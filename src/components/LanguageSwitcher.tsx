import { useLanguage } from "@/i18n/LanguageContext";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-3 w-3" />
      <button
        onClick={() => setLanguage("de")}
        className={`text-sm transition-opacity ${
          language === "de" 
            ? "font-semibold opacity-100" 
            : "opacity-70 hover:opacity-100"
        }`}
      >
        DE
      </button>
      <span className="text-primary-foreground/50">|</span>
      <button
        onClick={() => setLanguage("en")}
        className={`text-sm transition-opacity ${
          language === "en" 
            ? "font-semibold opacity-100" 
            : "opacity-70 hover:opacity-100"
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
