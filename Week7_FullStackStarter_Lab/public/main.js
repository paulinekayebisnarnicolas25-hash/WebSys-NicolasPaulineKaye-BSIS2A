if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log("Pau's Corner PWA is ready!"))
      .catch(err => console.error('Service Worker failed:', err));
  });
}