import {
  addTask,
  getQueue,
  updateTask,
  removeTask
} from "./taskQueue.js";

import {
  TASK_STATUS
} from "./taskStatus.js";

export function createTask(data = {}) {
  return addTask({
    ...data,
    status: TASK_STATUS.PENDING
  });
}

export function getPendingTasks() {
  return getQueue().filter(
    task => task.status === TASK_STATUS.PENDING
  );
}

export function startTask(taskId) {
  return updateTask(taskId, {
    status: TASK_STATUS.PROCESSING
  });
}

export function completeTask(taskId, result = null) {
  return updateTask(taskId, {
    status: TASK_STATUS.COMPLETED,
    result
  });
}

export function failTask(taskId, error) {
  return updateTask(taskId, {
    status: TASK_STATUS.FAILED,
    error: error?.message || String(error)
  });
}

export function deleteTask(taskId) {
  removeTask(taskId);
}
