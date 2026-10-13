import { useEffect } from "react";
import { Spinner } from "./Loaders";

export default function ConfirmDialog({ title, body = "This can't be undone.", confirmLabel = "Delete", cancelLabel = "Cancel", busy, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-ink/40 p-4">
      <div className="w-full max-w-sm rounded-card bg-white p-7" role="alertdialog" aria-modal="true">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate2">{body}</p>
        <div className="mt-8 flex justify-end gap-3">
          <button className="btn-ghost" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button className="btn-danger" onClick={onConfirm} disabled={busy}>
            {busy && <Spinner />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
