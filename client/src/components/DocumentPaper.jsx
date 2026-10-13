import StatusBadge from "./StatusBadge";
import { fmtDate, money } from "../utils/format";

// On-screen preview of an invoice or quote. Looks like the PDF.
//   type: 'invoice' | 'quote'
//   doc: document with `client` populated
//   business: { name, businessName, email } of the business that issued it
export default function DocumentPaper({ type, doc, business }) {
  const isInvoice = type === "invoice";
  const client = doc.client || {};
  const status = isInvoice ? doc.displayStatus || doc.status : doc.status;
  const balance = (doc.total || 0) - (doc.amountPaid || 0);

  return (
    <div className="rounded-lg border border-line bg-white p-5 text-sm shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">
            {business?.businessName || business?.name}
          </p>
          {business?.email && <p className="text-slate2">{business.email}</p>}
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold tracking-wide text-brand">
            {isInvoice ? "INVOICE" : "QUOTE"}
          </p>
          <p className="text-slate2">{doc.number}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate2">
            Bill to
          </p>
          <p className="mt-1 font-semibold">{client.name}</p>
          {[client.company, client.email, client.phone, client.address]
            .filter(Boolean)
            .map((line) => (
              <p key={line} className="text-slate2">
                {line}
              </p>
            ))}
        </div>
        <dl className="space-y-1 sm:ml-auto sm:w-64">
          <div className="flex justify-between gap-4">
            <dt className="text-slate2">Issue date</dt>
            <dd className="font-medium">{fmtDate(doc.issueDate)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate2">
              {isInvoice ? "Due date" : "Valid until"}
            </dt>
            <dd className="font-medium">
              {fmtDate(isInvoice ? doc.dueDate : doc.validUntil)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-slate2">Status</dt>
            <dd>
              <StatusBadge value={status} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-slate2">
            <tr>
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Unit price</th>
              <th className="py-2 text-right font-medium">Tax</th>
              <th className="py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(doc.items || []).map((item, i) => (
              <tr key={i} className="border-b border-line/60">
                <td className="py-2 pr-3">{item.description}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{money(item.unitPrice)}</td>
                <td className="py-2 text-right">{item.taxRate || 0}%</td>
                <td className="py-2 text-right">
                  {money(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-4 space-y-1 sm:ml-auto sm:w-64">
        <div className="flex justify-between">
          <dt className="text-slate2">Subtotal</dt>
          <dd>{money(doc.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate2">Tax</dt>
          <dd>{money(doc.taxTotal)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>{money(doc.total)}</dd>
        </div>
        {isInvoice && (
          <>
            <div className="flex justify-between">
              <dt className="text-slate2">Paid</dt>
              <dd>{money(doc.amountPaid)}</dd>
            </div>
            <div className="flex justify-between text-base font-semibold text-brand">
              <dt>Balance due</dt>
              <dd>{money(balance)}</dd>
            </div>
          </>
        )}
      </dl>

      {doc.notes && (
        <div className="mt-6 border-t border-line pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate2">
            Notes
          </p>
          <p className="mt-1 whitespace-pre-line">{doc.notes}</p>
        </div>
      )}
    </div>
  );
}
