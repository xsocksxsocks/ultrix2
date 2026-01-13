import { useState } from "react";
import { Upload, X, Send, CheckCircle, CalendarIcon, Euro, Clock, Shield, Phone } from "lucide-react";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MonthYearPicker } from "@/components/ui/month-year-picker";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageContext";

const Verkaufen = () => {
  const { toast } = useToast();
  const { language, t } = useLanguage();
  const dateLocale = language === "de" ? de : enUS;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>();
  const [appointmentTime, setAppointmentTime] = useState<string>("");
  const [formData, setFormData] = useState({
    vehicle_type: "Fahrzeug",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    brand: "",
    model: "",
    mileage: "",
    fuel_type: "",
    transmission: "",
    previous_owners: "",
    color: "",
    description: "",
    asking_price: "",
  });
  const [firstRegistrationDate, setFirstRegistrationDate] = useState<Date | undefined>();

  const sellCarSchema = z.object({
    customer_name: z.string().min(2, t.validation.nameMin).max(100),
    customer_email: z.string().email(t.validation.emailInvalid).max(255),
    customer_phone: z.string().min(5, t.validation.phoneInvalid).max(30),
    brand: z.string().min(1, t.validation.brandRequired).max(50),
    model: z.string().min(1, t.validation.modelRequired).max(100),
    first_registration_date: z.date({ required_error: t.validation.registrationRequired }),
    mileage: z.number().min(0, t.validation.mileageInvalid),
    fuel_type: z.string().min(1, t.validation.fuelRequired),
    transmission: z.string().min(1, t.validation.transmissionRequired),
    previous_owners: z.number().min(0).optional(),
    color: z.string().max(50).optional(),
    description: z.string().max(2000).optional(),
    asking_price: z.number().min(0).optional(),
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
        title: language === "de" ? "Bilder erforderlich" : "Images required",
        description: t.sell.errors.imagesRequired,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const validatedData = sellCarSchema.parse({
        ...formData,
        first_registration_date: firstRegistrationDate,
        mileage: parseInt(formData.mileage),
        previous_owners: formData.previous_owners ? parseInt(formData.previous_owners) : undefined,
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

      // Insert sell request with appointment data
      const { error } = await supabase.from("car_sell_requests").insert({
        vehicle_type: formData.vehicle_type,
        customer_name: validatedData.customer_name,
        customer_email: validatedData.customer_email,
        customer_phone: validatedData.customer_phone,
        brand: validatedData.brand,
        model: validatedData.model,
        first_registration_date: format(validatedData.first_registration_date, "yyyy-MM-dd"),
        mileage: validatedData.mileage,
        fuel_type: validatedData.fuel_type,
        transmission: validatedData.transmission,
        previous_owners: validatedData.previous_owners || null,
        color: validatedData.color || null,
        description: validatedData.description || null,
        asking_price: validatedData.asking_price || null,
        images: imageUrls,
        appointment_date: appointmentDate ? format(appointmentDate, "yyyy-MM-dd") : null,
        appointment_time: appointmentTime || null,
        appointment_confirmed: false,
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t.validation.inputError,
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: language === "de" ? "Fehler" : "Error",
          description: t.validation.genericError,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleTypes = language === "de" 
    ? ["Fahrzeug", "Motorrad", "Baumaschinen"]
    : ["Vehicle", "Motorcycle", "Construction Equipment"];
  
  const vehicleTypeValues = ["Fahrzeug", "Motorrad", "Baumaschinen"];
  
  const carBrands = [
    "Audi", "BMW", "Caterpillar", "Citroën", "Dacia", "Ducati", "Ford", "Honda", "Hyundai", 
    "JCB", "Kawasaki", "Kia", "Komatsu", "KTM", "Liebherr", "Mazda", "Mercedes-Benz", "Opel", 
    "Porsche", "Renault", "Skoda", "Smart", "Suzuki", "Takeuchi", "Toyota", "Volkswagen", 
    "Volvo", "Yamaha", language === "de" ? "Andere" : "Other"
  ];

  const fuelTypes = language === "de" 
    ? ["Benzin", "Diesel", "Hybrid", "Elektro", "Gas"]
    : ["Petrol", "Diesel", "Hybrid", "Electric", "Gas"];
  const fuelTypeValues = ["Benzin", "Diesel", "Hybrid", "Elektro", "Gas"];
  
  const transmissions = language === "de" 
    ? ["Schaltgetriebe", "Automatik"]
    : ["Manual", "Automatic"];
  const transmissionValues = ["Schaltgetriebe", "Automatik"];
  
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
                <h2 className="font-heading text-3xl font-bold mb-4">{t.sell.success.title}</h2>
                <p className="text-muted-foreground mb-4">
                  {t.sell.success.message}
                </p>
                {appointmentDate && (
                  <p className="text-foreground font-medium mb-4">
                    {t.sell.success.appointment} {format(appointmentDate, "EEEE, dd. MMMM yyyy", { locale: dateLocale })}
                    {appointmentTime && ` ${language === "de" ? "um" : "at"} ${appointmentTime} ${language === "de" ? "Uhr" : ""}`}
                  </p>
                )}
                <p className="text-muted-foreground mb-8">
                  {t.sell.success.nextSteps}
                </p>
                <Button onClick={() => window.location.reload()}>
                  {t.sell.success.another}
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
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">{t.sell.title}</h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl">
            {t.sell.subtitle}
          </p>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-8 bg-secondary border-b border-border">
        <div className="section-container">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <Euro className="h-6 w-6 text-accent" />
              <span className="font-medium">{t.sell.benefits.fairPrices}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Clock className="h-6 w-6 text-accent" />
              <span className="font-medium">{t.sell.benefits.fast}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-6 w-6 text-accent" />
              <span className="font-medium">{t.sell.benefits.secure}</span>
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
                      <h3 className="font-heading text-xl font-semibold mb-4">{t.sell.form.contact.title}</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer_name">{t.sell.form.contact.name} *</Label>
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
                          <Label htmlFor="customer_email">{t.sell.form.contact.email} *</Label>
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
                          <Label htmlFor="customer_phone">{t.sell.form.contact.phone} *</Label>
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
                      <h3 className="font-heading text-xl font-semibold mb-4">{t.sell.form.vehicle.title}</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t.sell.form.vehicle.type} *</Label>
                          <Select 
                            value={formData.vehicle_type} 
                            onValueChange={(v) => setFormData({ ...formData, vehicle_type: v })} 
                            required
                          >
                            <SelectTrigger className="input-classic">
                              <SelectValue placeholder={language === "de" ? "Typ wählen" : "Select type"} />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicleTypeValues.map((type, idx) => (
                                <SelectItem key={type} value={type}>{vehicleTypes[idx]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t.sell.form.vehicle.brand} *</Label>
                          <Select value={formData.brand} onValueChange={(v) => handleSelectChange("brand", v)} required>
                            <SelectTrigger className="input-classic">
                              <SelectValue placeholder={language === "de" ? "Marke wählen" : "Select brand"} />
                            </SelectTrigger>
                            <SelectContent>
                              {carBrands.map((brand) => (
                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model">{t.sell.form.vehicle.model} *</Label>
                          <Input
                            id="model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            required
                            className="input-classic"
                            placeholder={language === "de" ? "z.B. Golf 7" : "e.g. Golf 7"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.sell.form.vehicle.firstRegistration} *</Label>
                          <MonthYearPicker
                            value={firstRegistrationDate}
                            onChange={setFirstRegistrationDate}
                            placeholder={language === "de" ? "Monat/Jahr wählen" : "Select month/year"}
                            className="input-classic"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mileage">{t.sell.form.vehicle.mileage} *</Label>
                          <Input
                            id="mileage"
                            name="mileage"
                            type="number"
                            min="0"
                            value={formData.mileage}
                            onChange={handleChange}
                            required
                            className="input-classic"
                            placeholder={language === "de" ? "z.B. 75000" : "e.g. 75000"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t.sell.form.vehicle.fuel} *</Label>
                          <Select onValueChange={(v) => handleSelectChange("fuel_type", v)} required>
                            <SelectTrigger className="input-classic">
                              <SelectValue placeholder={language === "de" ? "Kraftstoff wählen" : "Select fuel"} />
                            </SelectTrigger>
                            <SelectContent>
                              {fuelTypeValues.map((fuel, idx) => (
                                <SelectItem key={fuel} value={fuel}>{fuelTypes[idx]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t.sell.form.vehicle.transmission} *</Label>
                          <Select onValueChange={(v) => handleSelectChange("transmission", v)} required>
                            <SelectTrigger className="input-classic">
                              <SelectValue placeholder={language === "de" ? "Getriebe wählen" : "Select transmission"} />
                            </SelectTrigger>
                            <SelectContent>
                              {transmissionValues.map((trans, idx) => (
                                <SelectItem key={trans} value={trans}>{transmissions[idx]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="previous_owners">{t.sell.form.vehicle.previousOwners}</Label>
                          <Input
                            id="previous_owners"
                            name="previous_owners"
                            type="number"
                            min="0"
                            value={formData.previous_owners}
                            onChange={handleChange}
                            className="input-classic"
                            placeholder={language === "de" ? "z.B. 2" : "e.g. 2"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="color">{t.sell.form.vehicle.color}</Label>
                          <Input
                            id="color"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="input-classic"
                            placeholder={language === "de" ? "z.B. Schwarz" : "e.g. Black"}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="asking_price">{t.sell.form.vehicle.askingPrice} (€)</Label>
                          <Input
                            id="asking_price"
                            name="asking_price"
                            type="number"
                            min="0"
                            value={formData.asking_price}
                            onChange={handleChange}
                            className="input-classic"
                            placeholder={language === "de" ? "z.B. 15000" : "e.g. 15000"}
                          />
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Label htmlFor="description">{t.sell.form.vehicle.description}</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          className="input-classic"
                          rows={3}
                          placeholder={language === "de" ? "Beschreiben Sie den Zustand und besondere Ausstattung..." : "Describe the condition and special features..."}
                        />
                      </div>
                    </div>

                    {/* Appointment Selection */}
                    <div>
                      <h3 className="font-heading text-xl font-semibold mb-4">{t.sell.form.appointment.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">{t.sell.form.appointment.subtitle}</p>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t.sell.form.appointment.date}</Label>
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
                                {appointmentDate ? format(appointmentDate, "PPP", { locale: dateLocale }) : t.sell.form.appointment.selectDate}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={appointmentDate}
                                onSelect={setAppointmentDate}
                                disabled={disabledDays}
                                locale={dateLocale}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label>{t.sell.form.appointment.time}</Label>
                          <Select value={appointmentTime} onValueChange={setAppointmentTime}>
                            <SelectTrigger className="input-classic">
                              <SelectValue placeholder={t.sell.form.appointment.selectTime} />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>{time} {language === "de" ? "Uhr" : ""}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <h3 className="font-heading text-xl font-semibold mb-2">{t.sell.form.images.title}</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        {t.sell.form.images.subtitle}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                            <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        {images.length < 10 && (
                          <label className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">{t.sell.form.images.button}</span>
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
                      <p className="text-sm text-muted-foreground mt-2">
                        {images.length}/10 {language === "de" ? "Bilder" : "images"} • {t.sell.form.images.required}
                      </p>
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          {t.sell.form.submitting}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {t.sell.form.submit}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="border-border sticky top-24">
                <CardContent className="p-6">
                  <h3 className="font-heading text-lg font-semibold mb-4">{t.sell.sidebar.title}</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">1</div>
                      <div>
                        <p className="font-medium">{t.sell.sidebar.step1.title}</p>
                        <p className="text-sm text-muted-foreground">{t.sell.sidebar.step1.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">2</div>
                      <div>
                        <p className="font-medium">{t.sell.sidebar.step2.title}</p>
                        <p className="text-sm text-muted-foreground">{t.sell.sidebar.step2.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">3</div>
                      <div>
                        <p className="font-medium">{t.sell.sidebar.step3.title}</p>
                        <p className="text-sm text-muted-foreground">{t.sell.sidebar.step3.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-accent text-accent-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">4</div>
                      <div>
                        <p className="font-medium">{t.sell.sidebar.step4.title}</p>
                        <p className="text-sm text-muted-foreground">{t.sell.sidebar.step4.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">{t.sell.sidebar.questions}</p>
                    <a href={`tel:${t.common.phone}`} className="flex items-center gap-2 text-primary font-semibold">
                      <Phone className="h-4 w-4" />
                      {t.common.phone}
                    </a>
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
