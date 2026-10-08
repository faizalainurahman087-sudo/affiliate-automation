import { getData, saveData } from "./storage.js";

const STATE_KEY = "app_state";

const DEFAULT_STATE = {
  deviceMode: null,
  connected: false,
  running: false
};

export function getAppState() {
  return getData(STATE_KEY, { ...DEFAULT_STATE });
}

export function updateAppState(updates) {
  const currentState = getAppState();

  const newState = {
    ...currentState,
    ...updates
  };

  saveData(STATE_KEY, newState);

  return newState;
}

export function resetAppState() {
  saveData(STATE_KEY, { ...DEFAULT_STATE });
  return getAppState();
}
