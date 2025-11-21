document.addEventListener("DOMContentLoaded", () => {
  configurarEventosDescuentos();
  configurarEventosTipos();

  listarDescuentos();
  listarTipos();
});

// =====================================================
// VARIABLES GLOBALES Y CONFIG
// =====================================================
const API_DESCUENTOS = "https://localhost:7271/api/Descuento";
const API_TIPOS = "https://localhost:7271/api/TipoMembresia";
let editando = false;
let idEditando = null;

let paginaActual = 1;
const filasPorPagina = 5;

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================
function mostrarCargando(mostrar) {
  const overlay = document.getElementById("overlay");
  if (!overlay) return;
  overlay.style.display = mostrar ? "block" : "none";
}

function limpiarModal(modalId) {
  const modal = document.getElementById(modalId);
  const inputs = modal.querySelectorAll("input, select, textarea");

  inputs.forEach(i => {
    if (i.type === "checkbox" || i.type === "radio") {
      i.checked = false;
    } else {
      i.value = "";
    }
  });
}

function cerrarModal(id) {
  document.getElementById(id).classList.remove("show");
  limpiarModal(id);   // <-- se vacía todo automáticamente
  editando = false;   // por si estabas editando
  idEditando = null;
}

function decimalAporcentaje(valor) {
  return (valor * 100) + "%";
}

function porcentajeADecimal(valor) {
  return parseFloat(valor) / 100;
}

// =====================================================
// ======== DESCUENTOS
// =====================================================


// === Listar Descuentos (con paginación) ===

async function listarDescuentos() {
  mostrarCargando(true);
  try {
    const res = await fetch(API_DESCUENTOS);

    if (!res.ok) {
      document.querySelector("#descuentosTabla tbody").innerHTML =
        "<tr><td colspan='4'>Error al obtener descuentos.</td></tr>";
      return;
    }

    descuentos = await res.json();

    if (!Array.isArray(descuentos) || descuentos.length === 0) {
      document.querySelector("#descuentosTabla tbody").innerHTML =
        "<tr><td colspan='4'>No hay descuentos registrados.</td></tr>";

      crearPaginacion({
        contenedor: "#paginacion",
        totalItems: 0,
        paginaActual: 1,
        filasPorPagina,
        onPaginaCambiada: () => {}
      });
      return;
    }

    // PAGINACIÓN
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const descuentosPagina = descuentos.slice(inicio, fin);

    const tbody = document.querySelector("#descuentosTabla tbody");
    tbody.innerHTML = descuentosPagina
      .map((d) => `
        <tr>
          <td>${d.id}</td>
          <td>${d.nombre}</td>
          <td>${decimalAporcentaje(d.porcentaje)}</td>
          <td>
            <button onclick="eliminarDescuento(${d.id})" class="btn-small btn btn-delete"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            <button onclick="editarDescuento(${d.id})" class="btn-small btn btn-edit"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-pen-line-icon lucide-file-pen-line"><path d="m18.226 5.226-2.52-2.52A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.351"/><path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 18h1"/></svg></button>
          </td>
        </tr>
      `)
      .join("");

    // ⭐ FIX: solo actualizar el select si existe ⭐
    const select = document.querySelector("#descuento");
    if (select) actualizarSelectDescuentos(descuentos);

    // PAGINACIÓN
    crearPaginacion({
      contenedor: "#paginacion",
      totalItems: descuentos.length,
      paginaActual,
      filasPorPagina,
      onPaginaCambiada: (nuevaPagina) => {
        paginaActual = nuevaPagina;
        listarDescuentos();
      }
    });

  } catch (err) {
    console.error("Error al listar descuentos:", err);
    document.querySelector("#descuentosTabla tbody").innerHTML =
      "<tr><td colspan='4'>Error al cargar descuentos.</td></tr>";
  } finally {
    mostrarCargando(false);
  }
}



