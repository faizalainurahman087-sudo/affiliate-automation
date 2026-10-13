
import { bootstrap } from "./bootstrap.js";
import {
  setDeviceRole,
  isWorkerDevice
} from "./deviceController.js";
import {
  getAppState,
  updateAppState
} from "./state.js";
import { getQueue } from "./taskQueue.js";
import {
  createTestVideoTask,
  createTelegramTestTasks,
  startTask,
  completeTask,
  failTask
} from "./taskManager.js";
import { createTelegramTasks } from "./telegramTask.js";
import {
  saveTelegramConfig,
  getTelegramStatus,
  disconnectTelegram
} from "./telegram.js";

const app = bootstrap();

const MAX_VIDEOS_PER_SESSION = 10;

let sessionProcessed = 0;
let processingQueue = false;

/* ================================
   MODE PERANGKAT
================================ */

function updateModeUI(mode) {
  const workerBtn = document.getElementById("workerBtn");
  const monitorBtn = document.getElementById("monitorBtn");
  const deviceMode = document.getElementById("deviceMode");
  const modeText = document.getElementById("modeText");

  workerBtn?.classList.toggle("active", mode === "worker");
  monitorBtn?.classList.toggle("active", mode === "monitor");
  deviceMode?.classList.toggle("active", mode === "monitor");

  if (deviceMode) {
    deviceMode.textContent =
      mode === "worker" ? "Worker" :
      mode === "monitor" ? "Monitor" : "-";
  }

  if (modeText) {
    modeText.textContent =
      mode === "worker" ? "WORKER MODE" :
      mode === "monitor" ? "MONITOR MODE" : "PILIH MODE";
  }
}

/* ================================
   STATUS DAN LOG
================================ */

function updateStatus(status, videoStatus, accountStatus, logText) {
  const statusElement = document.getElementById("status");
  const videoStatusElement = document.getElementById("videoStatus");
  const accountStatusElement = document.getElementById("accountStatus");
  const log = document.getElementById("log");

  if (statusElement) {
    statusElement.textContent = status;
  }

  if (videoStatusElement) {
    videoStatusElement.textContent = videoStatus;
  }

  if (accountStatusElement) {
    accountStatusElement.textContent = accountStatus;
  }

  if (log) {
    // Log dibuat sebagai teks agar pesan tidak ditafsirkan sebagai HTML.
    log.textContent = logText.replace(/<br\s*\/?>/gi, "\n");
  }
}

/* ================================
   PROGRES ANTREAN
================================ */

function updateProgress() {
  const queue = getQueue();

  const completed = queue.filter(
    task => task.status === "completed"
  ).length;

  const total = queue.length;

  const videoCount = document.getElementById("videoCount");
  const videoProgress = document.getElementById("videoProgress");
  const accountVideo = document.getElementById("accountVideo");

  if (videoCount) {
    videoCount.textContent = `${completed} / ${total}`;
  }

  if (accountVideo) {
    accountVideo.textContent =
      `${sessionProcessed} / ${MAX_VIDEOS_PER_SESSION}`;
  }

  if (videoProgress) {
    const percent = total > 0
      ? Math.min((completed / total) * 100, 100)
      : 0;

    videoProgress.style.width = `${percent}%`;
  }
}

/* ================================
   PILIH MODE
================================ */

window.setMode = function (mode) {
  if (mode !== "worker" && mode !== "monitor") {
    return;
  }

  try {
    // Jangan mengganti mode ketika tugas sedang diproses.
    if (processingQueue) {
      updateStatus(
        "Sedang bekerja",
        "Diproses",
        "Menunggu",
        "Tunggu sampai proses saat ini berhenti sebelum mengganti mode."
      );
      return;
    }

    setDeviceRole(mode);

    updateAppState({
      deviceMode: mode,
      connected: true,
      running: false
    });

    updateModeUI(mode);
    updateProgress();

    if (mode === "worker") {
      updateStatus(
        "Siap",
        "Menunggu",
        "Manual",
        "Worker aktif.\nSiap memproses antrean video."
      );
    } else {
      updateStatus(
        "Monitor",
        "Menunggu",
        "Manual",
        "Monitor aktif.\nPemrosesan video dilakukan di Worker."
      );
    }
  } catch (error) {
    updateStatus("Error", "Gagal", "Manual", error.message);
  }
};

/* ================================
   MULAI SESI
================================ */

window.startAutomation = function () {
  if (!isWorkerDevice()) {
    updateStatus(
      "Monitor",
      "Menunggu",
      "Manual",
      "Pilih Worker Mode pada perangkat yang memproses video."
    );
    return;
  }

  if (processingQueue) {
    updateStatus(
      "Berjalan",
      "Diproses",
      "Manual",
      "Sesi masih berjalan. Tunggu sampai selesai."
    );
    return;
  }

  sessionProcessed = 0;

  updateAppState({ running: true });

  updateStatus(
    "Berjalan",
    "Menunggu",
    "Manual",
    "Sesi dimulai.\nBatas sesi: maksimal 10 video berhasil diproses."
  );

  updateProgress();
  processPendingTasks();
};

/* ================================
   JEDA
================================ */

window.pauseAutomation = function () {
  updateAppState({ running: false });

  updateStatus(
    "Dijeda",
    "Dijeda",
    "Manual",
    "Sesi dijeda. Tugas yang belum diproses tetap berada dalam antrean."
  );

  updateProgress();
};

/* ================================
   TUGAS UJI
================================ */

