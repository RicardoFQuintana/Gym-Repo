// =============================
// CONFIGURACIÓN / ESTADO
// =============================
const API_BASE_ENTRENADOR = "https://localhost:7271/api/Entrenador";
const CERTIFICADO_IMG_PATH = "../ASSETS/img/ImagenesCertificados/";
const ENTRENADOR_IMG_PATH = "../ASSETS/img/ImagenesPersonas/ImagenesEditadas/";

let entrenadores = [];
let paginaActual = 1;
const filasPorPagina = 4;
let entrenadorSeleccionado = null;


// =============================
// VARIABLES DE DOM
// =============================
let modalForm, contenedorForm, btnAbrirModal, btnCancelarForm, btnGuardarForm;
let tablaBody;
let modalConsulta, btnConfirmarConsulta, btnCancelarConsulta;
let modalDetalle, btnCerrarDetalle, btnEditarDetalle, btnEliminarDetalle, btnImprimirDetalle, detalleContenido;

let inputCampos;

let fotoInput, certInput, fileNameFoto, fileNameCert, urlFotoEntrenador, urlCertEntrenador;

// =============================
// INICIALIZACIÓN
// =============================
document.addEventListener("DOMContentLoaded", () => {
    inicializarElementos();
    inicializarEventos();
    cargarEntrenadores();
});

// =============================
// ELEMENTOS
// =============================
function inicializarElementos() {
    modalForm = document.getElementById("modalEntrenador");
    contenedorForm = document.getElementById("entrenadorForm");

    btnAbrirModal = document.getElementById("abrirEntrenadorBtn");
    btnCancelarForm = document.getElementById("cancelarEntrenadorBtn");
    btnGuardarForm = document.getElementById("GuardarEntrenadorBtn");

    tablaBody = document.querySelector("#entrenadoresTabla tbody");

    // Consulta
    modalConsulta = document.getElementById("modalConsultaEntrenador");
    btnConfirmarConsulta = document.getElementById("confirmarConsultaEntrenadorBtn");
    btnCancelarConsulta = document.getElementById("cancelarConsultaEntrenadorBtn");

    // Detalle
    modalDetalle = document.getElementById("modalDetalleEntrenador");
    btnCerrarDetalle = document.getElementById("cerrarDetalleEntrenadorBtn");
    btnEditarDetalle = document.getElementById("btnEditarEntrenador");
    btnEliminarDetalle = document.getElementById("btnEliminarEntrenador");
    btnImprimirDetalle = document.getElementById("btnImprimirEntrenador");
    detalleContenido = document.getElementById("detalleEntrenadorContenido");

    // Campos del formulario
    inputCampos = {
        id: document.getElementById("entrenadorId"),
        nombre: document.getElementById("nombre"),
        apellido: document.getElementById("apellido"),
        dni: document.getElementById("dni"),
        direccion: document.getElementById("direccion"),
        telefono: document.getElementById("telefono"),
        fechaNacimiento: document.getElementById("fechaNacimiento")
    };

    fotoInput = document.getElementById("fotoFile");
    certInput = document.getElementById("fotoFileCertificado");

    fileNameFoto = document.getElementById("fileNameFoto");
    fileNameCert = document.getElementById("fileNameCertificado");

    urlFotoEntrenador = document.getElementById("urlFotoEntrenador");
    urlCertEntrenador = document.getElementById("urlCertificadoEntrenador");
}

