// reporte-asistencia.js (FINAL) - INTEGRADO CON GRÁFICOS
// Requiere en el HTML:
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
// <script src="https://cdn.jsdelivr.net/npm/chartjs-chart-matrix"></script>

// ==================== CONFIG ====================
const API_BASE = "https://localhost:7271/api";
const EP_ASISTENCIAS = `${API_BASE}/Asistencia`;
const EP_MIEMBROS = `${API_BASE}/Miembro`;
const EP_CLASES = `${API_BASE}/Clase`;

// ==================== ESTADO GLOBAL ====================
const estado = {
  paginaActual: 1,
  registrosPorPagina: 6,

  asistenciasOriginales: [],
  asistenciasFiltradas: [],

  miembros: [],
  clases: [],

  filtros: {
    clase: "todas",
    miembro: "todos",
    periodo: "todos",
    desde: null,
    hasta: null
  }
};

// ==================== DOM ====================
const filtroMiembro = document.getElementById("filtro-miembro");
const filtroClase = document.getElementById("filtro-clase");
const filtroPeriodo = document.getElementById("filtro-periodo");
const fechaDesde = document.getElementById("fecha-desde");
const fechaHasta = document.getElementById("fecha-hasta");
const btnAplicar = document.getElementById("btn-aplicar-filtros");
const btnExportar = document.getElementById("btnExportarPDF");

const tablaBody = document.getElementById("tabla-body");
const paginacionCont = "#paginacion";

const metricDia = document.getElementById("metric-dia");
const metricMes = document.getElementById("metric-mes");
const metricTri = document.getElementById("metric-tri");
const metricAnio = document.getElementById("metric-anio");

// modal
const modal = document.getElementById("modalAsistencia");
const btnAbrirModal = document.getElementById("btnRegistrar");
const btnCerrarModal = document.getElementById("cancelarAsistenciaBtn");
const btnGuardar = document.getElementById("guardarAsistenciaBtn");
const inputDni = document.getElementById("modal-dni");
const inputNombre = document.getElementById("modal-nombre");
const inputClase = document.getElementById("modal-clase");
const inputMetodo = document.getElementById("modal-metodo");

// overlay (opcional, si existe)
const overlay = document.getElementById("overlay");

// ==================== UTILIDADES ====================
function formatearFechaHora(d) {
  if (!d) return "";
  try { return new Date(d).toLocaleString(); } catch { return String(d); }
}

async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("fetchJSON:", err);
    return [];
  }
}

function parseISOToDate(iso) {
  if (!iso) return null;
  return new Date(iso);
}

function obtenerRangoPorPeriodo(periodo) {
  const hoy = new Date();
  const copia = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  let desde = null, hasta = null;

  switch (periodo) {
    case "diario":
      desde = copia(hoy);
      hasta = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate(), 23, 59, 59);
      break;
    case "semanal": {
      const dia = hoy.getDay();
      const diff = dia === 0 ? 6 : dia - 1;
      desde = copia(hoy);
      desde.setDate(desde.getDate() - diff);
      hasta = new Date(desde);
      hasta.setDate(desde.getDate() + 6);
      hasta.setHours(23,59,59);
      break;
    }
    case "mensual":
      desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      hasta = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);
      break;
    case "trimestral": {
      const qStart = Math.floor(hoy.getMonth() / 3) * 3;
      desde = new Date(hoy.getFullYear(), qStart, 1);
      hasta = new Date(hoy.getFullYear(), qStart + 3, 0, 23, 59, 59);
      break;
    }
    case "anual":
      desde = new Date(hoy.getFullYear(), 0, 1);
      hasta = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59);
      break;
    default:
      desde = hasta = null;
  }
  return { desde, hasta };
}

// ==================== CHARTS - INSTANCIAS ====================
const chartRefs = {
  barrasClases: null,
  lineaTendencia: null,
  donutClases: null,
  lineaMiembro: null,
  barrasMiembro: null,
  barrasRanking: null,
};

