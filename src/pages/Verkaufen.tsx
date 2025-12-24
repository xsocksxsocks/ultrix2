import { useState } from "react";
import { Upload, X, Send, CheckCircle, CalendarIcon, Euro, Clock, Shield, Phone } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { z } from "zod";
import { cn } from "@/lib/utils";

const sellCarSchema = z.object({
  customer_name: z.string().min(2, "Name muss mindestens 2 Zeichen haben").max(100),
  customer_email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein").max(255),
  customer_phone: z.string().min(5, "Bitte geben Sie eine gültige Telefonnummer ein").max(30),
  brand: z.string().min(1, "Bitte wählen Sie eine Marke").max(50),
  model: z.string().min(1, "Bitte geben Sie das Modell ein").max(100),
  year: z.number().min(1900, "Ungültiges Baujahr").max(new Date().getFullYear() + 1),
  mileage: z.number().min(0, "Ungültiger Kilometerstand"),
  fuel_type: z.string().min(1, "Bitte wählen Sie einen Kraftstoff"),
  transmission: z.string().min(1, "Bitte wählen Sie ein Getriebe"),
  color: z.string().max(50).optional(),
  description: z.string().max(2000).optional(),
  asking_price: z.number().min(0).optional(),
});

const Verkaufen = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    fuel_type: "",
    transmission: "",
    color: "",
    description: "",
    asking_price: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 10 - images.length);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast({
        title: "Bilder erforderlich",
        description: "Bitte laden Sie mindestens ein Bild Ihres Fahrzeugs hoch.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const validatedData = sellCarSchema.parse({
        ...formData,
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        asking_price: formData.asking_price ? parseFloat(formData.asking_price) : undefined,
      });

      // Upload images
      const imageUrls: string[] = [];
      for (const image of images) {
        const fileName = `sell-requests/${Date.now()}-${Math.random().toString(36).substring(7)}-${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from("car-images")
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("car-images")
          .getPublicUrl(fileName);

        imageUrls.push(urlData.publicUrl);
      }

      // Build description with appointment info
      let fullDescription = validatedData.description || "";
      if (appointmentDate) {
        const appointmentInfo = `\n\n--- Wunschtermin ---\nDatum: ${format(appointmentDate, "dd.MM.yyyy", { locale: de })}${appointmentTime ? `\nUhrzeit: ${appointmentTime} Uhr` : ""}`;
        fullDescription += appointmentInfo;
      }

      // Insert sell request
      const { error } = await supabase.from("car_sell_requests").insert({
        customer_name: validatedData.customer_name,
        customer_email: validatedData.customer_email,
        customer_phone: validatedData.customer_phone,
        brand: validatedData.brand,
        model: validatedData.model,
        year: validatedData.year,
        mileage: validatedData.mileage,
        fuel_type: validatedData.fuel_type,
        transmission: validatedData.transmission,
        color: validatedData.color || null,
        description: fullDescription || null,
        asking_price: validatedData.asking_price || null,
        images: imageUrls,
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Eingabefehler",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fehler",
          description: "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const carBrands = [
    "Audi", "BMW", "Ford", "Mercedes-Benz", "Opel", "Porsche", "Skoda", 
    "Toyota", "Volkswagen", "Volvo", "Andere"
  ];

  const fuelTypes = ["Benzin", "Diesel", "Hybrid", "Elektro", "Gas"];
  const transmissions = ["Schaltgetriebe", "Automatik"];
  
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  // Disable past dates and weekends
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = date.getDay();
    return date < today || day === 0; // Disable past and Sundays
  };

  if (isSuccess) {
    return (
      <Layout>
        <section className="py-16 md:py-24">
          <div className="section-container">
            <Card className="max-w-2xl mx-auto border-border">
              <CardContent className="p-12 text-center">
                <div className="bg-accent/20 text-accent p-4 rounded-full inline-block mb-6">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h2 className="font-heading text-3xl font-bold mb-4">Vielen Dank!</h2>
                <p className="text-muted-foreground mb-4">
                  Ihre Verkaufsanfrage wurde erfolgreich übermittelt.
                </p>
                {appointmentDate && (
                  <p className="text-foreground font-medium mb-4">
                    Ihr Wunschtermin: {format(appointmentDate, "EEEE, dd. MMMM yyyy", { locale: de })}
                    {appointmentTime && ` um ${appointmentTime} Uhr`}
                  </p>
                )}
                <p className="text-muted-foreground mb-8">
                  Wir werden Ihre Unterlagen prüfen und uns zeitnah bei Ihnen melden, um den Termin zu bestätigen.
                </p>
                <Button onClick={() => window.location.reload()}>
                  Weitere Anfrage stellen
                </Button>
              </CardContent>
            </Card>
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
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Auto verkaufen</h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl">
            Verkaufen Sie Ihr Fahrzeug schnell und unkompliziert. Füllen Sie das Formular aus, 
            wählen Sie einen Termin und wir machen Ihnen ein faires Angebot.
          </p>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-8 bg-secondary border-b border-border">
        <div className="section-container">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <Euro className="h-6 w-6 text-accent" />
              <span className="font-medium">Faire Preise</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Clock className="h-6 w-6 text-accent" />
              <span className="font-medium">Schnelle Abwicklung</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-6 w-6 text-accent" />
              <span className="font-medium">Sichere Bezahlung</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Contact Info */}
                    <div>
                      <h3 className="font-heading text-xl font-semibold mb-4">Ihre Kontaktdaten</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer_name">Name *</Label>
                          <Input
                            id="customer_name"
                            name="customer_name"
                            value={formData.customer_name}
                            onChange={handleChange}
                            required
                            className="input-classic"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customer_email">E-Mail *</Label>
                          <Input
                            id="customer_email"
                            name="customer_email"
                            type="email"
                            value={formData.customer_email}
                            onChange={handleChange}
                            required
                            className="input-classic"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="customer_phone">Telefon *</Label>
                          <Input
                            id="customer_phone"
                            name="customer_phone"
                            type="tel"
                            value={formData.customer_phone}
                            onChange={handleChange}
                            required
                            className="input-classic"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div>
                      <h3 className="font-heading text-xl font-semibold mb-4">Fahrzeugdaten</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Marke *</Label>
                          <Select onValueChange={(v) => handleSelectChange("brand", v)} required>
                            <SelectTrigger className="input-classic">
                              <SelectValue placeholder="Marke wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {carBrands.map((brand) => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model">Modell *</Label>
                          <Input
                            id="model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            required
                            className="input-classic"
                            placeholder="z.B. Golf 7"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">Baujahr *</Label>
                          <Input
                            id="year"
                            name="year"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            value={formData.year}
                            onChange={handleChange}
                            required
                            className="input-classic"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mileage">Kilometerstand *</Label>
                          <Input
                            id="mileage"
                            name="mileage"
                            type="number"
                            min="0"
                            value={formData.mileage}
                            onChange={handleChange}
                            required
                            className="input-classic"
                            placeholder="z.B. 75000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Kraftstoff *</Label>
                          <Select onValueChange={(v) => handleSelectChange("fuel_type", v)} required>
                            <SelectTrigger className="input-classic">
                              <SelectValue placeholder="Kraftstoff wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {fuelTypes.map((fuel) => (
                                <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Getriebe *</Label>
                          <Select onValueChange={(v) => handleSelectChange("transmission", v)} required>
                            <SelectTrigger className="input-classic">
                              <SelectValue placeholder="Getriebe wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {transmissions.map((trans) => (
                                <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="color">Farbe</Label>
                          <Input
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="input-classic"
                            placeholder="z.B. Schwarz Metallic"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="asking_price">Preisvorstellung (€)</Label>
                          <Input
                            id="asking_price"
                            name="asking_price"
                            type="number"
                            min="0"
                            value={formData.asking_price}
                            onChange={handleChange}
                            className="input-classic"
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <Label htmlFor="description">Beschreibung / Ausstattung</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={4}
                          className="input-classic resize-none"
                          placeholder="Beschreiben Sie Ihr Fahrzeug, besondere Ausstattung, Zustand, etc."
                        />
                      </div>
                    </div>

                    {/* Appointment Section */}
                    <div>
                      <h3 className="font-heading text-xl font-semibold mb-4">
                        <CalendarIcon className="h-5 w-5 inline-block mr-2 text-accent" />
                        Wunschtermin wählen
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Wählen Sie einen passenden Termin für die Fahrzeugbegutachtung bei uns vor Ort.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Datum</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal input-classic",
                                  !appointmentDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {appointmentDate ? format(appointmentDate, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={appointmentDate}
                                onSelect={setAppointmentDate}
                                disabled={disabledDays}
                                initialFocus
                                locale={de}
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>Uhrzeit</Label>
                          <Select onValueChange={setAppointmentTime} value={appointmentTime}>
                            <SelectTrigger className="input-classic">
                              <SelectValue placeholder="Uhrzeit wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>{time} Uhr</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Images */}
                    <div>
                      <h3 className="font-heading text-xl font-semibold mb-4">Fahrzeugbilder *</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Laden Sie mindestens ein Bild Ihres Fahrzeugs hoch (max. 10 Bilder).
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {images.map((image, index) => (
                          <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Fahrzeugbild ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full hover:bg-destructive/90"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        
                        {images.length < 10 && (
                          <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Bild hinzufügen</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Wird gesendet..." : "Verkaufsanfrage senden"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-4">So geht's weiter</h3>
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <span className="text-sm">Formular ausfüllen & Termin wählen</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <span className="text-sm">Wir prüfen Ihre Anfrage und bestätigen den Termin</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <span className="text-sm">Fahrzeug vorbeibringen & Bargeld erhalten</span>
                    </li>
                  </ol>
                </CardContent>
              </Card>

              <Card className="border-border bg-accent/5">
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-2">Fragen?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Rufen Sie uns an – wir beraten Sie gerne.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="tel:+496204XXXXXX">
                      <Phone className="h-4 w-4 mr-2" />
                      06204 / XXXXXX
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-4">Wir kaufen alle Marken</h3>
                  <div className="flex flex-wrap gap-2">
                    {carBrands.slice(0, -1).map((brand) => (
                      <span key={brand} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                        {brand}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Verkaufen;
