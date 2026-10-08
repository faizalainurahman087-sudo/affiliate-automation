export const ROLES = {
  WORKER: "worker",
  MONITOR: "monitor"
};

export function isValidRole(role) {
  return role === ROLES.WORKER || role === ROLES.MONITOR;
}

export function getRoleLabel(role) {
  if (role === ROLES.WORKER) {
    return "Worker";
  }

  if (role === ROLES.MONITOR) {
    return "Monitor";
  }

  return "Unknown";
}
