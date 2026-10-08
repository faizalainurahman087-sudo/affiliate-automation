const PREFIX = "affiliate_automation_";

export function saveData(key, value) {
  localStorage.setItem(
    PREFIX + key,
    JSON.stringify(value)
  );
}

export function getData(key, fallback = null) {
  const value = localStorage.getItem(PREFIX + key);

  if (value === null) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function removeData(key) {
  localStorage.removeItem(PREFIX + key);
}
