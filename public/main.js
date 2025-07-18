import { popupNotification } from "./script/popupNotification.js";
import { RenderFormRequest } from "./script/renderFormRequest.js";

// const renderHandler = new RenderFormRequest();
// await renderHandler.init();
// renderHandler.render();
// console.log(renderHandler.getAll());

export async function fetchWithAuth(url, options = { method: "GET"}) {
  console.log(options)
  const accessToken = localStorage.getItem("accessToken")
  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`
    },
    credentials: "include"
  });

  if (res.status === 401) {
    // 🔑 Token expired, call refresh
    const refreshRes = await fetch("/api/refresh_token", {
      method: "POST",
      credentials: "include"
    });
    const refreshData = await refreshRes.json();
    accessToken = refreshData.accessToken;

    // Retry original request with new token
    res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${accessToken}`
      },
      credentials: "include"
    });
  }

  return res;
}

export function logOut() {
  
}
