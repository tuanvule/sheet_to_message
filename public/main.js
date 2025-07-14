import { RenderFormRequest } from "./script/renderFormRequest.js";

const renderHandler = new RenderFormRequest();
await renderHandler.init();
renderHandler.render();
console.log(renderHandler.getAll());

const accessToken = localStorage.getItem("accessToken")
console.log(accessToken)

export async function fetchWithAuth(url, options = { method: "GET"}) {
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
    const refreshRes = await fetch("/refresh_token", {
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




const session = await fetchWithAuth("http://127.0.0.1:3092/get_sessionId")

console.log()