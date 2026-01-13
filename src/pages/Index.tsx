import { Link } from "react-router-dom";
import { Car, HandCoins, CheckCircle, Euro, Clock, Shield, Phone, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { useLanguage, useLocalizedRoute } from "@/i18n/LanguageContext";
import heroImage from "@/assets/hero-cars.jpg";

const Index = () => {
  const { t } = useLanguage();
  const getRoute = useLocalizedRoute();

  const benefits = [
    {
      icon: Euro,
      title: t.home.benefits.fairPrices.title,
      description: t.home.benefits.fairPrices.description,
    },
    {
      icon: Clock,
      title: t.home.benefits.fast.title,
      description: t.home.benefits.fast.description,
    },
    {
      icon: Shield,
      title: t.home.benefits.secure.title,
      description: t.home.benefits.secure.description,
    },
  ];

  const process = [
    {
      step: "1",
      title: t.home.process.step1.title,
      description: t.home.process.step1.description,
    },
    {
      step: "2",
      title: t.home.process.step2.title,
      description: t.home.process.step2.description,
    },
    {
      step: "3",
      title: t.home.process.step3.title,
      description: t.home.process.step3.description,
    },
  ];

  return (
    <Layout>
      {/* Hero Section - Fokus auf Ankauf */}
      <section className="relative min-h-[650px] md:min-h-[750px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="ULTRIX Fahrzeugankauf"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/50" />
        </div>
        
        {/* Content */}
        <div className="section-container relative z-10">
          <div className="max-w-3xl text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 px-4 py-2 rounded-full mb-6 backdrop-blur-sm">
              <Euro className="h-5 w-5 text-accent" />
              <span className="text-accent font-medium">{t.home.hero.badge}</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t.home.hero.title}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 leading-relaxed">
              {t.home.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-lg px-8">
                <Link to={getRoute("sell")}>
                  <HandCoins className="h-5 w-5 mr-2" />
                  {t.home.hero.sellButton}
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-primary-foreground/20 text-primary-foreground border-2 border-primary-foreground/50 hover:bg-primary-foreground hover:text-primary font-semibold backdrop-blur-sm">
                <Link to={getRoute("contact")}>
                  <Phone className="h-5 w-5 mr-2" />
                  {t.home.hero.adviceButton}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-6 bg-secondary border-y border-border">
        <div className="section-container">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 text-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span className="font-medium">{t.home.trust.vehicles}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span className="font-medium">{t.home.trust.payment}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-accent" />
              <span className="font-medium">{t.home.trust.brands}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.home.benefits.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.home.benefits.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="card-hover border-border text-center">
                <CardContent className="p-8">
                  <div className="bg-accent/10 text-accent p-4 rounded-full inline-block mb-4">
                    <benefit.icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.home.process.title}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.home.process.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {process.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-card p-8 rounded-lg border border-border h-full">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-xl mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < process.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-muted-foreground h-6 w-6" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              <Link to={getRoute("sell")}>
                <HandCoins className="h-5 w-5 mr-2" />
                {t.home.process.button}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-background">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t.home.testimonials.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {t.home.testimonials.items.map((testimonial, index) => (
              <Card key={index} className="border-border">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div className="text-sm">
                    <span className="font-semibold">{testimonial.author}</span>
                    <span className="text-muted-foreground"> – {testimonial.location}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary Services - Fahrzeuge kaufen (kleinere Sektion) */}
      <section className="py-16 bg-muted">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t.home.secondary.title}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t.home.secondary.description}
              </p>
              <Button asChild variant="outline">
                <Link to={getRoute("vehicles")}>
                  <Car className="h-4 w-4 mr-2" />
                  {t.home.secondary.button}
                </Link>
              </Button>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="font-heading text-lg font-semibold mb-4">{t.home.secondary.businessTitle}</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>{t.home.secondary.fleet}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>{t.home.secondary.leasing}</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span>{t.home.secondary.discreet}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 gradient-navy text-primary-foreground">
        <div className="section-container text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            {t.home.cta.title}
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-xl mx-auto text-lg">
            {t.home.cta.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              <Link to={getRoute("sell")}>{t.home.cta.button}</Link>
            </Button>
            <Button asChild size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold">
              <a href={`tel:${t.common.phone.replace(/\s/g, "")}`}>
                <Phone className="h-5 w-5 mr-2" />
                06204 / 6129035
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