// helper: safe text
function safeText(s){ return s ?? ""; }

// ==================== CARGA INICIAL ====================
async function cargarMiembros() {
  estado.miembros = await fetchJSON(EP_MIEMBROS);

  // llenar select de filtro por miembro
  if (filtroMiembro) {
    filtroMiembro.innerHTML = `<option value="todos">Todos</option>`;
    estado.miembros.forEach(m => {
      const o = document.createElement("option");
      o.value = m.id;
      o.textContent = `${m.nombre} ${m.apellido}`
      filtroMiembro.appendChild(o);
    });
  }
}

async function cargarClases() {
  estado.clases = await fetchJSON(EP_CLASES);
  // popular selects de clase (filtro + modal)
  if (filtroClase) {
    filtroClase.innerHTML = `<option value="todas">Todas</option>`;
    estado.clases.forEach(c => {
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = c.nombre;
      filtroClase.appendChild(o);
    });
  }
  if (inputClase) {
    inputClase.innerHTML = `<option value="">-- Ninguna --</option>`;
    estado.clases.forEach(c => {
      const o = document.createElement("option");
      o.value = c.id;
      o.textContent = c.nombre;
      inputClase.appendChild(o);
    });
  }
}

async function cargarAsistencias() {
  const data = await fetchJSON(EP_ASISTENCIAS);
  // normalizar: esperamos datos con campos: miembroNombre, miembroApellido, miembroDni, claseId, claseNombre, fecha, metodo
  estado.asistenciasOriginales = (data || []).map(a => ({
    miembroId: a.miembroId ?? a.miembro?.id ?? null,
    miembroNombre: a.miembroNombre ?? a.nombre ?? "",
    miembroApellido: a.miembroApellido ?? a.apellido ?? "",
    miembroDni: a.miembroDni ?? a.miembro?.dni ?? "",
    claseId: a.claseId ?? a.clase?.id ?? null,
    claseNombre: a.claseNombre ?? a.clase?.nombre ?? a.clase ?? "",
    fecha: parseISOToDate(a.fecha),
    metodo: a.metodo ?? a.metodoRegistro ?? ""
  }));

  aplicarFiltros(); // inicial
}

// ==================== FILTROS / EVENTOS ====================
function configurarEventos() {
  // mostrar/ocultar rango
  filtroPeriodo.addEventListener("change", () => {
    const mostrar = filtroPeriodo.value === "rango";
    document.getElementById("rango-fechas-inicio").classList.toggle("oculto", !mostrar);
    document.getElementById("rango-fechas-fin").classList.toggle("oculto", !mostrar);

    estado.filtros.periodo = filtroPeriodo.value;
  });

  filtroMiembro.addEventListener("change", () => {
    estado.filtros.miembro = filtroMiembro.value;
  });

  filtroClase.addEventListener("change", () => {
    estado.filtros.clase = filtroClase.value;
  });

  fechaDesde.addEventListener("change", () => {
    estado.filtros.desde = fechaDesde.value ? new Date(fechaDesde.value + "T00:00:00") : null;
  });

  fechaHasta.addEventListener("change", () => {
    estado.filtros.hasta = fechaHasta.value ? new Date(fechaHasta.value + "T23:59:59") : null;
  });

  if (btnAplicar) btnAplicar.addEventListener("click", () => {
    aplicarFiltros();
  });

  if (btnExportar) btnExportar.addEventListener("click", imprimirAsistencias); // usar plantilla print

  // modal open/close
  if (btnAbrirModal) btnAbrirModal.addEventListener("click", abrirModal);
  if (btnCerrarModal) btnCerrarModal.addEventListener("click", cerrarModal);
  if (overlay) overlay.addEventListener("click", cerrarModal);

  // autocomplete dni -> nombre
  if (inputDni) {
    inputDni.addEventListener("input", () => {
      // limpiar no numéricos
      inputDni.value = inputDni.value.replace(/\D/g, "");
      const m = estado.miembros.find(x => String(x.dni) === String(inputDni.value));
      inputNombre.value = m ? `${m.nombre} ${m.apellido}` : "";
    });

    inputDni.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        registrarAsistencia();
      }
    });
  }

  // guardar asistencia
  if (btnGuardar) btnGuardar.addEventListener("click", registrarAsistencia);

  // cerrar modal con ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModal();
  });
}

