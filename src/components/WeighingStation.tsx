import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectionStatus, ConnectionType, ConnectionState } from "./ConnectionStatus";
import { WeightDisplay } from "./WeightDisplay";
import { LogOut, Save, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WeighingStationProps {
  operatorName: string;
  machineName: string;
  onEndShift: () => void;
}

interface WeightRecord {
  timestamp: string;
  machineName: string;
  operatorName: string;
  weight: number;
}

export const WeighingStation = ({ operatorName, machineName, onEndShift }: WeighingStationProps) => {
  const [currentWeight, setCurrentWeight] = useState(0);
  const [activeConnection, setActiveConnection] = useState<ConnectionType>("bluetooth");
  const [bluetoothState, setBluetoothState] = useState<ConnectionState>("disconnected");
  const [wifiState, setWifiState] = useState<ConnectionState>("connected");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedRecords, setQueuedRecords] = useState<WeightRecord[]>([]);
  const { toast } = useToast();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Simulate weight changes (in production, this would read from the scale)
  useEffect(() => {
    const interval = setInterval(() => {
      if (bluetoothState === "connected" || wifiState === "connected") {
        setCurrentWeight(Math.random() * 100 + 50);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [bluetoothState, wifiState]);

  // Auto-sync queued records when online
  useEffect(() => {
    if (isOnline && queuedRecords.length > 0) {
      syncQueuedRecords();
    }
  }, [isOnline, queuedRecords]);

  const syncQueuedRecords = async () => {
    // In production, this would upload to Google Sheets
    toast({
      title: "Syncing data",
      description: `Uploading ${queuedRecords.length} queued records...`,
    });

    // Simulate upload
    setTimeout(() => {
      setQueuedRecords([]);
      toast({
        title: "Sync complete",
        description: "All queued records uploaded successfully",
      });
    }, 1000);
  };

  const handleRecordWeight = async () => {
    const record: WeightRecord = {
      timestamp: new Date().toISOString(),
      machineName,
      operatorName,
      weight: currentWeight,
    };

    if (isOnline) {
      // In production, upload to Google Sheets immediately
      toast({
        title: "Weight recorded",
        description: `${currentWeight.toFixed(2)} kg saved successfully`,
        duration: 2000,
      });
    } else {
      // Queue for later upload
      setQueuedRecords((prev) => [...prev, record]);
      toast({
        title: "Weight queued",
        description: `Saved offline. Will sync when connection restored.`,
        variant: "default",
        duration: 2000,
      });
    }
  };

  const handleConnectionSwitch = (type: ConnectionType) => {
    setActiveConnection(type);
    
    if (type === "bluetooth") {
      setBluetoothState("connecting");
      setTimeout(() => {
        // Simulate connection attempt
        const success = Math.random() > 0.3;
        setBluetoothState(success ? "connected" : "disconnected");
        if (!success) {
          toast({
            title: "Bluetooth connection failed",
            description: "Switching to Wi-Fi mode",
            variant: "destructive",
          });
          setActiveConnection("wifi");
        }
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{machineName}</h1>
              <p className="text-lg text-muted-foreground">
                Operator: <span className="font-semibold text-foreground">{operatorName}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant={isOnline ? "default" : "destructive"} className="px-4 py-2 text-sm">
                <Wifi className="w-4 h-4 mr-2" />
                {isOnline ? "Online" : "Offline Mode"}
              </Badge>
              
              {queuedRecords.length > 0 && (
                <Badge variant="outline" className="px-4 py-2 text-sm">
                  {queuedRecords.length} queued
                </Badge>
              )}
              
              <Button
                variant="outline"
                size="lg"
                onClick={onEndShift}
                className="gap-2"
              >
                <LogOut className="w-5 h-5" />
                End Shift
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Options */}
      <div className="max-w-4xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4 text-foreground">Connection Method</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConnectionStatus
            type="bluetooth"
            state={bluetoothState}
            isActive={activeConnection === "bluetooth"}
            onClick={() => handleConnectionSwitch("bluetooth")}
          />
          <ConnectionStatus
            type="wifi"
            state={wifiState}
            isActive={activeConnection === "wifi"}
            onClick={() => handleConnectionSwitch("wifi")}
          />
        </div>
      </div>

      {/* Weight Display */}
      <div className="max-w-4xl mx-auto mb-8">
        <WeightDisplay weight={currentWeight} />
      </div>

      {/* Record Button */}
      <div className="max-w-4xl mx-auto">
        <Button
          size="lg"
          onClick={handleRecordWeight}
          disabled={bluetoothState !== "connected" && wifiState !== "connected"}
          className="w-full h-24 text-3xl font-bold gap-4 shadow-xl hover:shadow-2xl transition-all"
        >
          <Save className="w-10 h-10" />
          Record Weight
        </Button>
      </div>
    </div>
  );
};
