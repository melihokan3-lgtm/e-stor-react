import { translate } from "../../features/i18n/LanguageContext";
import type { KeyboardEvent } from "react";

interface ProfileDetailInput {
  name: string;
  value: string;
  placeholder: string;
  type?: "text" | "email" | "tel";
}

interface ProfileDetailRowProps {
  label: string;
  value: string;
  inputs: ProfileDetailInput[];
  editing: boolean;
  error: string;
  last?: boolean;
  onEdit: () => void;
  onChange: (name: string, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileDetailRow({
  label, value, inputs, editing, error, last = false,
  onEdit, onChange, onSave, onCancel,
}: ProfileDetailRowProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSave();
    } else if (event.key === "Escape") {
      onCancel();
    }
  };

  return (
    <div className={`flex items-center justify-between py-[30px] max-md:items-start max-md:gap-4 ${last ? "" : "border-b border-[#f2f2f2]"}`}>
      {editing ? (
        <div className="flex w-full flex-col gap-3">
          <span className="text-[15px] font-bold text-[#111]">{translate("Edit ")}{label}</span>
          <div className="flex w-full flex-wrap gap-3">
            {inputs.map((input, index) => (
              <input
                key={input.name}
                type={input.type || "text"}
                className={`h-[42px] min-w-[180px] flex-1 rounded-[10px] border-[1.5px] bg-white px-[14px] text-sm text-gray-900 outline-none transition focus:border-[#b6349a] focus:ring-[3px] focus:ring-[#b6349a]/[.12] ${error ? "border-red-500" : "border-gray-200"}`}
                aria-label={input.placeholder}
                placeholder={input.placeholder}
                value={input.value}
                onChange={(event) => onChange(input.name, event.currentTarget.value)}
                onKeyDown={handleKeyDown}
                autoFocus={index === 0}
              />
            ))}
          </div>
          {error && <span className="text-xs font-medium text-red-500" role="alert">{translate(error)}</span>}
          <div className="mt-1 flex items-center gap-2">
            <button type="button" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-[#b6349a] to-[#831843] px-[18px] py-2 text-[13px] font-semibold text-white shadow-[0_2px_8px_rgba(182,52,154,0.25)] transition hover:-translate-y-px hover:opacity-95 hover:shadow-[0_4px_12px_rgba(182,52,154,0.35)]" onClick={onSave}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
              {translate("\n              Save\n            ")}</button>
            <button type="button" className="inline-flex items-center rounded-lg bg-gray-100 px-[14px] py-2 text-[13px] font-semibold text-gray-600 transition hover:bg-gray-200 hover:text-gray-900" onClick={onCancel}>{translate("Cancel")}</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2">
          <span className="text-[15px] font-bold text-[#111]">{translate(label)}</span>
            <span className="text-sm font-medium text-[#aaa]">{value}</span>
          </div>
          <button type="button" className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-[#b6349a] transition hover:bg-[#b6349a]/[.05]" onClick={onEdit} aria-label={`Edit ${label}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            {translate("\n            Edit\n          ")}</button>
        </>
      )}
    </div>
  );
}
