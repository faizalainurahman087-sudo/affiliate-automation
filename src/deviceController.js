import {
  getCurrentDeviceMode,
  configureDevice,
  removeDeviceMode
} from "./deviceManager.js";

import {
  ROLES,
  isValidRole
} from "./roles.js";

import {
  updateAppState
} from "./state.js";

export function initializeDevice() {
  const mode = getCurrentDeviceMode();

  updateAppState({
    deviceMode: mode,
    connected: mode !== null
  });

  return mode;
}

export function setDeviceRole(role) {
  if (!isValidRole(role)) {
    throw new Error("Role perangkat tidak valid");
  }

  const mode = configureDevice(role);

  updateAppState({
    deviceMode: mode,
    connected: true
  });

  return mode;
}

export function clearDeviceRole() {
  removeDeviceMode();

  updateAppState({
    deviceMode: null,
    connected: false,
    running: false
  });
}

export function isWorkerDevice() {
  return getCurrentDeviceMode() === ROLES.WORKER;
}

export function isMonitorDevice() {
  return getCurrentDeviceMode() === ROLES.MONITOR;
}