function abrirModal() {
  if (!modal) return;
  modal.style.display = "flex";
  if (overlay) overlay.classList.add("active");
}

function cerrarModal() {
  if (!modal) return;
  modal.style.display = "none";
  if (overlay) overlay.classList.remove("active");
}

// ==================== FILTRAR ====================
function aplicarFiltros() {
  let lista = [...estado.asistenciasOriginales];

  // filtro por clase (claseId)
  if (estado.filtros.clase && estado.filtros.clase !== "todas") {
    lista = lista.filter(a => String(a.claseId) === String(estado.filtros.clase));
  }

  // filtro por miembro
  if (estado.filtros.miembro && estado.filtros.miembro !== "todos") {
    lista = lista.filter(a => String(a.miembroId) === String(estado.filtros.miembro));
  }

  // rango por periodo
  let rango = null;
  if (estado.filtros.periodo === "rango") {
    rango = {
      desde: estado.filtros.desde ? new Date(estado.filtros.desde) : null,
      hasta: estado.filtros.hasta ? new Date(estado.filtros.hasta) : null
    };
  } else {
    rango = obtenerRangoPorPeriodo(estado.filtros.periodo);
  }

  if (rango?.desde) lista = lista.filter(a => a.fecha && a.fecha >= rango.desde);
  if (rango?.hasta) lista = lista.filter(a => a.fecha && a.fecha <= rango.hasta);

  // ordenar desc por fecha
  lista.sort((x, y) => (y.fecha?.getTime() || 0) - (x.fecha?.getTime() || 0));

  estado.asistenciasFiltradas = lista;
  estado.paginaActual = 1;

  recalcularMetricas();
  renderTabla();
  renderPaginacion();

  // actualizar gráficos con la lista resultante
  actualizarGraficos();
}

// ==================== MÉTRICAS ====================
function recalcularMetricas() {
  const lista = estado.asistenciasOriginales || [];
  const hoy = new Date();

  const hoyIni = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const hoyFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

  const mesIni = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const mesFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59);

  const tri = obtenerRangoPorPeriodo("trimestral");
  const triIni = tri.desde;
  const triFin = tri.hasta;

  const anioIni = new Date(hoy.getFullYear(), 0, 1);
  const anioFin = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59);

  metricDia.textContent = lista.filter(a => a.fecha && a.fecha >= hoyIni && a.fecha <= hoyFin).length;
  metricMes.textContent = lista.filter(a => a.fecha && a.fecha >= mesIni && a.fecha <= mesFin).length;
  metricTri.textContent = lista.filter(a => a.fecha && a.fecha >= triIni && a.fecha <= triFin).length;
  metricAnio.textContent = lista.filter(a => a.fecha && a.fecha >= anioIni && a.fecha <= anioFin).length;
}

// ==================== RENDER TABLA (PAGINACIÓN REAL) ====================
function renderTabla() {
  const tbody = tablaBody;
  const lista = estado.asistenciasFiltradas || [];

  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

  if (!lista.length) {
    tbody.innerHTML = "<tr><td colspan='5'>No hay registros</td></tr>";
    return;
  }

  const inicio = (estado.paginaActual - 1) * estado.registrosPorPagina;
  const fin = inicio + estado.registrosPorPagina;
  const pagina = lista.slice(inicio, fin);

  tbody.innerHTML = pagina.map(a => `
    <tr>
      <td>${escapeHtml(a.miembroNombre || "")} ${escapeHtml(a.miembroApellido || "")}</td>
      <td>${escapeHtml(a.miembroDni|| "")}</td>
      <td>${escapeHtml(a.claseNombre || "")}</td>
      <td>${escapeHtml(formatearFechaHora(a.fecha))}</td>
      <td>${escapeHtml(a.metodo || "")}</td>
    </tr>
  `).join("");
}

