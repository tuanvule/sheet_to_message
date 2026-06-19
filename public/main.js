import { popupNotification } from "./script/popupNotification.js";
import { RenderFormRequestHandler } from "./script/renderFormRequestHandler.js";
import { fetchWithAuth } from "./script/uti/func.js";

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const renderFormRequestHandler = new RenderFormRequestHandler()

const login_btn = $(".navbar_btns-login")
const logout_btn = $(".navbar_btns-logout")
const signup_btn = $(".navbar_btns-signup")

// console.log(login_btn)

// const renderHandler = new RenderFormRequest();
// await renderHandler.init();
// renderHandler.render();
// console.log(renderHandler.getAll());

  // var payload = {
  //   type: "NSP",
  //   info: {
  //     rowData: {},
  //     headerData: {},
  //   },
  //   formId: "NHH_csvc",
  // };

  // var options = {
  //   method: "POST",
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(payload),
  // };

  // var response = UrlFetchApp.fetch("https://sheet-to-message.vercel.app//webhook/NHH", options);
  // Logger.log(response.getContentText());
  // var response = fetchWithAuth("http://127.0.0.1:3092/api/webhook/NHH", options);

// const response = await fetchWithAuth("/api/get-form-request")
// const data = await response.json()
// if(response.status !== 500) {
//   console.log(data)
//   try {
//     // data.forms_request.csvc.forEach(request => {
//       // if(request.submitData.headerData.length === 0) return
//       // document.querySelector("body").innerHTML += `<div>${request.submitData.rowData}</div>`
//     // });
//   } catch(err) {
//     console.log(err)
//   }
// } else {
//   popupNotification.Init()
//   popupNotification.Fail(data.message)
// }
// navigator.setAppBadge(10);
let userState = null
const res = await fetchWithAuth("/api/verify_token")
if(res.status === 200) {
  userState = await res.json()
  if(userState) {
    login_btn.style.display = "none";
    signup_btn.style.display = "none";
    logout_btn.style.display = "block";
    renderFormRequestHandler.Init()
  } else {
    login_btn.style.display = "block";
    signup_btn.style.display = "none";
    // signup_btn.style.display = "block";
    logout_btn.style.display = "none";
  }
}

logout_btn.onclick = () => {
  popupNotification.Init("YESNO")
  popupNotification.ShowYesNoNotification("Phiên đăng nhập của bạn sẽ bị xóa, bạn có chắc muốn đăng xuất chứ", async () => {
    localStorage.removeItem("accessToken")
    await fetchWithAuth("/api/logout")
    login_btn.style.display = "block";
    // signup_btn.style.display = "block";
    logout_btn.style.display = "none";
  })
}

const HomePage = $(".home_page")
const NomenotificationPage = $(".notification_page")
const AllPage = $$(".page")

function checkUserState() {
  console.log(userState)
  if(!userState) {
    popupNotification.Init()
    popupNotification.Fail("bạn phải đăng nhập mới nhận được thông báo")
    return false
  }
  return true
}

function HandleChangeMainContent(type) {

  switch(type) {
    case "homePage":
        AllPage.forEach(page => page.classList.remove("active"))
        HomePage.classList.add("active")
      break

    case "notificationPage":
        if(!checkUserState()) break
        AllPage.forEach(page => page.classList.remove("active"))
        NomenotificationPage.classList.add("active")
      break

    case "setting":
        if(!checkUserState()) break
        window.location.href = "/admin"
      break
    
    case "helpPage":

      break

    default:
        AllPage.forEach(page => page.classList.remove("active"))
        HomePage.classList.add("active")
      break
  }
}

const sidebar_menu_items = $$(".sidebar_menu .sidebar_item")
sidebar_menu_items.forEach(ele => {
  ele.onclick = () => {
    sidebar_menu_items.forEach(e => e.classList.remove("active"))
    ele.classList.add("active")
    console.dir(ele)
    HandleChangeMainContent(ele.dataset.pagetype)
  }
})





// reset FCMToken() is a function that clears all old Service Workers and IndexedDB databases related to Firebase, allowing the app to receive a new FCM token. This is useful for resolving issues with stuck or outdated tokens. The function should be run once on the device, and then the page should be reloaded to obtain a fresh token.

// async function resetFCMToken() {
//   if ('serviceWorker' in navigator) {
//     try {
//       // 1. Lấy tất cả Service Worker đang chạy ngầm trên điện thoại
//       const registrations = await navigator.serviceWorker.getRegistrations();
//       for (let registration of registrations) {
//         // Hủy đăng ký để xóa sạch cấu hình cũ kẹt trong cache
//         await registration.unregister();
//         console.log('Đã xóa thành công Service Worker cũ kẹt cache');
//       }

//       // 2. Xóa triệt để các token cũ lưu trong IndexedDB của Firebase
//       const dbs = await window.indexedDB.databases();
//       dbs.forEach(db => {
//         if (db.name && db.name.includes('firebase')) {
//           window.indexedDB.deleteDatabase(db.name);
//           console.log(`Đã xóa DB kẹt: ${db.name}`);
//         }
//       });

//       console.log('Đã dọn sạch! Hãy reload lại trang để nhận Token mới tinh.');
//     } catch (error) {
//       console.error('Lỗi khi dọn dẹp bộ nhớ: ', error);
//     }
//   }
// }

// // Bật dòng này lên chạy ĐÚNG 1 LẦN trên điện thoại, sau đó ẩn/xóa dòng này đi
// resetFCMToken();