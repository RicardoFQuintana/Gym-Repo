// ===============================
// MANEJO GENERAL DE MODALES
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalFormulario");
  const btnAbrir = document.getElementById("btnAbrirModal");
  const btnCerrar = document.getElementById("btnCerrarModal");
  const formContainer = document.getElementById("formModal");
  const modalTitulo = document.getElementById("modalTitulo");
  const overlay = document.getElementById("overlay");

  if (!modal || !btnAbrir || !btnCerrar) return;

  // Abrir modal de "Agregar"
  btnAbrir.addEventListener("click", () => {
    abrirModal("Agregar nuevo elemento", `
      <label>Nombre:</label>
      <input type="text" id="nombre" placeholder="Ejemplo...">
      <label>Descripción:</label>
      <textarea id="descripcion"></textarea>
      <button type="submit" class="btn btn-save">Guardar</button>
    `);
  });

  // Cerrar modal
  btnCerrar.addEventListener("click", cerrarModal);
  window.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal();
  });

  // Funciones globales
  window.abrirModal = function (titulo, contenidoHTML) {
    modalTitulo.textContent = titulo;
    formContainer.innerHTML = contenidoHTML;
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  };

  window.cerrarModal = function () {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    formContainer.innerHTML = "";
  };

  // Cerrar modal clickeando overlay
  overlay.addEventListener("click", () => {
    modal.style.display = "none";
    overlay.style.display = "none";
  });
});

function crearPaginacion({
    contenedor,
    totalItems,
    paginaActual,
    filasPorPagina = 5,
    onPaginaCambiada
}) {
    const div = document.querySelector(contenedor);
    if (!div) return;

    div.innerHTML = "";

    const totalPaginas = Math.ceil(totalItems / filasPorPagina);
    if (totalPaginas <= 1) return;

    // Helper botón
    function btn(texto, pagina, disabled = false, active = false) {
        const b = document.createElement("button");
        b.textContent = texto;

        if (disabled) b.disabled = true;
        if (active) b.classList.add("active");

        if (!disabled && !active) {
            b.addEventListener("click", () => {
                onPaginaCambiada(pagina);
            });
        }
        return b;
    }

    // BOTÓN ANTERIOR
    div.appendChild(
        btn("« Anterior", paginaActual - 1, paginaActual === 1)
    );

    // Reglas de puntos "…"
    const maxVisibles = 5;
    let inicio = Math.max(1, paginaActual - 2);
    let fin = Math.min(totalPaginas, paginaActual + 2);

    if (paginaActual <= 3) {
        inicio = 1;
        fin = Math.min(5, totalPaginas);
    } else if (paginaActual >= totalPaginas - 2) {
        inicio = Math.max(totalPaginas - 4, 1);
        fin = totalPaginas;
    }

    // Si el inicio no es 1 → mostrar "1 …"
    if (inicio > 1) {
        div.appendChild(btn("1", 1));
        if (inicio > 2) {
            const sp = document.createElement("span");
            sp.textContent = "…";
            sp.classList.add("ellipsis");
            div.appendChild(sp);
        }
    }

    // Botones de páginas
    for (let i = inicio; i <= fin; i++) {
        div.appendChild(btn(i, i, false, i === paginaActual));
    }

    // Si el final no es el total → mostrar "… última"
    if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) {
            const sp = document.createElement("span");
            sp.textContent = "…";
            sp.classList.add("ellipsis");
            div.appendChild(sp);
        }
        div.appendChild(btn(totalPaginas, totalPaginas));
    }

    // BOTÓN SIGUIENTE
    div.appendChild(
        btn("Siguiente »", paginaActual + 1, paginaActual === totalPaginas)
    );
}