function renderPaginacion() {
  crearPaginacion({
    contenedor: paginacionCont,
    totalItems: estado.asistenciasFiltradas.length,
    paginaActual: estado.paginaActual,
    filasPorPagina: estado.registrosPorPagina,
    onPaginaCambiada: (nueva) => {
      estado.paginaActual = nueva;
      renderTabla();
    }
  });
}

// ==================== REGISTRAR ASISTENCIA (POST) ====================
async function registrarAsistencia() {
  const dni = (inputDni?.value || "").trim();
  if (!dni) return alert("Ingrese DNI");

  const miembro = estado.miembros.find(m => String(m.dni) === String(dni));
  const claseId = inputClase.value || null;
  const metodo = inputMetodo.value || "manual";

  const payload = {
    miembroId: miembro?.id ?? null,
    dni: dni,
    claseId: claseId ? parseInt(claseId, 10) : null,
    metodo: metodo,
    fecha: new Date().toISOString()
  };

  try {
    const res = await fetch(EP_ASISTENCIAS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      console.error("Error al registrar:", res.status, await res.text().catch(()=>""));
      return alert("No se pudo registrar la asistencia");
    }

    // éxito
    alert("Asistencia registrada correctamente");
    cerrarModal();

    // limpiar inputs
    inputDni.value = "";
    inputNombre.value = "";

    // recargar
    await cargarAsistencias();
  } catch (err) {
    console.error(err);
    alert("Error registrando asistencia");
  }
}

const nombresBonitosCharts = {
  barrasClases: "Asistencias por clase (Barras)",
  lineaTendencia: "Tendencia de asistencia (Línea)",
  donutClases: "Distribución de asistencia por clase (Donut)",
  lineaMiembro: "Asistencia de miembro en el tiempo (Línea)",
  barrasMiembro: "Asistencia de miembro (Barras)",
  barrasRanking: "Ranking de asistencia por miembro (Barras)"
};

