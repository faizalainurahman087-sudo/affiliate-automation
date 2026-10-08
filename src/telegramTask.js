import {
  createTask
} from "./taskManager.js";

import {
  parseTelegramMessages
} from "./telegramFilter.js";

export function createTelegramTasks(
  messages = []
) {
  const groups =
    parseTelegramMessages(messages);

  const tasks = [];

  for (const group of groups) {
    for (const video of group.videos) {

      const task =
        createTask({
          type: "video",
          source: "telegram",

          account: group.account,

          telegram: {
            messageId:
              video.messageId || null,

            chatId:
              video.chatId || null,

            date:
              video.date || null,

            fileId:
              video.fileId || null,

            link:
              video.link || null
          },

          title:
            video.title ||
            `Video Akun ${group.account}`
        });

      tasks.push(task);
    }
  }

  return tasks;
}

export function createTelegramTasksForAccount(
  messages = [],
  accountNumber
) {
  const groups =
    parseTelegramMessages(messages);

  const group =
    groups.find(
      item =>
        item.account === accountNumber
    );

  if (!group) {
    return [];
  }

  return group.videos.map(video =>
    createTask({
      type: "video",
      source: "telegram",

      account: accountNumber,

      telegram: {
        messageId:
          video.messageId || null,

        chatId:
          video.chatId || null,

        date:
          video.date || null,

        fileId:
          video.fileId || null,

        link:
          video.link || null
      },

      title:
        video.title ||
        `Video Akun ${accountNumber}`
    })
  );
    }
