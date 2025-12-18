// === CONFIG ===
const API_BASE = "https://localhost:7271/api";

// === ESTADO GLOBAL ===
const estado = {
  paginaActual: 1,
  registrosPorPagina: 5,
  pagosOriginales: [],
  pagosFiltrados: [],
  filtros: {
    periodo: "todos",
    membresia: "todas",
    desde: null,
    hasta: null
  },
  tiposMembresiaMap: {} // { "Mensual": {nombre, precio}, ... }
};

// === INICIALIZACIÓN ===
document.addEventListener("DOMContentLoaded", async () => {
  await cargarPagos();
  await cargarTiposMembresia();
  aplicarFiltros(); 
  configurarEventos();

  const btnNuevoPago = document.getElementById("btnNuevoPago");
  if (btnNuevoPago) {
    btnNuevoPago.addEventListener("click", abrirModalNuevoPago);
  }

  // 🔥 CERRAR MODAL
  document.getElementById("cerrarNuevoPago")
    ?.addEventListener("click", cerrarModalNuevoPago);

  // 🔥 CONFIRMAR
  document.getElementById("btnConfirmarPago")
    ?.addEventListener("click", confirmarNuevoPago);

  // 🔥 CAMBIO DE MIEMBRO
  document.getElementById("np-miembro")
    ?.addEventListener("change", actualizarDatosPago);
});

// === UTILIDADES ===
function formatearMoneda(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS"
  }).format(valor);
}

function getTipoMembresia(fi, fv) {
  if (!fi || !fv) return "Desconocida";
  const inicio = new Date(fi);
  const fin = new Date(fv);
  const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));

  if (dias <= 31) return "Mensual";
  if (dias <= 93) return "Básica";
  return "Premium";
}

function parseISODateOnly(iso) {
  if (!iso) return null;
  return new Date(iso.split("T")[0] + "T00:00:00");
}

function obtenerRangoPorPeriodo(periodo) {
  const hoy = new Date();
  const copia = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  let desde, hasta;

  switch (periodo) {
    case "diario":
      desde = copia(hoy);
      hasta = copia(hoy);
      break;

    case "semanal":
      const dia = hoy.getDay();
      const diff = (dia === 0) ? 6 : dia - 1;
      desde = new Date(hoy);
      desde.setDate(hoy.getDate() - diff);
      hasta = new Date(desde);
      hasta.setDate(desde.getDate() + 6);
      break;

    case "mensual":
      desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      break;

    case "trimestral":
      const m = hoy.getMonth();
      const qStart = Math.floor(m / 3) * 3;
      desde = new Date(hoy.getFullYear(), qStart, 1);
      hasta = new Date(hoy.getFullYear(), qStart + 3, 0);
      break;

    case "anual":
      desde = new Date(hoy.getFullYear(), 0, 1);
      hasta = new Date(hoy.getFullYear(), 11, 31);
      break;

    default:
      desde = hasta = null;
  }
  return { desde, hasta };
}

// ==================== CHARTS - INSTANCIAS ====================
const chartRefsFin = {
  ingresosLinea: null,
  ingresosMensualesBarra: null,
  ingresosAcumulados: null,
  periodoPorMembresia: null,
  composicionIngresos: null,
  proporcionMembresias: null
};

// === CARGA DE DATOS ===
async function cargarPagos() {
  try {
    const res = await fetch(`${API_BASE}/Miembro`);
    if (!res.ok) throw new Error("No se pudieron cargar los miembros");
    const miembros = await res.json();

    const pagos = [];

    miembros.forEach(m => {
      if (m.membresia?.pagos) {
        m.membresia.pagos.forEach(p => {
          pagos.push({
            miembro: `${m.nombre} ${m.apellido}`,
            membresia: getTipoMembresia(m.membresia.fechaInicio, m.membresia.fechaVencimiento),
            fecha: p.fecha.split("T")[0],
            fechaObj: parseISODateOnly(p.fecha),
            metodo: p.metodoPago,
            monto: (p.monto || 0) / 100
          });
        });
      }
    });

    pagos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    estado.pagosOriginales = pagos;
    aplicarFiltros();
  } catch (e) { console.error("Error cargarPagos", e); }
}

