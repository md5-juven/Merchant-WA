/**
 * Google Apps Script: paste this into your sheet (Extensions → Apps Script),
 * then Deploy → New deployment → Web app.
 *
 * Deployment (required for dashboard to work without login):
 * - Execute as: Me
 * - Who has access: Anyone, even anonymous   <-- must be this (not "Anyone")
 *
 * Copy the Web app URL into your .env as VITE_GOOGLE_SHEET_WEB_APP_URL
 *
 * --- SHEET HEADER ROW (row 1) - use exactly these 9 columns in order ---
 * Column A: Merchant Store Name
 * Column B: Merchant Name
 * Column C: Phone Number
 * Column D: Address
 * Column E: Pincode
 * Column F: Location
 * Column G: Merchant Response
 * Column H: Potenial Problems
 * Column I: Submitted At   <-- required for "Submissions over time" chart
 *
 * Header name for the date column must be exactly:  Submitted At
 * (New form submissions will get the timestamp automatically. Existing rows
 *  will have an empty date unless you add it manually.)
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var body = e.postData ? JSON.parse(e.postData.contents) : {};
    var submittedAt = new Date();
    var row = [
      body['Merchant Store Name'] || '',
      body['Merchant Name'] || '',
      body['Phone Number'] || '',
      body['Address'] || '',
      body['Pincode'] || '',
      body['Location'] || '',
      body['Merchant Response'] || '',
      body['Potenial Problems'] || '',
      submittedAt
    ];
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET: returns sheet data as JSON for the dashboard.
 * Response: { headers: string[], rows: object[] }
 */
function doGet() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    if (!data || data.length === 0) {
      return jsonResponse({ headers: [], rows: [] });
    }
    var headers = data[0].map(function(h) { return String(h || '').trim(); });
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        var val = data[i][j];
        if (val instanceof Date) {
          row[headers[j]] = val.toISOString ? val.toISOString() : val.toString();
        } else {
          row[headers[j]] = val != null ? String(val).trim() : '';
        }
      }
      rows.push(row);
    }
    return jsonResponse({ headers: headers, rows: rows });
  } catch (err) {
    return jsonResponse({ error: err.toString() }, 500);
  }
}

function jsonResponse(obj, status) {
  var output = ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
