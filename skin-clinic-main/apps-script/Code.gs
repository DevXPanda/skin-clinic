/**
 * Ambraja Skin & Laser Clinic — Appointment Enquiry Backend
 * ---------------------------------------------------------
 * Receives the website enquiry form, appends a row to Google Sheets,
 * emails the clinic, and sends the patient a confirmation (if they gave an email).
 *
 * SETUP: see SETUP.md in the project root.
 */

// ====== CONFIG — edit these ======
var CLINIC_NAME  = 'Ambraja Skin & Laser Clinic';
var CLINIC_EMAIL = 'ambrajaclinic@gmail.com';   // where enquiries are sent
var CLINIC_PHONE = '0120-4552014';
var CLINIC_WA    = '+91-92177 54696';
var CLINIC_ADDR  = 'First Floor, C-43 RDC, Rajnagar, Ghaziabad';
var SHEET_NAME   = 'Appointments';
// =================================

var HEADERS = ['Timestamp', 'Full Name', 'Mobile', 'Email', 'Concern', 'Preferred Date', 'Message', 'Source'];


/** Entry point for the website form POST. */
function doPost(e) {
  try {
    var data = parseRequest_(e);

    if (!data.name || !data.mobile) {
      return json_({ status: 'error', message: 'Name and mobile are required.' });
    }

    var stamp = new Date();
    saveToSheet_(data, stamp);
    notifyClinic_(data, stamp);
    if (data.email) confirmToPatient_(data, stamp);

    return json_({ status: 'success', message: 'Appointment request received.' });

  } catch (err) {
    // Log so failures are visible in Apps Script > Executions
    console.error(err);
    return json_({ status: 'error', message: String(err) });
  }
}


/** Lets you open the deployed URL in a browser to confirm it is live. */
function doGet() {
  return json_({ status: 'ok', message: CLINIC_NAME + ' enquiry endpoint is running.' });
}


/** Accepts both FormData/urlencoded posts and raw JSON bodies. */
function parseRequest_(e) {
  var p = (e && e.parameter) ? e.parameter : {};

  if ((!p.name || !p.mobile) && e && e.postData && e.postData.contents) {
    try { p = JSON.parse(e.postData.contents); } catch (ignore) {}
  }

  return {
    name:    String(p.name    || '').trim(),
    mobile:  String(p.mobile  || '').trim(),
    email:   String(p.email   || '').trim(),
    concern: String(p.concern || 'Not specified').trim(),
    date:    String(p.date    || 'Not specified').trim(),
    message: String(p.message || '').trim(),
    source:  String(p.source  || 'Website').trim()
  };
}


/** Appends the enquiry as a new row, creating the sheet/headers on first run. */
function saveToSheet_(d, stamp) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
         .setFontWeight('bold')
         .setBackground('#14555C')
         .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(7, 320);
  }

  sheet.appendRow([
    stamp, d.name, d.mobile, d.email || '—',
    d.concern, d.date, d.message || '—', d.source
  ]);
}


/** Emails the clinic about the new appointment request. */
function notifyClinic_(d, stamp) {
  var when = Utilities.formatDate(stamp, Session.getScriptTimeZone(), 'dd MMM yyyy, hh:mm a');

  var rows =
    row_('Name', d.name) +
    row_('Mobile', '<a href="tel:' + d.mobile + '">' + d.mobile + '</a>') +
    row_('Email', d.email || '—') +
    row_('Concern', d.concern) +
    row_('Preferred Date', d.date) +
    row_('Message', d.message || '—') +
    row_('Submitted', when);

  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;' +
      'border:1px solid #e0d9cb;border-radius:12px;overflow:hidden">' +
      '<div style="background:#14555C;color:#fff;padding:20px 24px">' +
        '<h2 style="margin:0;font-size:19px">New Appointment Request</h2>' +
        '<p style="margin:6px 0 0;font-size:13px;opacity:.85">' + CLINIC_NAME + ' — Website Enquiry</p>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;background:#FBF8F1">' + rows + '</table>' +
      '<div style="padding:16px 24px;background:#F6F1E7;font-size:12px;color:#5f6b6a">' +
        'Please contact the patient to confirm the appointment slot.' +
      '</div>' +
    '</div>';

  var opts = { htmlBody: html, name: CLINIC_NAME + ' Website' };
  if (d.email) opts.replyTo = d.email;

  MailApp.sendEmail(
    CLINIC_EMAIL,
    'New Appointment: ' + d.name + ' — ' + d.concern,
    'New enquiry from ' + d.name + ' (' + d.mobile + '). Concern: ' + d.concern +
      '. Preferred date: ' + d.date + '. Message: ' + (d.message || '—'),
    opts
  );
}


