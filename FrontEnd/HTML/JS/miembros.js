// =============================
// CONFIGURACIÓN / ESTADO
// =============================
const API_BASE_MIEMBRO = "https://localhost:7271/api/Miembro";
const API_BASE_ENTRENADOR = "https://localhost:7271/api/Entrenador";
const API_BASE_DESCUENTO = "https://localhost:7271/api/Descuento";

let miembros = [];
let paginaActual = 1;
const filasPorPagina = 5;
let miembroSeleccionado = null;
let entrenadoresDisponibles = [];
let descuentosDisponibles = [];
let fotoFileMiembro = null;          // input file real
let urlFotoInputHidden = null;  

// =============================
// INICIALIZACIÓN
// =============================

document.addEventListener("DOMContentLoaded", () => {
  inicializarElementos();
  inicializarEventos();
  inicializarCarga();
});

// DOM elements (serán llenados en inicializarElementos)
let modalForm, contenedorForm, btnAbrirModal, btnCancelarForm, btnGuardarForm;
let tablaBody, btnBuscarMiembro;
let modalConsulta, btnConfirmarConsulta, btnCancelarConsulta;
let modalDetalle, btnCerrarDetalle, btnEditarDetalle, btnEliminarDetalle, btnImprimirDetalle, detalleContenido;
let modalAsignar, miembroNombreAsignar, selectEntrenador, btnConfirmarAsignacion, btnCancelarAsignacion;
let modalCarnet, btnCerrarCarnet, btnImprimirCarnet, carnetNombre, carnetDni, carnetId, carnetFoto, carnetImprimible, barcodeCanvas;
let inputCampos; 


// =============================
// INICIALIZAR ELEMENTOS & EVENTOS
// =============================
function inicializarElementos() {
  modalForm = document.getElementById("modalMiembro");
  contenedorForm = document.getElementById("miembroForm"); // es DIV en tu HTML
  btnAbrirModal = document.getElementById("abrirMiembroBtn");
  btnCancelarForm = document.getElementById("cancelarFormBtn");
  btnGuardarForm = document.getElementById("guardarFormBtn");

  tablaBody = document.querySelector("#miembrosTabla tbody");
  btnBuscarMiembro = document.getElementById("buscarMiembroBtn");

  modalConsulta = document.getElementById("modalConsulta");
  btnConfirmarConsulta = document.getElementById("confirmarConsultaBtn");
  btnCancelarConsulta = document.getElementById("cancelarConsultaBtn");

  modalDetalle = document.getElementById("modalDetalle");
  btnCerrarDetalle = document.getElementById("cerrarDetalleBtn");
  btnEditarDetalle = document.getElementById("btnEditarDetalle");
  btnEliminarDetalle = document.getElementById("btnEliminarDetalle");
  btnImprimirDetalle = document.getElementById("btnImprimirDetalle");
  detalleContenido = document.getElementById("detalleContenido");

  modalAsignar = document.getElementById("modalAsignarEntrenador");
  miembroNombreAsignar = document.getElementById("miembroNombreAsignar");
  selectEntrenador = document.getElementById("selectEntrenador");
  btnConfirmarAsignacion = document.getElementById("confirmarAsignacionBtn");
  btnCancelarAsignacion = document.getElementById("cancelarAsignacionBtn");

  // Carnet
  modalCarnet = document.getElementById("modalCarnet");
  btnCerrarCarnet = document.getElementById("cerrarCarnetBtn");
  btnImprimirCarnet = document.getElementById("btnImprimirCarnet");
  carnetNombre = document.getElementById("carnetNombre");
  carnetDni = document.getElementById("carnetDni");
  carnetId = document.getElementById("carnetId");
  carnetFoto = document.getElementById("carnetFoto");
  carnetImprimible = document.getElementById("carnetImprimible");
  barcodeCanvas = document.getElementById("barcodeCanvas");
  fotoFileMiembro = document.getElementById("fotoFile");
  urlFotoInputHidden = document.getElementById("urlFotoInput");

  
  // inputs dentro del DIV miembroForm (no es <form>)
  inputCampos = {
    miembroId: document.getElementById("miembroId"),
    nombre: document.getElementById("nombre"),
    apellido: document.getElementById("apellido"),
    dni: document.getElementById("dni"),
    direccion: document.getElementById("direccion"),
    telefono: document.getElementById("telefono"),
    fechaNacimiento: document.getElementById("fechaNacimiento"),
    urlFotoInput: document.getElementById("urlFotoInput"),
    tipoMembresia: document.getElementById("tipoMembresia"),
    metodoPago: document.getElementById("metodoPago"),
    descuentoSelect: document.getElementById("descuento")
  };
}