// =============================
// EVENTOS
// =============================
function inicializarEventos() {

    fotoInput.addEventListener("change", () => {
        if (!fotoInput.files.length) {
            fileNameFoto.textContent = "Ningún archivo seleccionado";
            urlFotoEntrenador.value = "";
            return;
        }

        const file = fotoInput.files[0];
        if (!file.type.startsWith("image/")) {
            alert("Debe ser una imagen");
            fotoInput.value = "";
            return;
        }

        fileNameFoto.textContent = file.name;
        urlFotoEntrenador.value = file.name;
    });

    certInput.addEventListener("change", () => {
        if (!certInput.files.length) {
            fileNameCert.textContent = "Ningún archivo seleccionado";
            urlCertEntrenador.value = "";
            return;
        }

        const file = certInput.files[0];
        if (!file.type.startsWith("image/")) {
            alert("Debe ser una imagen");
            certInput.value = "";
            return;
        }

        fileNameCert.textContent = file.name;
        urlCertEntrenador.value = file.name; 
    });

    // Abrir modal crear
    btnAbrirModal.addEventListener("click", () => {
        limpiarFormulario();
        entrenadorSeleccionado = null;
        abrirModal(modalForm);
    });

    // Guardar (crear o editar)
    btnGuardarForm.addEventListener("click", async () => {
        await guardarEntrenador();
    });

    // Cancelar formulario
    btnCancelarForm.addEventListener("click", () => cerrarModal(modalForm));

    // Consulta por DNI
    btnCancelarConsulta.addEventListener("click", () => cerrarModal(modalConsulta));

    btnConfirmarConsulta.addEventListener("click", () => {
        const dni = document.getElementById("consultaDniEntrenador").value.trim();
        const encontrado = entrenadores.find(e => String(e.dni) === dni);

        if (encontrado) {
            mostrarDetalle(encontrado);
        } else {
            alert("No se encontró ningún entrenador con ese DNI.");
        }
        cerrarModal(modalConsulta);
    });

    document.getElementById("buscarEntrenadorBtn")
        .addEventListener("click", () => abrirModal(modalConsulta));

    // Detalle
    btnCerrarDetalle.addEventListener("click", () => cerrarModal(modalDetalle));

    btnEditarDetalle.addEventListener("click", () => {
        if (!entrenadorSeleccionado) return;

        cargarFormularioParaEdicion(entrenadorSeleccionado);
        cerrarModal(modalDetalle);
        abrirModal(modalForm);
    });

    btnEliminarDetalle.addEventListener("click", async () => {
        if (!entrenadorSeleccionado) return;
        if (!confirm(`¿Seguro de eliminar a ${entrenadorSeleccionado.nombre} ${entrenadorSeleccionado.apellido}?`))
            return;

        const res = await fetch(`${API_BASE_ENTRENADOR}/${entrenadorSeleccionado.id}`, { method: "DELETE" });
        if (res.ok || res.status === 204) {
            alert("Entrenador eliminado.");
            cargarEntrenadores();
            cerrarModal(modalDetalle);
            entrenadorSeleccionado = null;
        } else {
            alert("Error al eliminar entrenador.");
        }
    });

    btnImprimirDetalle.addEventListener("click", () => {
        if (entrenadorSeleccionado) imprimirEntrenador(entrenadorSeleccionado);
    });

    // ESC cierra modales
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            [modalForm, modalConsulta, modalDetalle].forEach(m => {
                if (m.style.display === "flex") cerrarModal(m);
            });
        }
    });
}

function verCertificado(id) {

    const ent = entrenadores.find(e => e.id == id);

    if (!ent) {
        alert("Entrenador no encontrado.");
        return;
    }

    if (!ent.urlCertificado) {
        alert("No hay certificado disponible.");
        return;
    }

    // 👉 construir la ruta completa
    const certificadoUrl = `${CERTIFICADO_IMG_PATH}${ent.urlCertificado}`;

    // abrir en nueva pestaña
    window.open(certificadoUrl, "_blank");
}

// =============================
// API
// =============================
async function obtenerEntrenadores() {
    const res = await fetch(API_BASE_ENTRENADOR);
    return res.ok ? res.json() : [];
}

// =============================
// CARGA TABLA
// =============================
async function cargarEntrenadores() {
    try {
        entrenadores = await obtenerEntrenadores();
        renderizarTabla();
    } catch (err) {
        console.error(err);
        alert("Error cargando entrenadores.");
    }
}

function crearBoton(html, clases) {
    const b = document.createElement("button");
    b.innerHTML = html; // <---- PERMITE SVG
    clases.forEach(c => b.classList.add(c));
    b.classList.add("btn");

    // separación
    b.style.marginRight = "6px";

    return b;
}

