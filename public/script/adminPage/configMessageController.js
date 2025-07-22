// import { fetchWithAuth } from "../../main.js"
// import { formController } from "./formController.js"

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

/*export*/ const configMessageController = {
    originForm: {},
    form: {},
    convertedHeader: {
        fixedHeader: {},
        laybelHeader: []
    },
    sheetHeader: {},
    fieldCount: 0,
    is_saved: false,
    instance: null,
    headers: [],

    Start() {
        this.HandleEvent()
    },

    LoadForm(form_data) {
        if(form_data) {
            document.getElementById('fields-area').innerHTML = ""
            this.headers = []
            this.sheetHeader = []
            this.form = form_data
            this.originForm = form_data
            console.log(this.form)
            
            // this.config = {...form_data.config}
            // this.fieldCount = this.config.convertedHeader.fixedHeader.length
            // this.convertedHeader = this.config.convertedHeader
            // this.sheetHeader = this.config.sheetHeader
            Object.keys(this.form.config.convertedHeader.laybelHeader).forEach((header) => this.addField());
            this.LoadConfigType(this.form.config.messageType)
            this.LoadFormInfo()
            this.UpdateAllSelects()
            this.LoadAllField()
            this.LoadFixedHeader()
        }
    },

    LoadFormInfo() {
        $(".form_info_name").value = this.form.formName
    },

    LoadConfigType(type) {
        const allWarper = $$(".warper")
        allWarper.forEach((ele,i) => {
            if(i>2) {
                ele.style.display = "none"
            }
        })
        switch(type) {
            case "message":
                $(".fixed-header-settings").style.display = "block";
                break
            case "list":
                break
            default:
                break
        }

        this.form.config.messageType = type
    },

    HandleEvent() {
        const message_boxes = $$(".fixed-item")

        message_boxes.forEach(e => {
            console.log(e)
            e.onclick = () => {
                e.parentElement.classList.toggle("opened")
                e.parentElement.querySelector(".message-content_list").classList.toggle("hidden")
            }
        });

        const add_header_btn = $(".add_header_btn")
        add_header_btn.onclick = (e) => {
            console.log(21321)
            console.log(this.headers)
            e.preventDefault()
            this.addHeader()
        }

        const add_field_btn = $(".add-field")
        add_field_btn.onclick = () => {
            this.addField()
        }

        const show_message_btn = $(".show-message")
        show_message_btn.onclick = () => {
            this.ShowExampleMessage()
        }
        
        const fetch_header_btn = $(".fetch_header_btn")
        fetch_header_btn.onclick = () => this.fetchHeaders()

        const form_style_items = $$(".form_style_item")
        form_style_items.forEach(item => {
            item.onclick = () => {
                form_style_items.forEach(ele => ele.classList.remove("selected"))
                item.classList.add("selected")
                this.LoadConfigType(item.dataset.type)
                this.ShowExampleMessage()
            }
        })

        const save_btn = $(".save_btn")
        const clear_change_btn = $(".clear_change_btn")

        save_btn.onclick = () => formController.Save(this.form)
        clear_change_btn.onclick = () => this.LoadForm(this.originForm)
    },

    fetchHeaders() {
        const sheetId = document.getElementById('sheet-id').value.trim();
        const sheetName = document.getElementById('sheet-name').value.trim();

        if (!sheetId && !sheetName) {
            alert('Vui lòng nhập đủ API Key, Spreadsheet ID và Sheet name');
            return;
        }

        const that = this

        fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&tq=limit 1&tqx=out:json`)
            .then(res => res.text())
            .then(text => {
                const json = JSON.parse(text.substring(47).slice(0, -2));
                this.headers = json.table.cols.map(c => c.label)
                this.headers.forEach(() => that.addField());
                this.form.config.sheetHeader = this.headers
                this.UpdateAllSelects();
                console.log(json);
            });
    },

    LoadFixedHeader() {
        document.getElementById('fixed-ho-ten-header').selectedIndex = this.form.config.sheetHeader.findIndex(value => value == this.form.config.convertedHeader.fixedHeader.name);
        document.getElementById('fixed-hang-muc-header').selectedIndex = this.form.config.sheetHeader.findIndex(value => value == this.form.config.convertedHeader.fixedHeader.category);
    },

    addHeader() {
        const input = document.getElementById('header-input');
        const value = input.value.trim();
        if(value && !this.headers.includes(value)) {
            this.form.config.sheetHeader.push(value);
            this.UpdateAllSelects();
        }
        input.value = '';
    },

    LoadAllField() {
        const selects = $$('.field-header');
        selects.forEach((select, i) => {
            select.parentElement.querySelector(".field-range").selectedIndex = Number(this.form.config.convertedHeader.laybelHeader[i].range.replace("%","")) / 10 - 1
            select.selectedIndex = this.form.config.sheetHeader.findIndex(value => value === this.form.config.convertedHeader.laybelHeader[i].laybel)
            console.log(select.value)
            select.parentElement.querySelector(".field-label").value = this.form.config.convertedHeader.laybelHeader[i].key
        })
    },

    addField() {
        this.fieldCount++;
        const fieldId = `field-${this.fieldCount}`;
        const div = document.createElement('div');
        div.className = 'field-item';
        div.id = fieldId;
        div.innerHTML = `
            <input type="text" placeholder="Label hiển thị" class="field-label">
            <select class="field-header"></select>
            <select class="field-range">
                <option value="10%">10%</option>
                <option value="20%">20%</option>
                <option value="30%">30%</option>
                <option value="40%">40%</option>
                <option value="50%">50%</option>
                <option value="60%">60%</option>
                <option value="70%">70%</option>
                <option value="80%">80%</option>
                <option value="90%">90%</option>
                <option value="100%">100%</option>
            </select>
            <button class="remove">X</button>
        `;
        div.querySelector("button").onclick = () => this.removeField(`${fieldId}`);
        document.getElementById('fields-area').appendChild(div);
        this.updateSelect(div.querySelector('select'));
        div.querySelector(".field-range").onchange = (e) => {
            this.UpdateFieldRange()
        }
    },

    UpdateFieldRange() {
        const fieldRangeElements = $$(".field-range")
        const rangeList = Array.from(fieldRangeElements).map(ele => ele.value)
        console.log(this.form.config.convertedHeader)
        const newLaybelHeader = this.form.config.convertedHeader.laybelHeader.map((obj,i) => {
            const { laybel, key, _ } = obj
            return { laybel, key, range: rangeList[i]}
        })
        console.log(newLaybelHeader)
    },

    removeField(id) {
        document.getElementById(id).remove();
    },

    // LoadAllSelects() {

    // },

    UpdateAllSelects() {
        const selects = $$('.field-header');
        selects.forEach(select => this.updateSelect(select));

        this.updateSelect(document.getElementById('fixed-ho-ten-header'));
        this.updateSelect(document.getElementById('fixed-hang-muc-header'));
    },

    updateSelect(select) {
        select.innerHTML = '';
        this.form.config.sheetHeader.forEach(header => {
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;
            select.appendChild(option);
        });
    },

    RenderMessageType() {
        const fields = $$('.field-item');
        const sampleData = {}; // Dữ liệu mẫu
        this.headers.forEach(h => sampleData[h] = h + " demo");
        
        let html = `
            <div class="message-box">
                <div class="fixed-item">
                    <div class="fixed-label name">Họ tên</div>
                    <div class="fixed-label">Hạng mục</div>
                </div>
                <div class="message-content_list hidden">
        `;
        
        fields.forEach(field => {
            const label = field.querySelector('.field-label').value || 'No label';
            const header = field.querySelector('.field-header').value;
            const value = sampleData[header] || '';
            html += `<div class="message-item"><strong>${label}:</strong> ${value}</div>`;
        });
        html += `</div></div>`;
        
        document.getElementById('message-display').innerHTML = html;
        this.HandleEvent();
    },

    RenderListType() {
        const fields = Array.from($$('.field-item'));
        const sampleData = {}; // Dữ liệu mẫu
        this.headers.forEach(h => sampleData[h] = h + " demo");
        let html = `
        <div class="message_list">
          <ul class="message_title">
            ${fields.map(field => {
                const label = field.querySelector('.field-label').value || 'No label';
                const range = field.querySelector('.field-range').value || "20%";
                return `<li class="message_title-item" style="width: ${range}">${label}</li>`
            }).toString().replaceAll(">,<","><")}
          </ul>
          <ul class="message_list_content">
            <li class="message_item">
                ${fields.map(field => {
                    const label = field.querySelector('.field-label').value || 'No label';
                    const range = field.querySelector('.field-range').value || "20%";
                    return `<div class="message_item_value" style="width: ${range}">${"demo " + label}</div>`
                }).toString().replaceAll(">,<","><")}
            </li>
          </ul>
        </div>`

        document.getElementById('message-display').innerHTML = html;
        this.HandleEvent();
    },

    ShowExampleMessage() {
        switch(this.form.config.messageType) {
            case "message":
                this.RenderMessageType()
                break
            case "list":
                this.RenderListType()
                break
            default:
                this.RenderMessageType()
                break
        }
    },
}
