"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SheetController = void 0;
const googleapis_1 = require("googleapis");
class SheetController {
    static instance;
    sheets = null; // Will be initialized later
    sheetID = "";
    initialized = false;
    constructor() { }
    static getInstance() {
        if (!SheetController.instance) {
            SheetController.instance = new SheetController();
        }
        return SheetController.instance;
    }
    async initialize(config) {
        if (this.initialized)
            return; // Already initialized
        if (!config)
            throw new Error("Missing config for Sheet Controller initialization");
        this.sheetID = config.sheetID;
        // Auth for Google
        const auth = new googleapis_1.google.auth.GoogleAuth({
            keyFile: config.keyFile,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"],
        });
        const client = await auth.getClient();
        this.sheets = googleapis_1.google.sheets({ version: 'v4', auth: client });
        this.initialized = true;
    }
    async getRawData(sheetName) {
        if (!this.initialized)
            throw new Error("SheetController not initialized. Call initialize() first.");
        try {
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.sheetID,
                range: sheetName,
            });
            return response.data.values;
        }
        catch (error) {
            console.error("Error fetching sheet data:", error);
            throw error;
        }
    }
}
exports.SheetController = SheetController;
