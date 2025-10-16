/// <reference path="../../types/bluetooth.d.ts" />
import { BluetoothAdapter, BluetoothDeviceInfo } from "./BluetoothAdapter";

export class WebBluetoothAdapter implements BluetoothAdapter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private weightCallback: ((weight: number) => void) | null = null;

  async isAvailable(): Promise<boolean> {
    return 'bluetooth' in navigator;
  }

  async requestDevice(): Promise<BluetoothDeviceInfo> {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['battery_service', 'device_information']
    });

    this.device = device;

    return {
      id: device.id,
      name: device.name
    };
  }

  async connect(deviceInfo: BluetoothDeviceInfo): Promise<void> {
    if (!this.device) {
      throw new Error("No device selected");
    }

    const server = await this.device.gatt?.connect();
    if (!server) {
      throw new Error("Failed to connect to GATT server");
    }
  }

  disconnect(): void {
    if (this.characteristic) {
      this.characteristic.stopNotifications().catch(console.error);
    }
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
    this.weightCallback = null;
  }

  async subscribeToWeight(callback: (weight: number) => void): Promise<void> {
    if (!this.device?.gatt?.connected) {
      throw new Error("Device not connected");
    }

    this.weightCallback = callback;

    try {
      // Try to get weight characteristic
      // Replace these UUIDs with your actual scale's service and characteristic UUIDs
      const service = await this.device.gatt.getPrimaryService("00001234-0000-1000-8000-00805f9b34fb");
      const char = await service.getCharacteristic("00005678-0000-1000-8000-00805f9b34fb");
      
      this.characteristic = char;
      
      // Start notifications for weight updates
      await char.startNotifications();
      char.addEventListener('characteristicvaluechanged', this.handleWeightChange.bind(this));
    } catch (e) {
      console.warn("Could not subscribe to weight characteristic:", e);
      // If the scale doesn't support notifications, you might need to poll
      throw new Error("Scale does not support weight notifications");
    }
  }

  private handleWeightChange(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (value && this.weightCallback) {
      // Parse weight data (format depends on your scale)
      const weightValue = value.getFloat32(0, true);
      this.weightCallback(weightValue);
    }
  }
}
