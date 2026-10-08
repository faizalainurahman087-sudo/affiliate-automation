import {
  bootstrap
} from "./bootstrap.js";

import {
  setDeviceRole,
  isWorkerDevice
} from "./deviceController.js";

import {
  getAppState,
  updateAppState
} from "./state.js";

import {
  getQueue
} from "./taskQueue.js";

import {
  createTestVideoTask,
  createTelegramTestTasks,
  startTask,
  completeTask,
  failTask
} from "./taskManager.js";

import {
  createTelegramTasks
} from "./telegramTask.js";

const app = bootstrap();

function updateModeUI(mode) {
  const workerBtn =
    document.getElementById("workerBtn");

  const monitorBtn =
    document.getElementById("monitorBtn");

  const deviceMode =
    document.getElementById("deviceMode");

  const modeText =
    document.getElementById("modeText");

  if (workerBtn) {
    workerBtn.classList.remove("active");
  }

  if (monitorBtn) {
    monitorBtn.classList.remove("active");
  }

  if (deviceMode) {
    deviceMode.classList.remove("active");
  }

  if (mode === "worker") {
    workerBtn?.classList.add("active");

    if (deviceMode) {
      deviceMode.textContent = "Worker";
    }

    if (modeText) {
      modeText.textContent = "WORKER MODE";
    }
  }

  if (mode === "monitor") {
    monitorBtn?.classList.add("active");

    if (deviceMode) {
      deviceMode.classList.add("active");
      deviceMode.textContent = "Monitor";
    }

    if (modeText) {
      modeText.textContent = "MONITOR MODE";
    }
  }
}

function updateStatus(
  status,
  videoStatus,
  accountStatus,
  logText
) {
  const statusElement =
    document.getElementById("status");

  const videoStatusElement =
    document.getElementById("videoStatus");

  const accountStatusElement =
    document.getElementById("accountStatus");

  const log =
    document.getElementById("log");

  if (statusElement) {
    statusElement.innerHTML =
      `<span class="dot"></span> ${status}`;
  }

  if (videoStatusElement) {
    videoStatusElement.textContent =
      videoStatus;
  }

  if (accountStatusElement) {
    accountStatusElement.textContent =
      accountStatus;
  }

  if (log) {
    log.innerHTML = logText;
  }
}

function updateProgress() {
  const queue = getQueue();

  const completed =
    queue.filter(
      task =>
        task.status === "completed"
    ).length;

  const total =
    Math.max(queue.length, 10);

  const videoCount =
    document.getElementById("videoCount");

  const videoProgress =
    document.getElementById("videoProgress");

  const accountVideo =
    document.getElementById("accountVideo");

  if (videoCount) {
    videoCount.textContent =
      `${completed} / ${total}`;
  }

  if (accountVideo) {
    accountVideo.textContent =
      `${completed} / ${total}`;
  }

  if (videoProgress) {
    const percent =
      Math.min(
        (completed / total) * 100,
        100
      );

    videoProgress.style.width =
      `${percent}%`;
  }
}


/* ================================
   MODE PERANGKAT
================================ */

window.setMode = function (mode) {
  if (
    mode !== "worker" &&
    mode !== "monitor"
  ) {
    return;
  }

  try {
    setDeviceRole(mode);

    updateAppState({
      deviceMode: mode,
      connected: true,
      running: false
    });

    updateModeUI(mode);

    if (mode === "worker") {
      updateStatus(
        "Siap",
        "Menunggu",
        "Siap",
        "Worker aktif.<br>" +
        "Siap menerima antrean video."
      );
    } else {
      updateStatus(
        "Monitor",
        "Menunggu",
        "Menunggu",
        "Monitor aktif.<br>" +
        "Menunggu Worker terhubung."
      );
    }

    updateProgress();

  } catch (error) {
    updateStatus(
      "Error",
      "Gagal",
      "Gagal",
      "Gagal mengubah mode.<br>" +
      error.message
    );
  }
};


/* ================================
   MULAI
================================ */

window.startAutomation = function () {
  if (!isWorkerDevice()) {
    updateStatus(
      "Monitor",
      "Menunggu",
      "Menunggu",
      "Perangkat harus berada dalam Worker Mode."
    );

    return;
  }

  updateAppState({
    running: true
  });

  updateStatus(
    "Berjalan",
    "Berjalan",
    "Bekerja",
    "Worker dimulai.<br>" +
    "Sistem siap memproses antrean video."
  );

  updateProgress();

  processPendingTasks();
};


/* ================================
   JEDA
================================ */

window.pauseAutomation = function () {
  updateAppState({
    running: false
  });

  updateStatus(
    "Dijeda",
    "Dijeda",
    "Dijeda",
    "Automation dijeda.<br>" +
    "Tidak ada proses baru yang dijalankan."
  );

  updateProgress();
};


/* ================================
   TUGAS UJI
================================ */

