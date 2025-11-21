// =============================
// CONFIGURACIÓN
// =============================
const API_URL = "https://localhost:7271/api";
let clases = [];
let paginaActual = 1;
const filasPorPagina = 5;
let actividadesDisponibles = [];
let entrenadores = [];
let editando = false;
let idEditando = null;
let modalAnterior = null;

// =============================
// INICIALIZACIÓN
// =============================
document.addEventListener("DOMContentLoaded", async () => {
  await cargarActividades();
  await cargarEntrenadores();
  await listarClases();
  configurarEventos();
});

// =============================
// FUNCIONES AUXILIARES
// =============================
function obtenerCount(inscripciones) {
    if (!Array.isArray(inscripciones)) return 0;
    return inscripciones.length;
}
function obtenerNombreDia(numeroDia) {
  // número esperado: 1 (Monday) .. 6 (Saturday)
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  // si el backend devuelve string como "Monday" o number como 1 -> manejamos ambos
  if (typeof numeroDia === "number") return dias[numeroDia - 1] || "Desconocido";
  if (typeof numeroDia === "string") {
    // intentar parseInt
    const n = parseInt(numeroDia);
    if (!isNaN(n)) return dias[n - 1] || "Desconocido";
    // si viene "Monday" / "Tuesday" -> mapear
    const mapEnglish = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo"
    };
    return mapEnglish[numeroDia.toLowerCase()] || numeroDia;
  }
  return "Desconocido";
}

function mapDiaSelectToDayOfWeekValue(diaTexto) {
  // Devuelve número compatible con DayOfWeek (Monday = 1 .. Saturday = 6)
  const map = {
    "Lunes": 1,
    "Martes": 2,
    "Miércoles": 3,
    "Miercoles": 3,
    "Jueves": 4,
    "Viernes": 5,
    "Sábado": 6,
    "Sabado": 6
  };
  return map[diaTexto] ?? 1;
}

function calcularHoraFin(horaInicio, duracionMin) {
  const [h, m] = horaInicio.split(":").map(Number);
  const total = h * 60 + m + duracionMin;
  const hFin = Math.floor(total / 60) % 24;
  const mFin = total % 60;
  return `${hFin.toString().padStart(2, "0")}:${mFin.toString().padStart(2, "0")}`;
}

function calcularDuracion(horaInicio, horaFin) {
  const [h1, m1] = horaInicio.split(":").map(Number);
  const [h2, m2] = horaFin.split(":").map(Number);
  return h2 * 60 + m2 - (h1 * 60 + m1);
}

// =============================
// CARGAR ACTIVIDADES
// =============================
async function cargarActividades() {
  const contenedor = document.getElementById("listaActividades");
  contenedor.innerHTML = "<p>Cargando actividades...</p>";

  try {
    const res = await fetch(`${API_URL}/Actividad`);
    if (!res.ok) throw new Error("Error al obtener actividades");
    actividadesDisponibles = await res.json();

    if (!actividadesDisponibles || actividadesDisponibles.length === 0) {
      contenedor.innerHTML = "<p>No hay actividades registradas</p>";
      return;
    }

    const select = document.createElement("select");
    select.id = "actividadSelect";
    select.required = true;
    select.innerHTML = `
      <option value="">Seleccione una actividad</option>
      ${actividadesDisponibles.map(a => `<option value="${a.id}">${a.nombre}</option>`).join("")}
    `;

    contenedor.innerHTML = "";
    contenedor.appendChild(select);
  } catch (err) {
    console.error(err);
    contenedor.innerHTML = "<p>Error al cargar actividades</p>";
  }
}

