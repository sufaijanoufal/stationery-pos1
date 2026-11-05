
const API_BASE = "/api";

export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  // Support both "/api/users" and "http://localhost:5000/api/users"
  const apiUrl = url.startsWith("http://localhost:5000/api/")
    ? url.replace("http://localhost:5000/api", API_BASE)
    : url;

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(apiUrl, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Check your connection and try again."
    );
  }

  if (response.status === 401 && apiUrl !== "/api/users/login") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";

    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    let message = "Request failed. Please try again.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response;
};
