import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OperatorLoginProps {
  onStartShift: (operatorName: string, productType: string) => void;
}

export const OperatorLogin = ({ onStartShift }: OperatorLoginProps) => {
  const [name, setName] = useState("");
  const [productType, setProductType] = useState("");

  useEffect(() => {
    const savedOperatorName = localStorage.getItem("operatorName");
    if (savedOperatorName) {
      setName(savedOperatorName);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && productType.trim()) {
      const trimmedName = name.trim();
      const trimmedProduct = productType.trim();

      // Store single operator name in localStorage (overwrite previous)
      try {
        localStorage.setItem("operatorName", trimmedName);
      } catch (err) {
        // ignore localStorage errors (e.g., in private mode)
      }

      onStartShift(trimmedName, trimmedProduct);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary mb-4">
            <img src="/logo.png" alt="Hilina logo" className="w-20 h-20 object-contain" />
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">
            Hilina Enriched Foods PLC
          </h1>
          <h1 className="text-2xl font-bold text-foreground mt-2 mb-4">
            Carton Gross Weight Recording
          </h1>
          <p className="text-xl text-muted-foreground">Enter your name and product type to begin</p>
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

          <div className="space-y-2">
            <Label htmlFor="product-type" className="text-lg font-semibold">
              Product Type
            </Label>
            <Input
              id="product-type"
              type="text"
              placeholder="Enter product type"
              value={productType}
              onChange={(e) => setProductType(e.target.value)}
              className="h-16 text-xl"
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full h-20 text-2xl font-bold"
            disabled={!name.trim() || !productType.trim()}
          >
            Start
          </Button>
        </form>
      </div>
    </div>
  );
};
