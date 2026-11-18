
// Verificamos si el navegador soporta Service Worker
if ('serviceWorker' in navigator) {

    // Registramos el Service Worker cuando cargue la página
    window.addEventListener('load', () => {

        navigator.serviceWorker.register('./sw.js')

            .then(registro => {
                console.log('Service Worker registrado correctamente:', registro);
            })

            .catch(error => {
                console.error('Error al registrar el Service Worker:', error);
            });

    });

}

