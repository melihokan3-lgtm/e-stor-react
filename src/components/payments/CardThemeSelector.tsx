import { CARD_THEMES } from "../../utils/cardUtils";

interface CardThemeSelectorProps {
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
}

export default function CardThemeSelector({ selectedTheme, onSelectTheme }: CardThemeSelectorProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="field-label-text">Kart Teması:</span>
      <div className="flex gap-[10px]">
        {CARD_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`block size-[26px] shrink-0 cursor-pointer rounded-full border-2 transition-[transform,border-color] duration-200 ease-[ease] ${selectedTheme === theme.id ? "transform-[scale(1.2)] border-black shadow-[0_2px_8px_rgba(0,0,0,0.25)]" : "border-transparent"}`}
            style={{ background: theme.gradient }}
            onClick={() => onSelectTheme(theme.id)}
            title={theme.name}
            aria-label={theme.name}
          />
        ))}
      </div>
    </div>
  );
}
