import { Link } from "react-router-dom";
import { Car, HandCoins, Users, Building2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";

const Index = () => {
  const services = [
    {
      icon: Car,
      title: "Fahrzeuge kaufen",
      description: "Entdecken Sie unsere Auswahl an geprüften Gebrauchtwagen zu fairen Preisen.",
      link: "/fahrzeuge",
      linkText: "Fahrzeuge ansehen",
    },
    {
      icon: HandCoins,
      title: "Fahrzeug verkaufen",
      description: "Verkaufen Sie Ihr Fahrzeug schnell und unkompliziert zu einem fairen Preis.",
      link: "/verkaufen",
      linkText: "Jetzt verkaufen",
    },
  ];

  const benefits = [
    "Faire und transparente Preise",
    "Schnelle und unkomplizierte Abwicklung",
    "Persönliche Beratung",
    "Langjährige Erfahrung im Kfz-Handel",
    "Für Privat- und Geschäftskunden",
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-navy text-primary-foreground py-20 md:py-32">
        <div className="section-container">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Ihr Partner für Fahrzeughandel in Viernheim
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
              ULTRIX UG – Wir kaufen und verkaufen Qualitätsfahrzeuge. 
              Ob Sie ein neues Fahrzeug suchen oder Ihr Auto verkaufen möchten, 
              wir sind für Sie da.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                <Link to="/fahrzeuge">Fahrzeuge ansehen</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link to="/verkaufen">Fahrzeug verkaufen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Unsere Leistungen
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Wir bieten Ihnen einen umfassenden Service rund um den Fahrzeugkauf und -verkauf.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="card-hover border-border">
                <CardContent className="p-8">
                  <div className="bg-primary/10 text-primary p-3 rounded-lg inline-block mb-4">
                    <service.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-6">{service.description}</p>
                  <Button asChild variant="outline">
                    <Link to={service.link}>{service.linkText}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Types */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">
                Für Privat- und Geschäftskunden
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Ob Sie als Privatperson auf der Suche nach einem zuverlässigen Fahrzeug sind 
                oder als Unternehmen Ihren Fuhrpark erweitern möchten – bei ULTRIX sind Sie richtig.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium">Privatkunden</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-medium">Geschäftskunden</span>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-lg border border-border">
              <h3 className="font-heading text-xl font-semibold mb-6">Ihre Vorteile bei ULTRIX</h3>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="section-container text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Haben Sie Fragen?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Kontaktieren Sie uns für eine persönliche Beratung. Wir freuen uns auf Ihre Anfrage.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/kontakt">Jetzt kontaktieren</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
