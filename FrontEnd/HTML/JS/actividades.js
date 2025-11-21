// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener("DOMContentLoaded", () => {
    listarActividades();
    configurarEventos();
});

let editando = false;
let idEditando = null;
let paginaActual = 1;
const filasPorPagina = 5;

// ========================================
// LIMPIAR MODAL
// ========================================
function limpiarModal() {
    document.getElementById("actividadId").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
}

// ========================================
// CONFIGURAR EVENTOS
// ========================================
function configurarEventos() {

    const modalActividad = document.getElementById("modalActividad");
    const modalConsulta = document.getElementById("modalConsulta");
    const modalDetalle = document.getElementById("modalDetalle");

    // ABRIR MODAL CREAR
    document.getElementById("abrirActividadBtn").addEventListener("click", () => {
        limpiarModal();
        editando = false;
        idEditando = null;
        modalActividad.classList.add("show");
    });

    // GUARDAR (SIN SUBMIT)
    document.getElementById("guardarFormBtn").addEventListener("click", async () => {

        const nombre = document.getElementById("nombre").value.trim();
        const descripcion = document.getElementById("descripcion").value.trim();

        if (!nombre) {
            alert("El nombre es obligatorio");
            return;
        }

        const actividad = { nombre, descripcion };

        try {
            if (editando) {
                await fetch(`https://localhost:7271/api/Actividad/${idEditando}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(actividad)
                });
            } else {
                await fetch(`https://localhost:7271/api/Actividad`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(actividad)
                });
            }

            limpiarModal();
            modalActividad.classList.remove("show");
            listarActividades();
            editando = false;
            idEditando = null;

        } catch (err) {
            alert("Error al guardar la actividad");
            console.error(err);
        }
    });

    // CANCELAR FORMULARIO
    document.getElementById("cancelarFormBtn").addEventListener("click", () => {
        limpiarModal();
        editando = false;
        idEditando = null;
        modalActividad.classList.remove("show");
    });

    // CONSULTAR ACTIVIDAD
    document.getElementById("buscarActividadBtn").addEventListener("click", () => {
        modalConsulta.classList.add("show");
    });

    document.getElementById("cancelarConsultaBtn").addEventListener("click", () => {
        modalConsulta.classList.remove("show");
    });

    document.getElementById("confirmarConsultaBtn").addEventListener("click", async () => {
        const nombreBuscado = document.getElementById("consultaNombre").value.toLowerCase().trim();

        if (!nombreBuscado) {
            alert("Ingrese un nombre para consultar.");
            return;
        }

        try {
            const res = await fetch(`https://localhost:7271/api/Actividad`);
            const actividades = await res.json();

            const actividad = actividades.find(a => a.nombre.toLowerCase() === nombreBuscado);

            modalConsulta.classList.remove("show");

            if (!actividad) {
                alert("No se encontró la actividad.");
                return;
            }

            mostrarDetalle(actividad);

        } catch (err) {
            console.error(err);
            alert("Error al consultar actividades.");
        }
    });

    document.getElementById("cerrarDetalleBtn").addEventListener("click", () => {
        modalDetalle.classList.remove("show");
    });
}
// ========================================
// LISTAR ACTIVIDADES CON PAGINACIÓN
// ========================================
async function listarActividades() {
    const tbody = document.querySelector("#actividadesTabla tbody");

    try {
        const res = await fetch(`https://localhost:7271/api/Actividad`);
        const actividades = await res.json();

        if (!actividades || actividades.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4'>No hay actividades registradas.</td></tr>";
            return;
        }

        // ============================
        // PAGINACIÓN CORRECTA
        // ============================
        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;
        const actividadesPagina = actividades.slice(inicio, fin);

        // ============================
        // RENDER SOLO DE LA PÁGINA
        // ============================
        tbody.innerHTML = actividadesPagina.map(a => `
            <tr>
                <td>${a.id}</td>
                <td>${a.nombre}</td>
                <td>${a.descripcion || ""}</td>
                <td>
                    <button class="btn-small btn btn-edit" onclick="editarActividad(${a.id})"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-pen-line-icon lucide-file-pen-line"><path d="m18.226 5.226-2.52-2.52A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.351"/><path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 18h1"/></svg></button>
                    <button class="btn-small btn btn-delete" onclick="eliminarActividad(${a.id})"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                    <button class="btn-small btn btn-save" onclick="imprimirActividad(${a.id})"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer-icon lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg></button> 
                        
                </td>
            </tr>
        `).join("");

        // ============================
        // PAGINACIÓN GENÉRICA
        // ============================
        crearPaginacion({
            contenedor: "#paginacion",
            totalItems: actividades.length,  // <--- CORRECTO
            paginaActual,
            filasPorPagina,
            onPaginaCambiada: (nuevaPagina) => {
                paginaActual = nuevaPagina;
                listarActividades();         // <--- CORRECTO
            }
        });

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4">${err.message}</td></tr>`;
        console.error(err);
    }
}

// ========================================
// EDITAR ACTIVIDAD
// ========================================
async function editarActividad(id) {
    try {
        const res = await fetch(`https://localhost:7271/api/Actividad/${id}`);
        const act = await res.json();

        document.getElementById("actividadId").value = act.id;
        document.getElementById("nombre").value = act.nombre;
        document.getElementById("descripcion").value = act.descripcion;

        editando = true;
        idEditando = id;

        document.getElementById("modalActividad").classList.add("show");

    } catch (err) {
        alert("Error al cargar la actividad");
        console.error(err);
    }
}

// ========================================
// ELIMINAR ACTIVIDAD
// ========================================
async function eliminarActividad(id) {
    if (!confirm("¿Desea eliminar esta actividad?")) return;

    try {
        await fetch(`https://localhost:7271/api/Actividad/${id}`, { method: "DELETE" });
        listarActividades();
    } catch (err) {
        alert("Error al eliminar actividad");
        console.error(err);
    }
}

// ========================================
// IMPRIMIR ACTIVIDAD
// ========================================
async function imprimirActividad(id) {
    try {
        const res = await fetch(`https://localhost:7271/api/Actividad/${id}`);
        const act = await res.json();

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
              <h2>Ficha de Actividad</h2>
              <div class="campo"><span>ID:</span> ${act.id}</div>
              <div class="campo"><span>Nombre:</span> ${act.nombre}</div>
              <div class="campo"><span>Descripción:</span> ${act.descripcion || ""}</div>

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

    } catch (err) {
        alert("Error al imprimir actividad");
        console.error(err);
    }
}

// ========================================
// MOSTRAR DETALLE
// ========================================
function mostrarDetalle(act) {
    const modal = document.getElementById("modalDetalle");
    const cont = document.getElementById("detalleContenido");

    cont.innerHTML = `
        <h3>${act.nombre}</h3>
        <p><strong>ID:</strong> ${act.id}</p>
        <p><strong>Descripción:</strong> ${act.descripcion || ''}</p>
    `;

    document.getElementById("btnEditarDetalle").onclick = () => editarActividad(act.id);
    document.getElementById("btnEliminarDetalle").onclick = () => eliminarActividad(act.id);
    document.getElementById("btnImprimirDetalle").onclick = () => imprimirActividad(act.id);

    modal.classList.add("show");
}
