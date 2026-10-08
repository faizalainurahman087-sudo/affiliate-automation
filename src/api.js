const API_BASE_URL = "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API request gagal: ${response.status}`);
  }

  return response.json();
}

export async function checkHealth() {
  return request("/health");
}

export async function getStatus() {
  return request("/api/status");
}

export async function sendTask(task) {
  return request("/api/task", {
    method: "POST",
    body: JSON.stringify(task)
  });
}
