import { BluetoothAdapter } from "./BluetoothAdapter";
import { WebBluetoothAdapter } from "./WebBluetoothAdapter";
import { CapacitorBluetoothAdapter } from "./CapacitorBluetoothAdapter";
import { Capacitor } from "@capacitor/core";

export class BluetoothFactory {
  static createAdapter(): BluetoothAdapter {
    // Check if running in Capacitor native environment
    if (Capacitor.isNativePlatform()) {
      return new CapacitorBluetoothAdapter();
    } else {
      return new WebBluetoothAdapter();
    }
  }
}
