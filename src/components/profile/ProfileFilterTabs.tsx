import { translate } from "../../features/i18n/LanguageContext";
interface FilterOption<T extends string> {
  id: T;
  label: string;
}

interface ProfileFilterTabsProps<T extends string> {
  options: FilterOption<T>[];
  selected: T;
  onSelect: (id: T) => void;
  className?: string;
}

export default function ProfileFilterTabs<T extends string>({
  options, selected, onSelect, className = "",
}: ProfileFilterTabsProps<T>) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="group" aria-label={translate("Filtreler")}>
      {options.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          aria-pressed={selected === id}
          className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${selected === id ? "border-[#b6349a] bg-[#b6349a] text-white" : "border-[#eee] bg-white text-[#777]"}`}
          onClick={() => onSelect(id)}
        >
          {translate(label)}
        </button>
      ))}
    </div>
  );
}