async function cargarIngresos() {
  try {
    const res = await fetch(`${API_BASE}/Reporte/ingresos?Periodo=anual`);
    if (!res.ok) throw new Error("Error en reporte ingresos");
    const data = await res.json();

    const incomes = {};
    (data.registros || []).forEach(r => incomes[r.clave] = r.valor);

    document.getElementById("monthly-income").textContent = formatearMoneda(incomes.Mensual || 0);
    document.getElementById("quarterly-income").textContent = formatearMoneda(incomes.Trimestral || 0);
    document.getElementById("annual-income").textContent = formatearMoneda(incomes.Anual || 0);
  } catch (e) {
    console.error("cargarIngresos:", e);
  }
}

async function cargarTiposMembresia() {
  const select = document.getElementById("filtro-membresia");
  select.innerHTML = `<option value="todas">Todas</option>`;

  try {
    const res = await fetch(`${API_BASE}/TipoMembresia`);
    if (!res.ok) throw new Error("No se pudo obtener tipos de membresía");

    const tipos = await res.json();

    tipos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.id;          // ✅ ID real
      opt.textContent = t.nombre; // ✅ Nombre visible
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Error cargando tipos de membresía", err);
  }
}

async function cargarTipoMembresia(id) {
  const res = await fetch(`${API_BASE}/TipoMembresia/${id}`);
  if (!res.ok) return;

  tipoMembresiaActual = await res.json();

  document.getElementById("np-membresia").value =
    tipoMembresiaActual.nombre;

  document.getElementById("np-monto-base").value =
    `$${tipoMembresiaActual.costo.toLocaleString()}`;
}

async function cargarDescuento(id) {
  if (!id) {
    descuentoActual = 0;
    document.getElementById("np-descuento").value = "0%";
    return;
  }

  const res = await fetch(`${API_BASE}/Descuento/${id}`);
  if (!res.ok) return;

  const data = await res.json();
  descuentoActual = data.porcentaje;

  document.getElementById("np-descuento").value =
    `${Math.round(descuentoActual * 100)}%`;
}

function calcularTotal() {
  if (!tipoMembresiaActual) return;

  const base = tipoMembresiaActual.costo;
  const descuento = descuentoActual || 0;

  const total = base - (base * descuento);

  document.getElementById("np-total").value =
    `$${Math.round(total).toLocaleString()}`;
}

async function buscarMiembroPorDni() {
  const dni = document.getElementById("np-dni").value.trim();
  if (!dni) return alert("Ingresá un DNI");

  const res = await fetch(`${API_BASE}/Miembro/DNI/${dni}`);
  if (!res.ok) return alert("Miembro no encontrado");

  miembroActual = await res.json();

  document.getElementById("np-miembro").value =
    `${miembroActual.nombre} ${miembroActual.apellido}`;

  await cargarTipoMembresia(miembroActual.membresia.tipoMembresiaId);
  await cargarDescuento(miembroActual.descuento);

  calcularTotal();
}

// === FILTROS ===
function configurarEventos() {
  document.getElementById("btn-aplicar-filtros").onclick = aplicarFiltros;

  // corregido: el HTML tiene dos divs para rango, togglear ambos
  document.getElementById("filtro-periodo").onchange = () => {
    const val = document.getElementById("filtro-periodo").value;
    const inicio = document.getElementById("rango-fechas-inicio");
    const fin = document.getElementById("rango-fechas-fin");
    const mostrar = (val === "rango");
    inicio.classList.toggle("oculto", !mostrar);
    fin.classList.toggle("oculto", !mostrar);
  };

  document.getElementById("btnExportarPDF").addEventListener("click", imprimirIngresos);

  // Botón nuevo pago -> abrir modal
  const btnNuevo = document.getElementById("btnNuevoPago");
  if (btnNuevo) btnNuevo.addEventListener("click", abrirModalNuevoPago);

  // Cerrar modal y confirmar (delegamos listeners que pueden no existir al inicio)
  const cerrar = document.getElementById("cerrarNuevoPago");
  if (cerrar) document.getElementById("cerrarNuevoPago")
  ?.addEventListener("click", cerrarModalNuevoPago);

window.addEventListener("click", e => {
  const modal = document.getElementById("modalNuevoPago");
  if (modal && e.target === modal) cerrarModalNuevoPago();
});

  const btnConfirmar = document.getElementById("btnConfirmarPago");
  if (btnConfirmar) btnConfirmar.addEventListener("click", confirmarPago);

  document.getElementById("btnBuscarMiembro")?.addEventListener("click", buscarMiembroPorDni);

}

