import {
  isWorker,
  getCurrentDeviceMode
} from "./deviceManager.js";

import {
  getQueue,
  updateTask
} from "./taskQueue.js";

export function getWorkerStatus() {
  return {
    mode: getCurrentDeviceMode(),
    isWorker: isWorker(),
    queueLength: getQueue().length
  };
}

export async function processNextTask(handler) {
  if (!isWorker()) {
    throw new Error("Perangkat bukan mode worker");
  }

  const queue = getQueue();
  const task = queue.find(item => item.status === "pending");

  if (!task) {
    return null;
  }

  updateTask(task.id, {
    status: "processing"
  });

  try {
    const result = await handler(task);

    updateTask(task.id, {
      status: "completed",
      result
    });

    return result;
  } catch (error) {
    updateTask(task.id, {
      status: "failed",
      error: error.message
    });

    throw error;
  }
}
