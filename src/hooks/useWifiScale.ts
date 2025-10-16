import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface WifiScaleHook {
  weight: number;
  state: "connected" | "connecting" | "disconnected";
  connect: (ipAddress: string) => Promise<void>;
  disconnect: () => void;
}

export const useWifiScale = (): WifiScaleHook => {
  const [weight, setWeight] = useState(0);
  const [state, setState] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const [ipAddress, setIpAddress] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const connect = useCallback(async (ip: string) => {
    try {
      setState("connecting");
      
      // Test connection to the scale's Wi-Fi endpoint
      const response = await fetch(`http://${ip}/weight`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error("Failed to connect to scale");
      }

      const data = await response.json();
      setWeight(data.weight || 0);
      setIpAddress(ip);
      setState("connected");

      toast({
        title: "Wi-Fi connected",
        description: `Connected to scale at ${ip}`,
      });

      // Poll for weight updates every 2 seconds
      intervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`http://${ip}/weight`);
          if (response.ok) {
            const data = await response.json();
            setWeight(data.weight || 0);
          }
        } catch (error) {
          console.error("Error fetching weight:", error);
        }
      }, 2000);

    } catch (error: any) {
      console.error("Wi-Fi connection error:", error);
      setState("disconnected");
      throw error; // Re-throw to let the calling component handle it
    }
  }, [toast]);

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIpAddress(null);
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
