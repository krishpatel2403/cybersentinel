"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { NavSections } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </Button>
      <dialog
        ref={dialogRef}
        aria-label="Navigation menu"
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
        onClose={() => {
          setOpen(false);
          document.body.style.overflow = "";
        }}
        className="m-0 ml-0 h-dvh max-h-none w-[min(86vw,20rem)] rounded-none border-0 bg-[#060b14] p-0 text-slate-100 shadow-2xl backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5">
            <Logo />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <NavSections isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
          </div>
          <div className="border-t border-white/8 px-5 py-4">
            <p className="text-[10px] leading-4 text-slate-500">
              Portfolio demo · seeded sample data. Not a live security feed.
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
