import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/i18n/LanguageContext";
import { z } from "zod";

const Kontakt = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const contactSchema = z.object({
    name: z.string().min(2, t.validation.nameMin).max(100),
    email: z.string().email(t.validation.emailInvalid).max(255),
    phone: z.string().max(30).optional(),
    message: z.string().min(10, t.validation.messageMin).max(2000),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validatedData = contactSchema.parse(formData);

      const { error } = await supabase.from("contact_requests").insert({
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || null,
        message: validatedData.message,
      });

      if (error) throw error;

      toast({
        title: t.contact.success.title,
        description: t.contact.success.message,
      });

      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: t.validation.inputError,
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t.validation.inputError,
          description: t.validation.genericError,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: Phone, label: t.contact.phone, value: t.common.phone, href: `tel:${t.common.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: t.contact.email, value: t.common.email, href: `mailto:${t.common.email}` },
    { icon: MapPin, label: t.contact.address, value: `${t.common.address}, ${t.common.city}`, href: null },
  ];

  return (
    <Layout>
      {/* Page Header */}
      <section className="page-header gradient-navy">
        <div className="section-container">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">{t.contact.title}</h1>
          <p className="text-primary-foreground/90 text-lg max-w-2xl">
            {t.contact.subtitle}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="font-heading text-2xl font-bold mb-6">{t.contact.reach}</h2>
              
              <div className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="font-medium hover:text-primary transition-colors">
                          {item.value}
                        </a>
                      ) : (
                        <p className="font-medium">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Card className="mt-8 border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{t.contact.hours.title}</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.contact.hours.weekdays}</span>
                      <span className="font-medium">{t.contact.hours.weekdaysTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.contact.hours.saturday}</span>
                      <span className="font-medium">{t.contact.hours.saturdayTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.contact.hours.sunday}</span>
                      <span className="font-medium text-muted-foreground">{t.contact.hours.sundayTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardContent className="p-8">
                  <h2 className="font-heading text-2xl font-bold mb-6">{t.contact.form.title}</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t.contact.form.name} *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="input-classic"
                          placeholder={t.contact.form.namePlaceholder}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t.contact.form.email} *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="input-classic"
                          placeholder={t.contact.form.emailPlaceholder}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t.contact.form.phone}</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-classic"
                        placeholder={t.contact.form.phonePlaceholder}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t.contact.form.message} *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="input-classic resize-none"
                        placeholder={t.contact.form.messagePlaceholder}
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? t.common.sending : t.contact.form.submit}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="pb-16 md:pb-24">
        <div className="section-container">
          <h2 className="font-heading text-2xl font-bold mb-6 text-center">{t.contact.map.title}</h2>
          <div className="rounded-lg overflow-hidden border border-border shadow-md">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2597.1234567890!2d8.5777!3d49.5405!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4797c9c1234567890%3A0x1234567890abcdef!2sWeihgartenstra%C3%9Fe%2019%2C%2068519%20Viernheim%2C%20Germany!5e0!3m2!1sde!2sde!4v1703000000000!5m2!1sde!2sde"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ULTRIX UG Standort - Weihgartenstr. 19, 68519 Viernheim"
              className="w-full"
            />
          </div>
          <div className="text-center mt-4">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Weihgartenstr.+19,+68519+Viernheim"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              {t.contact.map.openInMaps}
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Kontakt;
