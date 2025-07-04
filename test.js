const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load service account credentials
const KEYFILEPATH = path.join(__dirname, 'key.json'); // Replace with your key file name
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const SPREADSHEET_ID = '18TVGscW2Syp7fkB_uYE8Tx_GirQVGmaaj6hZ7-MCMH4'; // Replace with your spreadsheet ID
const SHEET_NAME = 'Sheet1'; // Replace with your sheet name

async function accessSpreadsheet() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  // 🔹 READ data from sheet
  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}`,
  });
  console.log('Data from sheet:', readRes.data.values);

//   // 🔹 WRITE data to sheet
//   const writeRes = await sheets.spreadsheets.values.append({
//     spreadsheetId: SPREADSHEET_ID,
//     range: `${SHEET_NAME}!A1`,
//     valueInputOption: 'USER_ENTERED',
//     resource: {
//       values: [['Name', 'Email', 'Age'], ['Alice', 'alice@example.com', 30]],
//     },
//   });
//   console.log('Data written to sheet.');
}

accessSpreadsheet().catch(console.error);



