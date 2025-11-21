// Usamos la misma URL que definiste en miembros.js
const API_BASE_MIEMBRO_INDEX = "https://localhost:7271/api/Miembro"; 
// === CONSTANTE PARA ENTRENADORES ===
const API_BASE_ENTRENADOR_INDEX = "https://localhost:7271/api/Entrenador"; 
// === CONSTANTE PARA MEMBRESÍAS ===
const API_BASE_MEMBRESIA = "https://localhost:7271/api/TipoMembresia"; 

document.addEventListener("DOMContentLoaded", () => {
    // === LÓGICA DE NAVEGACIÓN Y SLIDER (EXISTENTE) ===
    const sidebar = document.getElementById("sidebar");
    const navLinks = document.querySelector(".nav-links");
    const menuBtn = document.getElementById("menu-btn");        
    const menuBtnRight = document.getElementById("menu-btn-right"); 
    const closeBtn = document.getElementById("close-btn");
    const overlay = document.getElementById("overlay");
    const closeBtnRight = document.getElementById("close-btn-right");

    // Abrir sidebar izquierdo
    menuBtn.addEventListener("click", () => {
        sidebar.classList.add("active");
        overlay.classList.add("active");
    });

    // Abrir sidebar derecho
    menuBtnRight.addEventListener("click", () => {
        navLinks.classList.add("active");
        overlay.classList.add("active");
    });

    // Cerrar sidebar izquierdo
    closeBtn.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });

    // Cerrar sidebar derecho
    closeBtnRight.addEventListener("click", () => {
        navLinks.classList.remove("active");
        overlay.classList.remove("active");
    });

    // Cerrar ambos sidebars con overlay
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        navLinks.classList.remove("active");
        overlay.classList.remove("active");
    });

    // ===== SLIDER HERO (EXISTENTE) =====
    let slides = document.querySelectorAll(".hero-slide");
    let currentSlide = 0;

    function changeSlide() {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
    }

    setInterval(changeSlide, 6000); // cambia cada 6 segundos

    // === INICIALIZACIÓN DE LAS FUNCIONES DINÁMICAS ===
    actualizarContadorMiembros(); 
    actualizarContadorEntrenadores(); 
    renderizarEntrenadores();
    renderizarPlanes(); 
});


// ===== Modo Nocturno (EXISTENTE) =====
const btnNocturno = document.getElementById("modoNocturnoBtn");

// Comprobar si ya estaba activado
if (localStorage.getItem("modoNocturno") === "true") {
    document.documentElement.setAttribute("data-paleta", "Nocturno");
    btnNocturno.textContent = "☀️";
}

btnNocturno.addEventListener("click", () => {
    const isNocturno = document.documentElement.getAttribute("data-paleta") === "Nocturno";

    if (isNocturno) {
        document.documentElement.removeAttribute("data-paleta");
        btnNocturno.textContent = "🌙";
        localStorage.setItem("modoNocturno", "false");
    } else {
        document.documentElement.setAttribute("data-paleta", "Nocturno");
        btnNocturno.textContent = "☀️";
        localStorage.setItem("modoNocturno", "true");
    }
});


// =========================================================
// === LÓGICA DE OBTENCIÓN DE DATOS DE MIEMBROS DINÁMICA ===
// =========================================================

async function obtenerTodosLosMiembrosIndex() {
    try {
        const response = await fetch(API_BASE_MIEMBRO_INDEX);
        if (!response.ok) {
            console.error(`Error al obtener miembros. Código: ${response.status}`);
            return []; 
        }
        return await response.json();
    } catch (error) {
        console.error("Error de conexión al obtener miembros:", error);
        return []; 
    }
}

async function actualizarContadorMiembros() {
    const contadorElemento = document.getElementById("miembrosActivosContador");
    if (!contadorElemento) return; 
    
    contadorElemento.textContent = "..."; 

    const miembros = await obtenerTodosLosMiembrosIndex();
    const totalMiembros = miembros.length;

    contadorElemento.textContent = totalMiembros;
}

// =============================================================
// === LÓGICA DE OBTENCIÓN Y RENDERIZACIÓN DE ENTRENADORES DINÁMICA ===
// =============================================================

async function obtenerTodosLosEntrenadores() {
    try {
        const response = await fetch(API_BASE_ENTRENADOR_INDEX);
        if (!response.ok) {
            console.error(`Error al obtener entrenadores. Código: ${response.status}`);
            return []; 
        }
        return await response.json();
    } catch (error) {
        console.error("Error de conexión al obtener entrenadores:", error);
        return []; 
    }
}

