import { translate, useLanguage } from "../i18n/LanguageContext";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { deleteAccount } from "./deleteAccount";
import { clearLocalAccountData } from "./settings";

type DeleteAccountDialogProps = {
  open: boolean;
  pending: boolean;
  error: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteAccountDialog({ open, pending, error, onClose, onConfirm }: DeleteAccountDialogProps) {
  const { language } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmation, setConfirmation] = useState("");
  const expectedConfirmation = language === "tr" ? "ONAY" : "DELETE";
  const confirmed = confirmation.trim().toLocaleUpperCase(language === "tr" ? "tr-TR" : "en-US") === expectedConfirmation;

  useEffect(() => {
    if (!open) {
      setConfirmation("");
      return;
    }
    const dialog = dialogRef.current;
    dialog?.showModal();
    inputRef.current?.focus();
    return () => { if (dialog?.open) dialog.close(); };
  }, [open]);

  if (!open) return null;

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    if (!pending) onClose();
  };
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget && !pending) onClose();
  };
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirmed && !pending) onConfirm();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-description"
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[min(92vw,480px)] overflow-y-auto rounded-2xl border border-red-100 bg-white p-0 shadow-2xl backdrop:bg-[#161016]/60"
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
        <div>
          <h2 id="delete-account-title" className="text-xl font-bold text-[#222]">{translate("Hesabınızı silmek istediğinize emin misiniz?")}</h2>
          <p id="delete-account-description" className="mt-2 text-sm leading-6 text-[#666]">
            {translate("\n            Bu işlem kalıcıdır. Giriş hesabınız ile profil, adres, sepet ve sipariş kayıtlarınız silinir. Bu tarayıcıdaki size ait test verileri de temizlenir.\n          ")}</p>
        </div>

        <label htmlFor="delete-account-confirmation" className="block text-sm font-semibold text-[#444]">
          {translate("\n          Onaylamak için ")}<span className="font-bold text-red-700">{translate("ONAY")}</span> {translate(" yazın\n        ")}</label>
        <input
          ref={inputRef}
          id="delete-account-confirmation"
          type="text"
          autoComplete="off"
          value={confirmation}
          onChange={(event) => setConfirmation(event.currentTarget.value)}
          disabled={pending}
          className="w-full rounded-xl border border-[#ddd] px-3 py-3 text-sm outline-none focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-200 disabled:opacity-60"
        />

        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{translate(error)}</p>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} disabled={pending} className="rounded-xl border border-[#ddd] px-4 py-2.5 text-sm font-semibold text-[#444] hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6349a] disabled:opacity-60">{translate("Vazgeç")}</button>
          <button type="submit" disabled={!confirmed || pending} className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-50">
            {pending ? translate("Hesap siliniyor...") : translate("Hesabımı kalıcı olarak sil")}
          </button>
        </div>
      </form>
    </dialog>
  );
}

export default function DeleteAccountSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!user || pending) return;
    setPending(true);
    setError("");
    try {
      await deleteAccount();
      clearLocalAccountData(user);
      // Leave the protected profile route before Auth signs out, so the route
      // guard does not reopen the login modal after a successful deletion.
      navigate("/", { replace: true, state: { accountDeleted: true } });
      await logout();
      clearLocalAccountData(user);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Hesap silinemedi. Lütfen tekrar deneyin.");
      setPending(false);
    }
  };

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-6" aria-labelledby="delete-account-heading">
      <h2 id="delete-account-heading" className="text-xl font-bold text-red-800">{translate("Hesabı sil")}</h2>
      <p className="mt-2 text-sm leading-6 text-red-700">{translate("Hesabınızı ve kayıtlı kullanıcı verilerinizi kalıcı olarak silin. Bu işlem geri alınamaz.")}</p>
      <button
        type="button"
        onClick={() => { setError(""); setOpen(true); }}
        className="mt-5 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
      >
        {translate("\n        Hesabımı sil\n      ")}</button>
      <DeleteAccountDialog open={open} pending={pending} error={error} onClose={() => setOpen(false)} onConfirm={() => void handleDelete()} />
    </section>
  );
}
