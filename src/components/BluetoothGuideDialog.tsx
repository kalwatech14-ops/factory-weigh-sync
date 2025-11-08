import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import scaleImage from "@/assets/digi-argeo-scale.png";

interface BluetoothGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: () => void;
}

export const BluetoothGuideDialog = ({
  open,
  onOpenChange,
  onConnect,
}: BluetoothGuideDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect to DIGI ARGEO Scale</DialogTitle>
          <DialogDescription>
            Follow these steps to enable Bluetooth on your scale
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Scale Image with Highlight */}
          <div className="relative">
            <img
              src={scaleImage}
              alt="DIGI ARGEO Scale"
              className="w-full rounded-lg border"
            />
            {/* TARE Button Highlight - positioned over the second button */}
            <div className="absolute left-[42%] top-[72%] w-16 h-16">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-primary/30 rounded-full animate-pulse" />
                <div className="absolute inset-0 border-4 border-primary rounded-full" />
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium whitespace-nowrap">
                  TARE Button
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Step-by-step Instructions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Connection Steps:</h3>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium mb-1">Locate the TARE Button</h4>
                <p className="text-sm text-muted-foreground">
                  Find the yellow TARE button (second from left) with the ↑ and Bluetooth icon on your scale.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium mb-1">Enable Bluetooth Mode</h4>
                <p className="text-sm text-muted-foreground">
                  Press and hold the TARE button for 3-5 seconds until the Bluetooth icon flashes or "BT" appears on the display.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium mb-1">Connect from App</h4>
                <p className="text-sm text-muted-foreground">
                  Tap the "Connect Now" button below and select your DIGI ARGEO scale from the list.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-medium mb-1">Test Connection</h4>
                <p className="text-sm text-muted-foreground">
                  Place an item on the scale to verify the weight appears in the app.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => {
              onConnect();
              onOpenChange(false);
            }}
            className="w-full"
            size="lg"
          >
            Connect Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
