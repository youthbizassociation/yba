// ============================================
// GOOGLE APPS SCRIPT — YBA Join Form
// ============================================
// INSTRUCTIONS:
// 1. Go to https://script.google.com
// 2. Click "New Project"
// 3. Paste this entire code
// 4. Create a new Google Sheet (or use existing)
// 5. Replace SPREADSHEET_ID below with your Sheet ID
//    (the long string in your Sheet URL between /d/ and /edit)
// 6. Click "Deploy" > "New deployment" > "Web app"
// 7. Set "Who has access" to "Anyone"
// 8. Copy the deployment URL and paste it into
//    scripts/form-config.js as FORM_SUBMIT_URL
// ============================================

const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
const SHEET_NAME = "YBA Signups";

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: "YBA Form API is running" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Validate required fields
    const required = ["first_name", "last_name", "grade", "school", "state", "email"];
    for (const field of required) {
      if (!data[field] || !data[field].trim()) {
        return ContentService.createTextOutput(
          JSON.stringify({ status: "error", message: `${field} is required` })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: "error", message: "Invalid email address" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Open spreadsheet and get or create sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Create sheet with headers if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Timestamp",
        "First Name",
        "Last Name",
        "Grade",
        "School",
        "State",
        "Email",
        "Referral Name",
        "Referral Email"
      ]);

      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#0a1628");
      headerRange.setFontColor("#ffffff");

      // Auto-resize columns
      for (let i = 1; i <= 9; i++) {
        sheet.autoResizeColumn(i);
      }
    }

    // Add the submission row
    const timestamp = new Date().toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short"
    });

    sheet.appendRow([
      timestamp,
      data.first_name.trim(),
      data.last_name.trim(),
      data.grade.trim(),
      data.school.trim(),
      data.state,
      data.email.trim().toLowerCase(),
      data.referral_name || "",
      data.referral_email || ""
    ]);

    // Return success
    return ContentService.createTextOutput(
      JSON.stringify({ status: "success", message: "Submission received" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: error.message || "Something went wrong" })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
