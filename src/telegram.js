const TELEGRAM_CONFIG_KEY =
  "affiliate_automation_telegram";

export function getTelegramConfig() {
  const saved =
    localStorage.getItem(TELEGRAM_CONFIG_KEY);

  if (!saved) {
    return {
      connected: false,
      configured: false
    };
  }

  try {
    return JSON.parse(saved);
  } catch {
    return {
      connected: false,
      configured: false
    };
  }
}

export function saveTelegramConfig(config) {
  const newConfig = {
    connected: false,
    configured: false,
    ...config
  };

  localStorage.setItem(
    TELEGRAM_CONFIG_KEY,
    JSON.stringify(newConfig)
  );

  return newConfig;
}

export function disconnectTelegram() {
  localStorage.removeItem(
    TELEGRAM_CONFIG_KEY
  );

  return {
    connected: false,
    configured: false
  };
}

export function isTelegramConnected() {
  return getTelegramConfig().connected === true;
}

export function getTelegramStatus() {
  const config =
    getTelegramConfig();

  return {
    connected: config.connected === true,
    configured: config.configured === true
  };
}
