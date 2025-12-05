// reporte-asistencia.js (FINAL)
// Usa la plantilla del reporte de ingresos: paginación, estado global y print via window.open

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
    periodo: "mensual",
    desde: null,
    hasta: null
  }
};

// ==================== DOM ====================
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

// ==================== CARGA INICIAL ====================
async function cargarMiembros() {
  estado.miembros = await fetchJSON(EP_MIEMBROS);
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
    miembroNombre: a.miembroNombre ?? a.nombre ?? "",
    miembroApellido: a.miembroApellido ?? a.apellido ?? "",
    miembroDni: a.miembroDni ?? a.dni ?? a.dniMiembro ?? "",
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
      // si presionan Enter en dni, intentar guardar
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

  // filtro por clase
  if (estado.filtros.clase && estado.filtros.clase !== "todas") {
    lista = lista.filter(a => String(a.claseId) === String(estado.filtros.clase));
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
      <td>${a.miembroNombre || ""} ${a.miembroApellido || ""}</td>
      <td>${a.miembroDni || ""}</td>
      <td>${a.claseNombre || ""}</td>
      <td>${formatearFechaHora(a.fecha)}</td>
      <td>${a.metodo || ""}</td>
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

// ==================== INIT ====================
async function init() {
  await cargarMiembros();
  await cargarClases();
  await cargarAsistencias();
  configurarEventos();
}

init();