async function actualizarContadorEntrenadores() {
    const contadorElemento = document.getElementById("entrenadoresContador");
    if (!contadorElemento) return; 
    
    contadorElemento.textContent = "..."; 

    const entrenadores = await obtenerTodosLosEntrenadores();
    const totalEntrenadores = entrenadores.length;

    contadorElemento.textContent = totalEntrenadores;
}

async function renderizarEntrenadores() {
    const contenedor = document.getElementById("trainer-cards-container"); 
    if (!contenedor) return; 

    contenedor.innerHTML = '<p>Cargando entrenadores...</p>'; 

    const entrenadores = await obtenerTodosLosEntrenadores();
    
    if (entrenadores.length === 0) {
        contenedor.innerHTML = '<p>No hay entrenadores disponibles en este momento.</p>';
        return;
    }
    
    contenedor.innerHTML = ''; 

    entrenadores.forEach(entrenador => {
        const especialidad = entrenador.especialidad || 'Fitness General'; 
        const urlFoto = entrenador.urlFoto || '../ASSETS/img/default-trainer.jpg'; 

        const cardHTML = `
            <div class="trainer-card">
                <div class="trainer-photo" style="background-image: url('${urlFoto}');"></div>
                <h3>${entrenador.nombre || ''} ${entrenador.apellido || ''}</h3>
                <p>${especialidad}</p>
            </div>
        `;
        
        contenedor.insertAdjacentHTML('beforeend', cardHTML);
    });
}


// =============================================================
// === LÓGICA DE GENERACIÓN COMPLETA DE PLANES DINÁMICA (FINAL) ===
// =============================================================

async function obtenerTiposMembresia() {
     try {
        const response = await fetch(API_BASE_MEMBRESIA);
        if (!response.ok) {
            console.error(`Error al obtener membresías. Código: ${response.status}`);
            throw new Error(`Error HTTP al obtener membresías: ${response.status}`); 
        }
        return await response.json();
    } catch (error) {
        console.error("Error de conexión al obtener membresías:", error);
        return []; 
    }
}

/**
 * Función para generar todas las tarjetas de planes dinámicamente.
 * (Requiere que la API devuelva Descripcion, EsPopular, BeneficiosHTML y DuracionDias)
 */
async function renderizarPlanes() {
    const contenedor = document.getElementById("plans-container");
    if (!contenedor) return;

    contenedor.innerHTML = '<p>Cargando planes de membresía...</p>'; 

    try {
        const planes = await obtenerTiposMembresia();
        
        if (planes.length === 0) {
            contenedor.innerHTML = '<p>No hay planes de membresía disponibles en este momento.</p>';
            return;
        }

        contenedor.innerHTML = ''; // Limpiar el indicador de carga

        planes.forEach(plan => {
            
            let cardClass = "plan-card";
            let tagHTML = "";
            
            // 1. Asignar clases y tags basados en las propiedades booleanas (si existen en la DB)
            if (plan.esPopular) {
                cardClass += " popular"; 
                tagHTML = '<h4 class="tag">Más Popular</h4>'; 
            }
            if (plan.esPremium) {
                cardClass += " premium"; 
                tagHTML = tagHTML || '<h4 class="tag-1">Premium</h4>'; 
            }
            
            // Fallback para descripción y beneficios
            const descripcion = plan.descripcion || 'Sin descripción disponible.';
            const beneficios = plan.beneficiosHTML || `<li>Beneficios no listados</li>`;

            // 2. LÓGICA DE FORMATO DE PRECIO CORREGIDA
            let formatoPrecio = "";
            const duracionDias = plan.duracionDias; // Viene de la DB: public int DuracionDias { get; set; }
            
            if (duracionDias >= 365) {
                formatoPrecio = " ";
            } else if (duracionDias >= 90) {
                formatoPrecio = " ";
            } else { // Asume que es Mensual (30 días) o menos
                formatoPrecio = " ";
            }
            
            // Construir el precio final
            const costoFormateado = `$${plan.costo.toFixed(0)}${formatoPrecio}`; 
            
            // === FIN DE LA LÓGICA DE PRECIO CORREGIDA ===

            const planCardHTML = `
                <div class="${cardClass}">
                    <span class="circle"></span>
                    ${tagHTML}
                    <h3>${plan.nombre}</h3> 
                    <p>${descripcion}</p>
                    <span class="price">${costoFormateado}</span> 
                </div>
            `;
            
            contenedor.insertAdjacentHTML('beforeend', planCardHTML);
        });

    } catch (error) {
        console.error("Error al generar las tarjetas de planes:", error);
        contenedor.innerHTML = '<p>Error al cargar los planes. Intente más tarde.</p>';
    }
}