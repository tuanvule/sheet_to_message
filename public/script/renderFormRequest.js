// import { fetchWithAuth } from "../main.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

export class RenderFormRequest {
    constructor() {
        this.form_datas = {};
        this.state = {
            time: "newest",
            type: "all",
        }
        this.showed_data = null;
    }

    async init() {
        try {
            const res = await fetchWithAuth("/api/get-form-request");
            const data = await res.json();
            this.data = data;
            this.showed_data = data;
        } catch(err) {
            console.error("init error: ", err);
        }
    }

    getAll() {
        return this.data
    }

    parseDateTime(str) {
        const [datePart, timePart] = str.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, minute, second] = timePart.split(':').map(Number);
        return new Date(year, month - 1, day, hour, minute, second);
    }

    toggleState(newState) {
        this.state = newState;
        if(this.type !== "all") {
            this.showed_data.csvc = this.showed_data.csvc.filter((data) => data.type == this.type)
        } else {
            this.showed_data = this.data
        }
        if(this.type.time == "newest") {
            this.showed_data.csvc.sort((a, b) => parseDateTime(b.time) - parseDateTime(a.time));
            this.showed_data.student.sort((a, b) => parseDateTime(b.time) - parseDateTime(a.time));
        } else {
            this.showed_data.csvc.sort((a, b) => parseDateTime(a.time) - parseDateTime(b.time));
            this.showed_data.student.sort((a, b) => parseDateTime(a.time) - parseDateTime(b.time));
        }

        this.render();
    }

    render(type) {
        if(this.showed_data !== null) {

        }
    }
}