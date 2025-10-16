import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { BluetoothFactory } from "@/lib/bluetooth/BluetoothFactory";
import { BluetoothAdapter, BluetoothDeviceInfo } from "@/lib/bluetooth/BluetoothAdapter";

interface BluetoothScaleHook {
  weight: number;
  state: "connected" | "connecting" | "disconnected";
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useBluetoothScale = (): BluetoothScaleHook => {
  const [weight, setWeight] = useState(0);
  const [state, setState] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const adapterRef = useRef<BluetoothAdapter | null>(null);
  const deviceInfoRef = useRef<BluetoothDeviceInfo | null>(null);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    try {
      setState("connecting");

      // Create the appropriate adapter (Web or Capacitor)
      if (!adapterRef.current) {
        adapterRef.current = BluetoothFactory.createAdapter();
      }

      const adapter = adapterRef.current;

      // Check if Bluetooth is available
      const isAvailable = await adapter.isAvailable();
      if (!isAvailable) {
        throw new Error("Bluetooth is not available on this device");
      }

      // Request device
      const deviceInfo = await adapter.requestDevice();
      deviceInfoRef.current = deviceInfo;

      // Connect to device
      await adapter.connect(deviceInfo);

      setState("connected");

      toast({
        title: "Bluetooth connected",
        description: `Connected to ${deviceInfo.name || "scale device"}`,
      });

      // Subscribe to weight updates
      try {
        await adapter.subscribeToWeight((newWeight) => {
          setWeight(newWeight);
        });
      } catch (e) {
        console.warn("Could not subscribe to weight notifications:", e);
        toast({
          title: "Warning",
          description: "Connected but weight notifications not available",
          variant: "default",
        });
      }

    } catch (error: any) {
      console.error("Bluetooth connection error:", error);
      setState("disconnected");
      toast({
        title: "Bluetooth connection failed",
        description: error.message || "Could not connect to device",
        variant: "destructive",
      });
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    if (adapterRef.current) {
      adapterRef.current.disconnect();
      adapterRef.current = null;
    }
    deviceInfoRef.current = null;
    setState("disconnected");
    setWeight(0);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    weight,
    state,
    connect,
    disconnect,
  };
};
