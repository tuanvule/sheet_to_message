const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const notifi_list = $(".notification_list")
const loading_box = $(".loading_box")
const loading_box_result = $(".loading_box_result")
const loading_box_message = $(".loading_box_message")
const token_show_token = $(".token_show_token")

export class GetPermHandler{
    Reset() {
        loading_box_result.className = "loading_box_result"
        this.ShowMessage("")
    }

    ShowMessage(mes) {
        loading_box_message.innerHTML = mes
    }

    Loading() {
        loading_box.style.display = "grid"
        loading_box_result.className = "loading_box_result loading"
        this.ShowMessage("Getting Perm")
    }

    Success() {
        loading_box_result.className = "loading_box_result success"
        this.ShowMessage("Get Perm Successfully")
    }

    Fail() {
        loading_box_result.className = "loading_box_result fail"
        this.ShowMessage("Get Perm Fail")
    }

    Show_token(token) {
        token_show_token.innerHTML = token
    }

    Exit() {
        loading_box.style.display = "none"
        this.Reset()
    }
}