/** Sends the patient a booking confirmation. */
function confirmToPatient_(d, stamp) {
  var html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;' +
      'border:1px solid #e0d9cb;border-radius:12px;overflow:hidden">' +
      '<div style="background:#14555C;color:#fff;padding:24px;text-align:center">' +
        '<h2 style="margin:0;font-size:22px;font-weight:normal">' + CLINIC_NAME + '</h2>' +
        '<p style="margin:6px 0 0;font-size:12px;letter-spacing:2px;opacity:.85">' +
          'DERMATOLOGIST-LED CARE · GHAZIABAD</p>' +
      '</div>' +
      '<div style="padding:26px 24px;background:#FBF8F1;color:#26302F">' +
        '<p style="margin:0 0 14px;font-size:16px">Dear ' + escape_(d.name) + ',</p>' +
        '<p style="margin:0 0 16px;font-size:14px;line-height:1.6">' +
          'Thank you for your appointment request. We have received your enquiry and our team ' +
          'will contact you shortly on <strong>' + escape_(d.mobile) + '</strong> to confirm your slot.' +
        '</p>' +
        '<table style="width:100%;border-collapse:collapse;font-size:14px;' +
          'background:#fff;border:1px solid #e0d9cb;border-radius:8px">' +
          row_('Concern', d.concern) +
          row_('Preferred Date', d.date) +
        '</table>' +
        '<p style="margin:18px 0 6px;font-size:14px"><strong>Clinic Details</strong></p>' +
        '<p style="margin:0;font-size:13px;line-height:1.7;color:#5f6b6a">' +
          CLINIC_ADDR + '<br>' +
          'Phone: ' + CLINIC_PHONE + '<br>' +
          'WhatsApp: ' + CLINIC_WA + '<br>' +
          'Timings: Mon · Wed · Fri — 1:00 PM to 4:00 PM<br>' +
          'Tue · Thu · Sat — 11:00 AM to 3:00 PM' +
        '</p>' +
      '</div>' +
      '<div style="padding:14px 24px;background:#0A2E33;color:#a9bfbe;font-size:11px;line-height:1.6">' +
        'This is an appointment enquiry acknowledgement, not a medical consultation. ' +
        'Treatment suitability is determined after an in-clinic evaluation.' +
      '</div>' +
    '</div>';

  MailApp.sendEmail(d.email, 'Appointment Request Received — ' + CLINIC_NAME,
    'Dear ' + d.name + ', we have received your appointment request and will contact you on ' +
    d.mobile + ' shortly to confirm.',
    { htmlBody: html, name: CLINIC_NAME, replyTo: CLINIC_EMAIL });
}


// ---------- helpers ----------

function row_(label, value) {
  return '<tr>' +
    '<td style="padding:10px 16px;border-bottom:1px solid #eee;color:#5f6b6a;' +
      'font-size:13px;width:150px">' + label + '</td>' +
    '<td style="padding:10px 16px;border-bottom:1px solid #eee;color:#26302F;' +
      'font-size:14px"><strong>' + value + '</strong></td>' +
  '</tr>';
}

function escape_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}


/** Run once from the editor to verify the sheet + emails work. */
function testSubmission() {
  var fake = {
    name: 'Test Patient', mobile: '9999999999', email: '',
    concern: 'Acne / Acne Scars', date: '2026-08-01',
    message: 'This is a test entry.', source: 'Manual Test'
  };
  var now = new Date();
  saveToSheet_(fake, now);
  notifyClinic_(fake, now);
  Logger.log('Test complete — check the sheet and ' + CLINIC_EMAIL);
}