// =============================
// CARGAR ENTRENADORES (select)
// =============================
async function cargarEntrenadores() {
  // Reemplaza (o crea) el control con id "idEntrenador" por un select
  const inputOrContainer = document.getElementById("idEntrenador");
  // Si existe y es input, lo reemplazamos por select; si ya es select, lo usamos
  let select;
  if (inputOrContainer && inputOrContainer.tagName.toLowerCase() === "select") {
    select = inputOrContainer;
  } else {
    // crear select
    select = document.createElement("select");
    select.id = "idEntrenador";
    select.required = true;
    // reemplazar el input con el select si el input existe
    if (inputOrContainer && inputOrContainer.parentNode) {
      inputOrContainer.parentNode.replaceChild(select, inputOrContainer);
    } else {
      // si no existe, buscar el contenedor form-group y añadir después del label
      const cont = document.querySelector(".form-group input#idEntrenador")?.parentNode;
      if (cont) cont.appendChild(select);
    }
  }

  // cargar opciones
  select.innerHTML = `<option value="">Cargando entrenadores...</option>`;
  try {
    const res = await fetch(`${API_URL}/Entrenador`);
    if (!res.ok) throw new Error("Error al obtener entrenadores");
    entrenadores = await res.json();

    if (!entrenadores || entrenadores.length === 0) {
      select.innerHTML = `<option value="">No hay entrenadores</option>`;
      return;
    }

    select.innerHTML = `<option value="">Seleccione un entrenador</option>` +
      entrenadores.map(en => {
        const text = `${en.nombre} ${en.apellido} (${en.dni ?? "sin DNI"})`;
        return `<option value="${en.id}">${text}</option>`;
      }).join("");
  } catch (err) {
    console.error(err);
    select.innerHTML = `<option value="">Error al cargar entrenadores</option>`;
  }
}

