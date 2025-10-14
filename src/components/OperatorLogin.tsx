import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale } from "lucide-react";

interface OperatorLoginProps {
  onStartShift: (operatorName: string) => void;
}

export const OperatorLogin = ({ onStartShift }: OperatorLoginProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStartShift(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-4">
            <Scale className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Industrial Weighing Station
          </h1>
          <p className="text-xl text-muted-foreground">
            Enter your name to begin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="operator-name" className="text-lg font-semibold">
              Operator Name
            </Label>
            <Input
              id="operator-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-16 text-xl"
              autoFocus
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-20 text-2xl font-bold"
            disabled={!name.trim()}
          >
            Start Shift
          </Button>
        </form>
      </div>
    </div>
  );
};
