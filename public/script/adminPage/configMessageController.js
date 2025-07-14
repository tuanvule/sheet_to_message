import { formController } from "./formController.js"

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

export const configMessageController = {
    forms: {},
    convertedHeader: {
        fixedHeader: {},
        laybelHeader: {}
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
            console.log(form_data)
            this.config = {...form_data.config}
            this.fieldCount = this.config.convertedHeader.fixedHeader.length
            this.convertedHeader = this.config.convertedHeader
            this.sheetHeader = this.config.sheetHeader
            Object.keys(this.convertedHeader.laybelHeader).forEach((header) => this.addField());
            this.updateAllSelects()
            this.LoadAllField()
            this.LoadFixedHeader()
        }
    },

    LoadHeader() {
        for(let i = 0; i < this.fieldCount; i++) {
            
        }
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

        const add_field_btn = $(".add-field")
        add_field_btn.onclick = () => {
            this.addField()
        }

        const show_message_btn = $(".show-message")
        show_message_btn.onclick = () => {
            this.renderMessage()
        }
        
        const fetch_header_btn = $(".fetch_header_btn")
        fetch_header_btn.onclick = () => this.fetchHeaders()
    },

    fetchHeaders() {
        const apiKey = "AIzaSyBuLAxLpm5IjXMjTtr7fa-KG_x3oAhMMso"
        const sheetId = document.getElementById('sheet-id').value.trim();
        const sheetName = document.getElementById('sheet-name').value.trim();

        if (!sheetId && !sheetName) {
            alert('Vui lòng nhập đủ API Key, Spreadsheet ID và Sheet name');
            return;
        }

        // const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!1:1?key=${apiKey}`;

        const that = this
        console.log(that)

        fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&tq=limit 1&tqx=out:json`)
            .then(res => res.text())
            .then(text => {
                // Visualization API trả về JS call chứ không phải JSON thuần
                const json = JSON.parse(text.substring(47).slice(0, -2));
                this.headers = json.table.cols.map(c => c.label)
                this.headers.forEach(() => that.addField());
                this.updateAllSelects();
                console.log(json);
            });
    },

    LoadFixedHeader() {
        document.getElementById('fixed-ho-ten-header').selectedIndex = this.sheetHeader.findIndex(value => value == this.convertedHeader.fixedHeader.name);
        document.getElementById('fixed-hang-muc-header').selectedIndex = this.sheetHeader.findIndex(value => value == this.convertedHeader.fixedHeader.category);
    },

    addHeader() {
        const input = document.getElementById('header-input');
        const value = input.value.trim();
        if(value && !this.headers.includes(value)) {
            this.headers.push(value);
            this.updateAllSelects();
        }
        input.value = '';
    },

    LoadAllField() {
        const selects = $$('.field-header');
        selects.forEach((select, i) => {
            select.selectedIndex = this.sheetHeader.findIndex(value => value === Object.keys(this.convertedHeader.laybelHeader)[i])
            console.log(select.value)
            // if(i >= ) {
                select.parentElement.querySelector(".field-label").value = this.convertedHeader.laybelHeader[select.value]
            // }
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
            <button class="remove">X</button>
        `;
        div.querySelector("button").onclick = () => this.removeField(`${fieldId}`);
        document.getElementById('fields-area').appendChild(div);
        this.updateSelect(div.querySelector('select'));
    },

    removeField(id) {
        document.getElementById(id).remove();
    },

    LoadAllSelects() {

    },

    updateAllSelects() {
        const selects = $$('.field-header');
        selects.forEach(select => this.updateSelect(select));

        this.updateSelect(document.getElementById('fixed-ho-ten-header'));
        this.updateSelect(document.getElementById('fixed-hang-muc-header'));
    },

    updateSelect(select) {
        select.innerHTML = '';
        this.sheetHeader.forEach(header => {
            const option = document.createElement('option');
            option.value = header;
            option.textContent = header;
            select.appendChild(option);
        });
    },

    renderMessage() {
        const fields = $$('.field-item');
        const sampleData = {}; // Dữ liệu mẫu
        this.headers.forEach(h => sampleData[h] = h + " demo");

        const hoTenHeader = document.getElementById('fixed-ho-ten-header').value;
        const hangMucHeader = document.getElementById('fixed-hang-muc-header').value;

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
}