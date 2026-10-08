import {
  createTask
} from "./taskManager.js";

import {
  isValidTelegramVideo
} from "./telegramFilter.js";

export function createTelegramVideoTask(video) {
  if (!isValidTelegramVideo(video)) {
    throw new Error(
      "Video Telegram tidak memenuhi aturan."
    );
  }

  return createTask({
    type: "video",
    source: "telegram",

    telegram: {
      messageId: video.messageId || null,
      chatId: video.chatId || null,
      date: video.date || null,
      fileId: video.fileId || null
    },

    title:
      video.title ||
      "Video Telegram"
  });
}

export function createTelegramVideoTasks(videos = []) {
  const tasks = [];

  for (const video of videos) {
    try {
      const task =
        createTelegramVideoTask(video);

      tasks.push(task);
    } catch {
      // Video yang tidak memenuhi aturan
      // tidak dimasukkan ke antrean.
    }
  }

  return tasks;
}
