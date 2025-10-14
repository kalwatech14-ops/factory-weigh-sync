import { Scale } from "lucide-react";

interface WeightDisplayProps {
  weight: number;
  unit?: string;
}

export const WeightDisplay = ({ weight, unit = "kg" }: WeightDisplayProps) => {
  return (
    <div className="relative">
      <div className="bg-card rounded-2xl p-8 border-4 border-primary/20 shadow-xl">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Scale className="w-10 h-10 text-primary" />
          <span className="text-2xl font-semibold text-muted-foreground">Current Weight</span>
        </div>
        
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-3">
            <span className="text-8xl font-bold text-weight tabular-nums tracking-tight">
              {weight.toFixed(2)}
            </span>
            <span className="text-4xl font-semibold text-muted-foreground mb-4">
              {unit}
            </span>
          </div>
        </div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl -z-10" />
    </div>
  );
};
