const listeners = {};

export function on(eventName, callback) {
  if (!listeners[eventName]) {
    listeners[eventName] = [];
  }

  listeners[eventName].push(callback);

  return () => {
    listeners[eventName] = listeners[eventName].filter(
      listener => listener !== callback
    );
  };
}

export function emit(eventName, data = null) {
  const eventListeners = listeners[eventName] || [];

  eventListeners.forEach(callback => {
    callback(data);
  });
}

export function clearEvent(eventName) {
  delete listeners[eventName];
}