window.createTestTask = function () {
  if (!isWorkerDevice()) {
    updateStatus(
      "Monitor",
      "Menunggu",
      "Manual",
      "Pilih Worker Mode terlebih dahulu."
    );
    return;
  }

  try {
    const task = createTestVideoTask();

    updateStatus(
      "Tugas dibuat",
      "Menunggu",
      "Manual",
      `Tugas uji berhasil dibuat.\nID: ${task.id}\nStatus: Menunggu`
    );

    updateProgress();

    if (getAppState().running && !processingQueue) {
      processPendingTasks();
    }
  } catch (error) {
    updateStatus("Error", "Gagal", "Manual", error.message);
  }
};

/* ================================
   UJI PARSER TELEGRAM
================================ */

window.createTelegramTest = function () {
  if (!isWorkerDevice()) {
    updateStatus(
      "Monitor",
      "Menunggu",
      "Manual",
      "Pilih Worker Mode terlebih dahulu."
    );
    return;
  }

  try {
    // Pesan simulasi untuk satu sesi, tanpa pergantian akun.
    const messages = createTelegramTestTasks();
    const tasks = createTelegramTasks(messages);

    let log = `Uji parser selesai.\nTotal tugas dibuat: ${tasks.length}\n\n`;

    tasks.forEach((task, index) => {
      log += `${index + 1}. ${task.title}\nID: ${task.id}\n\n`;
    });

    updateStatus(
      "Uji parser",
      "Tugas masuk",
      "Manual",
      log
    );

    updateProgress();

    console.log("TELEGRAM TEST TASKS:", tasks);
  } catch (error) {
    updateStatus("Error", "Gagal", "Manual", error.message);
  }
};

/* ================================
   PROSES ANTREAN
================================ */

async function processPendingTasks() {
  if (processingQueue || !isWorkerDevice()) {
    return;
  }

  processingQueue = true;

  try {
    while (
      isWorkerDevice() &&
      getAppState().running &&
      sessionProcessed < MAX_VIDEOS_PER_SESSION
    ) {
      const task = getQueue().find(
        item => item.status === "pending"
      );

      if (!task) {
        updateAppState({ running: false });

        updateStatus(
          "Antrean habis",
          "Menunggu",
          "Manual",
          `Tidak ada tugas tersisa.\nVideo berhasil diproses pada sesi ini: ${sessionProcessed}.`
        );

        break;
      }

      const succeeded = await processTask(task.id);

      if (succeeded) {
        sessionProcessed++;
        updateProgress();
      }
    }

    if (
      sessionProcessed >= MAX_VIDEOS_PER_SESSION
    ) {
      updateAppState({ running: false });

      updateStatus(
        "Sesi selesai",
        "Berhenti otomatis",
        "Ganti manual",
        "Batas 10 video tercapai.\nAplikasi berhenti otomatis.\nSilakan ganti akun Shopee secara manual, lalu tekan MULAI untuk sesi berikutnya."
      );
    } else if (!getAppState().running) {
      updateStatus(
        "Dijeda",
        "Menunggu",
        "Manual",
        `Sesi berhenti.\nVideo berhasil diproses: ${sessionProcessed}.\nTekan MULAI untuk memulai sesi baru.`
      );
    }
  } catch (error) {
    updateAppState({ running: false });

    updateStatus(
      "Error",
      "Gagal",
      "Manual",
      `Proses antrean mengalami kesalahan.\n${error.message}`
    );
  } finally {
    processingQueue = false;
    updateProgress();
  }
}

/* ================================
   PROSES SATU TUGAS
================================ */

async function processTask(taskId) {
  if (!isWorkerDevice() || !getAppState().running) {
    return false;
  }

  const task = getQueue().find(
    item => item.id === taskId
  );

  if (!task || task.status !== "pending") {
    return false;
  }

  try {
    startTask(taskId);

    updateStatus(
      "Berjalan",
      "Diproses",
      "Manual",
      `Memproses tugas.\nID: ${taskId}\nVideo sesi ini: ${sessionProcessed} / ${MAX_VIDEOS_PER_SESSION}`
    );

    updateProgress();

    // Simulasi pemrosesan yang digunakan versi saat ini.
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!getAppState().running || !isWorkerDevice()) {
      return false;
    }

    completeTask(taskId, {
      success: true,
      message: "Simulasi pemrosesan selesai",
      processedAt: new Date().toISOString()
    });

    updateProgress();
    return true;
  } catch (error) {
    failTask(taskId, error);

    updateStatus(
      "Tugas gagal",
      "Gagal",
      "Manual",
      `Tugas gagal diproses.\nID: ${taskId}\n${error.message}`
    );

    updateProgress();
    return false;
  }
}

/* ================================
   STATUS KONEKSI TELEGRAM
================================ */

window.connectTelegram = function () {
  // Tidak mengaku terhubung sebelum backend Telegram aktif.
  saveTelegramConfig({
    connected: false,
    configured: false
  });

  const status = getTelegramStatus();

  updateStatus(
    "Belum terhubung",
    "Backend diperlukan",
    "Manual",
    "Koneksi Telegram asli belum aktif.\nBot dan backend harus dikonfigurasi terlebih dahulu."
  );

  console.log("TELEGRAM STATUS:", status);
};

window.disconnectTelegram = function () {
  disconnectTelegram();

  updateStatus(
    "Telegram terputus",
    "Tidak aktif",
    "Manual",
    "Status konfigurasi Telegram lokal telah dihapus."
  );
};

/* ================================
   MULAI APLIKASI
================================ */

if (app.deviceMode) {
  updateModeUI(app.deviceMode);
}

updateProgress();
  