function obtenerImagenesCharts() {
  const imagenes = [];

  // chartRefs es el objeto donde guardás los gráficos
  for (const [key, chart] of Object.entries(chartRefs)) {
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

// ==================== IMPRIMIR (USANDO PLANTILLA HTML - window.print) ====================
function imprimirAsistencias() {
  const lista = estado.asistenciasFiltradas || [];

  if (!lista.length) {
    alert("No hay registros para imprimir");
    return;
  }

  const filasHtml = lista.map(a => `
    <tr>
      <td>${escapeHtml(a.miembroNombre || "")} ${escapeHtml(a.miembroApellido || "")}</td>
      <td>${escapeHtml(a.miembroDni || "")}</td>
      <td>${escapeHtml(a.claseNombre || "")}</td>
      <td>${escapeHtml(formatearFechaHora(a.fecha))}</td>
      <td>${escapeHtml(a.metodo || "")}</td>
    </tr>
  `).join("");

  // --- Obtener imágenes de gráficos ---
  const imagenesCharts = obtenerImagenesCharts();

  const htmlGraficos = imagenesCharts.map(img => `
    <div style="margin-top:20px;">
      <h3 style="margin-bottom:6px;">${img.nombre}</h3>
      <img src="${img.src}" style="width:100%; max-width:700px;">
    </div>
  `).join("");

  const contenido = `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2 style="margin:0 0 8px 0;">Reporte de Asistencia</h2>
      <p style="margin:0 0 12px 0;">Generado: ${new Date().toLocaleString()}</p>

      <table border="1" cellspacing="0" cellpadding="6" style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead>
          <tr style="background:#eee;">
            <th>Miembro</th>
            <th>DNI</th>
            <th>Clase</th>
            <th>Fecha / Hora</th>
            <th>Método</th>
          </tr>
        </thead>
        <tbody>
          ${filasHtml}
        </tbody>
      </table>

      <h2 style="margin-top:30px;">Gráficos</h2>

      ${htmlGraficos}

    </div>
  `;

  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>Reporte de Asistencia</title>
        <style>
          @media print {
            table { font-size: 11px; }
            th, td { border: 1px solid #999; padding:6px; }
          }
          body { font-family: Arial, sans-serif; margin:0; }
        </style>
      </head>
      <body>${contenido}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  // Esperar poco para que el nuevo documento renderice y lanzar impresión
  setTimeout(() => {
    win.print();
    // no cerramos la ventana automáticamente para que el usuario pueda revisar
  }, 300);
}

// ==================== ESCAPE HTML (seguridad mínima) ====================
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ==================== GRAFICOS / UTILIDADES ====================
function actualizarGraficos() {
  const lista = estado.asistenciasFiltradas || [];

  graficoBarrasClases(lista);
  graficoLineaTendencia(lista);
  graficoDonutClases(lista);

  // Si hay un miembro seleccionado distinto de "todos", mostrar charts por miembro
  if (estado.filtros.miembro && estado.filtros.miembro !== "todos") {
    const miembroId = String(estado.filtros.miembro);
    const listaMiembro = lista.filter(a => String(a.miembroId) === miembroId);
    graficoLineaMiembro(listaMiembro);
    graficoBarrasMiembro(listaMiembro);
  } else {
    // limpiar/actualizar a vacío
    graficoLineaMiembro([]);
    graficoBarrasMiembro([]);
  }

  // Si hay clase seleccionada distinta de "todas", mostrar charts por clase
  if (estado.filtros.clase && estado.filtros.clase !== "todas") {
    const claseId = String(estado.filtros.clase);
    const listaClase = lista.filter(a => String(a.claseId) === claseId);
    graficoBarrasRanking(listaClase);
  } else {
    graficoBarrasRanking(lista);
  }
}

// Helper: agrupador por clave
function agruparContar(arr, keyFn) {
  const map = new Map();
  arr.forEach(item => {
    const k = keyFn(item) ?? "";
    map.set(k, (map.get(k) || 0) + 1);
  });
  return Array.from(map.entries()); // [ [key, count], ... ]
}

// --- 1. Barras: Asistencias por clase (general)
function graficoBarrasClases(data) {
  const pares = agruparContar(data, a => a.claseNombre);
  pares.sort((a,b) => b[1]-a[1]);
  const labels = pares.map(p => p[0] || "(Sin clase)");
  const valores = pares.map(p => p[1]);

  const ctx = document.getElementById("chartBarrasClases");
  if (!ctx) return;

  if (chartRefs.barrasClases) {
    chartRefs.barrasClases.data.labels = labels;
    chartRefs.barrasClases.data.datasets[0].data = valores;
    chartRefs.barrasClases.update();
    return;
  }

  chartRefs.barrasClases = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Asistencias",
        data: valores,
        pointRadius: window.innerWidth < 600 ? 2 : 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,   // <--- RESPONSIVE REAL
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            autoSkipPadding: 10
          }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}



// --- 2. Línea: Tendencia por día
function graficoLineaTendencia(data) {
  const porDia = {};
  data.forEach(a => {
    if (!a.fecha) return;
    const f = a.fecha.toISOString().slice(0,10);
    porDia[f] = (porDia[f] || 0) + 1;
  });

  const labels = Object.keys(porDia).sort();
  const valores = labels.map(l => porDia[l]);

  const ctx = document.getElementById("chartLineaTendencia");
  if (!ctx) return;

  if (chartRefs.lineaTendencia) {
    chartRefs.lineaTendencia.data.labels = labels;
    chartRefs.lineaTendencia.data.datasets[0].data = valores;
    chartRefs.lineaTendencia.update();
    return;
  }

  chartRefs.lineaTendencia = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Asistencias por día",
        data: valores,
        fill: false,
        borderWidth: 2,
        pointRadius: window.innerWidth < 600 ? 2 : 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            minRotation: 0,
            autoSkip: true,
            autoSkipPadding: 10
          }
        }
      }
    }
  });
}



