/// <reference path="../types/bluetooth.d.ts" />
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface BluetoothScaleHook {
  weight: number;
  state: "connected" | "connecting" | "disconnected";
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useBluetoothScale = (): BluetoothScaleHook => {
  const [weight, setWeight] = useState(0);
  const [state, setState] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const { toast } = useToast();

  const connect = useCallback(async () => {
    try {
      setState("connecting");

      // Request Bluetooth device
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'device_information']
      });

      const server = await device.gatt?.connect();
      if (!server) throw new Error("Failed to connect to GATT server");

      setDevice(device);
      setState("connected");

      toast({
        title: "Bluetooth connected",
        description: `Connected to ${device.name || "scale device"}`,
      });

      // Try to get weight characteristic (this depends on your scale's service UUID)
      // Most scales use custom UUIDs - you'll need to replace these with your scale's actual UUIDs
      try {
        const service = await server.getPrimaryService("00001234-0000-1000-8000-00805f9b34fb");
        const char = await service.getCharacteristic("00005678-0000-1000-8000-00805f9b34fb");
        
        setCharacteristic(char);
        
        // Start notifications for weight updates
        await char.startNotifications();
        char.addEventListener('characteristicvaluechanged', (event: Event) => {
          const target = event.target as BluetoothRemoteGATTCharacteristic;
          const value = target.value;
          if (value) {
            // Parse weight data (format depends on your scale)
            const weightValue = value.getFloat32(0, true);
            setWeight(weightValue);
          }
        });
      } catch (e) {
        console.warn("Could not subscribe to weight characteristic:", e);
        // Fallback: poll for weight periodically if notifications aren't available
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
    if (characteristic) {
      characteristic.stopNotifications();
    }
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    setDevice(null);
    setCharacteristic(null);
    setState("disconnected");
    setWeight(0);
  }, [device, characteristic]);

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
