// Bluetooth adapter interface for cross-platform support
export interface BluetoothAdapter {
  requestDevice(): Promise<BluetoothDeviceInfo>;
  connect(device: BluetoothDeviceInfo): Promise<void>;
  disconnect(): void;
  subscribeToWeight(callback: (weight: number) => void): Promise<void>;
  isAvailable(): Promise<boolean>;
}

export interface BluetoothDeviceInfo {
  id: string;
  name?: string;
}

export interface BluetoothConnectionCallbacks {
  onWeightChange: (weight: number) => void;
  onDisconnect: () => void;
}
