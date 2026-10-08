export const TASK_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed"
};

export function isValidTaskStatus(status) {
  return Object.values(TASK_STATUS).includes(status);
}

export function getTaskStatusLabel(status) {
  switch (status) {
    case TASK_STATUS.PENDING:
      return "Menunggu";

    case TASK_STATUS.PROCESSING:
      return "Diproses";

    case TASK_STATUS.COMPLETED:
      return "Selesai";

    case TASK_STATUS.FAILED:
      return "Gagal";

    default:
      return "Tidak diketahui";
  }
}
