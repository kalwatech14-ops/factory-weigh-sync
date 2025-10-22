import { useState } from "react";
import { OperatorLogin } from "@/components/OperatorLogin";
import { WeighingStation } from "@/components/WeighingStation";

const Index = () => {
  const [operatorName, setOperatorName] = useState<string | null>(null);
  const [productType, setProductType] = useState<string | null>(null);
  const machineName = "SCALE 1"; // This could be configured per tablet

  const handleStartShift = (name: string, product: string) => {
    setOperatorName(name);
    setProductType(product);
  };

  const handleEndShift = () => {
    setOperatorName(null);
    setProductType(null);
  };

  if (!operatorName || !productType) {
    return <OperatorLogin onStartShift={handleStartShift} />;
  }

  return (
    <WeighingStation
      operatorName={operatorName}
      productType={productType}
      machineName={machineName}
      onEndShift={handleEndShift}
    />
  );
};

export default Index;
