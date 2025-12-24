import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "ultrix_cookie_consent";

type ConsentStatus = "accepted" | "declined" | null;

// Custom event for reopening the banner
const REOPEN_EVENT = "ultrix_reopen_cookie_banner";

export const reopenCookieBanner = () => {
  window.dispatchEvent(new CustomEvent(REOPEN_EVENT));
};

const CookieBanner = () => {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === "accepted" || stored === "declined") {
      setConsentStatus(stored);
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for reopen event
  useEffect(() => {
    const handleReopen = () => {
      setIsVisible(true);
    };

    window.addEventListener(REOPEN_EVENT, handleReopen);
    return () => window.removeEventListener(REOPEN_EVENT, handleReopen);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsentStatus("accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setConsentStatus("declined");
    setIsVisible(false);
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-lg shadow-lg p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">Cookie-Einstellungen</h3>
              <p className="text-sm text-muted-foreground">
                Wir verwenden Cookies, um Ihnen die bestmögliche Erfahrung auf unserer Website zu bieten. 
                Einige Cookies sind für den Betrieb der Website erforderlich, während andere uns helfen, 
                die Website zu verbessern.{" "}
                <Link to="/datenschutz" className="text-primary hover:underline">
                  Mehr erfahren
                </Link>
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button 
              variant="outline" 
              onClick={handleDecline}
              className="flex-1 md:flex-none"
            >
              Nur notwendige
            </Button>
            <Button 
              onClick={handleAccept}
              className="flex-1 md:flex-none"
            >
              Alle akzeptieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
