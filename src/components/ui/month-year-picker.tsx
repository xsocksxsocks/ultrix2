import * as React from "react";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MonthYearPickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

export function MonthYearPicker({
  value,
  onChange,
  placeholder = "Monat/Jahr wählen",
  className,
  disabled = false,
  minYear = 1990,
  maxYear = new Date().getFullYear(),
}: MonthYearPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewYear, setViewYear] = React.useState(value?.getFullYear() || new Date().getFullYear());

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(viewYear, monthIndex, 1);
    // Don't allow future dates
    if (newDate > new Date()) return;
    onChange(newDate);
    setIsOpen(false);
  };

  const isMonthDisabled = (monthIndex: number) => {
    const date = new Date(viewYear, monthIndex, 1);
    return date > new Date();
  };

  const formatValue = (date: Date) => {
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${month}/${date.getFullYear()}`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatValue(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-3">
          {/* Year navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewYear(Math.max(minYear, viewYear - 1))}
              disabled={viewYear <= minYear}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold text-lg">{viewYear}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewYear(Math.min(maxYear, viewYear + 1))}
              disabled={viewYear >= maxYear}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, index) => {
              const isSelected = value && 
                value.getMonth() === index && 
                value.getFullYear() === viewYear;
              const isDisabled = isMonthDisabled(index);

              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => handleMonthSelect(index)}
                  className={cn(
                    "h-9",
                    isSelected && "bg-primary text-primary-foreground"
                  )}
                >
                  {month.substring(0, 3)}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
