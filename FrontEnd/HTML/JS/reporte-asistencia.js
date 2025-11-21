const API_BASE = "https://localhost:7271/api";

// Función para generar PDF (versión modular)
function generatePDF(reportData) {
    // Verificar que las librerías estén cargadas
    if (typeof jspdf === 'undefined') {
        console.error('jsPDF no está cargado');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título principal
    doc.setFontSize(18);
    doc.text("Reporte de Asistencias por Clase", 14, 20);

    // Fecha de generación
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);

    // Estadísticas generales
    const totalClases = reportData.length;
    const totalAsistencias = reportData.reduce((sum, clase) => sum + clase.asistenciasCount, 0);
    const promedioAsistenciaPorClase = totalAsistencias / totalClases;

    doc.setFontSize(14);
    doc.text("Resumen General", 14, 45);
    doc.setFontSize(10);
    doc.text(`Total de Clases: ${totalClases}`, 14, 53);
    doc.text(`Total de Asistencias: ${totalAsistencias}`, 14, 60);
    doc.text(`Promedio por Clase: ${promedioAsistenciaPorClase.toFixed(1)}`, 14, 67);

    // Tabla principal de clases

    doc.text("Detalle de Clases", 14, 72);
    doc.autoTable({
        startY: 75,
        head: [["Clase", "Entrenador", "Cupo", "Inscriptos", "Asistencias", "% Asistencia", "Día", "Horario"]],
        body: reportData.map((clase) => [
            clase.claseNombre || "N/A",
            clase.entrenador || "N/A",
            clase.cupo?.toString() || "0",
            clase.inscriptosCount?.toString() || "0",
            clase.asistenciasCount?.toString() || "0",
            clase.porcentajeAsistencia || "0%",
            getDiaSemana(clase.dia),
            clase.horario ? clase.horario.substring(0, 5) : "N/A"
        ]),
        headStyles: {
            fillColor: [13, 110, 253],
            textColor: 255,
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 8,
            cellPadding: 2
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 25 },
            2: { cellWidth: 15 },
            3: { cellWidth: 15 },
            4: { cellWidth: 15 },
            5: { cellWidth: 15 },
            6: { cellWidth: 15 },
            7: { cellWidth: 25 }
        }
    });

    // Detalle de asistencias por clase
    reportData.forEach((clase, index) => {
        if (clase.asistencias && clase.asistencias.length > 0) {
            if (index > 0) {
                doc.addPage();
            }

            const startY = index === 0 ? doc.lastAutoTable.finalY + 15 : 20;

            doc.setFontSize(14);
            doc.text(`Clase: ${clase.claseNombre || "N/A"}`, 14, startY - 5);

            doc.autoTable({
                startY: startY,
                head: [["Miembro", "Fecha de Asistencia"]],
                body: clase.asistencias.map((asistencia) => [
                    `${asistencia.miembroNombre} ${asistencia.miembroApellido}`,
                    new Date(asistencia.fecha).toLocaleDateString('es-ES')
                ]),
                headStyles: {
                    fillColor: [40, 167, 69],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 8,
                    cellPadding: 2
                }
            });

            const finalY = doc.lastAutoTable.finalY + 10;
            doc.setFontSize(10);
            doc.text(`Resumen de la clase:`, 14, finalY);
            doc.text(`- Total de asistencias: ${clase.asistenciasCount}`, 14, finalY + 7);
            doc.text(`- Porcentaje de asistencia: ${clase.porcentajeAsistencia || '0%'}`, 14, finalY + 14);
            doc.text(`- Cupo utilizado: ${clase.inscriptosCount || 0}/${clase.cupo || 0}`, 14, finalY + 21);
        }
    });

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            `Página ${i} de ${pageCount} - Centro Deportivo`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    // Guardar el PDF
    const fecha = new Date().toISOString().split('T')[0];
    doc.save(`reporte-asistencias-clases-${fecha}.pdf`);
}

// Función auxiliar para obtener el nombre del día
function getDiaSemana(diaNumero) {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[diaNumero] || `Día ${diaNumero}`;
}

