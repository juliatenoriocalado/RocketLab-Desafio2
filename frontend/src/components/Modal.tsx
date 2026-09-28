import { useEffect, useRef } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md";
};

// Usa o <dialog> nativo: já prende o foco e fecha com Esc
export function Modal({ open, title, onClose, children, size = "md" }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`modal modal-${size}`}
      onClose={onClose}
      onClick={(event) => {
        // clique no fundo escuro (fora do conteúdo) fecha o modal
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="modal-content">
        <header className="modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </header>

        {open && children}
      </div>
    </dialog>
  );
}
