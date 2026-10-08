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
};

window.startAutomation = function () {
  if (!isWorkerDevice()) {
    updateStatus(
      "Monitor",
      "Menunggu",
      "Menunggu",
      "Monitor aktif.<br>" +
      "Menunggu Worker terhubung."
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

window.createTestTask = function () {
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

  updateProgress();

  updateStatus(
    "Berjalan",
    "Tugas masuk",
    "Bekerja",
    "Tugas video uji berhasil dibuat.<br>" +
    `ID tugas: ${task.id}<br>` +
    "Status: Menunggu diproses."
  );

  console.log(
    "Test video task:",
    task
  );

  processTask(task.id);
};

    return;
  }

  const messages =
    createTelegramTestTasks();

  const tasks =
    createTelegramTasks(messages);

  updateProgress();

  updateStatus(
    "Berjalan",
    "Tugas Telegram masuk",
    "Bekerja",
    `Tugas Telegram berhasil dibuat.<br>` +
    `Total tugas: ${tasks.length}<br>` +
    `Akun 1: ${tasks.filter(task => task.account === 1).length} video<br>` +
    `Akun 2: ${tasks.filter(task => task.account === 2).length} video`
  );

  console.log(
    "Telegram test messages:",
    messages
  );

  console.log(
    "Telegram test tasks:",
    tasks
  );

  for (const task of tasks) {
    processTask(task.id);
  }
};

  const task =
    createTestVideoTask();

  updateProgress();

  updateStatus(
    "Berjalan",
    "Tugas masuk",
    "Bekerja",
    "Tugas video uji berhasil dibuat.<br>" +
    `ID tugas: ${task.id}<br>` +
    "Status: Menunggu diproses."
  );

  console.log(
    "Test video task:",
    task
  );

  processTask(task.id);
};

async function processPendingTasks() {
  const queue = getQueue();

  const pendingTasks =
    queue.filter(
      task => task.status === "pending"
    );

  for (const task of pendingTasks) {
    if (!isWorkerDevice()) {
      return;
    }

    const state = getAppState();

    if (!state.running) {
      return;
    }

    await processTask(task.id);
  }
}

async function processTask(taskId) {
  if (!isWorkerDevice()) {
    return;
  }

  const state = getAppState();

  if (!state.running) {
    return;
  }

  const task =
    getQueue().find(
      item => item.id === taskId
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
      "Status: Processing..."
    );

    updateProgress();

    await new Promise(resolve =>
      setTimeout(resolve, 2000)
    );

    const result = {
      success: true,
      message: "Video uji berhasil diproses",
      processedAt: new Date().toISOString()
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

if (app.deviceMode) {
  updateModeUI(
    app.deviceMode
  );
}

updateProgress();
