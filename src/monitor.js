import {
  isMonitor,
  getCurrentDeviceMode
} from "./deviceManager.js";

import {
  getQueue
} from "./taskQueue.js";

export function getMonitorStatus() {
  return {
    mode: getCurrentDeviceMode(),
    isMonitor: isMonitor(),
    queueLength: getQueue().length
  };
}

export function getPendingTasks() {
  if (!isMonitor()) {
    throw new Error("Perangkat bukan mode monitor");
  }

  return getQueue().filter(task => task.status === "pending");
}

export function getProcessingTasks() {
  if (!isMonitor()) {
    throw new Error("Perangkat bukan mode monitor");
  }

  return getQueue().filter(task => task.status === "processing");
}

export function getCompletedTasks() {
  if (!isMonitor()) {
    throw new Error("Perangkat bukan mode monitor");
  }

  return getQueue().filter(task => task.status === "completed");
}

export function getFailedTasks() {
  if (!isMonitor()) {
    throw new Error("Perangkat bukan mode monitor");
  }

  return getQueue().filter(task => task.status === "failed");
}
