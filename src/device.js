const DEVICE_KEY = "affiliate_automation_device";

export function getDeviceMode() {
  return localStorage.getItem(DEVICE_KEY) || null;
}

export function setDeviceMode(mode) {
  if (mode !== "worker" && mode !== "monitor") {
    throw new Error("Mode perangkat tidak valid");
  }

  localStorage.setItem(DEVICE_KEY, mode);
  return mode;
}

export function clearDeviceMode() {
  localStorage.removeItem(DEVICE_KEY);
}
