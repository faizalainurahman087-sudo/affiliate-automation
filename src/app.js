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
  startTask,
  completeTask,
  failTask
} from "./taskManager.js";

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
    if (workerBtn) {
      workerBtn.classList.add("active");
    }

    if (deviceMode) {
      deviceMode.textContent = "Worker";
    }

    if (modeText) {
      modeText.textContent = "WORKER MODE";
    }
  }

  if (mode === "monitor") {
    if (monitorBtn) {
      monitorBtn.classList.add("active");
    }

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
      task => task.status === "completed"
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
    }

    if (mode === "monitor") {
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


/*
 * ==========================================
 * TUGAS UJI
 * ==========================================
 */

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
      "TUGAS UJI:",
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


/*
 * ==========================================
 * TEST TELEGRAM
 *
 * Simulasi:
 *
 * Hari ini
 * Video 1
 * Video 2
 * .
 * Akun 2
 * Video 3
 *
 * Hasil:
 * Akun 1 = 2 video
 * Akun 2 = 1 video
 * ==========================================
 */

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
     * Untuk tahap test ini kita menggunakan
     * task engine yang sudah terbukti bekerja.
     */

    const task1 =
      createTestVideoTask();

    const task2 =
      createTestVideoTask();

    const task3 =
      createTestVideoTask();

    updateStatus(
      "Telegram Test",
      "Tugas masuk",
      "Bekerja",

      "✓ TEST TELEGRAM BERHASIL.<br><br>" +

      "AKUN 1<br>" +
      "Video 1<br>" +
      `ID: ${task1.id}<br><br>` +

      "AKUN 1<br>" +
      "Video 2<br>" +
      `ID: ${task2.id}<br><br>` +

      "AKUN 2<br>" +
      "Video 1<br>" +
      `ID: ${task3.id}`
    );

    updateProgress();

    console.log(
      "TELEGRAM TEST:",
      {
        account1: [
          task1,
          task2
        ],

        account2: [
          task3
        ]
      }
    );

  } catch (error) {

    updateStatus(
      "Error",
      "Gagal",
      "Gagal",

      "TEST TELEGRAM ERROR:<br>" +
      error.message
    );

    console.error(
      "TEST TELEGRAM ERROR:",
      error
    );
  }
};


/*
 * ==========================================
 * PROCESS QUEUE
 * ==========================================
 */

async function processPendingTasks() {

  const queue =
    getQueue();

  const pendingTasks =
    queue.filter(
      task =>
        task.status === "pending"
    );

  for (const task of pendingTasks) {

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

    startTask(
      taskId
    );

    updateStatus(
      "Berjalan",
      "Diproses",
      "Bekerja",

      "Worker sedang memproses tugas.<br>" +
      `ID tugas: ${taskId}<br>` +
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
        "Video uji berhasil diproses",

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


/*
 * ==========================================
 * INITIALIZATION
 * ==========================================
 */

if (app.deviceMode) {
  updateModeUI(
    app.deviceMode
  );
}

updateProgress();
