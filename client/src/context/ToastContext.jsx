import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Icon from '../components/Icon';

const ToastContext = createContext(null);

const STYLES = {
  success: { icon: 'circleCheck', color: 'text-ok' },
  error: { icon: 'alert', color: 'text-rose2' },
  info: { icon: 'info', color: 'text-brand' },
};

// Usage: const toast = useToast(); toast.success('Saved'); toast.error('Could not save');
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (type, message) => {
      const id = Date.now() + Math.random();
      setToasts((list) => [...list.slice(-3), { id, type, message }]);
      setTimeout(() => remove(id), type === 'error' ? 6000 : 3500);
    },
    [remove],
  );

  const api = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed bottom-24 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 md:bottom-6 md:right-6"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="anim-toast pointer-events-auto flex items-start gap-3 rounded-card border border-line bg-white px-4 py-3.5 shadow-lg shadow-brand/10"
          >
            <Icon name={STYLES[t.type].icon} className={`mt-0.5 h-5 w-5 shrink-0 ${STYLES[t.type].color}`} />
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button onClick={() => remove(t.id)} aria-label="Dismiss" className="text-slate2 hover:text-ink">
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
