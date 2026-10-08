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
export function createTestVideoTask() {
  return createTask({
    type: "video",
    source: "test",
    title: "Video Affiliate Test"
  });
}
export function createTelegramTestTasks() {
  const testMessages = [
    {
      type: "text",
      text: "Hari ini"
    },

    {
      type: "video",
      messageId: 1,
      chatId: "test",
      date: new Date().toISOString(),
      fileId: "video-1",
      link: "https://test/video-1",
      title: "Video Produk 1"
    },

    {
      type: "video",
      messageId: 2,
      chatId: "test",
      date: new Date().toISOString(),
      fileId: "video-2",
      link: "https://test/video-2",
      title: "Video Produk 2"
    },

    {
      type: "text",
      text: "."
    },

    {
      type: "text",
      text: "Akun 2"
    },

    {
      type: "video",
      messageId: 3,
      chatId: "test",
      date: new Date().toISOString(),
      fileId: "video-3",
      link: "https://test/video-3",
      title: "Video Produk Akun 2"
    }
  ];

  return testMessages;
}