function aplicarFiltros() {
  const periodo = document.getElementById("filtro-periodo").value;
  const membresia = document.getElementById("filtro-membresia").value;
  const desdeVal = document.getElementById("fecha-desde").value;
  const hastaVal = document.getElementById("fecha-hasta").value;

  estado.filtros = {
    periodo,
    membresia,
    desde: desdeVal ? new Date(desdeVal + "T00:00:00") : null,
    hasta: hastaVal ? new Date(hastaVal + "T23:59:59") : null
  };

  let lista = [...estado.pagosOriginales];

  if (membresia !== "todas") {
    lista = lista.filter(p => p.membresia === membresia);
  }

  let rango = null;

  if (periodo === "rango" && estado.filtros.desde && estado.filtros.hasta) {
    rango = { ...estado.filtros };
  } else if (periodo !== "rango") {
    rango = obtenerRangoPorPeriodo(periodo);
  }

  if (rango?.desde && rango?.hasta) {
    lista = lista.filter(p => p.fechaObj && p.fechaObj >= rango.desde && p.fechaObj <= rango.hasta);
  }

  estado.pagosFiltrados = lista;
  estado.paginaActual = 1;

  recalcularMetricas();
  renderTabla();
  renderPaginacion();
  actualizarGraficosFinancieros()
}

// === MÉTRICAS ===
function recalcularMetricas() {
  const lista = estado.pagosFiltrados;

  // Helper para mostrar valor o ****
  const mostrar = (valor) => (lista.length === 0 ? "****" : formatearMoneda(valor));

  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0];

  const ingresoDiario = lista.filter(p => p.fecha === hoyStr).reduce((s, p) => s + p.monto, 0);
  document.getElementById("daily-income").textContent = mostrar(ingresoDiario);

  const rangoMensual = obtenerRangoPorPeriodo("mensual");
  const ingresoMensual = lista.filter(p => p.fechaObj >= rangoMensual.desde && p.fechaObj <= rangoMensual.hasta)
                              .reduce((s, p) => s + p.monto, 0);
  document.getElementById("monthly-income").textContent = mostrar(ingresoMensual);

  const rangoTri = obtenerRangoPorPeriodo("trimestral");
  const ingresoTri = lista.filter(p => p.fechaObj >= rangoTri.desde && p.fechaObj <= rangoTri.hasta)
                          .reduce((s, p) => s + p.monto, 0);
  document.getElementById("quarterly-income").textContent = mostrar(ingresoTri);

  const rangoAnual = obtenerRangoPorPeriodo("anual");
  const ingresoAnual = lista.filter(p => p.fechaObj >= rangoAnual.desde && p.fechaObj <= rangoAnual.hasta)
                            .reduce((s, p) => s + p.monto, 0);
  document.getElementById("annual-income").textContent = mostrar(ingresoAnual);
}

// =============================
// LISTAR PAGOS (con paginación real)
// =============================
function renderTabla() {

  const tbody = document.getElementById("payments-table-body");

  // Mostrar cargando mientras procesa
  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

  // Si no existen pagos
  if (!estado.pagosFiltrados || estado.pagosFiltrados.length === 0) {
    tbody.innerHTML = "<tr><td colspan='5'>No hay pagos registrados</td></tr>";
    return;
  }

  // ============================
  // PAGINACIÓN CORRECTA
  // ============================
  const inicio = (estado.paginaActual - 1) * estado.registrosPorPagina;
  const fin = inicio + estado.registrosPorPagina;

  const pagina = estado.pagosFiltrados.slice(inicio, fin);

  // ============================
  // RENDER SOLO DE LA PÁGINA
  // ============================
  tbody.innerHTML = pagina.map(p => `
    <tr>
      <td>${p.miembro}</td>
      <td>${p.membresia}</td>
      <td>${p.fecha}</td>
      <td>${p.metodo || ""}</td>
      <td>${formatearMoneda(p.monto)}</td>
    </tr>
  `).join("");


  // ============================
  // PAGINACIÓN GENÉRICA
  // ============================
  renderPaginacion();
}


