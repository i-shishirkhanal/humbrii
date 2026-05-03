import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GuestSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

const GuestSelector = ({
  value,
  onChange,
  min = 1,
  max = 10,
  label = "Guests",
  className,
}: GuestSelectorProps) => {
  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground">
            {value} {value === 1 ? "Guest" : "Guests"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={decrement}
            disabled={value <= min}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-semibold">{value}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={increment}
            disabled={value >= max}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuestSelector;
