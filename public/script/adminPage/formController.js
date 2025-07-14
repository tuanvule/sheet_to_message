import { fetchWithAuth } from "../../main.js"
import { configMessageController } from "./configMessageController.js"

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

export const formController = {
    form_datas: [],
    current_form: {},
    form_count: 0,
    current_form_index: 0,

    async Init() {
        const res = await fetchWithAuth("http://127.0.0.1:3092/get_account")
        const data = await res.json()
        this.form_datas = data.forms
        this.current_form = this.form_datas[this.current_form_index]
        this.Render()
    },

    Render() {
        if(!this.form_datas) return
        this.form_datas.forEach(form_data => this.NewForm(form_data.formName))
        configMessageController.LoadForm(this.current_form)
        configMessageController.Start()
    },

    HandleEvent() {
        $$(".form_item").forEach(element => {
            element.onclick = () => {
                $$(".form_item").forEach(e => e.className = "form_item")
                element.className = "form_item selected"
            }
        });
        $(".side_bar button").onclick = () => {
            this.NewForm()
        }
    },

    NewForm(form_name = "New form") {
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


}