import { getData, saveData } from "./storage.js";

const QUEUE_KEY = "task_queue";

export function getQueue() {
  return getData(QUEUE_KEY, []);
}

export function addTask(task) {
  const queue = getQueue();

  const newTask = {
    id: task.id || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    ...task
  };

  queue.push(newTask);
  saveData(QUEUE_KEY, queue);

  return newTask;
}

export function removeTask(taskId) {
  const queue = getQueue().filter(task => task.id !== taskId);
  saveData(QUEUE_KEY, queue);
}

export function updateTask(taskId, updates) {
  const queue = getQueue();

  const updatedQueue = queue.map(task =>
    task.id === taskId
      ? { ...task, ...updates }
      : task
  );

  saveData(QUEUE_KEY, updatedQueue);

  return updatedQueue.find(task => task.id === taskId) || null;
}

export function clearQueue() {
  saveData(QUEUE_KEY, []);
}
