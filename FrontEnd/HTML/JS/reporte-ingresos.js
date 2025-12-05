// === CONFIG ===
const API_BASE = "https://localhost:7271/api";

// === ESTADO GLOBAL ===
const estado = {
  paginaActual: 1,
  registrosPorPagina: 5,
  pagosOriginales: [],
  pagosFiltrados: [],
  filtros: {
    periodo: "mensual",
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
  await cargarIngresos();
  configurarEventos();
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

  // valores por defecto si el backend no provee precios
  const defaults = {
    "Mensual": { nombre: "Mensual", precio: 5000 },
    "Básica": { nombre: "Básica", precio: 12000 },
    "Premium": { nombre: "Premium", precio: 20000 }
  };

  try {
    const res = await fetch(`${API_BASE}/TipoMembresia`);
    if (!res.ok) throw new Error("No se pudo obtener tipos de membresía");
    const tipos = await res.json();

    // Tipos pueden venir como objetos o string; normalizamos y guardamos en el estado
    tipos.forEach(t => {
      const nom = t.nombre || t.tipo || String(t);
      const precio = t.precio ?? t.monto ?? defaults[nom]?.precio ?? null;
      estado.tiposMembresiaMap[nom] = { nombre: nom, precio };
      const opt = document.createElement("option");
      opt.value = nom;
      opt.textContent = nom;
      select.appendChild(opt);
    });

    // si el backend no entrega precio, rellenamos con defaults
    Object.keys(defaults).forEach(k => {
      if (!estado.tiposMembresiaMap[k]) estado.tiposMembresiaMap[k] = defaults[k];
    });

  } catch (err) {
    console.warn("cargarTiposMembresia: fallback", err);
    // fallback a los tipos detectados en los pagos
    const tiposFallback = [...new Set(estado.pagosOriginales.map(p => p.membresia))];
    tiposFallback.forEach(t => {
      estado.tiposMembresiaMap[t] = { nombre: t, precio: defaults[t]?.precio ?? 0 };
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      select.appendChild(opt);
    });

    // asegurar defaults
    Object.keys(defaults).forEach(k => {
      if (!estado.tiposMembresiaMap[k]) estado.tiposMembresiaMap[k] = defaults[k];
    });
  }
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
  if (cerrar) cerrar.addEventListener("click", () => {
    document.getElementById("modalNuevoPago").style.display = "none";
  });

  window.addEventListener("click", e => {
    const modal = document.getElementById("modalNuevoPago");
    if (modal && e.target === modal) modal.style.display = "none";
  });

  const btnConfirmar = document.getElementById("btnConfirmarPago");
  if (btnConfirmar) btnConfirmar.addEventListener("click", confirmarNuevoPago);

  // listener para cuando cambie el miembro en el modal
  const selectMiembro = document.getElementById("np-miembro");
  if (selectMiembro) selectMiembro.addEventListener("change", actualizarDatosPago);
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
}

// === MÉTRICAS ===
function recalcularMetricas() {
  const lista = estado.pagosFiltrados;
  const hoy = new Date();
  const hoyStr = hoy.toISOString().split("T")[0];

  const ingresoDiario = lista.filter(p => p.fecha === hoyStr).reduce((s, p) => s + p.monto, 0);
  document.getElementById("daily-income").textContent = formatearMoneda(ingresoDiario);

  const rangoMensual = obtenerRangoPorPeriodo("mensual");
  const ingresoMensual = lista.filter(p => p.fechaObj >= rangoMensual.desde && p.fechaObj <= rangoMensual.hasta)
                              .reduce((s, p) => s + p.monto, 0);
  document.getElementById("monthly-income").textContent = formatearMoneda(ingresoMensual);

  const rangoTri = obtenerRangoPorPeriodo("trimestral");
  const ingresoTri = lista.filter(p => p.fechaObj >= rangoTri.desde && p.fechaObj <= rangoTri.hasta)
                          .reduce((s, p) => s + p.monto, 0);
  document.getElementById("quarterly-income").textContent = formatearMoneda(ingresoTri);

  const rangoAnual = obtenerRangoPorPeriodo("anual");
  const ingresoAnual = lista.filter(p => p.fechaObj >= rangoAnual.desde && p.fechaObj <= rangoAnual.hasta)
                            .reduce((s, p) => s + p.monto, 0);
  document.getElementById("annual-income").textContent = formatearMoneda(ingresoAnual);
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
        <tbody>
          ${filas}
        </tbody>
      </table>
    `;

    // 7️⃣ Abrir ventana e imprimir
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
    ventana.print();

  } catch (err) {
    console.error(err);
    alert("Error al generar el reporte en PDF");
  }
}

/* ============================================================
   =============== NUEVO PAGO - BOTÓN Y MODAL ==================
   ============================================================ */

// Abre el modal y carga miembros
async function abrirModalNuevoPago() {
  try {
    const res = await fetch(`${API_BASE}/Miembro`);
    if (!res.ok) throw new Error("Error al cargar miembros");
    const miembros = await res.json();

    const select = document.getElementById("np-miembro");
    if (!select) return;

    // rellenar opciones con atributos útiles
    select.innerHTML = miembros.map(m => {
      const tipo = m.membresia ? getTipoMembresia(m.membresia.fechaInicio, m.membresia.fechaVencimiento) : "Mensual";
      const descuento = m.membresia?.descuento ?? m.descuento ?? 0;
      return `<option value="${m.id}"
                data-membresia="${tipo}"
                data-descuento="${descuento}"
                data-nombre="${(m.nombre || '') + ' ' + (m.apellido || '')}">
                ${m.nombre || ''} ${m.apellido || ''}
              </option>`;
    }).join("");

    // forzar actualizar datos al abrir
    actualizarDatosPago();

    document.getElementById("modalNuevoPago").style.display = "block";
  } catch (err) {
    console.error("abrirModalNuevoPago:", err);
    alert("No se pudo abrir el modal de nuevo pago");
  }
}

// Actualiza campos del modal según miembro seleccionado
async function actualizarDatosPago() {
  const select = document.getElementById("np-miembro");
  if (!select) return;
  const opt = select.selectedOptions[0];
  if (!opt) {
    document.getElementById("np-membresia").value = "";
    document.getElementById("np-monto-base").value = "";
    document.getElementById("np-descuento").value = "";
    document.getElementById("np-total").value = "";
    return;
  }

  const tipo = opt.dataset.membresia || "Mensual";
  const descuento = parseFloat(opt.dataset.descuento || 0);

  document.getElementById("np-membresia").value = tipo;
  document.getElementById("np-descuento").value = descuento;

  // obtener precio desde el mapa de tipos, si existe
  const tipoInfo = estado.tiposMembresiaMap[tipo];
  let precioBase = tipoInfo?.precio;
  if (precioBase == null) {
    // fallback a alguno de los defaults
    const defaults = { "Mensual": 5000, "Básica": 12000, "Premium": 20000 };
    precioBase = defaults[tipo] ?? 0;
  }

  // mostrar precio base y calcular total con descuento
  document.getElementById("np-monto-base").value = formatearMoneda(precioBase);
  const total = precioBase - (precioBase * (descuento / 100));
  document.getElementById("np-total").value = formatearMoneda(total);

  // también guardamos valores numéricos en atributos para usar al enviar
  document.getElementById("np-monto-base").dataset.raw = precioBase;
  document.getElementById("np-total").dataset.raw = total;
}

// Confirmar y POST al backend
async function confirmarNuevoPago() {
  try {
    const select = document.getElementById("np-miembro");
    if (!select || !select.value) { alert("Seleccione un miembro"); return; }

    const miembroId = select.value;
    const metodo = document.getElementById("np-metodo").value || "Efectivo";

    // monto en ARS numérico desde dataset.raw (precio ya calculado)
    const totalRaw = parseFloat(document.getElementById("np-total").dataset.raw || 0);
    if (isNaN(totalRaw) || totalRaw <= 0) { alert("Monto inválido"); return; }

    // backend en tus datos anteriores espera centavos -> guardamos en entero
    const montoEnCentavos = Math.round(totalRaw * 100);

    const body = {
      miembroId: parseInt(miembroId, 10),
      monto: montoEnCentavos,
      metodoPago: metodo,
      fecha: new Date().toISOString()
    };

    const res = await fetch(`${API_BASE}/Pago`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Error registrar pago:", res.status, txt);
      alert("No se pudo registrar el pago");
      return;
    }

    alert("Pago registrado correctamente ✔");
    document.getElementById("modalNuevoPago").style.display = "none";

    // recargar pagos y mantener filtros (refrescamos todo)
    await cargarPagos();
    aplicarFiltros();

  } catch (err) {
    console.error("confirmarNuevoPago:", err);
    alert("Error al registrar el pago");
  }
}