// =============================
// LISTAR ENTRENADORES
// =============================
function renderizarTabla() {

  const tbody = tablaBody;
  tbody.innerHTML = "<tr><td colspan='10'>Cargando...</td></tr>";

  if (!entrenadores || entrenadores.length === 0) {
    tbody.innerHTML = "<tr><td colspan='10'>No hay entrenadores registrados.</td></tr>";
    return;
  }

  // ============================
  // PAGINACIÓN REAL
  // ============================
  const inicio = (paginaActual - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const pagina = entrenadores.slice(inicio, fin);

  tbody.innerHTML = pagina.map(ent => `
    <tr>
      <td>${ent.id}</td>
      <td>${ent.nombre}</td>
      <td>${ent.apellido}</td>
      <td>${ent.dni}</td>
      <td>${ent.direccion || ""}</td>
      <td>${ent.telefono || ""}</td>
      <td>${ent.fechaNacimiento ? ent.fechaNacimiento.substring(0,10) : ""}</td>
      <td><img src="${ent.urlFoto? `${ENTRENADOR_IMG_PATH}${ent.urlFoto}` : `${ENTRENADOR_IMG_PATH}default-user.png`}" class = avatar width="50"></td>
      <td>${ent.urlCertificado ? `<button class="btn-small btn" onclick="verCertificado('${ent.id}')">Ver</button>` : "N/A"}</td>
      <td>
        <button class="btn btn-edit btn-small" onclick="abrirEditarEntrenador(${ent.id})" data-tooltip="Editar Entrenador">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-pen-line-icon lucide-file-pen-line"><path d="m18.226 5.226-2.52-2.52A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.351"/><path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 18h1"/></svg>
        </button>
        <button class="btn btn-delete btn-small" onclick="eliminarEntrenadorPorId(${ent.id})" data-tooltip="Eliminar Entrenador">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
        <button class="btn btn-save btn-small" onclick="imprimirEntrenadorPorId(${ent.id})" data-tooltip="Imprimir PDF">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer-icon lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>
        </button>
      </td>
    </tr>
  `).join("");

  // ============================
  // PAGINACIÓN GENÉRICA
  // ============================
  crearPaginacion({
    contenedor: "#paginacion",
    totalItems: entrenadores.length,
    paginaActual,
    filasPorPagina,
    onPaginaCambiada: (nuevaPagina) => {
      paginaActual = nuevaPagina;
      renderizarTabla();
    }
  });
}

// =============================
// UTIL FORM
// =============================
function limpiarFormulario() {
    Object.values(inputCampos).forEach(i => i.value = "");
    urlFotoEntrenador.value = "";
    urlCertEntrenador.value = "";
    fileNameFoto.textContent = "Ningún archivo seleccionado";
    fileNameCert.textContent = "Ningún archivo seleccionado";
    entrenadorSeleccionado = null;
}

function cargarFormularioParaEdicion(ent) {
    inputCampos.id.value = ent.id;
    inputCampos.nombre.value = ent.nombre || "";
    inputCampos.apellido.value = ent.apellido || "";
    inputCampos.dni.value = ent.dni || "";
    inputCampos.direccion.value = ent.direccion || "";
    inputCampos.telefono.value = ent.telefono || "";
    inputCampos.fechaNacimiento.value = ent.fechaNacimiento ? ent.fechaNacimiento.substring(0,10) : "";

    // mantener nombres de archivos
    urlFotoEntrenador.value = ent.urlFoto || "";
    urlCertEntrenador.value = ent.urlCertificado || "";

    fileNameFoto.textContent = ent.urlFoto || "Ningún archivo seleccionado";
    fileNameCert.textContent = ent.urlCertificado || "Ningún archivo seleccionado";

    entrenadorSeleccionado = ent;
}

// =============================
// GUARDAR (CREAR / EDITAR)
// =============================
async function guardarEntrenador() {

    const data = {
        nombre: inputCampos.nombre.value.trim(),
        apellido: inputCampos.apellido.value.trim(),
        dni: parseInt(inputCampos.dni.value),
        direccion: inputCampos.direccion.value.trim(),
        telefono: inputCampos.telefono.value.trim() ? parseInt(inputCampos.telefono.value) : null,
        fechaNacimiento: inputCampos.fechaNacimiento.value || null,
        urlFoto: urlFotoEntrenador.value,
        urlCertificado: urlCertEntrenador.value
    };

    if (!data.urlFoto) {
        alert("Debes elegir una foto.");
        return;
    }

    if (!data.urlCertificado) {
        alert("Debes elegir un certificado.");
        return;
    }

    const isEditing = !!entrenadorSeleccionado;
    const url = isEditing
        ? `${API_BASE_ENTRENADOR}/${entrenadorSeleccionado.id}`
        : API_BASE_ENTRENADOR;

    const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok && res.status !== 201) {
        alert("Error al guardar datos.");
        return;
    }

    alert(isEditing ? "Entrenador actualizado." : "Entrenador creado.");
    cerrarModal(modalForm);
    cargarEntrenadores();
    entrenadorSeleccionado = null;
}