// =============================
// LISTAR CLASES (con paginación real)
// =============================
async function listarClases() {

  const tbody = document.querySelector("#clasesTabla tbody");
  tbody.innerHTML = "<tr><td colspan='7'>Cargando...</td></tr>";

  try {
    const res = await fetch(`${API_URL}/Clase`);
    if (!res.ok) throw new Error("Error al listar clases");
    clases = await res.json();

    if (!clases || clases.length === 0) {
      tbody.innerHTML = "<tr><td colspan='7'>No hay clases registradas</td></tr>";
      return;
    }

    // ============================
    // PAGINACIÓN CORRECTA
    // ============================
    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const clasesPagina = clases.slice(inicio, fin);

    // ============================
    // RENDER SOLO DE LA PÁGINA
    // ============================
    tbody.innerHTML = clasesPagina.map(c => `
      <tr>
        <td>${c.id}</td>
        <td>${c.nombre}</td>
        <td>${c.actividadNombre || "Sin actividad"}</td>
        <td>${c.cupo}</td>
        <td>${(c.entrenadorNombre || "") + " " + (c.entrenadorApellido || "")}</td>
        <td>${obtenerNombreDia(c.dia)} ${c.horaInicio}</td>
        <td>
          <button class="btn btn-edit btn-small" onclick="abrirEditarClase(${c.id})"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-pen-line-icon lucide-file-pen-line"><path d="m18.226 5.226-2.52-2.52A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-.351"/><path d="M21.378 12.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 18h1"/></svg></button>
          <button class="btn btn-delete btn-small" onclick="eliminarClase(${c.id})"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          <button class="btn btn-save btn-small" onclick="imprimirClase(${c.id})"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-printer-icon lucide-printer"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg></button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='7'>Error al cargar clases</td></tr>";
  }

  // ============================
  // PAGINACIÓN GENÉRICA
  // ============================
  crearPaginacion({
      contenedor: "#paginacion",
      totalItems: clases.length,     // <--- CORRECTO
      paginaActual,
      filasPorPagina,
      onPaginaCambiada: (nuevaPagina) => {
        paginaActual = nuevaPagina;
        listarClases();             // <--- CORRECTO
      }
  });
}

// =============================
// REGISTRAR / MODIFICAR CLASE
// =============================
async function registrarClase() {
  const nombre = document.getElementById("nombre").value.trim();
  const cupo = parseInt(document.getElementById("cupos").value);
  const diaTexto = document.getElementById("dia").value;
  const horaInicio = document.getElementById("horaInicio").value;
  const duracion = parseInt(document.getElementById("duracion").value);
  const entrenadorId = parseInt(document.getElementById("idEntrenador").value);
  const actividadId = parseInt(document.getElementById("actividadSelect").value);

  if (!nombre || !cupo || !diaTexto || !horaInicio || !duracion || !entrenadorId || !actividadId) {
    alert("Complete todos los campos obligatorios");
    return;
  }

  const horaFin = calcularHoraFin(horaInicio, duracion);
  // Convertimos diaTexto (ej. "Lunes") a valor numérico para DayOfWeek (Monday = 1)
  const diaValue = mapDiaSelectToDayOfWeekValue(diaTexto);

  // El backend espera: Nombre, Cupo, Dia (DayOfWeek), HoraInicio (TimeSpan), HoraFin (TimeSpan), EntrenadorId, ActividadId
  // Enviamos Dia como número (1..6) para mayor compatibilidad.
  const claseData = {
    nombre,
    cupo,
    dia: diaValue,
    horaInicio,
    horaFin,
    entrenadorId,
    actividadId
  };

  try {
    const method = editando ? "PATCH" : "POST";
    const url = editando ? `${API_URL}/Clase/${idEditando}` : `${API_URL}/Clase`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(claseData)
    });

    if (!res.ok) throw new Error("Error del servidor");

        alert(editando ? "Clase modificada correctamente" : "Clase creada correctamente");
        limpiarFormularioClase();
        cerrarModal("modalClase");
        listarClases();
  } catch (err) {
    console.error(err);
    alert("Error al guardar la clase");
  }
}

// =============================
// EDITAR CLASE (abrir modal con datos)
// =============================
async function abrirEditarClase(id) {
  try {
    const res = await fetch(`${API_URL}/Clase/${id}`);
    if (!res.ok) throw new Error("No se pudo obtener la clase");
    const clase = await res.json();

    // Llenar campos
    document.getElementById("nombre").value = clase.nombre || "";
    document.getElementById("cupos").value = clase.cupo ?? "";

    // Día
    const diaSelect = document.getElementById("dia");
    const diaTexto = obtenerNombreDia(clase.dia);
    if (diaSelect) diaSelect.value = diaTexto;

    // Horarios
    document.getElementById("horaInicio").value = clase.horaInicio || "";
    document.getElementById("duracion").value = calcularDuracion(
      clase.horaInicio || "00:00",
      clase.horaFin || "00:00"
    );

    // Entrenador
    if (clase.entrenadorId) {
      document.getElementById("idEntrenador").value = clase.entrenadorId;
    }

    // 🔥 Actividad (seleccionada automáticamente)
    const selectActividad = document.getElementById("actividadSelect");

    // Si no está cargado aún, recargamos actividades
    if (!selectActividad || selectActividad.options.length <= 1) {
      await cargarActividades();
    }

    // Esperar un instante por seguridad (DOM update)
    setTimeout(() => {
      const select = document.getElementById("actividadSelect");
      if (select && clase.actividadId) {
        select.value = clase.actividadId;
      } else if (select && clase.actividadNombre) {
        // Si vino solo el nombre
        const opt = [...select.options].find(
          o => o.textContent.trim() === clase.actividadNombre.trim()
        );
        if (opt) select.value = opt.value;
      }
    }, 100);

    // Marcar modo edición
    editando = true;
    idEditando = id;

    cerrarModal("modalDetalle");
    cerrarModal("modalConsulta");
    abrirModal("modalClase");
  } catch (err) {
    console.error(err);
    alert("Error al cargar la clase");
  }
}

// ======================================================
// LIMPIAR FORMULARIO DE CLASE
// ======================================================
function limpiarFormularioClase() {
    document.getElementById("claseId").value = "";
    document.getElementById("nombre").value = "";
    document.getElementById("cupos").value = "";
    document.getElementById("dia").value = "";
    document.getElementById("horaInicio").value = "";
    document.getElementById("duracion").value = "";
    document.getElementById("idEntrenador").value = "";
    document.getElementById("actividadSelect").value = "";
    editando = false;
    idEditando = null;
}

// =============================
// ELIMINAR CLASE
// =============================
async function eliminarClase(id) {
  if (!confirm("¿Desea eliminar esta clase?")) return;
  try {
    const res = await fetch(`${API_URL}/Clase/${id}`, { method: "DELETE" });
    if (!res.ok) {
      let t = await res.text().catch(() => "");
      console.error("Error eliminar:", res.status, t);
      throw new Error("No pudo eliminarse");
    }
    alert("Clase eliminada correctamente");
    // si el modal detalle está abierto, cerrarlo
    cerrarModal("modalDetalle");
    await listarClases();
  } catch (err) {
    console.error(err);
    alert("Error al eliminar la clase");
  }
}

// =============================
// MOSTRAR DETALLE DE CLASE
// =============================
function mostrarDetalleClase(c) {
  const cont = document.getElementById("detalleContenido");

  cont.innerHTML = `
    <h3>${c.nombre}</h3>
    <p><strong>Actividad:</strong> ${c.actividadNombre || "N/D"}</p>
    <p><strong>Entrenador:</strong> ${(c.entrenadorNombre || "") + " " + (c.entrenadorApellido || "")} ${c.entrenadorDni ? "(" + c.entrenadorDni + ")" : ""}</p>
    <p><strong>Día y horario:</strong> ${obtenerNombreDia(c.dia)} ${c.horaInicio} - ${c.horaFin}</p>
    <p><strong>Cupo:</strong> ${c.cupo}</p>
    <p><strong>Inscritos:</strong> ${obtenerCount(c.inscripciones)}</p>
  `;

  // cerrar consulta y abrir detalle
  cerrarModal("modalConsulta");
  abrirModal("modalDetalle");

  // configurar botones del modal detalle
  document.getElementById("btnEditarClase").onclick = () => {
    cerrarModal("modalDetalle");
    abrirEditarClase(c.id);
  };

  document.getElementById("btnEliminarClase").onclick = async () => {
    if (!confirm("¿Eliminar esta clase?")) return;
    cerrarModal("modalDetalle");
    await eliminarClase(c.id);
  };

  document.getElementById("btnVerInscriptos").onclick = async () => {
    cerrarModal("modalDetalle");
    await mostrarInscriptosModal(c.id);
  };

  document.getElementById("btnImprimirDetalle").onclick = () => imprimirClase(c.id);
}

// =============================
// CONSULTAR CLASE SOLO POR NOMBRE
// =============================
async function consultarClase() {
  const nombre = document.getElementById("buscarClaseInput").value.trim();
  if (!nombre) return alert("Ingrese el nombre de la clase");

  try {
    const res = await fetch(`${API_URL}/Clase`);
    if (!res.ok) throw new Error("Error al obtener clases");
    const lista = await res.json();
    // buscar por nombre (solo nombre)
    const claseEncontrada = lista.find(c => c.nombre && c.nombre.toLowerCase() === nombre.toLowerCase());
    // si no hay exact match, buscar includes (opcional)
    const claseIncludes = !claseEncontrada ? lista.find(c => c.nombre && c.nombre.toLowerCase().includes(nombre.toLowerCase())) : null;
    const clase = claseEncontrada || claseIncludes;

    if (!clase) {
      alert("No se encontró ninguna clase con ese nombre");
      return;
    }

    // traer detalle por id y mostrar
    const detalleRes = await fetch(`${API_URL}/Clase/${clase.id}`);
    if (!detalleRes.ok) throw new Error("No se pudo obtener detalle");
    const detalle = await detalleRes.json();
    mostrarDetalleClase(detalle);
  } catch (err) {
    console.error(err);
    alert("Error al buscar la clase");
  }
}

// =============================
// IMPRIMIR CLASE (actividad, entrenador e inscriptos)
// =============================
async function imprimirClase(id) {
  try {
    // 1️⃣ Traer clase
    const resClase = await fetch(`${API_URL}/Clase/${id}`);
    if (!resClase.ok) throw new Error("No se pudo obtener la clase");
    const clase = await resClase.json();

    // 2️⃣ Traer actividad
    let actividad = null;
    if (clase.actividad) {
      actividad = clase.actividad; // ya viene anidada
    } else if (clase.actividadId) {
      const resAct = await fetch(`${API_URL}/Actividad/${clase.actividadId}`);
      if (resAct.ok) actividad = await resAct.json();
    } else if (clase.actividadNombre) {
      actividad = { nombre: clase.actividadNombre }; // solo tenemos el nombre
    }

    // 3️⃣ Traer entrenador usando entrenadorId
    let entrenador = null;
    if (clase.entrenadorId) {
      const resEnt = await fetch(`${API_URL}/Entrenador/${clase.entrenadorId}`);
      if (resEnt.ok) entrenador = await resEnt.json();
    }

    // 4️⃣ Traer inscriptos
    let inscriptos = [];
    const resIns = await fetch(`${API_URL}/Inscripcion/by-clase?id=${id}`);
    if (resIns.ok) {
      const inscripciones = await resIns.json();
      const miembroIds = [...new Set(inscripciones.map(i => i.miembroId))];
      const miembrosMap = {};

      await Promise.all(miembroIds.map(async mid => {
        try {
          const mRes = await fetch(`${API_URL}/Miembro/${mid}`);
          if (mRes.ok) miembrosMap[mid] = await mRes.json();
        } catch (err) { console.error("Error al traer miembro:", mid, err); }
      }));

      inscriptos = inscripciones.map(i => miembrosMap[i.miembroId] || { nombre: "-", apellido: "-", dni: "N/D" });
    }

    // 5️⃣ Generar contenido HTML
    const contenido = `
      <h2>Clase: ${clase.nombre}</h2>
      <p><strong>Día:</strong> ${obtenerNombreDia(clase.dia)}</p>
      <p><strong>Horario:</strong> ${clase.horaInicio} - ${clase.horaFin}</p>
      <p><strong>Cupo:</strong> ${clase.cupo}</p>
      <p><strong>Actividad:</strong> ${actividad?.nombre || "Sin asignar"}</p>
      <hr>
      <h3>Entrenador</h3>
      ${entrenador ? `
        <p><strong>Nombre:</strong> ${entrenador.nombre} ${entrenador.apellido}</p>
        <p><strong>DNI:</strong> ${entrenador.dni}</p>
        <p><strong>Teléfono:</strong> ${entrenador.telefono || "-"}</p>
      ` : "<p>Sin entrenador asignado</p>"}
      <hr>
      <h3>Inscriptos (${inscriptos.length})</h3>
      ${inscriptos.length > 0 ? `
        <table border="1" cellspacing="0" cellpadding="6" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
            </tr>
          </thead>
          <tbody>
            ${inscriptos.map(i => `
              <tr>
                <td>${i.nombre}</td>
                <td>${i.apellido}</td>
                <td>${i.dni || "N/D"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : "<p>No hay inscriptos en esta clase.</p>"}
    `;

    // 6️⃣ Abrir ventana e imprimir
    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html>
        <head>
          <title>Detalle de Clase</title>
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

  } catch (error) {
    console.error(error);
    alert("Error al imprimir la clase");
  }
}
// =============================
// IMPRIMIR HTML
// =============================
function imprimirDetalleClase(c) {
  const nuevaVentana = window.open("", "_blank");
  let inscriptosHtml = "<p>No hay inscriptos registrados</p>";

  if (c.inscriptos && c.inscriptos.length > 0) {
    inscriptosHtml = `
      <table border="1" style="border-collapse:collapse;width:100%;margin-top:10px;">
        <thead><tr><th>Nombre</th><th>Apellido</th><th>DNI</th></tr></thead>
        <tbody>
          ${c.inscriptos.map(i => `
            <tr>
              <td>${i.nombre || "-"}</td>
              <td>${i.apellido || "-"}</td>
              <td>${i.dni ?? "N/D"}</td>
            </tr>`).join("")}
        </tbody>
      </table>`;
  }

  const entrenadorText = c.entrenadorDetalle
    ? `${c.entrenadorDetalle.nombre} ${c.entrenadorDetalle.apellido} (${c.entrenadorDetalle.dni ?? "DNI no disponible"})`
    : `${c.entrenadorNombre || ""} ${c.entrenadorApellido || ""} ${c.entrenadorDni ? "(" + c.entrenadorDni + ")" : ""}`;

  nuevaVentana.document.write(`
    <html>
    <head>
      <title>Detalle de Clase</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { text-align: center; }
        p { margin: 6px 0; }
        table { font-size: 14px; }
      </style>
    </head>
    <body>
      <h2>Detalle de Clase</h2>
      <p><strong>Nombre:</strong> ${c.nombre}</p>
      <p><strong>Actividad:</strong> ${c.actividadNombre || "N/D"}</p>
      <p><strong>Día y Horario:</strong> ${obtenerNombreDia(c.dia)} ${c.horaInicio} - ${c.horaFin}</p>
      <p><strong>Cupo:</strong> ${c.cupo}</p>
      <p><strong>Entrenador:</strong> ${entrenadorText}</p>
      <h4>Inscriptos:</h4>
      ${inscriptosHtml}
      <script>window.print();</script>
    </body>
    </html>
  `);
  nuevaVentana.document.close();
}

// =============================
// MOSTRAR INSCRIPTOS (modal independiente)
// =============================
async function mostrarInscriptosModal(claseId) {
  try {
    const res = await fetch(`${API_URL}/Inscripcion/by-clase?id=${claseId}`);
    if (!res.ok) throw new Error("Error al obtener inscripciones");
    const inscripciones = await res.json();

    const miembroIds = [...new Set((inscripciones || []).map(i => i.miembroId).filter(Boolean))];
    const miembrosMap = {};

    if (miembroIds.length > 0) {
      await Promise.all(
        miembroIds.map(async (mid) => {
          try {
            const mRes = await fetch(`${API_URL}/Miembro/${mid}`);
            if (!mRes.ok) return;
            miembrosMap[mid] = await mRes.json();
          } catch (err) {
            console.error("Error al obtener miembro", mid, err);
          }
        })
      );
    }

    const ul = document.getElementById("listaInscriptos");
    if (!inscripciones || inscripciones.length === 0) {
      ul.innerHTML = "<li>No hay inscriptos</li>";
    } else {
      ul.innerHTML = inscripciones
        .map((i) => {
          const m = miembrosMap[i.miembroId] || {};
          return `<li>${m.nombre || "-"} ${m.apellido || ""} (DNI: ${
            m.dni ?? "N/D"
          })</li>`;
        })
        .join("");
    }

    modalAnterior = "modalDetalle";

    abrirModal("modalInscriptos");

    // === BOTÓN CERRAR ===
    document.getElementById("btnCerrarInscriptos").onclick = () =>
      cerrarModal("modalInscriptos");

    // === INSCRIBIR MIEMBRO POR DNI ===
    document.getElementById("btnInscribirMiembro").onclick = async () => {
      const dni = await pedirDNI("Ingrese el DNI del miembro a inscribir");
      if (!dni) return;

      try {
        const miembroRes = await fetch(`${API_URL}/Miembro`);
        if (!miembroRes.ok) throw new Error("Error al obtener miembros");
        const miembros = await miembroRes.json();
        const miembro = miembros.find((m) => m.dni == dni);

        if (!miembro) {
          alert("No se encontró ningún miembro con ese DNI");
          return;
        }

        const post = await fetch(`${API_URL}/Inscripcion`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ miembroId: miembro.id, claseId }),
        });

        if (!post.ok) throw new Error("Error al inscribir miembro");

        alert(`Miembro ${miembro.nombre} ${miembro.apellido} inscrito correctamente`);
        await mostrarInscriptosModal(claseId); // 🔁 refrescar lista sin cerrar modal
      } catch (err) {
        console.error(err);
        alert("Error al inscribir miembro");
      }
    };

    // === ELIMINAR INSCRIPCIÓN POR DNI ===
    document.getElementById("btnEliminarMiembro").onclick = async () => {
      const dni = await pedirDNI("Ingrese el DNI del miembro a eliminar");
      if (!dni) return;

      try {
        // Buscar miembro por DNI
        const miembroRes = await fetch(`${API_URL}/Miembro`);
        if (!miembroRes.ok) throw new Error("Error al obtener miembros");
        const miembros = await miembroRes.json();
        const miembro = miembros.find((m) => m.dni == dni);

        if (!miembro) {
          alert("No se encontró ningún miembro con ese DNI");
          return;
        }

        // 🔁 Obtener inscripciones actualizadas
        const insRes = await fetch(`${API_URL}/Inscripcion/by-clase?id=${claseId}`);
        if (!insRes.ok) throw new Error("Error al obtener inscripciones");
        const inscripcionesActualizadas = await insRes.json();

        // Buscar la inscripción del miembro en la clase
        const inscripcion = inscripcionesActualizadas.find(
          (i) => i.miembroId === miembro.id
        );
        if (!inscripcion) {
          alert("Ese miembro no está inscrito en esta clase");
          return;
        }

        // Eliminar inscripción
        const del = await fetch(`${API_URL}/Inscripcion/${inscripcion.id}`, {
          method: "DELETE",
        });
        if (!del.ok) throw new Error("Error al eliminar inscripción");

        alert(
          `Inscripción de ${miembro.nombre} ${miembro.apellido} eliminada correctamente`
        );

        // 🔄 Refrescar lista sin cerrar modal
        await mostrarInscriptosModal(claseId);
      } catch (err) {
        console.error(err);
        alert("Error al eliminar inscripción");
      }
    };
  } catch (err) {
    console.error(err);
    alert("Error al cargar inscriptos");
  }
}

function pedirDNI(titulo) {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalPedirDNI");
    const input = document.getElementById("inputDNI");
    const txtTitulo = document.getElementById("tituloPedirDNI");

    txtTitulo.textContent = titulo;
    input.value = "";

    abrirModal("modalPedirDNI");

    document.getElementById("btnAceptarDNI").onclick = () => {
      const valor = input.value.trim();
      cerrarModal("modalPedirDNI");
      resolve(valor);
    };

    document.getElementById("btnCancelarDNI").onclick = () => {
      cerrarModal("modalPedirDNI");
      resolve(null);
    };
  });
}
// =============================
// EVENTOS Y MODALES
// =============================
function configurarEventos() {
  document.getElementById("btnRegistrar").onclick = () => {
    limpiarFormularioClase();
    editando = false;
    idEditando = null;
    abrirModal("modalClase");
  };

  document.getElementById("btnConsultar").onclick = () => abrirModal("modalConsulta");
  document.getElementById("confirmarConsultaBtn").onclick = consultarClase;

  document.getElementById("guardarBtn").onclick = registrarClase;

  document.getElementById("cancelarBtn").onclick = () => {
    limpiarFormularioClase();
    cerrarModal("modalClase");
  };

  document.getElementById("cancelarConsultaBtn").onclick = () => cerrarModal("modalConsulta");
  document.getElementById("btnCerrarDetalle").onclick = () => cerrarModal("modalDetalle");
}

function abrirModal(id) {
  const nuevo = document.getElementById(id);
  const actual = document.querySelector(".modal.show");

  if (actual && actual.id !== id) {
    modalAnterior = actual.id; // Guardamos cuál estaba abierto
    actual.classList.remove("show");
  }

  if (nuevo) nuevo.classList.add("show");
}
function cerrarModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("show");

  if (modalAnterior) {
    const previo = modalAnterior;
    modalAnterior = null; // limpiar historial para evitar loops
    abrirModal(previo);
  }
}