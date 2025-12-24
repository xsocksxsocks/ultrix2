import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, Mail, Car, HandCoins, Eye, Trash2, Plus, X, Upload, Check, ShoppingCart, Pencil, StickyNote, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import AppointmentCalendar from "@/components/admin/AppointmentCalendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedSellRequest, setSelectedSellRequest] = useState<any>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [newCarImages, setNewCarImages] = useState<File[]>([]);
  const [editCarImages, setEditCarImages] = useState<File[]>([]);
  const [newCarData, setNewCarData] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    fuel_type: "",
    transmission: "",
    color: "",
    power_hp: "",
    price: "",
    description: "",
    features: "",
    is_featured: false,
  });
  const [editCarData, setEditCarData] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    fuel_type: "",
    transmission: "",
    color: "",
    power_hp: "",
    price: "",
    description: "",
    features: "",
    is_featured: false,
    existingImages: [] as string[],
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) {
        await supabase.auth.signOut();
        navigate("/admin/login");
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch data
  const { data: contactRequests } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: sellRequests } = useQuery({
    queryKey: ["admin-sell-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_sell_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: carInquiries } = useQuery({
    queryKey: ["admin-car-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: carsForSale } = useQuery({
    queryKey: ["admin-cars"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars_for_sale")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Mutations
  const markContactRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contact_requests")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-contacts"] }),
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "Anfrage gelöscht" });
    },
  });

  const updateContactNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from("contact_requests")
        .update({ notes })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      toast({ title: "Notiz gespeichert" });
    },
  });

  const markSellRequestRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("car_sell_requests")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-sell-requests"] }),
  });

  const updateSellRequestStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("car_sell_requests")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sell-requests"] });
      toast({ title: "Status aktualisiert" });
    },
  });

  const updateSellRequestNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from("car_sell_requests")
        .update({ notes })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sell-requests"] });
      toast({ title: "Notiz gespeichert" });
    },
  });

  const deleteSellRequest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("car_sell_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sell-requests"] });
      toast({ title: "Anfrage gelöscht" });
    },
  });

  const markCarInquiryRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("car_inquiries")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-car-inquiries"] }),
  });

  const updateCarInquiryNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from("car_inquiries")
        .update({ notes })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-car-inquiries"] });
      toast({ title: "Notiz gespeichert" });
    },
  });

  const deleteCarInquiry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("car_inquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-car-inquiries"] });
      toast({ title: "Anfrage gelöscht" });
    },
  });

  const deleteCar = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cars_for_sale").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      toast({ title: "Fahrzeug gelöscht" });
    },
  });

  const toggleCarSold = useMutation({
    mutationFn: async ({ id, is_sold }: { id: string; is_sold: boolean }) => {
      const { error } = await supabase
        .from("cars_for_sale")
        .update({ is_sold })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
      toast({ title: "Status aktualisiert" });
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleAddCar = async () => {
    if (newCarImages.length === 0) {
      toast({
        title: "Bilder erforderlich",
        description: "Bitte laden Sie mindestens ein Bild hoch.",
        variant: "destructive",
      });
      return;
    }

    try {
      const imageUrls: string[] = [];
      for (const image of newCarImages) {
        const fileName = `cars/${Date.now()}-${Math.random().toString(36).substring(7)}-${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from("car-images")
          .upload(fileName, image);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("car-images").getPublicUrl(fileName);
        imageUrls.push(urlData.publicUrl);
      }

      const { error } = await supabase.from("cars_for_sale").insert({
        brand: newCarData.brand,
        model: newCarData.model,
        year: parseInt(newCarData.year),
        mileage: parseInt(newCarData.mileage),
        fuel_type: newCarData.fuel_type,
        transmission: newCarData.transmission,
        color: newCarData.color || null,
        power_hp: newCarData.power_hp ? parseInt(newCarData.power_hp) : null,
        price: parseFloat(newCarData.price),
        description: newCarData.description || null,
        features: newCarData.features ? newCarData.features.split(",").map(f => f.trim()) : null,
        images: imageUrls,
        is_featured: newCarData.is_featured,
      });

      if (error) throw error;

      toast({ title: "Fahrzeug hinzugefügt" });
      setIsAddCarOpen(false);
      setNewCarImages([]);
      setNewCarData({
        brand: "", model: "", year: "", mileage: "", fuel_type: "", transmission: "",
        color: "", power_hp: "", price: "", description: "", features: "", is_featured: false,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditCar = async () => {
    if (!editingCar) return;

    try {
      let imageUrls = [...editCarData.existingImages];

      // Upload new images
      for (const image of editCarImages) {
        const fileName = `cars/${Date.now()}-${Math.random().toString(36).substring(7)}-${image.name}`;
        const { error: uploadError } = await supabase.storage
          .from("car-images")
          .upload(fileName, image);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("car-images").getPublicUrl(fileName);
        imageUrls.push(urlData.publicUrl);
      }

      if (imageUrls.length === 0) {
        toast({
          title: "Bilder erforderlich",
          description: "Bitte behalten Sie mindestens ein Bild.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("cars_for_sale")
        .update({
          brand: editCarData.brand,
          model: editCarData.model,
          year: parseInt(editCarData.year),
          mileage: parseInt(editCarData.mileage),
          fuel_type: editCarData.fuel_type,
          transmission: editCarData.transmission,
          color: editCarData.color || null,
          power_hp: editCarData.power_hp ? parseInt(editCarData.power_hp) : null,
          price: parseFloat(editCarData.price),
          description: editCarData.description || null,
          features: editCarData.features ? editCarData.features.split(",").map(f => f.trim()) : null,
          images: imageUrls,
          is_featured: editCarData.is_featured,
        })
        .eq("id", editingCar.id);

      if (error) throw error;

      toast({ title: "Fahrzeug aktualisiert" });
      setIsEditCarOpen(false);
      setEditingCar(null);
      setEditCarImages([]);
      queryClient.invalidateQueries({ queryKey: ["admin-cars"] });
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (car: any) => {
    setEditingCar(car);
    setEditCarData({
      brand: car.brand,
      model: car.model,
      year: car.year.toString(),
      mileage: car.mileage.toString(),
      fuel_type: car.fuel_type,
      transmission: car.transmission,
      color: car.color || "",
      power_hp: car.power_hp?.toString() || "",
      price: car.price.toString(),
      description: car.description || "",
      features: car.features?.join(", ") || "",
      is_featured: car.is_featured || false,
      existingImages: car.images || [],
    });
    setEditCarImages([]);
    setIsEditCarOpen(true);
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const formatPrice = (price: number) => new Intl.NumberFormat("de-DE", {
    style: "currency", currency: "EUR", minimumFractionDigits: 0,
  }).format(price);

  const carBrands = ["Audi", "BMW", "Ford", "Mercedes-Benz", "Opel", "Porsche", "Skoda", "Toyota", "Volkswagen", "Volvo", "Andere"];
  const fuelTypes = ["Benzin", "Diesel", "Hybrid", "Elektro", "Gas"];
  const transmissions = ["Schaltgetriebe", "Automatik"];

  const unreadContacts = contactRequests?.filter(c => !c.is_read).length || 0;
  const unreadSellRequests = sellRequests?.filter(s => !s.is_read).length || 0;
  const unreadCarInquiries = carInquiries?.filter(i => !i.is_read).length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 shadow-md">
        <div className="section-container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary-foreground text-primary px-3 py-1 rounded">
              <span className="font-heading font-bold text-lg">ULTRIX</span>
            </div>
            <span className="text-sm opacity-80">Admin-Bereich</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:text-primary-foreground/80">
            <LogOut className="h-4 w-4 mr-2" />
            Abmelden
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="section-container py-8">
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="calendar" className="relative">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Termine</span>
            </TabsTrigger>
            <TabsTrigger value="car-inquiries" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Kaufanfragen</span>
              {unreadCarInquiries > 0 && (
                <Badge className="ml-2 bg-accent">{unreadCarInquiries}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="contacts" className="relative">
              <Mail className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Kontakt</span>
              {unreadContacts > 0 && (
                <Badge className="ml-2 bg-accent">{unreadContacts}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sell-requests" className="relative">
              <HandCoins className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Verkauf</span>
              {unreadSellRequests > 0 && (
                <Badge className="ml-2 bg-accent">{unreadSellRequests}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cars">
              <Car className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Fahrzeuge</span>
            </TabsTrigger>
          </TabsList>

          {/* Appointment Calendar */}
          <TabsContent value="calendar">
            <AppointmentCalendar />
          </TabsContent>

          {/* Car Inquiries */}
          <TabsContent value="car-inquiries">
            <Card>
              <CardHeader>
                <CardTitle>Fahrzeuganfragen</CardTitle>
              </CardHeader>
              <CardContent>
                {carInquiries && carInquiries.length > 0 ? (
                  <div className="space-y-4">
                    {carInquiries.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        className={`p-4 border rounded-lg ${!inquiry.is_read ? "bg-accent/10 border-accent" : "border-border"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{inquiry.car_brand} {inquiry.car_model} ({inquiry.car_year})</span>
                              {!inquiry.is_read && <Badge variant="secondary">Neu</Badge>}
                            </div>
                            <p className="text-sm font-medium text-primary mb-1">{formatPrice(inquiry.car_price)}</p>
                            <p className="text-sm text-muted-foreground">
                              {inquiry.customer_name} • {inquiry.customer_email} • {inquiry.customer_phone}
                            </p>
                            {inquiry.message && (
                              <p className="mt-2 text-sm">{inquiry.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">{formatDate(inquiry.created_at)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setSelectedInquiry(inquiry);
                              if (!inquiry.is_read) markCarInquiryRead.mutate(inquiry.id);
                            }}>
                              <StickyNote className="h-4 w-4" />
                            </Button>
                            {!inquiry.is_read && (
                              <Button size="sm" variant="outline" onClick={() => markCarInquiryRead.mutate(inquiry.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => deleteCarInquiry.mutate(inquiry.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {inquiry.notes && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <span className="font-medium">Notiz:</span> {inquiry.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Keine Fahrzeuganfragen vorhanden.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Requests */}
          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Kontaktanfragen</CardTitle>
              </CardHeader>
              <CardContent>
                {contactRequests && contactRequests.length > 0 ? (
                  <div className="space-y-4">
                    {contactRequests.map((contact) => (
                      <div
                        key={contact.id}
                        className={`p-4 border rounded-lg ${!contact.is_read ? "bg-accent/10 border-accent" : "border-border"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{contact.name}</span>
                              {!contact.is_read && <Badge variant="secondary">Neu</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground">{contact.email}</p>
                            {contact.phone && <p className="text-sm text-muted-foreground">{contact.phone}</p>}
                            <p className="mt-2">{contact.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{formatDate(contact.created_at)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setSelectedContact(contact);
                              if (!contact.is_read) markContactRead.mutate(contact.id);
                            }}>
                              <StickyNote className="h-4 w-4" />
                            </Button>
                            {!contact.is_read && (
                              <Button size="sm" variant="outline" onClick={() => markContactRead.mutate(contact.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => deleteContact.mutate(contact.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {contact.notes && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <span className="font-medium">Notiz:</span> {contact.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Keine Kontaktanfragen vorhanden.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sell Requests */}
          <TabsContent value="sell-requests">
            <Card>
              <CardHeader>
                <CardTitle>Verkaufsanfragen</CardTitle>
              </CardHeader>
              <CardContent>
                {sellRequests && sellRequests.length > 0 ? (
                  <div className="space-y-4">
                    {sellRequests.map((request) => (
                      <div
                        key={request.id}
                        className={`p-4 border rounded-lg ${!request.is_read ? "bg-accent/10 border-accent" : "border-border"}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{request.brand} {request.model}</span>
                              {!request.is_read && <Badge variant="secondary">Neu</Badge>}
                              <Badge variant={request.status === "pending" ? "outline" : "default"}>
                                {request.status === "pending" ? "Offen" : request.status === "contacted" ? "Kontaktiert" : "Abgeschlossen"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.customer_name} • {request.customer_email} • {request.customer_phone}
                            </p>
                            <p className="text-sm mt-1">
                              EZ {request.year} • {request.mileage.toLocaleString("de-DE")} km • {request.fuel_type}
                            </p>
                            {request.asking_price && (
                              <p className="font-semibold mt-1">Preisvorstellung: {formatPrice(request.asking_price)}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">{formatDate(request.created_at)}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => {
                              setSelectedSellRequest(request);
                              if (!request.is_read) markSellRequestRead.mutate(request.id);
                            }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteSellRequest.mutate(request.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {request.notes && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <span className="font-medium">Notiz:</span> {request.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Keine Verkaufsanfragen vorhanden.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cars for Sale */}
          <TabsContent value="cars">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fahrzeuge im Angebot</CardTitle>
                <Button onClick={() => setIsAddCarOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Fahrzeug hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                {carsForSale && carsForSale.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {carsForSale.map((car) => (
                      <div key={car.id} className={`border rounded-lg overflow-hidden ${car.is_sold ? "opacity-60" : ""}`}>
                        <div className="h-32 bg-muted relative">
                          {car.images && car.images[0] ? (
                            <img src={car.images[0]} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                          )}
                          {car.is_sold && (
                            <Badge className="absolute top-2 right-2 bg-destructive">Verkauft</Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold">{car.brand} {car.model}</h4>
                          <p className="text-lg font-bold text-primary">{formatPrice(car.price)}</p>
                          <p className="text-sm text-muted-foreground">
                            EZ {car.year} • {car.mileage.toLocaleString("de-DE")} km
                          </p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(car)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={car.is_sold ? "outline" : "default"}
                              onClick={() => toggleCarSold.mutate({ id: car.id, is_sold: !car.is_sold })}
                            >
                              {car.is_sold ? "Verfügbar" : "Verkauft"}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteCar.mutate(car.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">Keine Fahrzeuge vorhanden.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Car Dialog */}
      <Dialog open={isAddCarOpen} onOpenChange={setIsAddCarOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neues Fahrzeug hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marke *</Label>
                <Select value={newCarData.brand} onValueChange={(v) => setNewCarData({ ...newCarData, brand: v })}>
                  <SelectTrigger><SelectValue placeholder="Marke wählen" /></SelectTrigger>
                  <SelectContent>
                    {carBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modell *</Label>
                <Input value={newCarData.model} onChange={(e) => setNewCarData({ ...newCarData, model: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Baujahr *</Label>
                <Input type="number" value={newCarData.year} onChange={(e) => setNewCarData({ ...newCarData, year: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kilometerstand *</Label>
                <Input type="number" value={newCarData.mileage} onChange={(e) => setNewCarData({ ...newCarData, mileage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kraftstoff *</Label>
                <Select value={newCarData.fuel_type} onValueChange={(v) => setNewCarData({ ...newCarData, fuel_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Kraftstoff wählen" /></SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map((fuel) => (
                      <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Getriebe *</Label>
                <Select value={newCarData.transmission} onValueChange={(v) => setNewCarData({ ...newCarData, transmission: v })}>
                  <SelectTrigger><SelectValue placeholder="Getriebe wählen" /></SelectTrigger>
                  <SelectContent>
                    {transmissions.map((trans) => (
                      <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preis (€) *</Label>
                <Input type="number" value={newCarData.price} onChange={(e) => setNewCarData({ ...newCarData, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Leistung (PS)</Label>
                <Input type="number" value={newCarData.power_hp} onChange={(e) => setNewCarData({ ...newCarData, power_hp: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Farbe</Label>
                <Input value={newCarData.color} onChange={(e) => setNewCarData({ ...newCarData, color: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ausstattung (kommagetrennt)</Label>
              <Input
                value={newCarData.features}
                onChange={(e) => setNewCarData({ ...newCarData, features: e.target.value })}
                placeholder="z.B. Klimaanlage, Navigationssystem, Ledersitze"
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={newCarData.description}
                onChange={(e) => setNewCarData({ ...newCarData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="featured"
                checked={newCarData.is_featured}
                onCheckedChange={(c) => setNewCarData({ ...newCarData, is_featured: !!c })}
              />
              <Label htmlFor="featured">Als Empfohlen markieren</Label>
            </div>
            <div className="space-y-2">
              <Label>Bilder *</Label>
              <div className="grid grid-cols-4 gap-2">
                {newCarImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-muted rounded overflow-hidden">
                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewCarImages(newCarImages.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {newCarImages.length < 10 && (
                  <label className="aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          setNewCarImages([...newCarImages, ...Array.from(e.target.files).slice(0, 10 - newCarImages.length)]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddCarOpen(false)}>Abbrechen</Button>
            <Button onClick={handleAddCar}>Fahrzeug hinzufügen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Car Dialog */}
      <Dialog open={isEditCarOpen} onOpenChange={setIsEditCarOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fahrzeug bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marke *</Label>
                <Select value={editCarData.brand} onValueChange={(v) => setEditCarData({ ...editCarData, brand: v })}>
                  <SelectTrigger><SelectValue placeholder="Marke wählen" /></SelectTrigger>
                  <SelectContent>
                    {carBrands.map((brand) => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Modell *</Label>
                <Input value={editCarData.model} onChange={(e) => setEditCarData({ ...editCarData, model: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Baujahr *</Label>
                <Input type="number" value={editCarData.year} onChange={(e) => setEditCarData({ ...editCarData, year: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kilometerstand *</Label>
                <Input type="number" value={editCarData.mileage} onChange={(e) => setEditCarData({ ...editCarData, mileage: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kraftstoff *</Label>
                <Select value={editCarData.fuel_type} onValueChange={(v) => setEditCarData({ ...editCarData, fuel_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Kraftstoff wählen" /></SelectTrigger>
                  <SelectContent>
                    {fuelTypes.map((fuel) => (
                      <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Getriebe *</Label>
                <Select value={editCarData.transmission} onValueChange={(v) => setEditCarData({ ...editCarData, transmission: v })}>
                  <SelectTrigger><SelectValue placeholder="Getriebe wählen" /></SelectTrigger>
                  <SelectContent>
                    {transmissions.map((trans) => (
                      <SelectItem key={trans} value={trans}>{trans}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preis (€) *</Label>
                <Input type="number" value={editCarData.price} onChange={(e) => setEditCarData({ ...editCarData, price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Leistung (PS)</Label>
                <Input type="number" value={editCarData.power_hp} onChange={(e) => setEditCarData({ ...editCarData, power_hp: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Farbe</Label>
                <Input value={editCarData.color} onChange={(e) => setEditCarData({ ...editCarData, color: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ausstattung (kommagetrennt)</Label>
              <Input
                value={editCarData.features}
                onChange={(e) => setEditCarData({ ...editCarData, features: e.target.value })}
                placeholder="z.B. Klimaanlage, Navigationssystem, Ledersitze"
              />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Textarea
                value={editCarData.description}
                onChange={(e) => setEditCarData({ ...editCarData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="edit-featured"
                checked={editCarData.is_featured}
                onCheckedChange={(c) => setEditCarData({ ...editCarData, is_featured: !!c })}
              />
              <Label htmlFor="edit-featured">Als Empfohlen markieren</Label>
            </div>
            <div className="space-y-2">
              <Label>Vorhandene Bilder (klicken und ziehen oder Pfeile zum Sortieren)</Label>
              <p className="text-xs text-muted-foreground">Das erste Bild wird als Hauptbild angezeigt</p>
              <div className="grid grid-cols-4 gap-2">
                {editCarData.existingImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-muted rounded overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                        Hauptbild
                      </span>
                    )}
                    <div className="absolute bottom-1 left-1 right-1 flex justify-between">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const newImages = [...editCarData.existingImages];
                          [newImages[idx - 1], newImages[idx]] = [newImages[idx], newImages[idx - 1]];
                          setEditCarData({ ...editCarData, existingImages: newImages });
                        }}
                        className="bg-background/80 text-foreground p-1 rounded disabled:opacity-30"
                      >
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === editCarData.existingImages.length - 1}
                        onClick={() => {
                          const newImages = [...editCarData.existingImages];
                          [newImages[idx], newImages[idx + 1]] = [newImages[idx + 1], newImages[idx]];
                          setEditCarData({ ...editCarData, existingImages: newImages });
                        }}
                        className="bg-background/80 text-foreground p-1 rounded disabled:opacity-30"
                      >
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditCarData({
                        ...editCarData,
                        existingImages: editCarData.existingImages.filter((_, i) => i !== idx)
                      })}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Neue Bilder hinzufügen</Label>
              <div className="grid grid-cols-4 gap-2">
                {editCarImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-muted rounded overflow-hidden">
                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setEditCarImages(editCarImages.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground p-1 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {(editCarData.existingImages.length + editCarImages.length) < 10 && (
                  <label className="aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          const remaining = 10 - editCarData.existingImages.length - editCarImages.length;
                          setEditCarImages([...editCarImages, ...Array.from(e.target.files).slice(0, remaining)]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCarOpen(false)}>Abbrechen</Button>
            <Button onClick={handleEditCar}>Speichern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Car Inquiry Notes Dialog */}
      <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
        <DialogContent>
          {selectedInquiry && (
            <>
              <DialogHeader>
                <DialogTitle>Notizen - {selectedInquiry.car_brand} {selectedInquiry.car_model}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Kunde: {selectedInquiry.customer_name} • {selectedInquiry.customer_email}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Notizen</Label>
                  <Textarea
                    value={selectedInquiry.notes || ""}
                    onChange={(e) => setSelectedInquiry({ ...selectedInquiry, notes: e.target.value })}
                    placeholder="Notizen zur Anfrage..."
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedInquiry(null)}>Schließen</Button>
                <Button onClick={() => {
                  updateCarInquiryNotes.mutate({ id: selectedInquiry.id, notes: selectedInquiry.notes || "" });
                  setSelectedInquiry(null);
                }}>Speichern</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Notes Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent>
          {selectedContact && (
            <>
              <DialogHeader>
                <DialogTitle>Notizen - {selectedContact.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedContact.email} {selectedContact.phone && `• ${selectedContact.phone}`}
                  </p>
                  <p className="text-sm">{selectedContact.message}</p>
                </div>
                <div className="space-y-2">
                  <Label>Notizen</Label>
                  <Textarea
                    value={selectedContact.notes || ""}
                    onChange={(e) => setSelectedContact({ ...selectedContact, notes: e.target.value })}
                    placeholder="Notizen zur Anfrage..."
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedContact(null)}>Schließen</Button>
                <Button onClick={() => {
                  updateContactNotes.mutate({ id: selectedContact.id, notes: selectedContact.notes || "" });
                  setSelectedContact(null);
                }}>Speichern</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Sell Request Detail Dialog */}
      <Dialog open={!!selectedSellRequest} onOpenChange={() => setSelectedSellRequest(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedSellRequest && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedSellRequest.brand} {selectedSellRequest.model}</DialogTitle>
              </DialogHeader>
              
              {selectedSellRequest.images && selectedSellRequest.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedSellRequest.images.map((img: string, idx: number) => (
                    <img key={idx} src={img} alt="" className="w-full h-32 object-cover rounded" />
                  ))}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Kundendaten</h4>
                  <p>{selectedSellRequest.customer_name}</p>
                  <p>{selectedSellRequest.customer_email}</p>
                  <p>{selectedSellRequest.customer_phone}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Baujahr</p>
                    <p className="font-medium">{selectedSellRequest.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kilometerstand</p>
                    <p className="font-medium">{selectedSellRequest.mileage.toLocaleString("de-DE")} km</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kraftstoff</p>
                    <p className="font-medium">{selectedSellRequest.fuel_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Getriebe</p>
                    <p className="font-medium">{selectedSellRequest.transmission}</p>
                  </div>
                  {selectedSellRequest.color && (
                    <div>
                      <p className="text-sm text-muted-foreground">Farbe</p>
                      <p className="font-medium">{selectedSellRequest.color}</p>
                    </div>
                  )}
                  {selectedSellRequest.asking_price && (
                    <div>
                      <p className="text-sm text-muted-foreground">Preisvorstellung</p>
                      <p className="font-medium">{formatPrice(selectedSellRequest.asking_price)}</p>
                    </div>
                  )}
                </div>

                {selectedSellRequest.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Beschreibung</h4>
                    <p className="text-muted-foreground">{selectedSellRequest.description}</p>
                  </div>
                )}

                <div>
                  <Label>Status ändern</Label>
                  <Select
                    value={selectedSellRequest.status}
                    onValueChange={(v) => {
                      updateSellRequestStatus.mutate({ id: selectedSellRequest.id, status: v });
                      setSelectedSellRequest({ ...selectedSellRequest, status: v });
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Offen</SelectItem>
                      <SelectItem value="contacted">Kontaktiert</SelectItem>
                      <SelectItem value="completed">Abgeschlossen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Notizen</Label>
                  <Textarea
                    value={selectedSellRequest.notes || ""}
                    onChange={(e) => setSelectedSellRequest({ ...selectedSellRequest, notes: e.target.value })}
                    placeholder="Notizen zur Anfrage..."
                    rows={4}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => updateSellRequestNotes.mutate({ 
                      id: selectedSellRequest.id, 
                      notes: selectedSellRequest.notes || "" 
                    })}
                  >
                    Notizen speichern
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
