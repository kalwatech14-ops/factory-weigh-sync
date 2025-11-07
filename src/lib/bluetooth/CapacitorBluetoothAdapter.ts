import { BluetoothAdapter, BluetoothDeviceInfo } from "./BluetoothAdapter";
import { BleClient, numbersToDataView, numberToUUID } from "@capacitor-community/bluetooth-le";

export class CapacitorBluetoothAdapter implements BluetoothAdapter {
  private deviceId: string | null = null;
  private weightCallback: ((weight: number) => void) | null = null;

  // Standard Bluetooth Weight Scale Service UUIDs (Bluetooth SIG specification)
  private readonly SERVICE_UUID = "0000181d-0000-1000-8000-00805f9b34fb";
  private readonly WEIGHT_CHARACTERISTIC_UUID = "00002a9d-0000-1000-8000-00805f9b34fb";

  async isAvailable(): Promise<boolean> {
    try {
      await BleClient.initialize();
      return true;
    } catch (error) {
      console.error("Bluetooth LE not available:", error);
      return false;
    }
  }

  async requestDevice(): Promise<BluetoothDeviceInfo> {
    // Initialize BLE
    await BleClient.initialize();

    // Request device
    const device = await BleClient.requestDevice({
      optionalServices: [this.SERVICE_UUID]
    });

    this.deviceId = device.deviceId;

    return {
      id: device.deviceId,
      name: device.name
    };
  }

  async connect(deviceInfo: BluetoothDeviceInfo): Promise<void> {
    if (!this.deviceId) {
      this.deviceId = deviceInfo.id;
    }

    await BleClient.connect(this.deviceId, (deviceId) => {
      console.log(`Device ${deviceId} disconnected`);
      this.deviceId = null;
      this.weightCallback = null;
    });
  }

  disconnect(): void {
    if (this.deviceId) {
      BleClient.disconnect(this.deviceId).catch(console.error);
      this.deviceId = null;
      this.weightCallback = null;
    }
  }

  async subscribeToWeight(callback: (weight: number) => void): Promise<void> {
    if (!this.deviceId) {
      throw new Error("Device not connected");
    }

    this.weightCallback = callback;

    // Start notifications for weight updates
    await BleClient.startNotifications(
      this.deviceId,
      this.SERVICE_UUID,
      this.WEIGHT_CHARACTERISTIC_UUID,
      (value) => {
        if (this.weightCallback) {
          // Parse weight data according to Bluetooth Weight Scale specification
          // Byte 0: Flags
          // Bytes 1-2: Weight value (uint16, little endian)
          const flags = value.getUint8(0);
          const unit = flags & 0x01; // 0 = SI (kg), 1 = Imperial (lb)
          const weightValue = value.getUint16(1, true) / (unit === 0 ? 200 : 100); // kg or lb
          this.weightCallback(weightValue);
        }
      }
    );
  }
}
