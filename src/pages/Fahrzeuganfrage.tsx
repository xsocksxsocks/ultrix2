import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Car, Calendar, Gauge, Fuel, Settings2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";

interface CarForSale {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  color: string | null;
  power_hp: number | null;
  price: number;
  description: string | null;
  features: string[] | null;
  images: string[];
  is_sold: boolean;
  is_featured: boolean;
}

const Fahrzeuganfrage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const carId = searchParams.get("car");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: car, isLoading } = useQuery({
    queryKey: ["car-for-inquiry", carId],
    queryFn: async () => {
      if (!carId) return null;
      const { data, error } = await supabase
        .from("cars_for_sale")
        .select("*")
        .eq("id", carId)
        .maybeSingle();

      if (error) throw error;
      return data as CarForSale | null;
    },
    enabled: !!carId,
  });

  useEffect(() => {
    if (!carId) {
      navigate("/fahrzeuge");
    }
  }, [carId, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("de-DE").format(mileage) + " km";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!car) return;

    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("car_inquiries").insert({
        car_id: car.id,
        car_brand: car.brand,
        car_model: car.model,
        car_year: car.year,
        car_price: car.price,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        message: formData.message || null,
      });

      if (error) throw error;

      toast({
        title: "Anfrage gesendet!",
        description: "Wir werden uns schnellstmöglich bei Ihnen melden.",
      });

      navigate("/fahrzeuge");
    } catch (error: any) {
      toast({
        title: "Fehler beim Senden",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <section className="py-16">
          <div className="section-container">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-64 bg-muted rounded" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (!car) {
    return (
      <Layout>
        <section className="py-16">
          <div className="section-container text-center">
            <Car className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h1 className="font-heading text-2xl font-semibold mb-2">Fahrzeug nicht gefunden</h1>
            <p className="text-muted-foreground mb-4">Das angeforderte Fahrzeug existiert nicht mehr.</p>
            <Button asChild>
              <Link to="/fahrzeuge">Zurück zu den Fahrzeugen</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <section className="page-header gradient-navy">
        <div className="section-container">
          <Link to="/fahrzeuge" className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Zurück zu den Fahrzeugen
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Fahrzeuganfrage</h1>
          <p className="text-primary-foreground/90 text-lg">
            Senden Sie uns Ihre Anfrage für das ausgewählte Fahrzeug.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Car Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">
                    {car.brand} {car.model}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {car.images && car.images[0] && (
                    <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                      <img
                        src={car.images[0]}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(car.price)}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>EZ {car.year}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      <span>{formatMileage(car.mileage)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Fuel className="h-4 w-4" />
                      <span>{car.fuel_type}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Settings2 className="h-4 w-4" />
                      <span>{car.transmission}</span>
                    </div>
                  </div>

                  {car.description && (
                    <div>
                      <h4 className="font-semibold mb-2">Beschreibung</h4>
                      <p className="text-muted-foreground text-sm">{car.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Ihre Kontaktdaten</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ihr vollständiger Name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ihre@email.de"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+49 123 456789"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Nachricht (optional)</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Haben Sie Fragen zum Fahrzeug?"
                        rows={4}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Wird gesendet..." : "Anfrage senden"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Fahrzeuganfrage;
