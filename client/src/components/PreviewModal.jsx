import DocumentPaper from "./DocumentPaper";

// Full-screen preview with Download / Open PDF buttons.
// pdfUrl is the API path of the PDF, e.g. "/api/invoices/123/pdf".
// `footer` can hold extra actions (the client portal uses it for Accept / Decline).
export default function PreviewModal({
  type,
  doc,
  business,
  pdfUrl,
  onClose,
  footer,
}) {
  return (
    <div className="fixed inset-0 z-20 overflow-y-auto bg-ink/50 p-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <a className="btn-primary" href={`${pdfUrl}?download=1`}>
              Download PDF
            </a>
            <a
              className="btn-ghost"
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open PDF in new tab
            </a>
          </div>
          <button className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <DocumentPaper type={type} doc={doc} business={business} />

        {footer && (
          <div className="mt-3 flex flex-wrap justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}
