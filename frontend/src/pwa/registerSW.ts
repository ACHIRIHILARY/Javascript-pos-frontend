export function registerSW() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service Workers are not supported in this browser')
    return undefined
  }

  return navigator.serviceWorker
    .register('/sw.js', { scope: '/' })
    .then((registration) => {
      console.log('[PWA] Service Worker registered successfully', registration)

      // Check for updates periodically
      setInterval(() => {
        registration.update()
      }, 60000) // Check every minute

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('[PWA] New Service Worker activated - app updated')
              // Optionally show a notification to the user
              window.dispatchEvent(
                new CustomEvent('sw-updated', { detail: registration })
              )
            }
          })
        }
      })

      return registration
    })
    .catch((error) => {
      console.error('[PWA] Service Worker registration failed:', error)
      return undefined
    })
}
