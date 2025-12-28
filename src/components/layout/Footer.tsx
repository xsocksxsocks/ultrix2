import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { reopenCookieBanner } from "@/components/CookieBanner";
import ultrixLogo from "@/assets/ultrix-logo.png";
const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <img src={ultrixLogo} alt="ULTRIX Logo" className="h-10 mb-4 brightness-0 invert" />
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Ihr zuverlässiger Partner für den Kauf und Verkauf von Qualitätsfahrzeugen. 
              Wir bedienen sowohl Privat- als auch Geschäftskunden.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Kontakt</h3>
            <div className="space-y-3 text-sm">
              <a href="tel:+4910000000" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Phone className="h-4 w-4" />
                +49 10000000
              </a>
              <a href="mailto:kontakt@ultrix-kfz.net" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Mail className="h-4 w-4" />
                kontakt@ultrix-kfz.net
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <div>
                  Weihgartenstr. 19<br />
                  68519 Viernheim
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Rechtliches</h3>
            <div className="space-y-2 text-sm">
              <Link to="/impressum" className="block hover:opacity-80 transition-opacity">
                Impressum
              </Link>
              <Link to="/datenschutz" className="block hover:opacity-80 transition-opacity">
                Datenschutz
              </Link>
              <button 
                onClick={reopenCookieBanner}
                className="block hover:opacity-80 transition-opacity text-left"
              >
                Cookie-Einstellungen
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} ULTRIX UG. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
