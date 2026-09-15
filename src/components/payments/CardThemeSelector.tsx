import { CARD_THEMES } from "../../utils/cardUtils";

interface CardThemeSelectorProps {
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
}

export default function CardThemeSelector({ selectedTheme, onSelectTheme }: CardThemeSelectorProps) {
  return (
    <div className="theme-selection-row">
      <span className="field-label-text">Kart Teması:</span>
      <div className="theme-options">
        {CARD_THEMES.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`theme-dot ${selectedTheme === theme.id ? "selected" : ""}`}
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
