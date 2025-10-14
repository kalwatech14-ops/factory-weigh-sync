import { Bluetooth, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConnectionType = "bluetooth" | "wifi";
export type ConnectionState = "connected" | "connecting" | "disconnected";

interface ConnectionStatusProps {
  type: ConnectionType;
  state: ConnectionState;
  isActive: boolean;
  onClick: () => void;
}

export const ConnectionStatus = ({ type, state, isActive, onClick }: ConnectionStatusProps) => {
  const getStatusColor = () => {
    switch (state) {
      case "connected":
        return "bg-status-connected";
      case "connecting":
        return "bg-status-connecting";
      case "disconnected":
        return "bg-status-disconnected";
      default:
        return "bg-status-offline";
    }
  };

  const getStatusText = () => {
    switch (state) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
      default:
        return "Offline";
    }
  };

  const Icon = type === "bluetooth" ? Bluetooth : state === "connected" ? Wifi : WifiOff;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-6 py-4 rounded-lg border-2 transition-all",
        isActive
          ? "border-primary bg-primary/10 shadow-lg"
          : "border-border bg-card hover:border-primary/50"
      )}
    >
      <Icon className={cn("w-6 h-6", isActive ? "text-primary" : "text-muted-foreground")} />
      <div className="flex-1 text-left">
        <div className={cn("font-semibold text-sm", isActive ? "text-foreground" : "text-muted-foreground")}>
          {type === "bluetooth" ? "Bluetooth" : "Wi-Fi"}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className={cn("w-2 h-2 rounded-full", getStatusColor())} />
          <span className="text-xs text-muted-foreground">{getStatusText()}</span>
        </div>
      </div>
    </button>
  );
};
