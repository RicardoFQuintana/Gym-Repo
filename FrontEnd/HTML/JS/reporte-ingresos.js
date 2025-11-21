const API_BASE = "https://localhost:7271/api";


const getTipoMembresia = (fechaInicio, fechaVencimiento) => {
    const inicio = new Date(fechaInicio);
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = Math.abs(vencimiento.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 31) return "Mensual";
    if (diffDays <= 93) return "Básica";
    return "Premium";
};

// Función para formatear el método de pago
const formatMetodoPago = (metodo) => {
    const methods = {
        'QR': 'QR',
        'TarjetaDebito': 'Tarjeta',
        'TarjetaCredito': 'Tarjeta',
        'Efectivo': 'Efectivo',
        'Transferencia': 'Transferencia'
    };
    return methods[metodo] || metodo;
};
const paymentHistory = [];

async function getMembersPaymentHistory() {
    try {
        const response = await fetch(`${API_BASE}/Miembro`);
        const data = await response.json();


        data.forEach(miembro => {
            if (miembro.membresia && miembro.membresia.pagos) {
                miembro.membresia.pagos.forEach(pago => {
                    const tipoMembresia = getTipoMembresia(
                        miembro.membresia.fechaInicio,
                        miembro.membresia.fechaVencimiento
                    );

                    paymentHistory.push({
                        miembro: `${miembro.nombre} ${miembro.apellido}`,
                        membresia: tipoMembresia,
                        fecha: pago.fecha.split('T')[0],
                        metodo: formatMetodoPago(pago.metodoPago),
                        monto: `$${(pago.monto / 100).toFixed(2)}`, // Asumiendo que viene en centavos
                        ticket: pago.ticket,
                        dni: miembro.dni
                    });
                });
            }
        });

        return paymentHistory.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    } catch (error) {
        console.error('Error fetching payment history:', error);
        return [];
    }
}