function inicializarEventos() {
  // Abrir modal nuevo miembro
  if (btnAbrirModal) {
    btnAbrirModal.addEventListener("click", () => {
      limpiarFormulario();
      miembroSeleccionado = null;
      abrirModalElement(modalForm);
    });
  }

  if (fotoFileMiembro) {
    fotoFileMiembro.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const base64 = await convertirArchivoABase64(file);
        urlFotoInputHidden.value = base64;
    });
  }

  // Guardar (botón en lugar de submit)
  if (btnGuardarForm) {
    btnGuardarForm.addEventListener("click", async (e) => {
      e.preventDefault();
      await guardarMiembroHandler();
    });
  }

  // Cancelar edición/creación
  if (btnCancelarForm) {
    btnCancelarForm.addEventListener("click", () => cerrarModalElement(modalForm));
  }

  // Consulta por DNI
  if (btnBuscarMiembro) {
    btnBuscarMiembro.addEventListener("click", () => abrirModalElement(modalConsulta));
  }
  if (btnConfirmarConsulta) {
    btnConfirmarConsulta.addEventListener("click", () => {
      const dni = document.getElementById("consultaDni").value.trim();
      const encontrado = miembros.find(m => String(m.dni) === dni);
      if (encontrado) {
        mostrarDetalleMiembro(encontrado);
      } else {
        alert("No se encontró ningún miembro con ese DNI.");
      }
      cerrarModalElement(modalConsulta);
    });
  }
  if (btnCancelarConsulta) {
    btnCancelarConsulta.addEventListener("click", () => cerrarModalElement(modalConsulta));
  }

  // Modal detalle: cerrar / editar / eliminar / imprimir
  if (btnCerrarDetalle) btnCerrarDetalle.addEventListener("click", () => cerrarModalElement(modalDetalle));
  if (btnEditarDetalle) btnEditarDetalle.addEventListener("click", () => {
    if (!miembroSeleccionado) return;
    cargarFormularioParaEdicion(miembroSeleccionado);
    cerrarModalElement(modalDetalle);
    abrirModalElement(modalForm);
  });
  if (btnEliminarDetalle) btnEliminarDetalle.addEventListener("click", async () => {
    if (!miembroSeleccionado) return;
    if (!confirm(`¿Seguro de eliminar a ${miembroSeleccionado.nombre} ${miembroSeleccionado.apellido}?`)) return;
    try {
      const res = await eliminarMiembroAPI(miembroSeleccionado.id);
      if (res.ok || res.status === 204) {
        alert("Miembro eliminado correctamente.");
        await cargarMiembros();
        cerrarModalElement(modalDetalle);
        miembroSeleccionado = null;
      } else {
        alert("Error al eliminar el miembro.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de comunicación con la API.");
    }
  });
  if (btnImprimirDetalle) btnImprimirDetalle.addEventListener("click", () => {
    if (!miembroSeleccionado) return;
    imprimirMiembro(miembroSeleccionado);
  });

  // Asignar entrenador modal
  if (btnCancelarAsignacion) btnCancelarAsignacion.addEventListener("click", () => cerrarModalElement(modalAsignar));
  if (btnConfirmarAsignacion) {
    btnConfirmarAsignacion.addEventListener("click", async () => {
      const entrenadorId = selectEntrenador.value;
      if (!miembroSeleccionado || !entrenadorId) return alert("Seleccione un entrenador.");
      try {
        const url = `${API_BASE_MIEMBRO}/asignar-entrenador?miembroId=${miembroSeleccionado.id}&entrenadorId=${entrenadorId}`;
        const res = await fetch(url, { method: "PUT" });
        if (res.ok) {
          alert("Entrenador asignado con éxito.");
          cerrarModalElement(modalAsignar);
          await cargarMiembros();
        } else if (res.status === 404) {
          alert("Miembro o entrenador no encontrado (404).");
        } else {
          const err = await res.text().catch(() => null);
          alert("Error al asignar entrenador: " + (err || res.status));
        }
      } catch (err) {
        console.error(err);
        alert("Error de red al asignar entrenador.");
      }
    });
  }

  // Carnet: cerrar e imprimir
  if (btnCerrarCarnet) btnCerrarCarnet.addEventListener("click", () => cerrarModalElement(modalCarnet));
  if (btnImprimirCarnet) btnImprimirCarnet.addEventListener("click", () => {
    if (!carnetImprimible) return;
    imprimirElemento(carnetImprimible);
  });

  // Cerrar modales con ESC (opcional)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // cerrar cualquier modal abierto
      [modalForm, modalConsulta, modalDetalle, modalAsignar, modalCarnet].forEach(m => {
        if (m && m.style && m.style.display === "flex") cerrarModalElement(m);
      });
    }
  });
}

