/**
 * Lightweight, dependency-free toast notifications. Theming follows the
 * editor host element (so the toast adopts dark mode if any editor on the
 * page is themed dark).
 */
type ToastVariant = 'info' | 'success' | 'error' | 'warn';

let host: HTMLDivElement | null = null;

function ensureHost(): HTMLDivElement {
    if (host && document.body.contains(host)) return host;
    host = document.createElement('div');
    host.className = 'rk-toast-host rk-word-editor';
    const themed = document.querySelector('.rk-word-editor[data-rk-theme]') as HTMLElement | null;
    if (themed?.dataset.rkTheme) host.dataset.rkTheme = themed.dataset.rkTheme;
    document.body.appendChild(host);
    return host;
}

export interface ToastOptions {
    variant?: ToastVariant;
    duration?: number; // ms
}

export function toast(message: string, opts: ToastOptions = {}): () => void {
    const root = ensureHost();
    const el = document.createElement('div');
    el.className = `rk-toast rk-toast-${opts.variant || 'info'}`;
    el.setAttribute('role', opts.variant === 'error' ? 'alert' : 'status');
    el.textContent = message;
    root.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-visible'));

    const dismiss = () => {
        el.classList.remove('is-visible');
        setTimeout(() => el.remove(), 250);
    };
    const t = setTimeout(dismiss, Math.max(800, opts.duration ?? 3200));
    el.addEventListener('click', () => { clearTimeout(t); dismiss(); });
    return () => { clearTimeout(t); dismiss(); };
}
