import { formController } from "./formController.js";

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

formController.HandleEvent();

// let this.headers = [];
// let this.fieldCount = 0;

export class AdminPageHandler {
    constructor() {
        this.headers = []
        this.fieldCount = 0;
    }

    async start() {
        await formController.Init();
    }
}

const adminPageHandler = new AdminPageHandler();
await adminPageHandler.start()

