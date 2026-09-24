import { useLanguage, translate } from "../../features/i18n/LanguageContext";

const options = [
  { value: "tr", label: "TR", title: "Türkçe" },
  { value: "en", label: "EN", title: "English" },
] as const;

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label={translate("Site language")}
      className="inline-flex shrink-0 items-center rounded-full border border-[#ead9e8] bg-[#fbf6fa] p-1"
    >
      {options.map((option) => {
        const selected = language === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            aria-label={option.title}
            title={option.title}
            onClick={() => setLanguage(option.value)}
            className={`min-w-9 rounded-full px-2.5 py-1.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6349a] ${selected ? "bg-[#b6349a] text-white shadow-sm" : "bg-transparent text-[#6b5368] hover:bg-white hover:text-[#b6349a]"}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
