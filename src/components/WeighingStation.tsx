import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectionStatus, ConnectionType, ConnectionState } from "./ConnectionStatus";
import { WeightDisplay } from "./WeightDisplay";
import { WifiConfigDialog } from "./WifiConfigDialog";
import { LogOut, Save, Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBluetoothScale } from "@/hooks/useBluetoothScale";
import { useWifiScale } from "@/hooks/useWifiScale";

interface WeighingStationProps {
  operatorName: string;
  productType: string;
  machineName: string;
  onEndShift: () => void;
}

interface WeightRecord {
  timestamp: string;
  machineName: string;
  operatorName: string;
  productType: string;
  weight: number;
}

export const WeighingStation = ({ operatorName, productType, machineName, onEndShift }: WeighingStationProps) => {
  const [activeConnection, setActiveConnection] = useState<ConnectionType>("bluetooth");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedRecords, setQueuedRecords] = useState<WeightRecord[]>([]);
  const [showWifiConfig, setShowWifiConfig] = useState(false);
  const { toast } = useToast();
  
  const bluetooth = useBluetoothScale();
  const wifi = useWifiScale();
  
  const currentWeight = activeConnection === "bluetooth" ? bluetooth.weight : wifi.weight;
  const bluetoothState = bluetooth.state;
  const wifiState = wifi.state;

  // Log shift start when component mounts
  useEffect(() => {
    logShiftEvent('start');
  }, []);

  const logShiftEvent = async (action: 'start' | 'end') => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/log-shift`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            machineName,
            operatorName,
            productType,
            action
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to log shift event');
      }

      console.log(`Shift ${action} logged successfully`);
    } catch (error) {
      console.error('Shift log error:', error);
      // Don't show error toast for shift logging to avoid disrupting user
    }
  };

  const handleEndShift = async () => {
    await logShiftEvent('end');
    onEndShift();
  };

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

  // Weight is now handled by the hooks

  // Auto-sync queued records when online
  useEffect(() => {
    if (isOnline && queuedRecords.length > 0) {
      syncQueuedRecords();
    }
  }, [isOnline, queuedRecords]);

  const syncQueuedRecords = async () => {
    toast({
      title: "Syncing data",
      description: `Uploading ${queuedRecords.length} queued records...`,
    });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/record-weight`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ records: queuedRecords })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to sync records');
      }

      setQueuedRecords([]);
      toast({
        title: "Sync complete",
        description: "All queued records uploaded successfully",
      });
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: "Failed to upload records. Will retry later.",
        variant: "destructive",
      });
    }
  };

  const handleRecordWeight = async () => {
    const record: WeightRecord = {
      timestamp: new Date().toISOString(),
      machineName,
      operatorName,
      productType,
      weight: currentWeight,
    };

    if (isOnline) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/record-weight`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ records: [record] })
          }
        );

        if (!response.ok) {
          throw new Error('Failed to record weight');
        }

        toast({
          title: "Weight recorded",
          description: `${currentWeight.toFixed(2)} kg saved successfully`,
          duration: 2000,
        });
      } catch (error) {
        console.error('Record error:', error);
        // Queue for later if upload fails
        setQueuedRecords((prev) => [...prev, record]);
        toast({
          title: "Weight queued",
          description: `Network error. Saved offline for later sync.`,
          variant: "default",
          duration: 2000,
        });
      }
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

  const handleConnectionSwitch = async (type: ConnectionType) => {
    if (type === "bluetooth") {
      setActiveConnection(type);
      try {
        await bluetooth.connect();
      } catch (error: any) {
        // Only auto-switch if error is not user cancellation
        if (error?.message?.includes("cancelled") || error?.message?.includes("canceled")) {
          return; // User cancelled, don't switch to Wi-Fi
        }
        
        toast({
          title: "Bluetooth unavailable",
          description: "Please configure Wi-Fi connection",
          variant: "default",
        });
        setActiveConnection("wifi");
        setShowWifiConfig(true);
      }
    } else {
      // For Wi-Fi, show configuration dialog
      bluetooth.disconnect();
      setActiveConnection("wifi");
      setShowWifiConfig(true);
    }
  };

  const handleWifiConnect = async (ipAddress: string) => {
    try {
      await wifi.connect(ipAddress);
    } catch (error: any) {
      toast({
        title: "Wi-Fi connection failed",
        description: "Please check the IP address and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <WifiConfigDialog
        open={showWifiConfig}
        onOpenChange={setShowWifiConfig}
        onConnect={handleWifiConnect}
      />
      
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
              <p className="text-lg text-muted-foreground">
                Product: <span className="font-semibold text-foreground">{productType}</span>
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
                onClick={handleEndShift}
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
    </>
  );
};
