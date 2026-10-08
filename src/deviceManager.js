import {
  getDeviceMode,
  setDeviceMode,
  clearDeviceMode
} from "./device.js";

export function isWorker() {
  return getDeviceMode() === "worker";
}

export function isMonitor() {
  return getDeviceMode() === "monitor";
}

export function configureDevice(mode) {
  return setDeviceMode(mode);
}

export function removeDeviceMode() {
  clearDeviceMode();
}

export function getCurrentDeviceMode() {
  return getDeviceMode();
}
