import { fetchWithAuth } from "../uti/func.js";
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
            const res = await fetchWithAuth("/api/get_account")
            if(res.status === 403) {
                popupNotification.Init()
                popupNotification.Fail("Bạn phải là chủ tài khoản mới được sử dụng trang này")
            } else {
                const data = await res.json()
                this.data = data
                this.LoadUserData()
                await formController.Init(data);
                this.DeviceResponsive()
                this.HandleEvent()
            }
        } catch(err) {
            console.log(err)
        }
    }

    DeviceResponsive() {
        console.log(window.mobileCheck())
        if(window.mobileCheck()) {
            console.log($(".admin_side_bar_header-exit"))
            $(".open_side_bar_btn").style.display = "grid"
            $(".admin_side_bar_header-exit").style.display = "grid"
        }
    }

    LoadUserData() {
        $(".join_code").innerHTML = this.data.joinCode
    }

    HandleDisplaySideBarModal(type) {
        const admin_page_overlay_btn = $(".admin_page_overlay")
        const side_bar = $(".admin_side_bar")
        if(type === "show") {
            admin_page_overlay_btn.className = "admin_page_overlay show"
            side_bar.className = "admin_side_bar show"
        } else {
            admin_page_overlay_btn.className = "admin_page_overlay hide"
            side_bar.className = "admin_side_bar hide"
        }
    }

    HandleDisplayScriptModal(type) {
        const admin_page_overlay_btn = $(".admin_page_overlay")
        const script_modal = $(".script_modal")
        if(type === "show") {
            admin_page_overlay_btn.className = "admin_page_overlay show"
            script_modal.className = "script_modal show"
        } else {
            admin_page_overlay_btn.className = "admin_page_overlay hide"
            script_modal.className = "script_modal hide"
        }
    }

    HandleEvent() {
        const form_config_controller = $(".form_config_controller")
        const account_controller = $(".account_controller")
        const admin_page_overlay_btn = $(".admin_page_overlay")
        const side_bar = $(".admin_side_bar")

        const open_setting_btn = $(".open_setting_btn")
        open_setting_btn.onclick = () => {
            account_controller.className = "account_controller active"
            form_config_controller.classList.remove("active")
            admin_page_overlay_btn.className = "admin_page_overlay hide"
            open_script_modal_btn.style.display = "none"
            if(window.mobileCheck()) {
                side_bar.className = "admin_side_bar hide"
            }
            formController.ClearChoosenForm()
        }

        const open_script_modal_btn = $(".open_script_modal_btn")
        open_script_modal_btn.onclick = () => this.HandleDisplayScriptModal("show")
        const close_script_modal_btn = $(".script_modal_header-exit")
        close_script_modal_btn.onclick = () => this.HandleDisplayScriptModal("hide")

        const copy_join_code = $(".copy_join_code")
        copy_join_code.onclick = () => navigator.clipboard.writeText($(".join_code").innerHTML)
        .then(() => {
            alert('Đã copy');
        })
        .catch(() => {
            console.error('Chưa coppy được');
        });

        if(window.mobileCheck()) {
            const side_bar_header_exit = $(".admin_side_bar_header-exit")
            side_bar_header_exit.onclick = () => this.HandleDisplaySideBarModal("hide")

            const open_side_bar_btn = $(".open_side_bar_btn")
            open_side_bar_btn.onclick = () => this.HandleDisplaySideBarModal("show")
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