function convertirArchivoABase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject("Error leyendo archivo");
    reader.readAsDataURL(file);
  });
}

// =============================
// CARGA INICIAL
// =============================
async function inicializarCarga() {
  await Promise.all([
    cargarMiembros(),
    cargarTipoMembresias(),
    cargarDescuentos(),
    cargarEntrenadores(),
    cargarMiembros()

  ]);
}

// =============================
// API - funciones básicas
// =============================

async function cargarTipoMembresias() {
  try {
    const res = await fetch("https://localhost:7271/api/TipoMembresia");
    const data = await res.json();

    const select = document.getElementById("tipoMembresia");
    select.innerHTML = `<option value="">Seleccione una opción</option>`;

    data.forEach(m => {
      select.innerHTML += `<option value="${m.id}">${m.nombre} (${m.duracionDias} días - $${m.costo})</option>`;
    });

  } catch (e) {
    console.error("Error cargando membresías:", e);
  }
}

async function cargarDescuentos() {
  try {
    const res = await fetch("https://localhost:7271/api/Descuento");
    const data = await res.json();

    const select = document.getElementById("descuento");
    select.innerHTML = `<option value="">Seleccione una opción</option>`;

    data.forEach(d => {
      const porcentaje = (d.porcentaje * 100).toFixed(0);
      select.innerHTML += `<option value="${d.id}">${d.nombre} (${porcentaje}%)</option>`;
    });

  } catch (e) {
    console.error("Error cargando descuentos:", e);
  }
}

async function cargarEntrenadores() {
  try {
    const res = await fetch("https://localhost:7271/api/Entrenador");
    const data = await res.json();

    const select = document.getElementById("entrenadorPersonal");
    select.innerHTML = `<option value="">Sin entrenador asignado</option>`;

    data.forEach(e => {
      select.innerHTML += `<option value="${e.id}">${e.nombre} ${e.apellido} (DNI ${e.dni})</option>`;
    });

  } catch (e) {
    console.error("Error cargando entrenadores:", e);
  }
}

