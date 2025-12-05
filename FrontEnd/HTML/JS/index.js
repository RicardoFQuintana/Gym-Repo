// === CONSTANTES DE LA API ===
const API_BASE_MIEMBRO_INDEX = "https://localhost:7271/api/Miembro"; 
const API_BASE_ENTRENADOR_INDEX = "https://localhost:7271/api/Entrenador"; 
const API_BASE_MEMBRESIA = "https://localhost:7271/api/TipoMembresia"; 

// =========================================================
// === FUNCIÓN CENTRAL DE INTERACTIVIDAD (NUEVA) ===
// Contiene toda la lógica que depende de los elementos inyectados por loadComponents.js
// =========================================================
function initializeComponentInteractivity() {
    
    // --- LÓGICA DE NAVEGACIÓN Y SIDEBAR ---
    const sidebar = document.getElementById("sidebar");
    const menuBtn = document.getElementById("menu-btn");        
    const closeBtn = document.getElementById("close-btn");
    const overlay = document.getElementById("overlay");
    
    // Lógica del Scroll (Header Transparente)
    const header = document.querySelector('.navbar');
    const heroHeight = 600; 

    function handleScroll() {
        if (header) { 
             if (window.scrollY > heroHeight) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }

    // LÓGICA DE EVENT LISTENERS para Sidebar
    if (menuBtn && sidebar && closeBtn && overlay) { 
        menuBtn.addEventListener("click", () => {
            sidebar.classList.add("active");
            document.body.classList.add("sidebar-active");
        });

        closeBtn.addEventListener("click", () => {
            sidebar.classList.remove("active");
            document.body.classList.remove("sidebar-active");
        });

        overlay.addEventListener("click", () => {
            sidebar.classList.remove("active");
            overlay.classList.remove("active");
        });
    }

    // Inicializar Scroll
    if (header) {
        handleScroll();
        window.addEventListener('scroll', handleScroll);
    }
    
    // ===== SLIDER HERO (Depende del contenido estático de la página, pero lo inicializamos aquí) =====
    let slides = document.querySelectorAll(".hero-slide");
    if (slides.length > 0) {
        let currentSlide = 0;
        // Asegura que el primero esté activo al inicio (si no lo está en el HTML)
        if (!slides[currentSlide].classList.contains("active")) { 
            slides[currentSlide].classList.add("active");
        }

        function changeSlide() {
            slides[currentSlide].classList.remove("active");
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add("active");
        }
        setInterval(changeSlide, 6000); 
    }
    
    // ===== Modo Nocturno (MOVIDO Y AJUSTADO AQUÍ) =====
    const btnNocturno = document.getElementById("modoNocturnoBtn");

    if (btnNocturno) { 
        const isNocturno = localStorage.getItem("modoNocturno") === "true";
        const iconOn = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-toggle-right-icon lucide-toggle-right"><circle cx="15" cy="12" r="3"/><rect width="20" height="14" x="2" y="5" rx="7"/></svg>`;
        const iconOff = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-toggle-left-icon lucide-toggle-left"><circle cx="9" cy="12" r="3"/><rect width="20" height="14" x="2" y="5" rx="7"/></svg>`;
        
        // Inicializar el estado y el icono
        if (isNocturno) {
            document.documentElement.setAttribute("data-paleta", "Nocturno");
            btnNocturno.innerHTML = iconOn;
        } else {
             document.documentElement.removeAttribute("data-paleta");
             btnNocturno.innerHTML = iconOff;
        }
        
        btnNocturno.addEventListener("click", () => {
            const currentlyNocturno = document.documentElement.getAttribute("data-paleta") === "Nocturno";

            if (currentlyNocturno) {
                document.documentElement.removeAttribute("data-paleta");
                btnNocturno.innerHTML = iconOff;
                localStorage.setItem("modoNocturno", "false");
            } else {
                document.documentElement.setAttribute("data-paleta", "Nocturno");
                btnNocturno.innerHTML = iconOn;
                localStorage.setItem("modoNocturno", "true");
            }
        });
    }

    // =========================================================
    // === MENÚ DE USUARIO (ICONO + DESPLEGABLE) ===
    // =========================================================
    const userBtn = document.getElementById("userBtn");
    const userDropdown = document.getElementById("userDropdown");

    if (userBtn && userDropdown) {

        // Abrir/cerrar menú al hacer clic en el icono de usuario
        userBtn.addEventListener("click", (e) => {
            e.stopPropagation(); 
            userDropdown.classList.toggle("hidden");
        });

        // Cerrar menú si se hace clic fuera
        document.addEventListener("click", (e) => {
            if (
                !userDropdown.contains(e.target) &&
                !userBtn.contains(e.target)
            ) {
                userDropdown.classList.add("hidden");
            }
        });

        // Botón de cerrar sesión (si lo necesitás)
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                console.log("Cerrar sesión...");
                // Aquí podés limpiar tokens, localStorage, etc.
            });
        }
    }
}

// =========================================================
// === FIN DE FUNCIÓN CENTRAL DE INTERACTIVIDAD ===
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    // === LÓGICA DE OBTENCIÓN DE DATOS (NO AFECTADA) ===
    // Estas funciones no dependen de que el header o aside se carguen.
    actualizarContadorMiembros(); 
    actualizarContadorEntrenadores(); 
    renderizarEntrenadores();
    renderizarPlanes(); 
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
                <p1>${especialidad}</p1>
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
            if (plan.duracionDias == 90) {
                cardClass += " popular"; 
                tagHTML = '<h4 class="tag">Más Popular</h4>'; 
            }
            if (plan.duracionDias >= 365) {
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