// -----------------------------
// Wrappers para botones (aceptan id)
// -----------------------------

// Abre el formulario para edición a partir del id
function abrirEditarEntrenador(id) {
    const ent = entrenadores.find(e => e.id == id);
    if (!ent) {
        alert("Entrenador no encontrado.");
        return;
    }
    cargarFormularioParaEdicion(ent);  
    abrirModal(modalForm);
}

// Eliminar por id (wrapper)
async function eliminarEntrenadorPorId(id) {
    if (!confirm("¿Seguro que desea eliminar este entrenador?")) return;

    try {
        const res = await fetch(`${API_BASE_ENTRENADOR}/${id}`, { method: "DELETE" });
        if (res.ok || res.status === 204) {
            alert("Entrenador eliminado.");
            await cargarEntrenadores();
        } else {
            const text = await res.text().catch(() => "");
            console.error("Error eliminar:", res.status, text);
            alert("Error al eliminar entrenador.");
        }
    } catch (err) {
        console.error("Error eliminar entrenador:", err);
        alert("Error de conexión al eliminar entrenador.");
    }
}

// Imprimir por id 
function imprimirEntrenadorPorId(id) {
    const ent = entrenadores.find(e => e.id == id);
    if (!ent) {
        alert("Entrenador no encontrado.");
        return;
    }
    imprimirEntrenador(ent); 
}

// =============================
// DETALLE / IMPRIMIR
// =============================
function mostrarDetalle(ent) {
    entrenadorSeleccionado = ent;

    const clasesHtml = ent.clases && ent.clases.length > 0
        ? ent.clases.map(c => `
            <li>
                <strong>${c.nombre}</strong>  
                (${c.horaInicio.substring(0,5)} - ${c.horaFin.substring(0,5)})  
                — Día ${c.dia}
            </li>
        `).join("")
        : "<li>No tiene clases asignadas.</li>";

    const miembrosHtml = ent.miembros && ent.miembros.length > 0
        ? ent.miembros.map(m => `<li>${m.nombre} ${m.apellido} (DNI ${m.dni})</li>`).join("")
        : "<li>No tiene miembros asignados.</li>";

    const fotoSrc = ent.urlFoto
        ? `${ENTRENADOR_IMG_PATH}${ent.urlFoto}`
        : `${ENTRENADOR_IMG_PATH}default-user.png`;

    const certificadoSrc = ent.urlCertificado
        ? `${CERTIFICADO_IMG_PATH}${ent.urlCertificado}`
        : ""; 


    detalleContenido.innerHTML = `
        <h3>${ent.nombre} ${ent.apellido}</h3>

        <img src="${fotoSrc}" alt="Foto del entrenador"
            width="150" style="display:auto;margin:10px 130px  10px  0px;border-radius:8px;"/>

        ${certificadoSrc ? `<img src="${certificadoSrc}" alt="certificado del entrenador"
            width="150" height="150" style="display:auto;margin:10px auto;border-radius:8px;"/>` : ""}

        <hr>

        <p><strong>ID:</strong> ${ent.id}</p>
        <p><strong>DNI:</strong> ${ent.dni}</p>
        <p><strong>Dirección:</strong> ${ent.direccion}</p>
        <p><strong>Teléfono:</strong> ${ent.telefono || "N/A"}</p>
        <p><strong>Fecha Nac.:</strong> ${ent.fechaNacimiento ? ent.fechaNacimiento.substring(0,10) : "N/A"}</p>

        <hr>

        <h4>Clases que dicta</h4>
        <ul>${clasesHtml}</ul>

        <hr>

        <h4>Miembros Asignados</h4>
        <ul>${miembrosHtml}</ul>
    `;

    abrirModal(modalDetalle);
}

