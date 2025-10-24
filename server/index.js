import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { google } from "googleapis";

// Load env vars
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  GOOGLE_SHEET_ID
} = process.env;

if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
  throw new Error("Missing Google Sheets credentials in .env");
}

// Google Sheets auth setup
const auth = new google.auth.JWT(
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  undefined,
  GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  ["https://www.googleapis.com/auth/spreadsheets"]
);
const sheets = google.sheets({ version: "v4", auth });

// Example: Read all rows from Sheet1
app.get("/api/sheet", async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Sheet1"
    });
    res.json(result.data.values);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example: Append a row
app.post("/api/sheet", async (req, res) => {
  const { row } = req.body; // row: array of values
  if (!Array.isArray(row)) return res.status(400).json({ error: "row must be array" });
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Sheet1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
