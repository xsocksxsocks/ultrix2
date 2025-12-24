import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, parseISO, isToday } from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone, Mail, Car, Check, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  appointment_date: string | null;
  appointment_time: string | null;
  appointment_confirmed: boolean | null;
  status: string | null;
  created_at: string;
}

const AppointmentCalendar = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Fetch appointments with dates
  const { data: appointments } = useQuery({
    queryKey: ["admin-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_sell_requests")
        .select("*")
        .not("appointment_date", "is", null)
        .order("appointment_date", { ascending: true });
      if (error) throw error;
      return data as Appointment[];
    },
  });

  // Confirm appointment mutation
  const confirmAppointment = useMutation({
    mutationFn: async ({ id, confirmed }: { id: string; confirmed: boolean }) => {
      const { error } = await supabase
        .from("car_sell_requests")
        .update({ 
          appointment_confirmed: confirmed,
          status: confirmed ? "contacted" : "pending"
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { confirmed }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-appointments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sell-requests"] });
      toast({ 
        title: confirmed ? "Termin bestätigt" : "Termin abgelehnt",
        description: confirmed ? "Der Kunde wird über die Bestätigung informiert." : undefined
      });
      setSelectedAppointment(null);
    },
  });

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week (Monday = 0)
  const startDayOfWeek = (monthStart.getDay() + 6) % 7;
  const emptyDays = Array(startDayOfWeek).fill(null);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    appointments?.forEach((apt) => {
      if (apt.appointment_date) {
        const key = apt.appointment_date;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(apt);
      }
    });
    return map;
  }, [appointments]);

  // Get appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return appointmentsByDate.get(key) || [];
  }, [selectedDate, appointmentsByDate]);

  // Count stats
  const stats = useMemo(() => {
    const now = new Date();
    const pending = appointments?.filter(a => !a.appointment_confirmed && a.appointment_date && parseISO(a.appointment_date) >= now).length || 0;
    const confirmed = appointments?.filter(a => a.appointment_confirmed).length || 0;
    const thisMonth = appointments?.filter(a => a.appointment_date && isSameMonth(parseISO(a.appointment_date), now)).length || 0;
    return { pending, confirmed, thisMonth };
  }, [appointments]);

  const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-accent/20 p-3 rounded-full">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Offene Termine</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <CheckCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.confirmed}</p>
              <p className="text-sm text-muted-foreground">Bestätigte Termine</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-secondary p-3 rounded-full">
              <Calendar className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
              <p className="text-sm text-muted-foreground">Diesen Monat</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Terminkalender
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[140px] text-center">
                {format(currentMonth, "MMMM yyyy", { locale: de })}
              </span>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}
              {daysInMonth.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayAppointments = appointmentsByDate.get(dateKey) || [];
                const hasUnconfirmed = dayAppointments.some(a => !a.appointment_confirmed);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square p-1 rounded-lg border transition-all relative
                      ${isToday(day) ? "border-primary" : "border-transparent"}
                      ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                      ${dayAppointments.length > 0 ? "font-semibold" : ""}
                    `}
                  >
                    <span className="text-sm">{format(day, "d")}</span>
                    {dayAppointments.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {hasUnconfirmed ? (
                          <span className="w-2 h-2 rounded-full bg-accent" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                        {dayAppointments.length > 1 && (
                          <span className="text-[10px] text-muted-foreground">+{dayAppointments.length - 1}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent" />
                <span>Offen</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span>Bestätigt</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Appointments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {selectedDate 
                ? format(selectedDate, "EEEE, dd. MMMM", { locale: de })
                : "Datum auswählen"
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateAppointments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md
                        ${apt.appointment_confirmed ? "border-primary/30 bg-primary/5" : "border-accent/30 bg-accent/5"}
                      `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm">
                          {apt.appointment_time ? `${apt.appointment_time} Uhr` : "Uhrzeit offen"}
                        </span>
                        <Badge variant={apt.appointment_confirmed ? "default" : "secondary"}>
                          {apt.appointment_confirmed ? "Bestätigt" : "Offen"}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium">{apt.brand} {apt.model}</p>
                      <p className="text-sm text-muted-foreground">{apt.customer_name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Keine Termine an diesem Tag.
                </p>
              )
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Klicken Sie auf einen Tag im Kalender.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Anstehende Termine</CardTitle>
        </CardHeader>
        <CardContent>
          {appointments && appointments.filter(a => a.appointment_date && parseISO(a.appointment_date) >= new Date()).length > 0 ? (
            <div className="space-y-3">
              {appointments
                .filter(a => a.appointment_date && parseISO(a.appointment_date) >= new Date())
                .slice(0, 10)
                .map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${apt.appointment_confirmed ? "bg-primary/10" : "bg-accent/10"}`}>
                        <Calendar className={`h-5 w-5 ${apt.appointment_confirmed ? "text-primary" : "text-accent"}`} />
                      </div>
                      <div>
                        <p className="font-semibold">{apt.brand} {apt.model}</p>
                        <p className="text-sm text-muted-foreground">
                          {apt.appointment_date && format(parseISO(apt.appointment_date), "dd.MM.yyyy", { locale: de })}
                          {apt.appointment_time && ` um ${apt.appointment_time} Uhr`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{apt.customer_name}</p>
                        <p className="text-xs text-muted-foreground">{apt.customer_phone}</p>
                      </div>
                      <Badge variant={apt.appointment_confirmed ? "default" : "secondary"}>
                        {apt.appointment_confirmed ? "Bestätigt" : "Offen"}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Keine anstehenden Termine.</p>
          )}
        </CardContent>
      </Card>

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Termindetails</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge variant={selectedAppointment.appointment_confirmed ? "default" : "secondary"} className="text-sm">
                  {selectedAppointment.appointment_confirmed ? "Bestätigt" : "Warten auf Bestätigung"}
                </Badge>
              </div>

              {/* Date & Time */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold">
                      {selectedAppointment.appointment_date && format(parseISO(selectedAppointment.appointment_date), "EEEE, dd. MMMM yyyy", { locale: de })}
                    </p>
                    {selectedAppointment.appointment_time && (
                      <p className="text-sm text-muted-foreground">um {selectedAppointment.appointment_time} Uhr</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h4 className="font-semibold">Kundendaten</h4>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedAppointment.customer_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${selectedAppointment.customer_phone}`} className="text-primary hover:underline">
                    {selectedAppointment.customer_phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${selectedAppointment.customer_email}`} className="text-primary hover:underline">
                    {selectedAppointment.customer_email}
                  </a>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="space-y-3">
                <h4 className="font-semibold">Fahrzeug</h4>
                <div className="flex items-center gap-3">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedAppointment.brand} {selectedAppointment.model}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  EZ {selectedAppointment.year} • {selectedAppointment.mileage.toLocaleString("de-DE")} km
                </p>
              </div>

              {/* Requested Date */}
              <p className="text-xs text-muted-foreground">
                Anfrage vom {format(parseISO(selectedAppointment.created_at), "dd.MM.yyyy 'um' HH:mm", { locale: de })}
              </p>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selectedAppointment && !selectedAppointment.appointment_confirmed && (
              <>
                <Button
                  variant="outline"
                  onClick={() => confirmAppointment.mutate({ id: selectedAppointment.id, confirmed: false })}
                >
                  <X className="h-4 w-4 mr-2" />
                  Ablehnen
                </Button>
                <Button
                  onClick={() => confirmAppointment.mutate({ id: selectedAppointment.id, confirmed: true })}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Termin bestätigen
                </Button>
              </>
            )}
            {selectedAppointment?.appointment_confirmed && (
              <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                Schließen
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentCalendar;
