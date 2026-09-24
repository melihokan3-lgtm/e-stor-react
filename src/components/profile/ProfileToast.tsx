interface ProfileToastProps {
  message: string;
}

export default function ProfileToast({ message }: ProfileToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#111] px-4 py-3 text-sm font-semibold text-white shadow-lg" role="status">
      {translate(message)}
    </div>
  );
}
import { translate } from "../../features/i18n/LanguageContext";