function generatePDF(membersPaymentHistory, monthlyIncome, quarterlyIncome, annualIncome) {
    if (typeof jspdf === 'undefined') {
        console.error('jsPDF no está cargado');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text("Reportes de Pago", 14, 20);

    // Fecha de generación
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 14, 30);

    // Estadísticas
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Estadísticas Generales", 14, 50);

    doc.setFontSize(10);
    doc.text(`Ingresos Mensuales: ${monthlyIncome}`, 14, 60);
    doc.text(`Ingresos Trimestrales: ${quarterlyIncome}`, 14, 67);
    doc.text(`Ingresos Anuales: ${annualIncome}`, 14, 74);

    // Tabla de pagos con configuración más flexible
    doc.autoTable({
        startY: 80,
        head: [["Miembro", "Membresía", "Fecha", "Método", "Monto"]],
        body: membersPaymentHistory.map(payment => [
            payment.miembro,
            payment.membresia,
            payment.fecha,
            payment.metodo,
            payment.monto
        ]),
        headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [243, 244, 246]
        },
        styles: {
            fontSize: 8,
            cellPadding: 3,
            overflow: 'linebreak',
            cellWidth: 'auto'
        },
        margin: { left: 14, right: 14 },
        tableWidth: 'wrap'
    });

    // Pie de página
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Página ${i} de ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            { align: 'center' }
        );
    }

    // Guardar el PDF
    const fileName = `reporte-pagos-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

async function obtenerIngresosPorPeriodo() {
    try {
        const response = await fetch(`${API_BASE}/Reporte/ingresos?Periodo=anual`);
        const data = await response.json();
        const ingresos = {};
        data.registros.forEach(registro => {
            ingresos[registro.clave] = registro.valor;
        });

        return ingresos;
    } catch (error) {

    }
}

function formatCurrency(value) {
    const formatter = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })

    return formatter.format(value);
}

document.addEventListener("DOMContentLoaded", () => {

    const tableBody = document.getElementById("payments-table-body");
    const noPaymentsMessage = document.getElementById("no-payments-message");
    const generateReportBtn = document.getElementById("generate-report-btn");
    const monthlyIncomeElem = document.getElementById("monthly-income");
    const quarterlyIncomeElem = document.getElementById("quarterly-income");
    const annualIncomeElem = document.getElementById("annual-income");

    let currentPage = 1;
    const recordsPerPage = 5;
    let allPayments = [];

    obtenerIngresosPorPeriodo().then(ingresos => {
        monthlyIncomeElem.textContent = formatCurrency(ingresos.Mensual || 0);
        quarterlyIncomeElem.textContent = formatCurrency(ingresos.Trimestral || 0);
        annualIncomeElem.textContent = formatCurrency(ingresos.Anual || 0);
    });

    generateReportBtn.addEventListener("click", () => {
        generatePDF(
            allPayments,
            monthlyIncomeElem.textContent,
            quarterlyIncomeElem.textContent,
            annualIncomeElem.textContent
        );
    })



    getMembersPaymentHistory().then(paymentHistory => {
        if (paymentHistory.length === 0) {
            noPaymentsMessage.style.display = "block";
            return;
        }

        allPayments = paymentHistory;
        renderTable();
        setupPagination();

    });


    function renderTable() {
        tableBody.innerHTML = "";

        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const currentPagePayments = paymentHistory.slice(startIndex, endIndex);

        currentPagePayments.forEach(record => {
            const row = document.createElement("tr");
            row.classList.add("bg-white", "border-b");
            row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">${record.miembro}</div>
            </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-900">${record.membresia}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.fecha}</td>
        <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
                <i class="fas fa-credit-card text-gray-400 mr-2"></i>
                <span class="text-sm text-gray-700">${record.metodo}</span>
            </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${record.monto}</td>
        `;
            tableBody.appendChild(row);
        });


        updatePaginationInfo();
    }

    function setupPagination() {
        const totalPages = Math.ceil(allPayments.length / recordsPerPage);

        // Actualizar botones de navegación
        document.getElementById("first-page").disabled = currentPage === 1;
        // document.getElementById("prev-page").disabled = currentPage === 1;
        // document.getElementById("next-page").disabled = currentPage === totalPages;
        document.getElementById("last-page").disabled = currentPage === totalPages;
        document.getElementById("prev-btn-mobile").disabled = currentPage === 1;
        document.getElementById("next-btn-mobile").disabled = currentPage === totalPages;

        // Generar números de página
        const paginationNumbers = document.getElementById("pagination-numbers");
        paginationNumbers.innerHTML = "";

        // Mostrar máximo 5 números de página
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // Ajustar si estamos cerca del final
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement("button");
            pageButton.classList.add("pagination-btn", "relative", "inline-flex", "items-center", "px-4", "py-2", "border", "border-gray-300", "bg-white", "text-sm", "font-medium", "text-gray-700");

            if (i === currentPage) {
                pageButton.classList.add("active");
            }

            pageButton.textContent = i;
            pageButton.addEventListener("click", () => {
                currentPage = i;
                renderTable();
                setupPagination();
            });

            paginationNumbers.appendChild(pageButton);
        }

        // Configurar eventos de los botones de navegación
        document.getElementById("first-page").addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage = 1;
                renderTable();
                setupPagination();
            }
        });

        // document.getElementById("prev-page").addEventListener("click", () => {
        //     if (currentPage > 1) {
        //         currentPage--;
        //         renderTable();
        //         setupPagination();
        //     }
        // });

        // document.getElementById("next-page").addEventListener("click", () => {
        //     if (currentPage < totalPages) {
        //         currentPage++;
        //         renderTable();
        //         setupPagination();
        //     }
        // });

        document.getElementById("last-page").addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage = totalPages;
                renderTable();
                setupPagination();
            }
        });

        // Botones móviles
        document.getElementById("prev-btn-mobile").addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
                setupPagination();
            }
        });

        document.getElementById("next-btn-mobile").addEventListener("click", () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
                setupPagination();
            }
        });
    }

    function updatePaginationInfo() {
        const startRecord = allPayments.length > 0 ? (currentPage - 1) * recordsPerPage + 1 : 0;
        const endRecord = Math.min(currentPage * recordsPerPage, allPayments.length);

        document.getElementById("start-record").textContent = startRecord;
        document.getElementById("end-record").textContent = endRecord;
        document.getElementById("total-records").textContent = allPayments.length;
    }

});