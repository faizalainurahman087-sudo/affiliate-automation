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
  startTask,
  completeTask,
  failTask
} from "./taskManager.js";
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
      mode === "monitor" ? "MONITOR MODE" :
      "PILIH MODE";
  }
}

/* ================================
   STATUS APLIKASI
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
    log.textContent = logText;
  }
}

/* ================================
   PROGRES
================================ */

function updateProgress() {
  const queue = getQueue();

  const completed = queue.filter(
    task => task.status === "completed"
  ).length;

  const videoCount = document.getElementById("videoCount");
  const videoProgress = document.getElementById("videoProgress");
  const accountVideo = document.getElementById("accountVideo");

  if (videoCount) {
    videoCount.textContent = `${completed} / ${queue.length}`;
  }

  if (accountVideo) {
    accountVideo.textContent =
      `${sessionProcessed} / ${MAX_VIDEOS_PER_SESSION}`;
  }

  if (videoProgress) {
    const percent = queue.length
      ? Math.min((completed / queue.length) * 100, 100)
      : 0;

    videoProgress.style.width = `${percent}%`;
  }
}

/* ================================
   MODE WORKER / MONITOR
================================ */

window.setMode = function (mode) {
  if (mode !== "worker" && mode !== "monitor") return;

  if (processingQueue) {
    updateStatus(
      "Sedang bekerja",
      "Diproses",
      "Manual",
      "Tunggu sampai tugas saat ini selesai sebelum mengganti mode."
    );
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
    updateProgress();

    updateStatus(
      mode === "worker" ? "Siap" : "Monitor",
      "Menunggu",
      "Manual",
      mode === "worker"
        ? "Worker aktif.\nSiap menerima tugas video."
        : "Monitor aktif.\nPergantian akun Shopee dilakukan secara manual."
    );
  } catch (error) {
    updateStatus("Error", "Gagal", "Manual", error.message);
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
      "Manual",
      "Pilih Worker Mode pada perangkat pemroses."
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
    "Memulai",
    "Manual",
    "Sesi dimulai.\nMaksimal 10 video berhasil diproses.\nTidak ada pergantian akun otomatis."
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
    "Sesi dijeda.\nTugas yang belum dimulai tetap menunggu."
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
      `Tugas uji berhasil dibuat.\nID tugas: ${task.id}\nStatus: Menunggu`
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
   TEST VIDEO
   TANPA PEMBAGIAN AKUN
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
    // Membuat 3 tugas video uji biasa.
    // Tidak ada parser Akun 1 / Akun 2.
    const tasks = [];

    for (let i = 0; i < 3; i++) {
      tasks.push(createTestVideoTask());
    }

    let log = `Uji tugas selesai.\nTotal tugas uji: ${tasks.length}\n\n`;

    tasks.forEach((task, index) => {
      log += `Video uji ${index + 1}\n`;
      log += `ID: ${task.id}\n`;
      log += "Status: Menunggu\n\n";
    });

    updateStatus(
      "Uji tugas",
      "Tugas dibuat",
      "Manual",
      log
    );

    updateProgress();
    console.log("VIDEO TEST TASKS:", tasks);
  } catch (error) {
    updateStatus("Error", "Gagal", "Manual", error.message);
  }
};

/* ================================
   PROSES ANTREAN
================================ */

async function processPendingTasks() {
  if (processingQueue || !isWorkerDevice()) return;

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
          `Tidak ada tugas tersisa.\nVideo berhasil pada sesi ini: ${sessionProcessed}.`
        );
        break;
      }

      const succeeded = await processTask(task.id);

      if (succeeded) {
        sessionProcessed++;
        updateProgress();
      }
    }

    if (sessionProcessed >= MAX_VIDEOS_PER_SESSION) {
      updateAppState({ running: false });

      updateStatus(
        "Sesi selesai",
        "Berhenti otomatis",
        "Ganti manual",
        "Batas 10 video tercapai.\nAplikasi berhenti otomatis.\nGanti akun Shopee sendiri, lalu tekan MULAI untuk sesi berikutnya."
      );
    }
  } catch (error) {
    updateAppState({ running: false });

    updateStatus(
      "Error",
      "Gagal",
      "Manual",
      `Terjadi kesalahan:\n${error.message}`
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
      `Memproses tugas uji.\nID: ${taskId}\nProgres sesi: ${sessionProcessed}/${MAX_VIDEOS_PER_SESSION}`
    );

    updateProgress();

    // Simulasi saat ini, bukan pemrosesan video asli.
    await new Promise(resolve => setTimeout(resolve, 2000));

    completeTask(taskId, {
      success: true,
      message: "Simulasi selesai",
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
      `ID tugas: ${taskId}\nError: ${error.message}`
    );

    updateProgress();
    return false;
  }
}

/* ================================
   TELEGRAM
================================ */

window.connectTelegram = function () {
  saveTelegramConfig({
    connected: false,
    configured: false
  });

  getTelegramStatus();

  updateStatus(
    "Belum terhubung",
    "Backend diperlukan",
    "Manual",
    "Telegram belum terhubung secara nyata.\nBackend dan bot perlu dikonfigurasi terlebih dahulu."
  );
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
      
