import { fetchWithAuth } from "../uti/func.js"
import { popupNotification } from "../popupNotification.js"
import { configMessageController } from "./configMessageController.js"

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

export const formController = {
    form_datas: [],
    current_form: {},
    form_count: 0,
    current_form_index: 0,
    userData: {},

    async Init(data) {
        $(".admin_side_bar-account_name").innerHTML = data.userName
        this.userData = data
        this.form_datas = data.forms
        this.current_form = this.form_datas[this.current_form_index]
        this.Render()
        this.HandleEvent();
    },

    ReloadWithNewData(newData) {
        this.form_datas = this.form_datas.map(ele => {
            if(ele.formId === newData.formId) {
                return newData
            }
            return ele
        })
        this.current_form = newData
        this.Render()
        this.HandleEvent()
    },

    Render() {
        if(this.form_datas.length === 0) return
        $(".form_list").innerHTML = ""
        this.form_datas.forEach(form_data => this.RenderFormBtn(form_data.formName))
        configMessageController.LoadForm(this.current_form)
        configMessageController.Start()
    },

    ChangeAppScript() {
        const app_script_code = $(".script_modal pre code")
        app_script_code.removeAttribute('data-highlighted');
        const new_app_script = `
function sendMessage(e) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var sheet = (e && e.source) ? e.source.getActiveSheet() : SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var rowData = sheet.getRange(lastRow, 1, 1, lastColumn).getValues()[0];
  Logger.log(headers);
  Logger.log(rowData);

  if (!scriptProperties.getProperty('STORAGE_CREATED')) {
      try {
          var createPayload = { header: headers, formId: "${this.current_form.formId}" };
          var createOptions = {
              method: "post",
              contentType: "application/json",
              payload: JSON.stringify(createPayload),
              muteHttpExceptions: true
          };
          var createResponse = UrlFetchApp.fetch("https://sheet-to-message.vercel.app/api/create_form_config/${this.userData.id}", createOptions);
          Logger.log("Tạo kho lưu trữ: " + createResponse.getContentText());
          scriptProperties.setProperty('STORAGE_CREATED', 'true');
      } catch (err) {
          Logger.log("Lỗi khi tạo kho lưu trữ: " + err);
      }
  }

  if(e && e.source) {
    var payload = { info: { rowData: rowData, headerData: headers }, formId: "${this.current_form.formId}" };
    var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
    };
    Logger.log(UrlFetchApp.fetch("https://sheet-to-message.vercel.app/api/webhook/${this.userData.userName}", options).getContentText());
  }
}`

        app_script_code.innerHTML = new_app_script
        hljs.highlightElement(app_script_code)

        const script_modal_copy_btn = $(".script_modal_copy_btn")
        script_modal_copy_btn.onclick = () => navigator.clipboard.writeText(new_app_script)
        .then(() => {
            alert('Đã copy');
        })
        .catch(() => {
            console.error('Chưa coppy được');
        });
        
    },

    HandleEvent() {
        const form_config_controller = $(".form_config_controller")
        const account_controller = $(".account_controller")
        const admin_page_overlay = $(".admin_page_overlay")
        const side_bar = $(".admin_side_bar")
        const open_script_modal_btn = $(".open_script_modal_btn")
        $$(".form_item").forEach((element, i) => {
            element.onclick = () => {
                $$(".form_item").forEach(e => e.className = "form_item")
                element.className = "form_item selected"
                account_controller.classList.remove("active")
                form_config_controller.classList.add("active")
                this.current_form = this.form_datas[i]
                configMessageController.LoadForm(this.current_form)
                configMessageController.Start()
                open_script_modal_btn.style.display = "grid"
                if(window.mobileCheck()) {
                    admin_page_overlay.classList.add("hide")
                    side_bar.classList.add("hide")
                }
                this.ChangeAppScript()
            }
        });
        $(".admin_side_bar button").onclick = () => {
            this.NewForm()
        }
    },

    ClearChoosenForm() {
        $$(".form_item").forEach(e => e.className = "form_item")
    },

    RenderFormBtn(form_name = "New form") {
        const form_list = $(".form_list")
        const para = document.createElement("li");
        para.className = "form_item"
        const node = document.createTextNode(form_name);
        para.appendChild(node);
        para.id = this.form_count
        form_list.appendChild(para)
        // para.onclick = () => {
        //     $$(".form_item").forEach(e => e.className = "form_item")
        //     para.className = "form_item selected"
        //     const forms_data = this.form_datas[Number(para.id)]
        //     configMessageController.LoadForm(forms_data)
        // }
        this.form_count++
    },

    async NewForm() {
        popupNotification.Init()
        popupNotification.Loading()
        popupNotification.ShowMessage("Loading ...")
        const res = await fetchWithAuth("/api/create_new_form", {
            method: "GET",
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
            this.HandleEvent()
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
                        time: document.getElementById('fixed-time-header').value,
                        name: document.getElementById('fixed-name-header').value,
                        category: document.getElementById('fixed-category-header').value
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
                filterKeys: [document.getElementById('fixed-category-header').value]
            }
        }

        popupNotification.Init()
        popupNotification.Loading("Đang lưu ...")

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
        if(res.status === 200) {
            popupNotification.Success("Lưu Form thành công")
            this.ReloadWithNewData(newData)
        } else {
            popupNotification.Fail("Form chưa được lưu, vui lòng đợi chút")
        }
    },

    async DeleteForm() {

    }

}