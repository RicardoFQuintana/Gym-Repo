// =====================================================
// ========== GESTIÓN DE HORARIOS DINÁMICA ==========
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  const tabla = document.getElementById("tablaHorarios");
  const modalDetalle = document.getElementById("modalDetalle");
  const detalleClase = document.getElementById("detalleClase");

  let celdaActual = null;
  let horarios = [];

  const API_BASE = "https://localhost:7271/api/Clase"; // Ajusta tu endpoint real

  // =============================================
  // FUNCIONES DE CONVERSIÓN
  // =============================================
  function diaToString(dia) {
    const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return dias[dia];
  }

  function timeSpanToString(hora) {
    if (!hora) return "";
    const h = hora.split(':');
    return h[0].padStart(2,'0') + ':' + h[1];
  }

  // =============================================
  // 1. CARGAR HORARIOS DESDE LA BASE DE DATOS
  // =============================================
  async function cargarHorariosDB() {
    try {
      const res = await fetch(API_BASE);
      horarios = await res.json(); 
      cargarHorariosTabla();
    } catch (error) {
      console.error("Error al cargar horarios:", error);
    }
  }

  // =============================================
  // 2. GENERAR TABLA DINÁMICA
  // =============================================
  function cargarHorariosTabla() {
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const tbody = tabla.querySelector("tbody");
    tbody.innerHTML = "";

    // Generar todas las horas de 8:00 a 20:00
    const horasUnicas = [];
    for (let hora = 8; hora <= 20; hora++) {
      horasUnicas.push(hora.toString().padStart(2, "0") + ":00");
    }

    horasUnicas.forEach(horaStr => {
      const fila = document.createElement("tr");
      fila.innerHTML = `<td>${horaStr}</td>` + dias.map(dia => {
        const clase = horarios.find(c => 
          diaToString(c.dia) === dia && timeSpanToString(c.horaInicio) === horaStr
        );
        return clase
          ? `<td><button class="btn-clase" data-tooltip="Info" data-id="${clase.id}">${clase.nombre}</button></td>`
          : `<td></td>`;
      }).join("");
      tbody.appendChild(fila);
    });
  }

  // =============================================
  // 3. CLICK EN CELDA: ABRIR MODAL DETALLE
  // =============================================
  tabla.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-clase")) {
      const idClase = e.target.dataset.id;
      celdaActual = e.target.parentElement;

      // Obtener detalles de la clase
      const clase = horarios.find(h => h.id == idClase);

      if (clase) {
        detalleClase.innerHTML = `
          <h3>${clase.nombre}</h3>
          <p><strong>Día:</strong> ${diaToString(clase.dia)}</p>
          <p><strong>Hora:</strong> ${timeSpanToString(clase.horaInicio)} - ${timeSpanToString(clase.horaFin)}</p>
          <p><strong>Actividad:</strong> ${clase.actividadNombre || 'N/A'}</p>
          <p><strong>Entrenador</strong> ${clase.entrenadorNombre || 'N/A'} ${clase.entrenadorApellido || ''}</p>
          <p><strong>Cupo:</strong> ${clase.cupo}</p>
          <p><strong>Inscritos:</strong> ${clase.inscriptosCount}</p>
        `;
        modalDetalle.classList.add("show");
      }
      return;
    }
  });

  // =============================================
  // 4. CERRAR MODAL
  // =============================================
  window.cerrarModal = function (id) {
    document.getElementById(id).classList.remove("show");
  };

  modalDetalle.addEventListener("click", e => {
    if (e.target.classList.contains("modal")) {
      modalDetalle.classList.remove("show");
    }
  });

  // =============================================
  // 5. IMPRIMIR HORARIO
  // =============================================
  document.getElementById("imprimirBtn").addEventListener("click", e => {
    e.preventDefault();
    const contenido = document.getElementById("contenedor-horario").innerHTML;
    const ventana = window.open("", "_blank", "width=900,height=700");
    ventana.document.write(`
      <html>
      <head>
        <title>Horario de Clases - CuerpoSano</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; }
          table { border-collapse: collapse; width: 100%; margin: 20px auto; }
          th, td { border: 1px solid #000; padding: 10px; text-align: center; }
          th { background-color: #ff4500; color: #fff; }
          .btn-clase { border: 1px solid #007bff; border-radius: 10px; padding: 3px 8px; color: #007bff; background-color: transparent; }
        </style>
      </head>
      <body>
        <h2>Horario de Clases</h2>
        ${contenido}
      </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
    ventana.close();
  });

  // =============================================
  // 6. INICIALIZAR
  // =============================================
  cargarHorariosDB();
});