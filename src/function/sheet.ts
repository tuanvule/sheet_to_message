import { google } from "googleapis";

interface SheetInitialConfig {
    keyFile: string; // Should define proper type
    sheetID: string;
}

export class SheetController {
  private static instance: SheetController;
  private sheets: any | null = null; // Will be initialized later
  private sheetID: string = "";
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): SheetController {
    if (!SheetController.instance) {
      SheetController.instance = new SheetController();
    }
    return SheetController.instance;
  }

  public async initialize(config: SheetInitialConfig): Promise<void> {
    if (this.initialized) return; // Already initialized

    if (!config) throw new Error("Missing config for Sheet Controller initialization");

    this.sheetID = config.sheetID;

    // Auth for Google
    const auth = new google.auth.GoogleAuth({
        keyFile: config.keyFile,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    
    const client = await auth.getClient();
    this.sheets = google.sheets({ version: 'v4', auth: client as any });
    this.initialized = true;
  }

  public async getRawData(sheetName: string): Promise<any> {
    if (!this.initialized) throw new Error("SheetController not initialized. Call initialize() first.");
    

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetID,
        range: sheetName,
      });
      
      return response.data.values;
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      throw error;
    }
  }
}