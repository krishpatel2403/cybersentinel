"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
      document.body.style.overflow = "";
    }

    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={cn(
        "m-auto w-[min(94vw,44rem)] rounded-2xl border border-white/10 bg-[#0a1220] p-0 text-slate-100 shadow-2xl shadow-black/60 backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4">
        <div>
          <h2 id={titleId} className="text-base font-semibold text-white">
            {title}
          </h2>
          {description ? (
            <p id={descriptionId} className="mt-1 text-xs leading-5 text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
          aria-label="Close dialog"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <div className="max-h-[calc(90vh-8rem)] overflow-y-auto px-5 py-5">{children}</div>
    </dialog>
  );
}
