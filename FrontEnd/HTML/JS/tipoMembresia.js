// TipoMembresia.js

const API_BASE_MEMBRESIA = "https://localhost:7271/api/TipoMembresia";

/**
 * Función global para obtener la lista de tipos de membresía (planes) con sus precios.
 * Esta función será usada por index.js.
 */
function obtenerTiposMembresia() {
    return fetch(API_BASE_MEMBRESIA)
           .then(res => {
               if (!res.ok) {
                   // Lanza un error si la respuesta HTTP no es exitosa
                   throw new Error(`Error HTTP: ${res.status}`);
               }
               return res.json();
           });
}