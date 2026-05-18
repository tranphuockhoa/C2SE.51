/**
 * Simple toast notification system (no external dependency).
 * Creates DOM-based toasts.
 */

let container = null

function getContainer() {
    if (container) return container
    container = document.createElement('div')
    container.id = 'toast-container'
    container.style.cssText =
        'position:fixed;top:16px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;'
    document.body.appendChild(container)
    return container
}

function createToast(message, type = 'info', duration = 3000) {
    const el = document.createElement('div')
    el.style.cssText =
        'pointer-events:auto;padding:12px 20px;border-radius:10px;font-size:14px;font-family:"Noto Sans JP",sans-serif;' +
        'color:#fff;box-shadow:0 4px 12px rgba(0,0,0,0.15);transform:translateX(120%);transition:transform 0.3s ease;max-width:360px;'

    const colors = {
        success: '#22C55E',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#0891B2',
    }
    el.style.backgroundColor = colors[type] || colors.info
    el.textContent = message

    getContainer().appendChild(el)
    requestAnimationFrame(() => {
        el.style.transform = 'translateX(0)'
    })

    setTimeout(() => {
        el.style.transform = 'translateX(120%)'
        setTimeout(() => el.remove(), 300)
    }, duration)
}

export const toast = {
    success: (msg, dur) => createToast(msg, 'success', dur),
    error: (msg, dur) => createToast(msg, 'error', dur),
    warning: (msg, dur) => createToast(msg, 'warning', dur),
    info: (msg, dur) => createToast(msg, 'info', dur),
}