import {
  initializeDevice
} from "./deviceController.js";

import {
  getAppState
} from "./state.js";

export function bootstrap() {
  const deviceMode = initializeDevice();
  const state = getAppState();

  return {
    deviceMode,
    state
  };
}