// === Guardar / Editar Descuento ===
async function guardarDescuento(e) {
  e.preventDefault();
  const nombre = document.getElementById("descripcionDescuento").value.trim();
  const porcentajeInput = document.getElementById("porcentajeDescuento").value;
  const porcentaje = porcentajeADecimal(porcentajeInput);

  if (!nombre || isNaN(porcentaje)) return alert("Complete todos los campos");

  const request = { nombre, porcentaje };
  mostrarCargando(true);

  try {
    if (editando) {
      await fetch(`${API_DESCUENTOS}/${idEditando}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
    } else {
      await fetch(API_DESCUENTOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
    }
    alert(
          `Membresia Guardada correctamente`
        );

    cerrarModal("modalDescuento");
    listarDescuentos();
  } catch (err) {
    alert("Error al guardar descuento");
    console.error(err);
  } finally {
    mostrarCargando(false);
  }
}

// === Editar ===
async function editarDescuento(id) {
  mostrarCargando(true);
  try {
    const res = await fetch(`${API_DESCUENTOS}/${id}`);
    if (!res.ok) throw new Error("Descuento no encontrado");
    const d = await res.json();

    document.getElementById("descripcionDescuento").value = d.nombre;
    document.getElementById("porcentajeDescuento").value = d.porcentaje * 100;
    editando = true;
    idEditando = d.id;
    document.getElementById("modalDescuento").classList.add("show");
  } catch (err) {
    alert("Error al obtener el descuento");
  } finally {
    mostrarCargando(false);
  }
}

// === Eliminar ===
async function eliminarDescuento(id) {
  if (!confirm("¿Eliminar descuento?")) return;
  mostrarCargando(true);
  try {
    const res = await fetch(`${API_DESCUENTOS}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    listarDescuentos();
  } catch (err) {
    alert("Error al eliminar descuento");
  } finally {
    mostrarCargando(false);
  }
}

// === Consultar Descuento ===
async function consultarDescuento() {
  const valor = document.getElementById("buscarDescuentoInput").value.trim().toLowerCase();
  cerrarModal("modalConsultaDescuento");

  if (!valor) return alert("Ingrese un nombre o ID");

  mostrarCargando(true);
  try {
    const res = await fetch(API_DESCUENTOS);
    const descuentos = await res.json();
    const encontrado = descuentos.find(
      (d) => d.nombre.toLowerCase() === valor || d.id.toString() === valor
    );

    if (!encontrado) return alert("Descuento no encontrado");

    const detalle = await fetch(`${API_DESCUENTOS}/${encontrado.id}`);
    const d = await detalle.json();
    mostrarDetalleDescuento(d);
  } catch (err) {
    alert("Error al consultar descuento");
  } finally {
    mostrarCargando(false);
  }
}

// === Mostrar Detalle ===
function mostrarDetalleDescuento(d) {
  const div = document.getElementById("detalleContenidoDescuento");
  div.innerHTML = `
    <h3>${d.nombre}</h3>
    <p><strong>ID:</strong> ${d.id}</p>
    <p><strong>Porcentaje:</strong> ${d.porcentaje}%</p>
  `;

  const modal = document.getElementById("modalDetalleDescuento");
  modal.classList.add("show");

  document.getElementById("btnEditarDescuento").onclick = () => {
    modal.classList.remove("show");
    editarDescuento(d.id);
  };
  document.getElementById("btnEliminarDescuento").onclick = () => {
    modal.classList.remove("show");
    eliminarDescuento(d.id);
  };
  document.getElementById("btnCerrarDetalleDescuento").onclick = () =>
    modal.classList.remove("show");
}

// === Eventos ===
function configurarEventosDescuentos() {
  document.getElementById("btnRegistrarDesc").onclick = () =>
    document.getElementById("modalDescuento").classList.add("show");

  document.getElementById("guardarDescuentoBtn").onclick = guardarDescuento;
  document.getElementById("cancelarDescuentoBtn").onclick = () =>
    cerrarModal("modalDescuento");

  document.getElementById("btnConsultarDesc").onclick = () =>
    document.getElementById("modalConsultaDescuento").classList.add("show");

  document.getElementById("confirmarConsultaDescuentoBtn").onclick = consultarDescuento;
  document.querySelector("#modalConsultaDescuento #cancelarConsultaBtn").onclick = () =>
    cerrarModal("modalConsultaDescuento");
}

// =====================================================
// ======== TIPOS DE MEMBRESÍA
// =====================================================

// === Listar Tipos de Membresía (con paginación) ===
async function listarTipos() {
  mostrarCargando(true);
  try {
    const res = await fetch(API_TIPOS);
    if (!res.ok) throw new Error("Error al obtener tipos de membresía");

    tipos = await res.json(); // <-- lo guardamos global si querés

    if (!Array.isArray(tipos) || tipos.length === 0) {
      document.querySelector("#tiposMembresiaTabla tbody").innerHTML =
        "<tr><td colspan='5'>No hay tipos registrados.</td></tr>";
      return;
    }

    // ============================
    // PAGINACIÓN CORRECTA
    // ============================
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const tiposPagina = tipos.slice(inicio, fin);

    const tbody = document.querySelector("#tiposMembresiaTabla tbody");

    tbody.innerHTML = tiposPagina
      .map(
        (t) => `
        <tr>
          <td>${t.id}</td>
          <td>${t.nombre}</td>
          <td>$${t.costo}</td>
          <td>${t.duracionDias} días</td>
          <td>
            <button onclick="editarTipo(${t.id})" class="btn-small btn btn-edit"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-pen-line-icon lucide-file-pen-line"><path d="m18.226 5.226-2.52-2.52A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.351"/><path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 18h1"/></svg></button>
            <button onclick="eliminarTipo(${t.id})" class="btn-small btn btn-delete"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
            <button onclick="imprimirTipo(${t.id})" class="btn-small btn btn-save"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer-icon lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg></button>
          </td>
        </tr>`
      )
      .join("");

  } catch (err) {
    alert("Error al listar tipos de membresía");
    console.error(err);
  } finally {
    mostrarCargando(false);
  }

  // ============================
  // PAGINACIÓN GENÉRICA
  // ============================
  crearPaginacion({
    contenedor: "#paginacion",
    totalItems: tipos.length,     // <-- CORRECTO
    paginaActual,
    filasPorPagina,
    onPaginaCambiada: (nuevaPagina) => {
      paginaActual = nuevaPagina;
      listarTipos();              // <-- CORRECTO
    }
  });
}


// === Guardar / Editar ===
async function guardarTipo(e) {
  e.preventDefault();
  const nombre = document.getElementById("nombreTipo").value.trim();
  const duracionDias = parseInt(document.getElementById("duracionTipo").value);
  const costo = parseFloat(document.getElementById("costoTipo").value);

  if (!nombre || isNaN(duracionDias) || isNaN(costo)) {
    return alert("Complete todos los campos");
  }

  const request = { nombre, duracionDias, costo };
  mostrarCargando(true);

  try {
    if (editando) {
      await fetch(`${API_TIPOS}/${idEditando}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
    } else {
      await fetch(API_TIPOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
    }

    alert(
          `Membresia Guardada correctamente`
        );


    cerrarModal("modalTipo");
    listarTipos();
  } catch (err) {
    alert("Error al guardar tipo de membresía");
  } finally {
    mostrarCargando(false);
  }
}

// === Editar ===
async function editarTipo(id) {
  mostrarCargando(true);
  try {
    const res = await fetch(`${API_TIPOS}/${id}`);
    if (!res.ok) throw new Error("Tipo no encontrado");
    const t = await res.json();

    document.getElementById("nombreTipo").value = t.nombre;
    document.getElementById("duracionTipo").value = t.duracionDias;
    document.getElementById("costoTipo").value = t.costo;
    editando = true;
    idEditando = id;
    document.getElementById("modalTipo").classList.add("show");
  } catch (err) {
    alert("Error al obtener tipo");
  } finally {
    mostrarCargando(false);
  }
}

// === Eliminar ===
async function eliminarTipo(id) {
  if (!confirm("¿Eliminar tipo de membresía?")) return;
  mostrarCargando(true);
  try {
    await fetch(`${API_TIPOS}/${id}`, { method: "DELETE" });
    listarTipos();
  } catch (err) {
    alert("Error al eliminar tipo");
  } finally {
    mostrarCargando(false);
  }
}

// === Consultar Tipo ===
async function consultarTipo() {
  const valor = document.getElementById("buscarTipoInput").value.trim().toLowerCase();
  cerrarModal("modalConsultaTipo");

  if (!valor) return alert("Ingrese un nombre o ID");

  mostrarCargando(true);
  try {
    const res = await fetch(API_TIPOS);
    const tipos = await res.json();
    const encontrado = tipos.find(
      (t) => t.nombre.toLowerCase() === valor || t.id.toString() === valor
    );

    if (!encontrado) return alert("Tipo de membresía no encontrado");

    const detalle = await fetch(`${API_TIPOS}/${encontrado.id}`);
    const t = await detalle.json();
    mostrarDetalleTipo(t);
  } catch (err) {
    alert("Error al consultar tipo de membresía");
  } finally {
    mostrarCargando(false);
  }
}

// === Mostrar Detalle Tipo ===
function mostrarDetalleTipo(t) {
  const div = document.getElementById("detalleContenidoTipo");
  div.innerHTML = `
    <h3>${t.nombre}</h3>
    <p><strong>ID:</strong> ${t.id}</p>
    <p><strong>Duración:</strong> ${t.duracionDias} días</p>
    <p><strong>Costo:</strong> $${t.costo}</p>
  `;

  const modal = document.getElementById("modalDetalleTipo");
  modal.classList.add("show");

  document.getElementById("btnEditarTipo").onclick = () => {
    modal.classList.remove("show");
    editarTipo(t.id);
  };
  document.getElementById("btnEliminarTipo").onclick = () => {
    modal.classList.remove("show");
    eliminarTipo(t.id);
  };
  document.getElementById("btnImprimirDetalle").onclick = () => imprimirTipo(t.id);
  document.getElementById("btnCerrarDetalleTipo").onclick = () =>
    modal.classList.remove("show");
}

// === Imprimir Tipo ===
async function imprimirTipo(id) {
  try {
    const res = await fetch(`${API_TIPOS}/${id}`);
    if (!res.ok) throw new Error("No se pudo obtener la información");

    const t = await res.json();

    const contenidoHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Ficha de Membresía</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            padding: 0;
            background: #f2f2f2;
          }

          .card {
            background: white;
            border-radius: 12px;
            padding: 28px;
            max-width: 450px;
            margin: auto;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            border-left: 6px solid #007bff;
          }

          h2 {
            text-align: center;
            font-size: 26px;
            margin-bottom: 18px;
            color: #007bff;
          }

          .campo {
            margin-bottom: 15px;
            font-size: 16px;
          }

          .campo span {
            font-weight: bold;
            color: #333;
          }

          .footer {
            margin-top: 25px;
            font-size: 12px;
            color: #666;
            text-align: center;
          }

          .linea {
            height: 1px;
            background: #ddd;
            margin: 15px 0;
          }
        </style>
      </head>
      <body>

        <div class="card">
          <h2>Ficha de Membresía</h2>

          <div class="campo"><span>ID:</span> ${t.id}</div>
          <div class="campo"><span>Nombre:</span> ${t.nombre}</div>
          <div class="campo"><span>Precio:</span> $${t.costo}</div>
          <div class="campo"><span>Duración (días):</span> ${t.duracionDias}</div>

          <div class="linea"></div>

          <div class="footer">
            Gimnasio Cuerpo Sano - Registro de Membresías<br>
            Fecha de impresión: ${new Date().toLocaleDateString()}
          </div>
        </div>

        <script>
          window.onload = () => window.print();
        </script>

      </body>
      </html>
    `;

    const ventana = window.open("", "_blank");
    ventana.document.write(contenidoHTML);
    ventana.document.close();

  } catch (error) {
    alert("Error al generar la ficha de impresión.");
    console.error(error);
  }
}
// === Actualizar select ===
function actualizarSelectDescuentos(descuentos = []) {
  const select = document.getElementById("descuentoTipo");
  select.innerHTML =
    `<option value="">Sin descuento</option>` +
    descuentos.map((d) => `<option value="${d.id}">${d.nombre}</option>`).join("");
}

// === Eventos de Tipos ===
function configurarEventosTipos() {
  document.getElementById("btnRegistrarTipo").onclick = () =>
    document.getElementById("modalTipo").classList.add("show");

  document.getElementById("guardarTipoBtn").onclick =  guardarTipo;

  document.getElementById("cancelarTipoBtn").onclick = () =>
    cerrarModal("modalTipo");

  document.getElementById("btnConsultarTipo").onclick = () =>
    document.getElementById("modalConsultaTipo").classList.add("show");

  document.getElementById("confirmarConsultaTipoBtn").onclick = consultarTipo;
  document.querySelector("#modalConsultaTipo #cancelarConsultaBtn").onclick = () =>
    cerrarModal("modalConsultaTipo");
}