// =============================
// PAGINACIÓN
// =============================
function renderPaginacion() {
  crearPaginacion({
    contenedor: "#paginacion",
    totalItems: estado.pagosFiltrados.length,
    paginaActual: estado.paginaActual,
    filasPorPagina: estado.registrosPorPagina,
    onPaginaCambiada: nuevaPagina => {
        estado.paginaActual = nuevaPagina;
        renderTabla(); // vuelve a renderizar la página correcta
    }
  });
}

const nombresBonitosCharts = {
  ingresosLinea: "Ingresos diarios (Línea)",
  ingresosMensualesBarra: "Ingresos por mes (Barras)",
  ingresosAcumulados: "Ingresos acumulados (Área)",
  periodoPorMembresia: "Ingresos por membresía por período (Barras agrupadas)",
  composicionIngresos: "Composición del total por membresía (Barras apiladas)",
  proporcionMembresias: "Distribución por membresía (Donut)"
};

function obtenerImagenesCharts() {
  const imagenes = [];

  // chartRefsFin ES el objeto real donde guardás los gráficos financieros
  for (const [key, chart] of Object.entries(chartRefsFin)) {
    if (chart && typeof chart.toBase64Image === "function") {
      try {
        const img = chart.toBase64Image();
        imagenes.push({
          nombre: nombresBonitosCharts[key] ?? key,
          src: img
        });
      } catch (err) {
        console.error("Error exportando gráfico", key, err);
      }
    }
  }

  return imagenes;
}

// =============================
// IMPRIMIR REPORTE DE INGRESOS
// =============================
async function imprimirIngresos() {
  try {
    // 1️⃣ Obtener filtros seleccionados
    const periodo = document.getElementById("filtro-periodo").value;
    const membresia = document.getElementById("filtro-membresia").value;
    const desde = document.getElementById("fecha-desde").value;
    const hasta = document.getElementById("fecha-hasta").value;

    // 2️⃣ Construir URL según filtros
    let url = `${API_BASE}/Reporte/ingresos?Periodo=${periodo}`;

    if (membresia !== "todas") url += `&Membresia=${membresia}`;
    if (periodo === "rango" && desde && hasta)
      url += `&Desde=${desde}&Hasta=${hasta}`;

    // 3️⃣ Consultar ingresos
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error obteniendo ingresos");

    const data = await res.json();

    // 4️⃣ Preparar filas
    const filas = (estado.pagosFiltrados || []).map(p => `
      <tr>
        <td>${p.miembro}</td>
        <td>${p.membresia}</td>
        <td>${p.fecha}</td>
        <td>${p.metodo || "-"}</td>
        <td>${formatearMoneda(p.monto)}</td>
      </tr>
    `).join("");

    // 5️⃣ Métricas
    const diario = document.getElementById("daily-income").textContent;
    const mensual = document.getElementById("monthly-income").textContent;
    const trimestral = document.getElementById("quarterly-income").textContent;
    const anual = document.getElementById("annual-income").textContent;

    // --- Obtener imágenes de gráficos ---
    const imagenesCharts = obtenerImagenesCharts();
    const htmlGraficos = imagenesCharts.map(img => `
      <div style="margin-top:20px;">
        <h3 style="margin-bottom:6px;">${img.nombre}</h3>
        <img src="${img.src}" style="width:100%; max-width:700px;">
      </div>
    `).join("");

    // 6️⃣ Armar contenido HTML
    const contenido = `
      <h2>Reporte de Ingresos</h2>
      <p><strong>Período:</strong> ${periodo}</p>
      <p><strong>Membresía:</strong> ${membresia}</p>

      <hr>

      <h3>Métricas</h3>
      <p><strong>Diario:</strong> ${diario}</p>
      <p><strong>Mensual:</strong> ${mensual}</p>
      <p><strong>Trimestral:</strong> ${trimestral}</p>
      <p><strong>Anual:</strong> ${anual}</p>

      <hr>

      <h3>Detalle de ingresos (${estado.pagosFiltrados.length})</h3>
      <table border="1" cellspacing="0" cellpadding="6" style="width:100%; border-collapse:collapse;">
        <thead>
          <tr>
            <th>Miembro</th>
            <th>Membresía</th>
            <th>Fecha</th>
            <th>Método</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>

      <h2 style="margin-top:30px;">Gráficos</h2>
      ${htmlGraficos}
    `;

    // 7️⃣ Abrir ventana e imprimir cuando las imágenes estén listas
    const ventana = window.open("", "_blank");

    ventana.document.write(`
      <html>
        <head>
          <title>Reporte de Ingresos</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2, h3 { color: #333; }
            table { margin-top: 10px; width: 100%; border-collapse: collapse; }
            th { background: #eee; }
            th, td { padding: 6px; border: 1px solid #ccc; }
          </style>
        </head>
        <body>${contenido}</body>
      </html>
    `);

    ventana.document.close();

    // Esperar a que todas las imágenes carguen
    const imgs = ventana.document.images;
    if (imgs.length > 0) {
      let loaded = 0;
      for (let img of imgs) {
        img.onload = () => {
          loaded++;
          if (loaded === imgs.length) ventana.print();
        };
        img.onerror = () => {
          loaded++;
          if (loaded === imgs.length) ventana.print();
        };
      }
    } else {
      ventana.print();
    }

  } catch (err) {
    console.error(err);
    alert("Error al generar el reporte en PDF");
  }
}

