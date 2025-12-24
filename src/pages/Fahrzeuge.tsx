import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Car, Fuel, Calendar, Gauge, Settings2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
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

const Fahrzeuge = () => {
  const [selectedCar, setSelectedCar] = useState<CarForSale | null>(null);
  const navigate = useNavigate();

  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars-for-sale"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars_for_sale")
        .select("*")
        .order("is_sold", { ascending: true })
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CarForSale[];
    },
  });

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

  return (
    <Layout>
      {/* Page Header */}
      <section className="page-header gradient-navy">
        <div className="section-container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Unsere Fahrzeuge</h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl">
            Entdecken Sie unsere Auswahl an geprüften Gebrauchtwagen. 
            Alle Fahrzeuge werden sorgfältig geprüft und zu fairen Preisen angeboten.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="section-container">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg" />
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cars && cars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => (
                <Card 
                  key={car.id} 
                  className={`card-hover overflow-hidden border-border ${car.is_sold ? "opacity-60 grayscale" : "cursor-pointer"}`} 
                  onClick={() => !car.is_sold && setSelectedCar(car)}
                >
                  <div className="relative aspect-[16/10] bg-muted">
                    {car.images && car.images[0] ? (
                      <img
                        src={car.images[0]}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                    {car.is_featured && !car.is_sold && (
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
                        Empfohlen
                      </Badge>
                    )}
                    {car.is_sold && (
                      <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                        Verkauft
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-heading text-xl font-semibold mb-1">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-2xl font-bold text-primary mb-4">
                      {formatPrice(car.price)}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>EZ {car.year}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        <span>{formatMileage(car.mileage)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4" />
                        <span>{car.fuel_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        <span>{car.transmission}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Car className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-semibold mb-2">Keine Fahrzeuge verfügbar</h2>
              <p className="text-muted-foreground">
                Aktuell sind keine Fahrzeuge im Angebot. Schauen Sie bald wieder vorbei!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Car Detail Dialog */}
      <Dialog open={!!selectedCar} onOpenChange={() => setSelectedCar(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCar && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">
                  {selectedCar.brand} {selectedCar.model}
                </DialogTitle>
              </DialogHeader>
              
              {selectedCar.images && selectedCar.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {selectedCar.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${selectedCar.brand} ${selectedCar.model} - Bild ${idx + 1}`}
                      className="w-full h-48 object-contain bg-muted rounded-lg"
                    />
                  ))}
                </div>
              )}
              
              <div className="space-y-6">
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(selectedCar.price)}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Erstzulassung</p>
                    <p className="font-medium">{selectedCar.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kilometerstand</p>
                    <p className="font-medium">{formatMileage(selectedCar.mileage)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kraftstoff</p>
                    <p className="font-medium">{selectedCar.fuel_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Getriebe</p>
                    <p className="font-medium">{selectedCar.transmission}</p>
                  </div>
                  {selectedCar.color && (
                    <div>
                      <p className="text-sm text-muted-foreground">Farbe</p>
                      <p className="font-medium">{selectedCar.color}</p>
                    </div>
                  )}
                  {selectedCar.power_hp && (
                    <div>
                      <p className="text-sm text-muted-foreground">Leistung</p>
                      <p className="font-medium">{selectedCar.power_hp} PS</p>
                    </div>
                  )}
                </div>

                {selectedCar.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Beschreibung</h4>
                    <p className="text-muted-foreground">{selectedCar.description}</p>
                  </div>
                )}

                {selectedCar.features && selectedCar.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Ausstattung</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCar.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={() => {
                    setSelectedCar(null);
                    navigate(`/fahrzeuganfrage?car=${selectedCar.id}`);
                  }}
                >
                  Anfrage senden
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Fahrzeuge;
