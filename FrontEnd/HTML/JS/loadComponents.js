


/**
 * Función para cargar e insertar un componente HTML de forma asíncrona.
 * * @param {string} componentName - El nombre del archivo (e.g., 'header').
 * @param {string} targetId - El ID del elemento contenedor donde se insertará (e.g., 'header-placeholder').
 * @param {function} callback - (OPCIONAL) Función a ejecutar inmediatamente después de que el HTML haya sido insertado.
 */
function loadComponent(componentName, targetId, callback) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        // Asumiendo que la estructura de carpetas es: /HTML/componentHTML/
        fetch(`/FrontEnd/HTML/componentHTML/${componentName}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error al cargar el componente ${componentName}. Código: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                targetElement.innerHTML = html;
                
                // === PASO CLAVE: Ejecutar el callback (usado para resolver la promesa) ===
                if (callback && typeof callback === 'function') {
                    callback();
                }
            })
            .catch(error => {
                console.error(error);
                // Si hay un error, aún llamamos al callback para no bloquear la secuencia de promesas.
                if (callback && typeof callback === 'function') {
                    callback(error); 
                }
            });
    } else {
        // Si el contenedor no existe, también debe terminar la promesa si se usa este archivo
        if (callback && typeof callback === 'function') {
             callback();
        }
    }
}

/**
 * Función auxiliar para envolver loadComponent en una Promesa. 
 * Esto nos permite usar el encadenamiento .then() para cargar componentes secuencialmente.
 */
function loadComponentAsPromise(componentName, targetId) {
    return new Promise((resolve, reject) => {
        // El callback pasado a loadComponent es la función 'resolve' de la promesa.
        // Así, la promesa se resuelve cuando la carga termina.
        loadComponent(componentName, targetId, (error) => {
            if (error) {
                // Rechaza la promesa si hubo un error en la carga (e.g., fetch falló)
                reject(error);
            } else {
                // Resuelve la promesa si la carga fue exitosa
                resolve();
            }
        });
    });
}


// === NUEVA LÓGICA DE CARGA SECUENCIAL Y ASÍNCRONA ===
// La carga del aside es crucial para #sidebar y #close-btn, por eso va primero.
loadComponentAsPromise('aside', 'aside-placeholder')
    .then(() => {
        return reemplazarIconosDesdeCarpeta();
    })
    .then(() => {
        return loadComponentAsPromise('header', 'header-placeholder');
    })
    .then(() => {
        // Una vez que el header está cargado, cargamos el footer.
        return loadComponentAsPromise('footer', 'footer-placeholder');
    })
    .then(() => {
        // Finalmente, una vez que TODOS los componentes interactivos están en el DOM,
        // ejecutamos la lógica de eventos.
        if (typeof initializeComponentInteractivity === 'function') {
            initializeComponentInteractivity();
        } else {
            console.error("Error: initializeComponentInteractivity no está definida o no es una función.");
        }
    })
    .catch(error => {
        console.error("Error crítico: Fallo en la secuencia de carga de componentes.", error);
    });


function reemplazarIconosDesdeCarpeta() {
    const iconMap = {
        "iconClases": "school.svg",
        "iconActividades": "shapes.svg",
        "iconEntrenador": "biceps-flexed.svg",
        "iconMiembros": "users.svg",
        "iconMembresias": "id-card.svg",
        "iconAsistencia": "hand.svg",
        "iconIngresos": "banknote-arrow-up.svg",
        "iconCalendar": "calendar.svg",
        "iconContactos": "contact.svg"
    };

    const iconFolder = "/FrontEnd/ASSETS/icons/";

    const promises = [];

    Object.keys(iconMap).forEach(tagName => {
        const elements = document.querySelectorAll(tagName);
        if (elements.length === 0) return;

        const filePath = iconFolder + iconMap[tagName];

        const p = fetch(filePath)
            .then(res => res.text())
            .then(svgContent => {
                elements.forEach(el => {
                    el.outerHTML = svgContent;
                });
            });

        promises.push(p);
    });

    return Promise.all(promises);
}