// --- 3. Donut: Distribución por clase
function graficoDonutClases(data) {
  const pares = agruparContar(data, a => a.claseNombre);
  pares.sort((a,b) => b[1]-a[1]);

  const labels = pares.map(p => p[0] || "(Sin clase)");
  const valores = pares.map(p => p[1]);

  const ctx = document.getElementById("chartDonutClases");
  if (!ctx) return;

  if (chartRefs.donutClases) {
    chartRefs.donutClases.data.labels = labels;
    chartRefs.donutClases.data.datasets[0].data = valores;
    chartRefs.donutClases.update();
    return;
  }

  chartRefs.donutClases = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: valores,
        borderWidth: 1,
        pointRadius: window.innerWidth < 600 ? 2 : 4
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



// ================= VISTA POR MIEMBRO ===================

// --- Línea: evolución del miembro
function graficoLineaMiembro(data) {
  const porDia = {};
  data.forEach(a => {
    if (!a.fecha) return;
    const f = a.fecha.toISOString().slice(0,10);
    porDia[f] = (porDia[f] || 0) + 1;
  });

  const labels = Object.keys(porDia).sort();
  const valores = labels.map(l => porDia[l]);

  const ctx = document.getElementById("chartLineaMiembro");
  if (!ctx) return;

  if (chartRefs.lineaMiembro) {
    chartRefs.lineaMiembro.data.labels = labels;
    chartRefs.lineaMiembro.data.datasets[0].data = valores;
    chartRefs.lineaMiembro.update();
    return;
  }

  chartRefs.lineaMiembro = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Asistencias",
        data: valores,
        fill: false,
        borderWidth: 2,
        pointRadius: window.innerWidth < 600 ? 2 : 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}



// --- Barras: asistencias por clase del miembro
function graficoBarrasMiembro(data) {
  const pares = agruparContar(data, a => a.claseNombre);
  pares.sort((a,b) => b[1]-a[1]);

  const labels = pares.map(p => p[0] || "(Sin clase)");
  const valores = pares.map(p => p[1]);

  const ctx = document.getElementById("chartBarrasMiembro");
  if (!ctx) return;

  if (chartRefs.barrasMiembro) {
    chartRefs.barrasMiembro.data.labels = labels;
    chartRefs.barrasMiembro.data.datasets[0].data = valores;
    chartRefs.barrasMiembro.update();
    return;
  }

  chartRefs.barrasMiembro = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Asistencias por clase",
        data: valores,
        pointRadius: window.innerWidth < 600 ? 2 : 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  });
}



// ================= VISTA POR CLASE ===================

// --- Barras horizontales: ranking por clase
function graficoBarrasRanking(data) {
  const pares = agruparContar(data, a => a.claseNombre);
  pares.sort((a,b) => b[1]-a[1]);

  const labels = pares.map(p => p[0] || "(Sin clase)");
  const valores = pares.map(p => p[1]);

  const ctx = document.getElementById("chartBarrasRanking");
  if (!ctx) return;

  if (chartRefs.barrasRanking) {
    chartRefs.barrasRanking.data.labels = labels;
    chartRefs.barrasRanking.data.datasets[0].data = valores;
    chartRefs.barrasRanking.update();
    return;
  }

  chartRefs.barrasRanking = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Asistencias",
        data: valores,
        pointRadius: window.innerWidth < 600 ? 2 : 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  });
}
// ==================== INIT ====================
async function init() {
  await cargarMiembros();
  await cargarClases();
  await cargarAsistencias();
  configurarEventos();
  // Nota: cargarAsistencias() ya llama aplicarFiltros() que a su vez llama actualizarGraficos()
}

init();

window.addEventListener("resize", () => {
  Object.values(chartRefs).forEach(chart => {
    if (chart) chart.resize();
  });
});