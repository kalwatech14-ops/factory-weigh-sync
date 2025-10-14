import { useState } from "react";
import { OperatorLogin } from "@/components/OperatorLogin";
import { WeighingStation } from "@/components/WeighingStation";

const Index = () => {
  const [operatorName, setOperatorName] = useState<string | null>(null);
  const machineName = "SCALE 1"; // This could be configured per tablet

  const handleStartShift = (name: string) => {
    setOperatorName(name);
  };

  const handleEndShift = () => {
    setOperatorName(null);
  };

  if (!operatorName) {
    return <OperatorLogin onStartShift={handleStartShift} />;
  }

  return (
    <WeighingStation
      operatorName={operatorName}
      machineName={machineName}
      onEndShift={handleEndShift}
    />
  );
};

export default Index;