async function getAttendanceByClasse(from, to) {
    try {
        // Obtener todas las clases
        const resp = await fetch(`${API_BASE}/Clase`);
        if (!resp.ok) {
            throw new Error(`Error al obtener clases: ${resp.status}`);
        }
        const classesData = await resp.json();

        // Crear array de promesas para obtener asistencias de cada clase
        const attendancePromises = classesData.map(async (classe) => {
            try {
                const attendanceResp = await fetch(
                    `${API_BASE}/Asistencia/by-clase?id=${classe.id}`
                );

                if (!attendanceResp.ok) {
                    console.warn(`Error al obtener asistencias para clase ${classe.id}: ${attendanceResp.status}`);
                    return {
                        clase: classe,
                        asistencias: [],
                        error: true
                    };
                }

                const asistencias = await attendanceResp.json();

                // Filtrar asistencias por fecha del lado del cliente
                const asistenciasFiltradas = asistencias.filter((asistencia) => {
                    const fechaAsistencia = new Date(asistencia.fecha);
                    // Ajustar horas para comparar solo la fecha
                    const fechaFrom = new Date(from);
                    fechaFrom.setHours(0, 0, 0, 0);
                    const fechaTo = new Date(to);
                    fechaTo.setHours(23, 59, 59, 999);

                    return fechaAsistencia >= fechaFrom && fechaAsistencia <= fechaTo;
                });

                return {
                    clase: classe,
                    asistencias: asistenciasFiltradas,
                    error: false
                };
            } catch (error) {
                console.error(`Error en fetch para clase ${classe.id}:`, error);
                return {
                    clase: classe,
                    asistencias: [],
                    error: true
                };
            }
        });

        // Esperar a que todas las promesas se resuelvan
        const results = await Promise.all(attendancePromises);

        // Procesar resultados para el reporte
        const reporte = results.map(result => {
            const porcentajeAsistencia = result.clase.cupo > 0 ?
                (result.asistencias.length / result.clase.cupo) * 100 : 0;

            return {
                claseId: result.clase.id,
                claseNombre: result.clase.nombre,
                entrenador: `${result.clase.entrenadorNombre} ${result.clase.entrenadorApellido}`,
                cupo: result.clase.cupo,
                inscriptosCount: result.clase.inscriptosCount,
                asistenciasCount: result.asistencias.length,
                porcentajeAsistencia: porcentajeAsistencia.toFixed(2) + '%',
                horario: `${result.clase.horaInicio} - ${result.clase.horaFin}`,
                dia: result.clase.dia,
                asistencias: result.asistencias,
                error: result.error,
                periodo: {
                    from: from.toISOString().split('T')[0],
                    to: to.toISOString().split('T')[0]
                }
            };
        });

        console.log('Reporte generado para el período:', from.toLocaleDateString(), 'a', to.toLocaleDateString());
        console.log('Total de clases procesadas:', reporte.length);
        console.log('Total de asistencias en el período:', reporte.reduce((sum, clase) => sum + clase.asistenciasCount, 0));

        return reporte;

    } catch (error) {
        console.error('Error general en getAttendanceByClasse:', error);
        throw error;
    }
}