async function imprimirEntrenador(ent) {
    try {
        const clasesHtml = ent.clases && ent.clases.length > 0
            ? ent.clases.map(c => `
                <div class="campo">
                    <span>${c.nombre}</span> — Día ${c.dia} |
                    ${c.horaInicio.substring(0,5)} - ${c.horaFin.substring(0,5)}
                </div>
            `).join("")
            : `<div class="campo">No tiene clases asignadas.</div>`;

        const miembrosHtml = ent.miembros && ent.miembros.length > 0
            ? ent.miembros.map(m => `
                <div class="campo">
                    <span>${m.nombre} ${m.apellido}</span> — DNI ${m.dni}
                </div>
            `).join("")
            : `<div class="campo">No tiene miembros asignados.</div>`;

        const fotoPrint = ent.urlFoto ? `${ENTRENADOR_IMG_PATH}${ent.urlFoto}` : ""; 
        const certificadoPrint = ent.urlCertificado ? `${CERTIFICADO_IMG_PATH}${ent.urlCertificado}` : "";

        const contenidoHTML = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <title>Ficha del Entrenador</title>

                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 40px;
                        background: #f2f2f2;
                    }

                    .card {
                        background: white;
                        border-radius: 12px;
                        padding: 28px;
                        max-width: 600px;
                        margin: auto;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.25);
                        border-left: 6px solid #007bff;
                    }

                    h2 {
                        text-align: center;
                        font-size: 26px;
                        margin-bottom: 18px;
                        color: #007bff;
                    }

                    .campo {
                        margin-bottom: 10px;
                        font-size: 15px;
                    }

                    .campo span {
                        font-weight: bold;
                        color: #222;
                    }

                    .foto {
                        text-align: center;
                        margin: 18px 0;
                    }

                    .foto img {
                        width: 180px;
                        height: 180px;
                        object-fit: cover;
                        border-radius: 10px;
                        box-shadow: 0 3px 10px rgba(0,0,0,0.22);
                    }

                    .linea {
                        height: 1px;
                        background: #ccc;
                        margin: 20px 0;
                    }

                    h3 {
                        color: #007bff;
                        margin: 10px 0;
                        text-align: center;
                    }

                    .footer {
                        margin-top: 25px;
                        font-size: 12px;
                        color: #666;
                        text-align: center;
                    }
                </style>
            </head>

            <body>

                <div class="card">

                    <h2>Ficha del Entrenador</h2>

                    <div class="foto">
                        <img src="${fotoPrint}" alt="Foto del entrenador">

                        ${certificadoPrint
                            ? `<img src="${certificadoPrint}" style="width:250px;height:auto;margin-top:10px;">`
                            : ""
                        }
                    </div>

                    <div class="campo"><span>Nombre:</span> ${ent.nombre} ${ent.apellido}</div>
                    <div class="campo"><span>ID:</span> ${ent.id}</div>
                    <div class="campo"><span>DNI:</span> ${ent.dni}</div>
                    <div class="campo"><span>Teléfono:</span> ${ent.telefono || "N/A"}</div>
                    <div class="campo"><span>Dirección:</span> ${ent.direccion || "N/A"}</div>
                    <div class="campo">
                        <span>Fecha de Nacimiento:</span>
                        ${ent.fechaNacimiento ? ent.fechaNacimiento.substring(0,10) : "N/A"}
                    </div>

                    <div class="linea"></div>

                    <h3>Clases que Dicta</h3>
                    ${clasesHtml}

                    <div class="linea"></div>

                    <h3>Miembros Asignados</h3>
                    ${miembrosHtml}

                    <div class="linea"></div>

                    <div class="footer">
                        Gimnasio Cuerpo Sano<br>
                        Fecha de impresión: ${new Date().toLocaleDateString()}
                    </div>
                </div>

                <script>window.onload = () => window.print();</script>

            </body>
            </html>
        `;

        const w = window.open("", "_blank");
        w.document.write(contenidoHTML);
        w.document.close();

    } catch (err) {
        console.error("Error imprimiendo entrenador:", err);
        alert("No se pudo imprimir la ficha del entrenador.");
    }
}

// =============================
// MODALES
// =============================
function abrirModal(m) { m.style.display = "flex"; }
function cerrarModal(m) { m.style.display = "none"; }