/* ============================================================
   =============== NUEVO PAGO - BOTÓN Y MODAL ==================
   ============================================================ */

function abrirModalNuevoPago() {
  miembroActual = null;
  tipoMembresiaActual = null;
  descuentoActual = 0;

  document.getElementById("np-dni").value = "";
  document.getElementById("np-miembro").value = "";
  document.getElementById("np-membresia").value = "";
  document.getElementById("np-monto-base").value = "";
  document.getElementById("np-descuento").value = "";
  document.getElementById("np-total").value = "";
  document.getElementById("np-metodo").value = "";

  document.getElementById("modalNuevoPago").classList.add("active");
}

function cerrarModalNuevoPago() {
  const modal = document.getElementById("modalNuevoPago");
  if (!modal) return;

  modal.classList.remove("active");

  document.getElementById("np-membresia").value = "";
  document.getElementById("np-monto-base").value = "";
  document.getElementById("np-descuento").value = "";
  document.getElementById("np-total").value = "";
  document.getElementById("np-miembro").value = "";
}

function imprimirTicket(pago) {
  try {
    if (!pago || !pago.ticket) {
      throw new Error("Pago o ticket inexistente");
    }

    const t = pago.ticket;

    const contenidoHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Ticket de Pago</title>

        <style>
          body {
            font-family: monospace;
            margin: 30px;
            background: #f2f2f2;
          }

          .ticket {
            background: white;
            padding: 20px;
            max-width: 320px;
            margin: auto;
            border: 1px dashed #000;
          }

          h2 {
            text-align: center;
            margin-bottom: 10px;
          }

          .campo {
            margin: 6px 0;
            font-size: 14px;
          }

          .linea {
            border-top: 1px dashed #000;
            margin: 12px 0;
          }

          .footer {
            text-align: center;
            font-size: 12px;
            margin-top: 15px;
          }
        </style>
      </head>

      <body>
        <div class="ticket">
          <h2>Gimnasio Cuerpo Sano</h2>

          <div class="campo">Ticket Nº: ${t.id}</div>
          <div class="campo">Fecha: ${new Date(t.fechaEmision).toLocaleString()}</div>

          <div class="linea"></div>

          <div class="campo">Membresía ID: ${pago.membresiaId}</div>
          <div class="campo">Monto: $${(pago.monto / 100).toLocaleString()}</div>
          <div class="campo">Método: ${pago.metodoPago}</div>

          <div class="linea"></div>

          <div class="campo">${t.detalle}</div>

          <div class="footer">
            Gracias por su pago
          </div>
        </div>

        <script>
          window.onload = () => window.print();
        </script>
      </body>
      </html>
    `;

    const w = window.open("", "_blank");
    if (!w) throw new Error("Popup bloqueado");

    w.document.write(contenidoHTML);
    w.document.close();

  } catch (err) {
    console.error("Error imprimirTicket:", err);
    alert("No se pudo imprimir el ticket.");
  }
}

// Confirmar y POST al backend
async function confirmarPago() {
  if (!miembroActual || !tipoMembresiaActual) {
    return alert("Faltan datos del pago");
  }

  const metodo = document.getElementById("np-metodo").value

  if (!metodo) {
    alert("Debe seleccionar un método de pago");
    return;
  }
 

  const total =
    tipoMembresiaActual.costo -
    tipoMembresiaActual.costo * (descuentoActual || 0);

  const payload = {
    monto: Math.round(total * 100),
    metodoPagoId: Number(metodo),
    membresiaId: miembroActual.membresia.id
  };

  const res = await fetch(`${API_BASE}/Pago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    alert("Error al registrar el pago");
    return;
  }

  const pago = await res.json(); 

  alert("Pago registrado correctamente ✔");

  imprimirTicket(pago); 
  cerrarModalNuevoPago();
}

