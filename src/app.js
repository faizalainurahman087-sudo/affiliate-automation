import {
  bootstrap
} from "./bootstrap.js";

import {
  setDeviceRole,
  clearDeviceRole,
  isWorkerDevice,
  isMonitorDevice
} from "./deviceController.js";

import {
  getAppState
} from "./state.js";

const app = bootstrap();

function updateModeUI(mode) {
  const workerBtn = document.getElementById("workerBtn");
  const monitorBtn = document.getElementById("monitorBtn");
  const deviceMode = document.getElementById("deviceMode");
  const modeText = document.getElementById("modeText");

  if (!workerBtn || !monitorBtn) return;

  workerBtn.classList.remove("active");
  monitorBtn.classList.remove("active");

  if (mode === "worker") {
    workerBtn.classList.add("active");
    deviceMode.textContent = "Worker";
    modeText.textContent = "WORKER MODE";
  } else if (mode === "monitor") {
    monitorBtn.classList.add("active");
    deviceMode.textContent = "Monitor";
    modeText.textContent = "MONITOR MODE";
  }
}

window.setMode = function (mode) {
  setDeviceRole(mode);
  updateModeUI(mode);

  const log = document.getElementById("log");

  if (log) {
    log.innerHTML =
      mode === "worker"
        ? "Perangkat diatur sebagai Worker.<br>Siap menerima tugas."
        : "Perangkat diatur sebagai Monitor.<br>Menunggu Worker terhubung.";
  }
};

window.startAutomation = function () {
  const state = getAppState();

  if (!isWorkerDevice()) {
    const log = document.getElementById("log");

    if (log) {
      log.innerHTML =
        "Monitor aktif.<br>Menunggu Worker terhubung.";
    }

    return;
  }

  const status = document.getElementById("status");
  const videoStatus = document.getElementById("videoStatus");
  const accountStatus = document.getElementById("accountStatus");
  const log = document.getElementById("log");

  if (status) {
    status.innerHTML =
      '<span class="dot"></span> Berjalan';
  }

  if (videoStatus) {
    videoStatus.textContent = "Berjalan";
  }

  if (accountStatus) {
    accountStatus.textContent = "Bekerja";
  }

  if (log) {
    log.innerHTML =
      "Worker dimulai.<br>" +
      "Menunggu antrean video.";
  }

  console.log("Affiliate Automation started", state);
};

window.pauseAutomation = function () {
  const status = document.getElementById("status");
  const videoStatus = document.getElementById("videoStatus");
  const accountStatus = document.getElementById("accountStatus");
  const log = document.getElementById("log");

  if (status) {
    status.innerHTML =
      '<span class="dot"></span> Dijeda';
  }

  if (videoStatus) {
    videoStatus.textContent = "Dijeda";
  }

  if (accountStatus) {
    accountStatus.textContent = "Dijeda";
  }

  if (log) {
    log.innerHTML =
      "Automation dijeda.<br>" +
      "Tidak ada proses baru yang dijalankan.";
  }
};

if (app.deviceMode) {
  updateModeUI(app.deviceMode);
      }
