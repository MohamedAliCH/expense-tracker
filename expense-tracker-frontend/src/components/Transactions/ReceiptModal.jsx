import React from "react";
import { DownloadSimple, Receipt } from "@phosphor-icons/react";
import MoorlyModal from "../Common/MoorlyModal";

const ReceiptModal = ({ show, onClose, transaction }) => {
  if (!transaction) return null;

  const isPdf = transaction.receipt_path?.toLowerCase().endsWith(".pdf");
  const fullUrl = transaction.receipt_url?.startsWith("http")
    ? transaction.receipt_url
    : `http://localhost:8000/storage/${transaction.receipt_path?.replace(/^public\//, "")}`;

  return (
    <MoorlyModal
      show={show}
      onClose={onClose}
      title="Receipt Attachment"
      subtitle={`${transaction.description} · $${parseFloat(transaction.amount).toFixed(2)}`}
      maxWidth="max-w-[640px]"
    >
      <div className="p-6 flex flex-col gap-4 items-center">
        <div
          className="w-full max-h-[500px] rounded-[14px] overflow-hidden flex items-center justify-center p-2"
          style={{ background: "var(--card-2)", border: "1px solid var(--line-2)" }}
        >
          {isPdf ? (
            <div className="p-10 flex flex-col items-center gap-3 text-center">
              <Receipt size={48} weight="duotone" style={{ color: "var(--accent)" }} />
              <p className="text-[14px] font-semibold" style={{ color: "var(--ink)" }}>
                PDF Receipt Document
              </p>
              <a
                href={fullUrl}
                target="_blank"
                rel="noreferrer"
                className="moorly-btn moorly-btn--primary"
              >
                <DownloadSimple size={16} weight="bold" />
                <span>Open / Download PDF</span>
              </a>
            </div>
          ) : (
            <img
              src={fullUrl}
              alt="Receipt"
              className="max-h-[460px] w-auto object-contain rounded-[10px]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><text y='50' font-size='12'>Attachment</text></svg>";
              }}
            />
          )}
        </div>

        <div className="w-full flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--line)" }}>
          <span className="text-[12px]" style={{ color: "var(--muted)" }}>
            Dated: {new Date(transaction.date).toLocaleDateString()}
          </span>

          <div className="flex items-center gap-2">
            <a
              href={fullUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="moorly-btn moorly-btn--ghost !h-9"
            >
              <DownloadSimple size={15} weight="bold" />
              <span>Download</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="moorly-btn moorly-btn--primary !h-9"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </MoorlyModal>
  );
};

export default ReceiptModal;