window.createTestTask = function () {
  try {
    if (!isWorkerDevice()) {
      updateStatus(
        "Monitor",
        "Menunggu",
        "Menunggu",
        "Perangkat harus berada dalam Worker Mode."
      );

      return;
    }

    const task =
      createTestVideoTask();

    updateStatus(
      "Berjalan",
      "Tugas masuk",
      "Bekerja",
      "TUGAS UJI BERHASIL DIBUAT.<br>" +
      `ID tugas: ${task.id}<br>` +
      "Status: Menunggu diproses."
    );

    updateProgress();

    console.log(
      "TEST TASK:",
      task
    );

    if (getAppState().running) {
      processTask(task.id);
    }

  } catch (error) {
    updateStatus(
      "Error",
      "Gagal",
      "Gagal",
      "TUGAS UJI ERROR:<br>" +
      error.message
    );

    console.error(
      "TUGAS UJI ERROR:",
      error
    );
  }
};


/* ================================
   TEST TELEGRAM SEBENARNYA
================================ */

window.createTelegramTest = function () {
  try {
    if (!isWorkerDevice()) {
      updateStatus(
        "Monitor",
        "Menunggu",
        "Menunggu",
        "Perangkat harus berada dalam Worker Mode."
      );

      return;
    }

    /*
     * Membuat pesan Telegram simulasi:
     *
     * Hari ini
     * Video 1
     * Video 2
     * .
     * Akun 2
     * Video 3
     */

    const messages =
      createTelegramTestTasks();

    /*
     * Parser Telegram membaca struktur
     * dan menentukan akun masing-masing.
     */

    const tasks =
      createTelegramTasks(messages);

    const account1 =
      tasks.filter(
        task =>
          task.account === 1
      );

    const account2 =
      tasks.filter(
        task =>
          task.account === 2
      );

    let log =
      "✓ TELEGRAM PARSER BERHASIL.<br><br>" +

      `Total tugas: ${tasks.length}<br>` +

      `Akun 1: ${account1.length} video<br>` +

      `Akun 2: ${account2.length} video<br><br>`;

    tasks.forEach(
      (task, index) => {

        log +=
          `${index + 1}. ` +

          `Akun ${task.account}<br>` +

          `${task.title}<br>` +

          `ID: ${task.id}<br><br>`;
      }
    );

    updateStatus(
      "Telegram Test",
      "Tugas masuk",
      "Bekerja",
      log
    );

    updateProgress();

    console.log(
      "TELEGRAM MESSAGES:",
      messages
    );

    console.log(
      "TELEGRAM TASKS:",
      tasks
    );

  } catch (error) {

    updateStatus(
      "Error",
      "Gagal",
      "Gagal",

      "TELEGRAM PARSER ERROR:<br>" +
      error.message
    );

    console.error(
      "TELEGRAM PARSER ERROR:",
      error
    );
  }
};


/* ================================
   PROCESS ANTREAN
================================ */

async function processPendingTasks() {

  const queue =
    getQueue();

  const pendingTasks =
    queue.filter(
      task =>
        task.status === "pending"
    );

  for (
    const task of pendingTasks
  ) {

    if (!isWorkerDevice()) {
      return;
    }

    if (!getAppState().running) {
      return;
    }

    await processTask(
      task.id
    );
  }
}


/* ================================
   PROCESS SATU TASK
================================ */

async function processTask(taskId) {

  if (!isWorkerDevice()) {
    return;
  }

  if (!getAppState().running) {
    return;
  }

  const task =
    getQueue().find(
      item =>
        item.id === taskId
    );

  if (!task) {
    return;
  }

  try {

    startTask(taskId);

    updateStatus(
      "Berjalan",
      "Diproses",
      "Bekerja",

      "Worker sedang memproses tugas.<br>" +

      `ID tugas: ${taskId}<br>` +

      `Akun: ${task.account || "-"}<br>` +

      "Status: Processing..."
    );

    updateProgress();

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          2000
        )
    );

    const result = {
      success: true,

      message:
        "Video berhasil diproses",

      account:
        task.account || null,

      processedAt:
        new Date().toISOString()
    };

    completeTask(
      taskId,
      result
    );

    updateStatus(
      "Berjalan",
      "Selesai",
      "Bekerja",

      "Tugas video berhasil diselesaikan.<br>" +

      `ID tugas: ${taskId}<br>` +

      `Akun: ${task.account || "-"}<br>` +

      "Status: Completed."
    );

    updateProgress();

  } catch (error) {

    failTask(
      taskId,
      error
    );

    updateStatus(
      "Berjalan",
      "Gagal",
      "Bekerja",

      "Tugas video gagal diproses.<br>" +

      `ID tugas: ${taskId}<br>` +

      `Error: ${error.message}`
    );

    updateProgress();
  }
}


/* ================================
   START APP
================================ */

if (app.deviceMode) {
  updateModeUI(
    app.deviceMode
  );
}

updateProgress();
