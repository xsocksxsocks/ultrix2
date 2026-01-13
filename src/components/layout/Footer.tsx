import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { reopenCookieBanner } from "@/components/CookieBanner";
import { useLanguage, useLocalizedRoute } from "@/i18n/LanguageContext";
import ultrixLogo from "@/assets/ultrix-logo.png";

const Footer = () => {
  const { t } = useLanguage();
  const getRoute = useLocalizedRoute();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <img src={ultrixLogo} alt="ULTRIX Logo" className="h-10 mb-4 brightness-0 invert" />
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{t.footer.contact}</h3>
            <div className="space-y-3 text-sm">
              <a href={`tel:${t.common.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Phone className="h-4 w-4" />
                {t.common.phone}
              </a>
              <a href={`mailto:${t.common.email}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Mail className="h-4 w-4" />
                {t.common.email}
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <div>
                  {t.common.address}<br />
                  {t.common.city}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{t.footer.legal}</h3>
            <div className="space-y-2 text-sm">
              <Link to={getRoute("imprint")} className="block hover:opacity-80 transition-opacity">
                {t.footer.imprint}
              </Link>
              <Link to={getRoute("privacy")} className="block hover:opacity-80 transition-opacity">
                {t.footer.privacy}
              </Link>
              <button 
                onClick={reopenCookieBanner}
                className="block hover:opacity-80 transition-opacity text-left"
              >
                {t.footer.cookieSettings}
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} {t.common.companyName}. {t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
