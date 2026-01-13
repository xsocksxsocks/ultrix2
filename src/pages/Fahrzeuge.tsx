import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import {
  Car,
  Fuel,
  Calendar,
  Gauge,
  Settings2,
  ShieldCheck,
  CheckCircle,
  Award,
  FileCheck,
  Handshake,
  MousePointerClick,
  Bike,
  Truck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { useLanguage, useLocalizedRoute } from "@/i18n/LanguageContext";

interface CarForSale {
  id: string;
  listing_number: string | null;
  vehicle_type: string | null;
  brand: string;
  model: string;
  first_registration_date: string;
  mileage: number;
  fuel_type: string;
  transmission: string;
  color: string | null;
  power_hp: number | null;
  previous_owners: number | null;
  price: number;
  description: string | null;
  description_en: string | null;
  features: string[] | null;
  features_en: string[] | null;
  images: string[];
  is_sold: boolean;
  is_reserved: boolean;
  is_featured: boolean;
  vat_deductible: boolean | null;
}

const Fahrzeuge = () => {
  const [selectedCar, setSelectedCar] = useState<CarForSale | null>(null);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const getRoute = useLocalizedRoute();
  const dateLocale = language === "de" ? de : enUS;

  const { data: cars, isLoading } = useQuery({
    queryKey: ["cars-for-sale"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars_for_sale")
        .select("*")
        .is("deleted_at", null)
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

  const getDescription = (car: CarForSale) => {
    if (language === "en" && car.description_en) return car.description_en;
    return car.description;
  };

  const getFeatures = (car: CarForSale) => {
    if (language === "en" && car.features_en && car.features_en.length > 0) return car.features_en;
    return car.features;
  };

  const filteredCars = cars?.filter((car) => {
    if (vehicleTypeFilter === "all") return true;
    if (vehicleTypeFilter === "Fahrzeug") {
      return car.vehicle_type === "Fahrzeug" || car.vehicle_type === "Pkw" || !car.vehicle_type;
    }
    if (vehicleTypeFilter === "Baumaschinen") {
      return car.vehicle_type === "Baumaschinen" || car.vehicle_type === "Baumaschine";
    }
    return car.vehicle_type === vehicleTypeFilter;
  });

  const getVehicleTypeDisplay = (type: string | null) => {
    if (!type || type === "Pkw") return t.vehicles.filters.vehicle;
    if (type === "Baumaschine" || type === "Baumaschinen") return t.vehicles.filters.construction;
    if (type === "Motorrad") return t.vehicles.filters.motorcycle;
    return type;
  };

  const getTransmissionDisplay = (transmission: string) => {
    if (language === "en") {
      if (transmission === "Automatik") return "Automatic";
      if (transmission === "Schaltgetriebe") return "Manual";
    }
    return transmission;
  };

  const getFuelTypeDisplay = (fuelType: string) => {
    if (language === "en") {
      const fuelMap: Record<string, string> = {
        "Benzin": "Petrol",
        "Diesel": "Diesel",
        "Elektro": "Electric",
        "Hybrid": "Hybrid",
        "Gas": "Gas",
      };
      return fuelMap[fuelType] || fuelType;
    }
    return fuelType;
  };

  return (
    <Layout>
      {/* Page Header */}
      <section className="page-header gradient-navy">
        <div className="section-container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">{t.vehicles.title}</h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl">
            {t.vehicles.subtitle}
          </p>
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-8 bg-secondary border-b border-border">
        <div className="section-container">
          <div className="flex items-start gap-4 bg-card p-6 rounded-lg border border-border mb-6">
            <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold mb-2">{t.vehicles.banner.title}</h3>
              <p className="text-muted-foreground">
                {t.vehicles.banner.description}
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileCheck className="h-6 w-6 text-accent" />
              </div>
              <p className="font-semibold text-sm">{t.vehicles.badges.inspected.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.vehicles.badges.inspected.subtitle}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <p className="font-semibold text-sm">{t.vehicles.badges.guarantee.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.vehicles.badges.guarantee.subtitle}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Handshake className="h-6 w-6 text-accent" />
              </div>
              <p className="font-semibold text-sm">{t.vehicles.badges.noCosts.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.vehicles.badges.noCosts.subtitle}</p>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="bg-accent/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <p className="font-semibold text-sm">{t.vehicles.badges.history.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{t.vehicles.badges.history.subtitle}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="section-container">
          {/* Vehicle Type Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              variant={vehicleTypeFilter === "all" ? "default" : "outline"}
              onClick={() => setVehicleTypeFilter("all")}
              className="flex items-center gap-2"
            >
              {t.vehicles.filters.all}
            </Button>
            <Button
              variant={vehicleTypeFilter === "Fahrzeug" ? "default" : "outline"}
              onClick={() => setVehicleTypeFilter("Fahrzeug")}
              className="flex items-center gap-2"
            >
              <Car className="h-4 w-4" />
              {t.vehicles.filters.vehicle}
            </Button>
            <Button
              variant={vehicleTypeFilter === "Motorrad" ? "default" : "outline"}
              onClick={() => setVehicleTypeFilter("Motorrad")}
              className="flex items-center gap-2"
            >
              <Bike className="h-4 w-4" />
              {t.vehicles.filters.motorcycle}
            </Button>
            <Button
              variant={vehicleTypeFilter === "Baumaschinen" ? "default" : "outline"}
              onClick={() => setVehicleTypeFilter("Baumaschinen")}
              className="flex items-center gap-2"
            >
              <Truck className="h-4 w-4" />
              {t.vehicles.filters.construction}
            </Button>
          </div>

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
          ) : filteredCars && filteredCars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCars.map((car) => (
                <Card
                  key={car.id}
                  className={`card-hover overflow-hidden border-border transition-all ${car.is_sold ? "opacity-60 grayscale" : car.is_reserved ? "opacity-80" : "cursor-pointer hover:border-primary hover:shadow-lg"}`}
                  onClick={() => !car.is_sold && !car.is_reserved && setSelectedCar(car)}
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
                    {car.is_featured && !car.is_sold && !car.is_reserved && (
                      <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">{t.vehicles.card.recommended}</Badge>
                    )}
                    {car.is_sold && (
                      <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
                        {t.vehicles.card.sold}
                      </Badge>
                    )}
                    {car.is_reserved && !car.is_sold && (
                      <Badge className="absolute top-3 left-3 bg-amber-500 text-white">{t.vehicles.card.reserved}</Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                      {car.vehicle_type && car.vehicle_type !== "Pkw" && car.vehicle_type !== "Fahrzeug" && (
                        <Badge variant="outline" className="text-xs">
                          {getVehicleTypeDisplay(car.vehicle_type)}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-heading text-xl font-semibold mb-1">
                      {car.brand} {car.model}
                    </h3>
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(car.price)} <span className="text-base font-normal">{t.common.gross}</span>
                      </p>
                      {car.vat_deductible && <p className="text-sm text-accent font-medium">{t.vehicles.card.vatDeductible}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{language === "de" ? "EZ" : "Reg."} {format(new Date(car.first_registration_date), "MM/yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4" />
                        <span>{formatMileage(car.mileage)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Fuel className="h-4 w-4" />
                        <span>{getFuelTypeDisplay(car.fuel_type)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4" />
                        <span>{getTransmissionDisplay(car.transmission)}</span>
                      </div>
                      {car.listing_number && (
                        <div className="flex items-center gap-2">
                          <span>{t.vehicles.card.listingNumber} {car.listing_number}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-border text-sm flex items-center justify-between">
                      <div>
                        <span className="text-muted-foreground">{t.vehicles.card.vatDeductible}: </span>
                        <span className={car.vat_deductible ? "text-accent font-medium" : "text-muted-foreground"}>
                          {car.vat_deductible ? t.common.yes : t.common.no}
                        </span>
                      </div>
                      {!car.is_sold && !car.is_reserved && (
                        <div className="flex items-center gap-1 text-primary text-xs font-medium">
                          <MousePointerClick className="h-3 w-3" />
                          <span>{t.vehicles.card.viewDetails}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Car className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-semibold mb-2">
                {vehicleTypeFilter !== "all"
                  ? t.vehicles.empty.titleFiltered
                  : t.vehicles.empty.title}
              </h2>
              <p className="text-muted-foreground">
                {vehicleTypeFilter !== "all"
                  ? t.vehicles.empty.subtitleFiltered
                  : t.vehicles.empty.subtitle}
              </p>
              {vehicleTypeFilter !== "all" && (
                <Button variant="outline" className="mt-4" onClick={() => setVehicleTypeFilter("all")}>
                  {t.vehicles.empty.showAll}
                </Button>
              )}
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
                      alt={`${selectedCar.brand} ${selectedCar.model} - ${language === "de" ? "Bild" : "Image"} ${idx + 1}`}
                      className="w-full h-48 object-contain bg-muted rounded-lg"
                    />
                  ))}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(selectedCar.price)} <span className="text-lg font-normal">{t.common.gross}</span>
                  </p>
                  {selectedCar.vat_deductible && (
                    <p className="text-sm text-accent font-medium mt-1">{t.vehicles.card.vatDeductible}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedCar.listing_number && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t.vehicles.details.listingNumber}</p>
                      <p className="font-medium">{selectedCar.listing_number}</p>
                    </div>
                  )}
                  {selectedCar.vehicle_type && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t.vehicles.details.vehicleType}</p>
                      <p className="font-medium">{getVehicleTypeDisplay(selectedCar.vehicle_type)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">{t.vehicles.details.firstRegistration}</p>
                    <p className="font-medium">
                      {format(new Date(selectedCar.first_registration_date), "MMMM yyyy", { locale: dateLocale })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.vehicles.details.mileage}</p>
                    <p className="font-medium">{formatMileage(selectedCar.mileage)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.vehicles.details.fuel}</p>
                    <p className="font-medium">{getFuelTypeDisplay(selectedCar.fuel_type)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.vehicles.details.transmission}</p>
                    <p className="font-medium">{getTransmissionDisplay(selectedCar.transmission)}</p>
                  </div>
                  {selectedCar.previous_owners !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t.vehicles.details.previousOwners}</p>
                      <p className="font-medium">{selectedCar.previous_owners}</p>
                    </div>
                  )}
                  {selectedCar.color && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t.vehicles.details.color}</p>
                      <p className="font-medium">{selectedCar.color}</p>
                    </div>
                  )}
                  {selectedCar.power_hp && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t.vehicles.details.power}</p>
                      <p className="font-medium">{selectedCar.power_hp} {language === "en" ? "HP" : "PS"}</p>
                    </div>
                  )}
                </div>

                {getDescription(selectedCar) && (
                  <div>
                    <h4 className="font-semibold mb-2">{t.vehicles.details.description}</h4>
                    <p className="text-muted-foreground">{getDescription(selectedCar)}</p>
                  </div>
                )}

                {getFeatures(selectedCar) && getFeatures(selectedCar)!.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">{t.vehicles.details.features}</h4>
                    <div className="flex flex-wrap gap-2">
                      {getFeatures(selectedCar)!.map((feature, idx) => (
                        <Badge key={idx} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedCar(null);
                    navigate(`${getRoute("vehicleInquiry")}?car=${selectedCar.id}`);
                  }}
                >
                  {t.vehicles.details.inquire}
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
