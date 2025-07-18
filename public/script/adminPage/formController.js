import { fetchWithAuth } from "../../main.js"
import { popupNotification } from "../popupNotification.js"
import { configMessageController } from "./configMessageController.js"

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

export const formController = {
    form_datas: [],
    current_form: {},
    form_count: 0,
    current_form_index: 0,

    async Init() {
        const res = await fetchWithAuth("/api/get_account")
        const data = await res.json()
        this.form_datas = data.forms
        this.current_form = this.form_datas[this.current_form_index]
        this.Render()
    },

    Render() {
        if(!this.form_datas) return
        this.form_datas.forEach(form_data => this.RenderFormBtn(form_data.formName))
        configMessageController.LoadForm(this.current_form)
        configMessageController.Start()
    },

    HandleEvent() {
        $$(".form_item").forEach((element, i) => {
            element.onclick = () => {
                $$(".form_item").forEach(e => e.className = "form_item")
                element.className = "form_item selected"
                this.current_form = i
                configMessageController.LoadForm(this.current_form)
                configMessageController.Start()
            }
        });
        $(".side_bar button").onclick = () => {
            this.NewForm()
        }
    },

    RenderFormBtn(form_name = "New form") {
        const form_list = $(".form_list")
        const para = document.createElement("li");
        para.className = "form_item"
        const node = document.createTextNode(form_name);
        para.appendChild(node);
        para.id = this.form_count
        form_list.appendChild(para)
        para.onclick = () => {
            $$(".form_item").forEach(e => e.className = "form_item")
            para.className = "form_item selected"
            const forms_data = this.form_datas[Number(para.id)]
            configMessageController.LoadForm(forms_data)
        }
        if(this.form_count == this.current_form_index) {
            para.classList.add("selected")
        } 
        this.form_count++
    },

    async NewForm() {
        popupNotification.Init()
        popupNotification.Loading()
        popupNotification.ShowMessage("Loading ...")
        const res = await fetchWithAuth("/api/create_new_form", {
            method: "POST",
        })
        const responseData = await res.json()
        if(res.status === 403 || res.status == 500) {
            popupNotification.Fail()
            popupNotification.ShowMessage(responseData.message)
        } else {
            popupNotification.Success()
            popupNotification.ShowMessage("Tạo thành công")
            this.form_datas.push(responseData.newForm)
            this.RenderFormBtn(responseData.newForm.formName)
        }

    },

    async Save(form) {

        const selects = $$('.field-header');
        const newData = {
            formId: form.formId,
            formName: $(".form_info_name").value || form.formName,
            config: {
                messageType: form.config.messageType,
                convertedHeader: {
                    fixedHeader: {
                        name: document.getElementById('fixed-ho-ten-header').value,
                        category: document.getElementById('fixed-hang-muc-header').value
                    },
                    laybelHeader: Array.from(selects).map((select,i) => {
                        return {
                            laybel:select.value, 
                            key: select.parentElement.querySelector(".field-label").value, 
                            range: select.parentElement.querySelector(".field-range").value
                        }
                    })
                },
                sheetHeader: form.config.sheetHeader,
                filterKeys: [document.getElementById('fixed-hang-muc-header').value]
            }
        }

        popupNotification.Init()
        popupNotification.Loading("Đang lưu ...")

        console.log(newData)

        const res = await fetchWithAuth("/api/save_form_config", {
            method: "POST",
            body: JSON.stringify({
                formId: form.formId,
                changeData: newData
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        console.log(res)
        if(res.status === 200) {
            popupNotification.Success("Lưu Form thành công")
        } else {
            popupNotification.Fail("Form chưa được lưu, vui lòng đợi chút")
        }
    },

    async DeleteForm() {

    }

}