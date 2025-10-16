import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface WifiConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (ipAddress: string) => void;
}

export const WifiConfigDialog = ({ open, onOpenChange, onConnect }: WifiConfigDialogProps) => {
  const [ipAddress, setIpAddress] = useState("192.168.1.100");

  const handleConnect = () => {
    if (ipAddress.trim()) {
      onConnect(ipAddress.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Wi-Fi Scale</DialogTitle>
          <DialogDescription>
            Enter the IP address of your Wi-Fi scale device
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ip-address">IP Address</Label>
            <Input
              id="ip-address"
              placeholder="192.168.1.100"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConnect}>
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
