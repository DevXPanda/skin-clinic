# Appointment Form → Google Sheets + Email Setup

The enquiry form on the website saves every appointment request to a Google Sheet,
emails the clinic, and sends the patient a confirmation email.

Follow these steps once. Takes about 5 minutes.

---

## Step 1 — Create the Google Sheet

1. Go to <https://sheets.google.com> and create a **new blank spreadsheet**.
2. Rename it something like **"Ambraja Appointments"**.
3. You do **not** need to add any headers — the script creates them automatically.

---

## Step 2 — Add the Apps Script

1. In that spreadsheet, click **Extensions → Apps Script**.
2. Delete whatever code is in the editor.
3. Open [`apps-script/Code.gs`](apps-script/Code.gs) from this project, copy **all** of it, and paste it in.
4. At the top of the script, check the **CONFIG** block and edit if needed:

   ```js
   var CLINIC_EMAIL = 'ambrajaclinic@gmail.com';   // where enquiries are sent
   ```

5. Click the **Save** (💾) icon.

---

## Step 3 — Authorise it

1. In the toolbar function dropdown, select **`testSubmission`** and click **Run**.
2. Google will ask for permission:
   - Click **Review permissions** → choose your Google account.
   - You'll see *"Google hasn't verified this app"* → click **Advanced** →
     **Go to (project name) (unsafe)**. This is normal for your own scripts.
   - Click **Allow**.
3. Check the spreadsheet — a row named **Test Patient** should appear on an
   **Appointments** tab, and a test email should arrive at the clinic address.
4. Delete that test row.

---

## Step 4 — Deploy as a Web App

1. Click **Deploy → New deployment**.
2. Click the ⚙️ gear next to "Select type" → choose **Web app**.
3. Set:
   - **Description:** `Ambraja appointment form`
   - **Execute as:** **Me** (your account)
   - **Who has access:** **Anyone** ← *important, must be "Anyone", not "Anyone with Google account"*
4. Click **Deploy**, then **copy the Web app URL**.
   It looks like:
   `https://script.google.com/macros/s/AKfycb.....................xyz/exec`

---

## Step 5 — Connect the website ✅ DONE

The live Web App URL is already wired into [`js/script.js`](js/script.js):

```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzmBPOIdtHeEu0AgYU7egjdu02cPbigQ6yyk8IsN4TCn-npWppNSgZZOtUJHILyIGy4dQ/exec';
```

If you ever create a **new deployment** (rather than a new version of the existing
one), the URL changes — paste the new one here.

---

## What happens on each submission

| Action | Detail |
|---|---|
| **Sheet row added** | Timestamp, Name, Mobile, Email, Concern, Preferred Date, Message, Source |
| **Email to clinic** | Branded summary sent to `CLINIC_EMAIL`, with reply-to set to the patient |
| **Email to patient** | Confirmation with clinic address, phone, WhatsApp and timings — *only if they entered an email* |

---

## Updating the script later

If you edit `Code.gs`, you must **re-deploy** for changes to go live:

**Deploy → Manage deployments → ✏️ edit → Version: New version → Deploy**

The URL stays the same, so you don't need to change `script.js` again.

---

## Troubleshooting

**Form says "Could not submit"**
- Confirm **Who has access** is set to **Anyone**.
- Confirm the URL ends in `/exec` (not `/dev`).
- Open the URL directly in a browser — you should see
  `{"status":"ok","message":"... endpoint is running."}`

**Rows appear but no email arrives**
- Check spam/junk.
- Gmail limits free accounts to ~100 emails/day. Check
  **Apps Script → Executions** for quota errors.

**Nothing happens at all**
- Open the browser console (F12). If you see
  *"APPS_SCRIPT_URL not configured"*, Step 5 wasn't completed.

---

## Note on data privacy

Patient names, phone numbers, and health concerns are personal data.
Keep the spreadsheet **private** (do not share the link publicly), restrict access
to clinic staff only, and make sure your Privacy Policy page reflects that
enquiry details are stored and used to contact the patient about their appointment.