async function obtenerTodosLosMiembros() {
  const res = await fetch(API_BASE_MIEMBRO);
  if (!res.ok) throw new Error("Error al obtener miembros");
  return res.json();
}
async function crearMiembroAPI(data) {
    return fetch(API_BASE_MIEMBRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}

async function actualizarMiembroAPI(id, data) {
    return fetch(`${API_BASE_MIEMBRO}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
}
async function eliminarMiembroAPI(id) {
  return fetch(`${API_BASE_MIEMBRO}/${id}`, { method: "DELETE" });
}
async function obtenerEntrenadoresAPI() {
  const res = await fetch(API_BASE_ENTRENADOR);
  if (!res.ok) throw new Error("Error al obtener entrenadores");
  return res.json();
}
async function obtenerDescuentosAPI() {
  const res = await fetch(API_BASE_DESCUENTO);
  if (!res.ok) throw new Error("Error al obtener descuentos");
  return res.json();
}

// =============================
// CRUD / UI Handlers
// =============================
async function cargarMiembros() {
  try {
    const data = await obtenerTodosLosMiembros();
    miembros = Array.isArray(data) ? data : [];
    renderizarTabla();
  } catch (err) {
    console.error("Error al cargar miembros:", err);
    alert("Error al cargar miembros.");
  }
}

function renderizarTabla() {
  if (!tablaBody) return;
  tablaBody.innerHTML = "";

  if (!miembros || miembros.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="9">No hay miembros registrados</td>`;
    tablaBody.appendChild(tr);
    return;
  }

  // ============================
  // PAGINACIÓN - CÁLCULO DE RANGO
  // ============================
  const inicio = (paginaActual - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const miembrosPagina = miembros.slice(inicio, fin);
  // ============================

  miembrosPagina.forEach(miembro => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${miembro.id}</td>
      <td>${escapeHtml(miembro.nombre)}</td>
      <td>${escapeHtml(miembro.apellido)}</td>
      <td>${miembro.dni ?? ""}</td>
      <td>${escapeHtml(miembro.direccion ?? "")}</td>
      <td>${miembro.telefono ?? ""}</td>
      <td>${miembro.fechaNacimiento ? miembro.fechaNacimiento.substring(0,10) : ""}</td>
      <td>${miembro.urlFoto ? `<img src="${miembro.urlFoto}" width="50" height="50">` : ""}</td>
      <td></td>
    `;

    const accionesTd = tr.querySelector("td:last-child");

    // Crear botones sin usar onclick inline
    const btnModificar = crearBoton(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-pen-line-icon lucide-file-pen-line"><path d="m18.226 5.226-2.52-2.52A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.351"/><path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 18h1"/></svg>`, ["btn-small", "btn", "btn-edit"]);
    const btnEliminar = crearBoton(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`, ["btn-small", "btn", "btn-delete"]);
    const btnCarnet = crearBoton(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card-icon lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`, ["btn-small", "btn", "btn-success"]);
    const btnImprimir = crearBoton(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer-icon lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>`, ["btn-small", "btn-save"]);

    accionesTd.append(btnEliminar);
    accionesTd.append(btnModificar);
    accionesTd.append(btnCarnet);
    accionesTd.append(btnImprimir);

    btnModificar.addEventListener("click", () => {
      cargarFormularioParaEdicion(miembro);
      abrirModalElement(modalForm);
    });

    btnEliminar.addEventListener("click", async () => {
      if (!confirm(`¿Seguro de eliminar a ${miembro.nombre}?`)) return;
      await eliminarMiembroAPI(miembro.id);
      cargarMiembros();
    });

    btnCarnet.addEventListener("click", () => mostrarCarnet(miembro));
    btnImprimir.addEventListener("click", () => imprimirMiembro(miembro));
    tablaBody.appendChild(tr);
   });

  // ============================
  // PAGINACIÓN GENÉRICA
  // ============================
  crearPaginacion({
    contenedor: "#paginacion",
    totalItems: miembros.length,
    paginaActual,
    filasPorPagina,
    onPaginaCambiada: (nuevaPagina) => {
      paginaActual = nuevaPagina;
      renderizarTabla();
    }
  });
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

function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// =============================
// Form / Guardar (Crear / Actualizar)
// =============================
async function guardarMiembroHandler() {
    // Validaciones mínimas
    const nombre = inputCampos.nombre.value.trim();
    const apellido = inputCampos.apellido.value.trim();
    const dni = inputCampos.dni.value.trim();

    if (!nombre || !apellido || !dni) {
        return alert("Nombre, Apellido y DNI son obligatorios.");
    }

    const isEditing = !!miembroSeleccionado;

    // -----------------------------------
    // Construcción del payload BASE (POST o PATCH según sea)
    // -----------------------------------
    const payload = {
        nombre,
        apellido,
        dni: parseInt(dni),
        direccion: inputCampos.direccion.value.trim(),
        telefono: inputCampos.telefono.value.trim()
            ? parseInt(inputCampos.telefono.value.trim())
            : null,
        fechaNacimiento: inputCampos.fechaNacimiento.value || null,
        urlFoto: urlFotoInputHidden.value.trim() // acá JS ya dejó base64 o url real
    };

    // ======================================
    // CAMPOS EXCLUSIVOS PARA CREAR
    // ======================================
    if (!isEditing) {
        // tipoMembresiaId
        if (inputCampos.tipoMembresia?.value) {
            payload.tipoMembresiaId = parseInt(inputCampos.tipoMembresia.value);
        }

        // metodoPagoId
        if (inputCampos.metodoPago?.value) {
            payload.metodoPagoId = parseInt(inputCampos.metodoPago.value);
        }

        // descuentoId
        if (inputCampos.descuentoSelect?.value) {
            payload.descuentoId = parseInt(inputCampos.descuentoSelect.value);
        }
    }
    // ======================================
    // EDITAR — PATCH SOLO LO PERMITIDO
    // ======================================
    else {
        // EL PATCH *NO ACEPTA* membresía / metodoPago / descuento
        // Asignamos entrenador luego de actualizar.
    }

    try {
        let res;

        // -----------------------------------
        // 1) Crear o Actualizar Miembro
        // -----------------------------------
        if (isEditing) {
            res = await actualizarMiembroAPI(miembroSeleccionado.id, payload);
        } else {
            res = await crearMiembroAPI(payload);
        }

        if (!res.ok && res.status !== 201) {
            const errorJson = await res.json().catch(() => null);
            const errMsg = errorJson?.message || errorJson?.title || JSON.stringify(errorJson || "");
            alert(`Error al guardar (código ${res.status}). ${errMsg}`);
            return;
        }

        // -----------------------------------
        // 2) Tomamos el ID recién creado o el existente
        // -----------------------------------
        let miembroId = isEditing ? miembroSeleccionado.id : null;

        if (!isEditing) {
            const creado = await res.json().catch(() => null);
            if (!creado || !creado.id) {
                alert("Miembro creado pero el servidor no devolvió un ID.");
                return;
            }
            miembroId = creado.id;
        }

        // -----------------------------------
        // 3) Asignar Entrenador automáticamente (CREAR o EDITAR)
        // -----------------------------------
        const entrenadorId = inputCampos.entrenadorPersonal?.value;

        if (entrenadorId && entrenadorId !== "" && entrenadorId !== "0") {
            // No permitir eliminar entrenador → solo asignar si eligen alguno
            try {
                const asignarRes = await fetch(
                    `${API_BASE_MIEMBRO}/asignar-entrenador?miembroId=${miembroId}&entrenadorId=${entrenadorId}`,
                    { method: "PUT" }
                );

                if (!asignarRes.ok) {
                    alert("Miembro guardado, pero NO se pudo asignar el entrenador.");
                }
            } catch (err) {
                console.error("Error asignando entrenador:", err);
                alert("Miembro guardado, pero falló la asignación del entrenador.");
            }
        }

        // -----------------------------------
        // Finalizar
        // -----------------------------------
        await cargarMiembros();
        cerrarModalElement(modalForm);
        miembroSeleccionado = null;

        alert(
            isEditing
                ? "Miembro actualizado correctamente."
                : "Miembro creado correctamente. Entrenador asignado si correspondía."
        );

    } catch (err) {
        console.error("Error general al guardar miembro:", err);
        alert("Error de red al guardar miembro.");
    }
}
function limpiarFormulario() {
  if (!inputCampos) return;
  inputCampos.miembroId.value = "";
  inputCampos.nombre.value = "";
  inputCampos.apellido.value = "";
  inputCampos.dni.value = "";
  inputCampos.direccion.value = "";
  inputCampos.telefono.value = "";
  inputCampos.fechaNacimiento.value = "";
  if (inputCampos.urlFotoInput) inputCampos.urlFotoInput.value = "";
  if (inputCampos.tipoMembresia) inputCampos.tipoMembresia.value = "";
  if (inputCampos.metodoPago) inputCampos.metodoPago.value = "";
  if (inputCampos.descuentoSelect) inputCampos.descuentoSelect.value = "";
  miembroSeleccionado = null;
  if (fotoFileMiembro) fotoFileMiembro.value = "";
  if (urlFotoInputHidden) urlFotoInputHidden.value = "";
}

function cargarFormularioParaEdicion(miembro) {
  if (!inputCampos) return;
  inputCampos.miembroId.value = miembro.id ?? "";
  inputCampos.nombre.value = miembro.nombre ?? "";
  inputCampos.apellido.value = miembro.apellido ?? "";
  inputCampos.dni.value = miembro.dni ?? "";
  inputCampos.direccion.value = miembro.direccion ?? "";
  inputCampos.telefono.value = miembro.telefono ?? "";
  inputCampos.fechaNacimiento.value = miembro.fechaNacimiento ? miembro.fechaNacimiento.substring(0,10) : "";
  if (inputCampos.urlFotoInput) inputCampos.urlFotoInput.value = miembro.urlFoto ?? "";
  if (inputCampos.descuentoSelect) inputCampos.descuentoSelect.value = miembro.descuentoId ?? "";
  miembroSeleccionado = miembro;
}

// =============================
// Detalle / Imprimir / Carnet
// =============================
async function mostrarDetalleMiembro(mi) {
    miembroSeleccionado = mi;

    const nombreCompleto = `${escapeHtml(mi.nombre)} ${escapeHtml(mi.apellido)}`;
    const fechaNac = mi.fechaNacimiento ? mi.fechaNacimiento.substring(0, 10) : "N/A";

    // ----- Membresía -----
    const datosMembresia = mi.membresia || null;
    const tipoMembresiaId = datosMembresia?.tipoMembresiaId || null;
    let nombreMembresia = "N/A";

    if (tipoMembresiaId) {
        try {
            const res = await fetch(`https://localhost:7271/api/TipoMembresia/${tipoMembresiaId}`);
            if (res.ok) {
                const data = await res.json();
                nombreMembresia = data.nombre || "N/A";
            }
        } catch (e) {
            console.error("Error al obtener nombre de membresía:", e);
        }
    }

    const fechaInicio = datosMembresia?.fechaInicio ? datosMembresia.fechaInicio.substring(0, 10) : "N/A";
    const fechaVenc = datosMembresia?.fechaVencimiento ? datosMembresia.fechaVencimiento.substring(0, 10) : "N/A";

    detalleContenido.innerHTML = `
        <h3>${nombreCompleto}</h3>

        ${mi.urlFoto ? `
            <img src="${mi.urlFoto}" alt="Foto del miembro"
            width="150" style="display:block;margin:10px auto;border-radius:8px;"/>
        ` : ""}

        <hr>

        <p><strong>ID:</strong> ${mi.id}</p>
        <p><strong>DNI:</strong> ${mi.dni}</p>
        <p><strong>Dirección:</strong> ${escapeHtml(mi.direccion || "")}</p>
        <p><strong>Teléfono:</strong> ${mi.telefono || "N/A"}</p>
        <p><strong>Fecha de Nacimiento:</strong> ${fechaNac}</p>
        <p><strong>Descuento:</strong> ${mi.descuento || "N/A"}</p>

        <hr>

        <h4>Membresía</h4>
        <p><strong>Tipo:</strong> ${nombreMembresia}</p>
        <p><strong>Fecha Inicio:</strong> ${fechaInicio}</p>
        <p><strong>Fecha Vencimiento:</strong> ${fechaVenc}</p>
    `;

    abrirModalElement(modalDetalle);
}

// =============================
// Imprimir Miembro - Carnet Profesional
// =============================
async function imprimirMiembro(mi) {
  try {
    // ====== 1. Obtener datos extra (tipo de membresía real) ======
    let nombreMembresia = "N/A";
    const memb = mi.membresia;
    let ultimoPago = null;
    let ticket = null;

    if (memb?.tipoMembresiaId) {
      try {
        const resTipo = await fetch(`https://localhost:7271/api/TipoMembresia/${memb.tipoMembresiaId}`);
        if (resTipo.ok) {
          const tipoData = await resTipo.json();
          nombreMembresia = tipoData.nombre || "N/A";
        }
      } catch (e) {
        console.error("Error obteniendo membresía:", e);
      }
    }

    // Último pago
    if (memb?.pagos?.length > 0) {
      ultimoPago = memb.pagos[0];
      ticket = ultimoPago.ticket || null;
    }

    const contenidoHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Ficha del Miembro</title>

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
            max-width: 500px;
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
            margin-bottom: 12px;
            font-size: 16px;
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

          <h2>Ficha de Miembro</h2>

          <div class="foto">
            ${mi.urlFoto ? `<img src="${mi.urlFoto}" alt="Foto del miembro">` : "<p>Sin foto</p>"}
          </div>

          <div class="campo"><span>Nombre:</span> ${escapeHtml(mi.nombre)} ${escapeHtml(mi.apellido)}</div>
          <div class="campo"><span>ID:</span> ${mi.id}</div>
          <div class="campo"><span>DNI:</span> ${mi.dni}</div>
          <div class="campo"><span>Teléfono:</span> ${mi.telefono || "N/A"}</div>
          <div class="campo"><span>Dirección:</span> ${escapeHtml(mi.direccion || "N/A")}</div>
          <div class="campo"><span>Fecha de Nacimiento:</span> ${mi.fechaNacimiento ? mi.fechaNacimiento.substring(0,10) : "N/A"}</div>
          <div class="campo"><span>Descuento:</span> ${escapeHtml(mi.descuento || "N/A")}</div>

          <div class="linea"></div>

          <h3 style="color:#28a745; text-align:center; margin-bottom:12px;">Membresía</h3>
          <div class="campo"><span>Tipo:</span> ${nombreMembresia}</div>
          <div class="campo"><span>Inicio:</span> ${memb?.fechaInicio ? memb.fechaInicio.substring(0,10) : "N/A"}</div>
          <div class="campo"><span>Vencimiento:</span> ${memb?.fechaVencimiento ? memb.fechaVencimiento.substring(0,10) : "N/A"}</div>

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
    console.error("Error imprimir miembro:", err);
    alert("No se pudo imprimir la ficha del miembro.");
  }
}
function mostrarCarnet(miembro) {
  // preparar datos
  const idParaBarcode = String(miembro.id ?? "").padStart(8, "0");
  carnetNombre.textContent = `${miembro.nombre} ${miembro.apellido}`;
  carnetDni.textContent = miembro.dni ?? "";
  carnetId.textContent = miembro.id ?? "";
  carnetFoto.src = miembro.urlFoto || "../ASSETS/img/default-user.png";

  // Generar codigo de barras (JsBarcode debe estar cargado)
  try {
    if (typeof JsBarcode === "function") {
      JsBarcode("#barcodeCanvas", idParaBarcode, {
        format: "CODE128",
        displayValue: true,
        text: idParaBarcode,
        margin: 6,
        width: 2,
        height: 50
      });
    } else {
      // si no está JsBarcode, limpiamos canvas
      console.warn("JsBarcode no disponible - no se generará código de barras.");
      if (barcodeCanvas) barcodeCanvas.innerHTML = "";
    }
  } catch (err) {
    console.error("Error al generar barcode:", err);
  }

  abrirModalElement(modalCarnet);
}

function imprimirElemento(elemento) {
  const contenido = elemento.outerHTML;
  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>Imprimir</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            #carnetImprimible { box-sizing: border-box; }
          }
        </style>
      </head>
      <body>${contenido}<script>window.onload = () => window.print();</script></body>
    </html>
  `);
  win.document.close();
}

// =============================
// Utilidades modales (compatibles con tu HTML: usa style.display)
// =============================
function abrirModalElement(modal) {
  if (!modal) return;
  modal.style.display = "flex";
}
function cerrarModalElement(modal) {
  if (!modal) return;
  modal.style.display = "none";
  // limpiar estado si era el form
  if (modal === modalForm) miembroSeleccionado = null;
}
