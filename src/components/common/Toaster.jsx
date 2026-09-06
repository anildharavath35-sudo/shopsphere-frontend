import { useUIStore, toastColor } from '../../store/uiStore';

export const Toaster = () => {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start justify-between gap-3 rounded-xl border px-4 py-3 shadow-lg animate-toast-in ${toastColor(t.type)}`}
          role="status"
        >
          <p className="text-sm font-medium">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="text-xs opacity-60 transition-opacity hover:opacity-100"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};