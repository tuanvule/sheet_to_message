import { fetchWithAuth } from "../../main.js";
import { popupNotification } from "../popupNotification.js";
import { formController } from "./formController.js";

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

// let this.headers = [];
// let this.fieldCount = 0;

export class AdminPageHandler {
    constructor() {
        this.headers = []
        this.fieldCount = 0;
        this.data = {}
    }

    async start() {
        try {

            console.log(window.mobileCheck())
            const res = await fetchWithAuth("/api/get_account")
            if(res.status === 403) {
                popupNotification.Init()
                popupNotification.Fail("Bạn phải là chủ tài khoản mới được sử dụng trang này")
            } else {
                const data = await res.json()
                this.data = data
                this.LoadUserData()
                await formController.Init(data);
                this.HandleEvent()
                this.DeviceResponsive()
            }
        } catch(err) {
            console.log(err)
        }
    }

    DeviceResponsive() {
        if(!window.mobileCheck()) {
            $(".open_side_bar_btn").style.display = "none"
            $(".side_bar_header-exit").style.display = "none"
        }
    }

    LoadUserData() {
        $(".join_code").innerHTML = this.data.joinCode
    }

    HandleEvent() {
        const form_config_controller = $(".form_config_controller")
        const account_controller = $(".account_controller")
        const admin_page_overlay_btn = $(".admin_page_overlay")

        const open_setting_btn = $(".open_setting_btn")
        open_setting_btn.onclick = () => {
            account_controller.className = "account_controller active"
            form_config_controller.classList.remove("active")
            admin_page_overlay_btn.className = "admin_page_overlay hide"
            formController.ClearChoosenForm()
        }

        const copy_join_code = $(".copy_join_code")
        copy_join_code.onclick = () => navigator.clipboard.writeText($(".join_code").innerHTML)
        .then(() => {
            alert('Đã copy');
        })
        .catch(() => {
            console.error('Chưa coppy được');
        });

        if(window.mobileCheck()) {
            const side_bar_header_exit = $(".side_bar_header-exit")
            side_bar_header_exit.onclick = () => {
                admin_page_overlay_btn.className = "admin_page_overlay hide"
            }

            const open_side_bar_btn = $(".open_side_bar_btn")
            open_side_bar_btn.onclick = () => {
                admin_page_overlay_btn.className = "admin_page_overlay show"
            }
        }
    }

    CreateNewJoinCode() {
        function generateUniqueString() {
            const timePart = Date.now().toString(36); // thời gian hiện tại, dạng base36
            const randomPart = Math.random().toString(36).substring(2, 10); // random base36 (8 ký tự)
            return timePart + randomPart;
        }
    }
}

const adminPageHandler = new AdminPageHandler();
await adminPageHandler.start()