// ==================== HELPERS ====================
function agruparSumar(arr, keyFn, valueFn) {
  const map = new Map();
  arr.forEach(item => {
    const k = keyFn(item) ?? "";
    const v = valueFn(item) ?? 0;
    map.set(k, (map.get(k) || 0) + v);
  });
  return Array.from(map.entries());
}

function obtenerMes(fecha) {
  if (!fecha) return "";

  // Normalizar a Date si es string
  let d = fecha instanceof Date ? fecha : (typeof fecha === "string" ? new Date(fecha) : null);

  // Fecha inválida
  if (!d || isNaN(d.getTime())) return "";

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`; // "yyyy-mm"
}

// ==================== ACTUALIZAR GRAFICOS ====================
function actualizarGraficosFinancieros() {
  const lista = estado.pagosFiltrados || [];

  graficoIngresosLinea(lista);
  graficoIngresosMensualesBarra(lista);
  graficoIngresosAcumulados(lista);

  graficoPeriodoPorMembresia(lista);
  graficoComposicionIngresos(lista);

  graficoProporcionMembresias(lista);
}

// =============================================================
// =============== 1. LINEA: INGRESOS EN EL TIEMPO =============
// =============================================================
function graficoIngresosLinea(data) {
  const pares = agruparSumar(
    data,
    a => a.fecha,
    a => a.monto
  );

  pares.sort((a,b) => a[0].localeCompare(b[0]));

  const labels = pares.map(p => p[0]);
  const valores = pares.map(p => p[1]);

  const ctx = document.getElementById("graficoIngresosLinea");
  if (!ctx) return;

  if (chartRefsFin.ingresosLinea) {
    chartRefsFin.ingresosLinea.data.labels = labels;
    chartRefsFin.ingresosLinea.data.datasets[0].data = valores;
    chartRefsFin.ingresosLinea.update();
    return;
  }

  chartRefsFin.ingresosLinea = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Ingresos diarios",
        data: valores,
        borderWidth: 2,
        fill: false,
        pointRadius: window.innerWidth < 600 ? 2 : 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// =============================================================
// =========== 2. BARRAS: COMPARACIÓN MENSUAL ===================
// =============================================================
function graficoIngresosMensualesBarra(data) {
  const pares = agruparSumar(
    data,
    a => obtenerMes(a.fecha),
    a => a.monto
  );

  pares.sort((a,b) => a[0].localeCompare(b[0]));

  const labels = pares.map(p => p[0]);
  const valores = pares.map(p => p[1]);

  const ctx = document.getElementById("graficoIngresosMensualesBarra");
  if (!ctx) return;

  if (chartRefsFin.ingresosMensualesBarra) {
    chartRefsFin.ingresosMensualesBarra.data.labels = labels;
    chartRefsFin.ingresosMensualesBarra.data.datasets[0].data = valores;
    chartRefsFin.ingresosMensualesBarra.update();
    return;
  }

  chartRefsFin.ingresosMensualesBarra = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Ingresos por mes",
        data: valores,
        pointRadius: window.innerWidth < 600 ? 2 : 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// =============================================================
// =========== 3. AREA: INGRESOS ACUMULADOS ====================
// =============================================================
function graficoIngresosAcumulados(data) {
  const pares = agruparSumar(
    data,
    a => a.fecha,
    a => a.monto
  );

  pares.sort((a,b) => a[0].localeCompare(b[0]));

  let acumulado = 0;
  const labels = [];
  const valores = [];

  pares.forEach(([fecha, monto]) => {
    acumulado += monto;
    labels.push(fecha);
    valores.push(acumulado);
  });

  const ctx = document.getElementById("graficoIngresosAcumulados");
  if (!ctx) return;

  if (chartRefsFin.ingresosAcumulados) {
    chartRefsFin.ingresosAcumulados.data.labels = labels;
    chartRefsFin.ingresosAcumulados.data.datasets[0].data = valores;
    chartRefsFin.ingresosAcumulados.update();
    return;
  }

  chartRefsFin.ingresosAcumulados = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Ingresos acumulados",
        data: valores,
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: window.innerWidth < 600 ? 2 : 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// =============================================================
// === 4. BARRAS AGRUPADAS: TIPO DE MEMBRESÍA POR PERIODO =====
// =============================================================
function graficoPeriodoPorMembresia(data) {
  const grupos = new Map();

  data.forEach(a => {
    const periodo = obtenerMes(a.fecha);
    const memb = a.membresia ?? "N/A";
    const monto = a.monto;

    if (!grupos.has(periodo)) grupos.set(periodo, new Map());
    const gm = grupos.get(periodo);
    gm.set(memb, (gm.get(memb) || 0) + monto);
  });

  const periodos = [...grupos.keys()].sort();
  const membresiasSet = new Set();

  periodos.forEach(p => {
    grupos.get(p).forEach((_, memb) => membresiasSet.add(memb));
  });

  const membresias = [...membresiasSet];

  const datasets = membresias.map(m => ({
    label: m,
    data: periodos.map(p => grupos.get(p).get(m) || 0)
  }));

  const ctx = document.getElementById("graficoPeriodoPorMembresia");
  if (!ctx) return;

  if (chartRefsFin.periodoPorMembresia) {
    chartRefsFin.periodoPorMembresia.data.labels = periodos;
    chartRefsFin.periodoPorMembresia.data.datasets = datasets;
    chartRefsFin.periodoPorMembresia.update();
    return;
  }

  chartRefsFin.periodoPorMembresia = new Chart(ctx, {
    type: "bar",
    data: {
      labels: periodos,
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// =============================================================
// === 5. BARRAS APILADAS: COMPOSICIÓN DEL TOTAL ===============
// =============================================================
function graficoComposicionIngresos(data) {
  const pares = agruparSumar(
    data,
    a => a.membresia ?? "N/A",
    a => a.monto
  );

  const labels = pares.map(p => p[0]);
  const valores = pares.map(p => p[1]);

  const ctx = document.getElementById("graficoComposicionIngresos");
  if (!ctx) return;

  if (chartRefsFin.composicionIngresos) {
    chartRefsFin.composicionIngresos.data.labels = labels;
    chartRefsFin.composicionIngresos.data.datasets[0].data = valores;
    chartRefsFin.composicionIngresos.update();
    return;
  }

  chartRefsFin.composicionIngresos = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Total por membresía",
        data: valores
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    }
  });
}

// =============================================================
// === 6. DONUT: PROPORCIÓN POR MEMBRESÍA =======================
// =============================================================
function graficoProporcionMembresias(data) {
  const pares = agruparSumar(
    data,
    a => a.membresia ?? "N/A",
    a => a.monto
  );

  const labels = pares.map(p => p[0]);
  const valores = pares.map(p => p[1]);

  const ctx = document.getElementById("graficoProporcionMembresias");
  if (!ctx) return;

  if (chartRefsFin.proporcionMembresias) {
    chartRefsFin.proporcionMembresias.data.labels = labels;
    chartRefsFin.proporcionMembresias.data.datasets[0].data = valores;
    chartRefsFin.proporcionMembresias.update();
    return;
  }

  chartRefsFin.proporcionMembresias = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: valores,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { padding: 20 }
        }
      }
    }
  });
}

// =============================================================
// ==================== RESIZE GLOBAL ===========================
// =============================================================
window.addEventListener("resize", () => {
  Object.values(chartRefsFin).forEach(chart => {
    if (chart) chart.resize();
  });
});