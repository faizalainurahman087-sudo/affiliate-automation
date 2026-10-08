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
  createTestVideoTask
} from "./taskManager.js";

const app = bootstrap();

function updateModeUI(mode) {
  const workerBtn = document.getElementById("workerBtn");
  const monitorBtn = document.getElementById("monitorBtn");
  const deviceMode = document.getElementById("deviceMode");
  const modeText = document.getElementById("modeText");

  if (workerBtn) workerBtn.classList.remove("active");
  if (monitorBtn) monitorBtn.classList.remove("active");

  if (mode === "worker") {
    if (workerBtn) workerBtn.classList.add("active");
    if (deviceMode) deviceMode.textContent = "Worker";
    if (modeText) modeText.textContent = "WORKER MODE";
  }

  if (mode === "monitor") {
    if (monitorBtn) monitorBtn.classList.add("active");
    if (deviceMode) deviceMode.textContent = "Monitor";
    if (modeText) modeText.textContent = "MONITOR MODE";
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
    "Sistem siap menerima dan memproses " +
    "antrean video."
  );

  updateProgress();

  console.log(
    "Worker berjalan",
    getAppState()
  );
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
      "Perangkat harus berada dalam " +
      "Worker Mode."
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
    `ID tugas: ${task.id}`
  );

  console.log(
    "Test video task:",
    task
  );
};

if (app.deviceMode) {
  updateModeUI(
    app.deviceMode
  );
}

updateProgress();
