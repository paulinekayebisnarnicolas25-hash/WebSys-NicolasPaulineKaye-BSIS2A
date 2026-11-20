if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {

        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log(
                    "Pau's Corner Service Worker Registered!",
                    registration.scope
                );
            })
            .catch(error => {
                console.error(
                    'Service Worker Registration Failed:',
                    error
                );
            });

    });
}