document.addEventListener("DOMContentLoaded", () => {


    const form = document.getElementById("asistenciaForm");
    const inputDNI = document.getElementById("miembroDNI");
    const selectClase = document.getElementById("claseId");
    const inputNombre = document.getElementById("miembroNombre");
    const miembroId = document.getElementById("miembroId");
    const btnExportarPdf = document.getElementById("exportarPdf");
    const dateFrom = document.getElementById("dateFrom");
    const dateTo = document.getElementById("dateTo");
    let todosLosMiembros = [];

    btnExportarPdf.addEventListener("click", async () => {
        const fromDate = new Date(dateFrom.value);
        const toDate = new Date(dateTo.value);

        if (isNaN(fromDate) || isNaN(toDate)) {
            alert("Por favor, ingrese fechas válidas para el rango.");
            return;
        }

        getAttendanceByClasse(fromDate, toDate)
            .then(reportData => {
                generatePDF(reportData);
            })
            .catch(error => {
                console.error("Error al generar el reporte de asistencias:", error);
                alert("Hubo un error al generar el reporte de asistencias.");
            });
    });



    // Cargar todos los miembros al inicio
    async function cargarMiembros() {
        try {
            const resp = await fetch(`${API_BASE}/Miembro`);
            if (!resp.ok) throw new Error(`Error: ${resp.status}`);
            todosLosMiembros = await resp.json();
        } catch (error) {
            console.error('Error al cargar miembros:', error);
        }
    }

    function filtrarMiembrosPorDNI(inputDNI) {
        // Si el input está vacío, limpiar el datalist
        if (!inputDNI || inputDNI.length < 2) {
            const dataList = document.getElementById("miembrosDatalist");
            dataList.innerHTML = "";
            return;
        }

        // Filtrar localmente
        const miembrosFiltrados = todosLosMiembros
            .filter(miembro => String(miembro.dni).includes(inputDNI))
            .slice(0, 5);

        const dataList = document.getElementById("miembrosDatalist");
        dataList.innerHTML = "";

        miembrosFiltrados.forEach(miembro => {
            const option = document.createElement("option");
            option.value = miembro.dni;
            dataList.appendChild(option);
        });
    }

    inputDNI.addEventListener("input", (event) => {
        filtrarMiembrosPorDNI(event.target.value);
    });

    inputDNI.addEventListener("change", (event) => {
        const dniSeleccionado = event.target.value;

        const miembroSeleccionado = todosLosMiembros.find(miembro => String(miembro.dni) === dniSeleccionado);
        if (miembroSeleccionado) {
            inputNombre.value = `${miembroSeleccionado.nombre} ${miembroSeleccionado.apellido}`;
            miembroId.value = miembroSeleccionado.id;
        } else {
            inputNombre.value = "";
        }
    });

    const selectActividad = document.getElementById("actividadId");
    async function cargarActividad() {
        try {
            const resp = await fetch(`${API_BASE}/Actividad`);
            if (!resp.ok) {
                throw new Error(`Error al obtener clases: ${resp.status}`);
            }
            const classesData = await resp.json();

            classesData.forEach(actividad => {
                const option = document.createElement("option");
                option.value = actividad.id;
                option.text = actividad.nombre;
                selectActividad.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar actividades:', error);
        }
    }

    selectActividad.addEventListener("change", (event) => {
        const actividadId = event.target.value;
        cargarClasesPorActividad(actividadId);
    });


    async function cargarClasesPorActividad(actividadId) {
        try {
            const resp = await fetch(`${API_BASE}/Clase`);
            if (!resp.ok) {
                throw new Error(`Error al obtener clases: ${resp.status}`);
            }
            const classesData = await resp.json();

            const clasesFiltradas = classesData.filter(clase => String(clase.id) == actividadId);

            // Limpiar opciones anteriores
            selectClase.innerHTML = '<option value="">-- Seleccione una clase --</option>';
            clasesFiltradas.forEach(clase => {
                const option = document.createElement("option");
                option.value = clase.id;
                option.text = clase.nombre;
                selectClase.appendChild(option);
            }
            );

        } catch (error) {
            console.error('Error al cargar clases por actividad:', error);
        }
    }


    function crearAsistencia(formData) {
        console.log("Enviando datos de asistencia:", formData);
        return fetch(`${API_BASE}/Asistencia`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.miembroId.value) {
            alert("Por favor, seleccione un miembro válido.");
            return;
        }
        

        const toSend = {
            miembroId: Number(form.miembroId.value),
            claseId: Number(form.claseId.value) || null,
            fecha: new Date().toISOString()
        }
        try {
            const response = await crearAsistencia(toSend);
            if (response.ok) {
                alert("Asistencia registrada con éxito.");
                form.reset();
            } else {
                alert("Error al registrar la asistencia.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al registrar la asistencia.");
        }
    });

    cargarMiembros();
    cargarActividad();
});