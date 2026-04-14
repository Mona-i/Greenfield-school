# Greenfield Secondary School Website
## Complete Setup, Deployment & Maintenance Guide

---

## FOLDER STRUCTURE

```
greenfield-school/
├── index.html            ← Homepage
├── about.html            ← About the school
├── academics.html        ← Curriculum & classes
├── admissions.html       ← How to apply & fees
├── news.html             ← News & announcements
├── gallery.html          ← Photo gallery
├── contact.html          ← Contact form + Google Map
├── portal-login.html     ← Student & staff login
├── css/
│   └── style.css         ← All shared styles
├── js/
│   ├── main.js           ← All shared JavaScript
│   └── supabase-client.js ← Supabase backend functions
├── assets/
│   ├── logo.png          ← School logo (replace with yours)
│   └── images/           ← Any custom photos
└── supabase-schema.sql   ← Database setup script
```

---

## PART 1 — SUPABASE BACKEND SETUP

Supabase is a free online database platform. Think of it as the "brain" behind
your website — it stores student records, results, announcements, and contact
messages securely.

### Step 1: Create a Free Supabase Account

1. Open your browser and go to: **https://supabase.com**
2. Click the green **"Start your project"** button.
3. Sign up using your Google account or a school email address.
4. Once logged in, click **"New project"**.
5. Fill in the details:
   - **Project name**: e.g. `greenfield-school`
   - **Database password**: Choose a strong password and save it somewhere safe
   - **Region**: Select **"West US"** or any available region (there is no Nigeria
     region yet — West US or EU West are both fine)
6. Click **"Create new project"** and wait about 2 minutes for it to be ready.

---

### Step 2: Create the Database Tables

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar.
2. Click **"New query"** (the + button).
3. Open the file `supabase-schema.sql` from your project folder.
4. Copy ALL the text in that file (Ctrl+A then Ctrl+C).
5. Paste it into the Supabase SQL Editor.
6. Click the green **"Run"** button (or press Ctrl+Enter).
7. You should see a success message. Your tables are now created.

**Tip**: If you see any error messages, run the script in smaller sections —
first just the `CREATE TABLE` blocks, then the `ALTER TABLE` blocks, then the
`CREATE POLICY` blocks.

---

### Step 3: Enable Email & Password Authentication

1. In the left sidebar, click **"Authentication"**.
2. Click **"Providers"**.
3. Find **"Email"** in the list — it should already be enabled by default.
4. Make sure the toggle is **ON** (green).
5. Optional: Turn off **"Confirm email"** during testing so logins work
   immediately without verifying an email address. (Turn it back ON for live use.)

---

### Step 4: Verify Row Level Security (RLS) Is Active

RLS means each user can only see data they are allowed to see. You enabled it
via the SQL script in Step 2. Let's confirm:

1. In the left sidebar, click **"Table Editor"**.
2. Click on the **"students"** table.
3. At the top, you should see a padlock icon 🔒 saying **"RLS enabled"**.
4. Repeat for: `staff`, `announcements`, `contact_messages`, `results`.

If any table shows RLS as OFF, click the table → click the shield/padlock icon →
toggle it ON.

---

### Step 5: Find Your Supabase API Keys

Your website needs two pieces of information to talk to Supabase:

1. In the left sidebar, click **"Settings"** (gear icon ⚙️).
2. Click **"API"**.
3. You will see:
   - **Project URL** — looks like: `https://abcdefghijklmn.supabase.co`
   - **Project API keys → anon / public** — a long string of letters and numbers

Copy both of these. You need them in the next step.

---

### Step 6: Connect Your Website to Supabase

1. Open the file `js/supabase-client.js` in a thttps://ext editor (e.g. Notepad,
   VS Code, or Notepad++).
2. Find these two lines near the top:

   ```javascript
   const SUPABASE_URL  = '-----';
   const SUPABASE_ANON = '-----';
   ```

3. Replace `YOUR_SUPABASE_URL` with your Project URL (keep the quotes).
4. Replace `YOUR_SUPABASE_ANON_KEY` with your anon/public key (keep the quotes).

   Example (yours will be different):
   ```javascript
   const SUPABASE_URL  = 'https://abcdefghijklmn.supabase.co';
   const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```

5. Save the file.

---

### Step 7: Create Your First Admin User

1. In Supabase, click **"Authentication"** → **"Users"** → **"Invite user"**.
2. Enter the school admin email address.
3. The user will receive an email to set their password.
4. Once they log in, you will need to set their role in the user metadata.
   In the Supabase dashboard → Authentication → Users → click the user →
   edit "Raw User Meta Data" to add: `{"role": "admin"}`

For students/staff, set metadata like:
- Student: `{"role": "student", "student_id": "<uuid from students table>"}`
- Staff:   `{"role": "staff", "subject": "Mathematics"}`

---

## PART 2 — NETLIFY DEPLOYMENT (FREE)

Netlify lets you put your website on the internet for free in minutes.

### Step 1: Create a Free Netlify Account

1. Go to: **https://netlify.com**
2. Click **"Sign up"**.
3. Sign up with GitHub, GitLab, or an email address.
4. Complete the email verification if required.

---

### Step 2: Deploy Your Website

**Method A — Drag and Drop (Easiest)**

1. Log into your Netlify account.
2. On the dashboard, you will see a box that says:
   **"Drag and drop your site folder here"**
3. Open your computer's file explorer and find your `greenfield-school` folder.
4. Drag the ENTIRE `greenfield-school` folder and drop it onto that Netlify box.
5. Netlify will upload and deploy your site in about 30 seconds.
6. You will get a random URL like: `https://quirky-rainbow-12345.netlify.app`

**Method B — GitHub (Recommended for future updates)**

1. Upload your project folder to a free GitHub repository.
2. In Netlify, click **"New site from Git"**.
3. Connect your GitHub account and select the repository.
4. Netlify will automatically rebuild your site every time you update the files.

---

### Step 3: Set a Custom Netlify Subdomain

1. In your Netlify dashboard, click on your deployed site.
2. Click **"Site settings"** → **"Domain management"**.
3. Under **"Custom domains"**, click **"Options"** → **"Edit site name"**.
4. Type your preferred subdomain, e.g.: `greenfieldabuja`
5. Your site will now be at: **https://greenfieldabuja.netlify.app**
   (This is free and you can share this link immediately.)

---

### Step 4: Environment Variables (Optional)

If you prefer not to put your Supabase keys directly in the JavaScript file
(for better security), you can use Netlify environment variables. However, since
this is a public website using the **anon** key only (which is safe to expose),
putting them directly in the JS file is acceptable.

If you still want to use environment variables:
1. Netlify Dashboard → Site Settings → Environment Variables.
2. Add: `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
3. Then update your JS to read from these variables.

---

## PART 3 — CUSTOM NIGERIAN DOMAIN (Optional)

### Buy a .edu.ng or .com.ng Domain

Nigerian domain registrars:

| Registrar   | Website              | Notes                     |
|-------------|----------------------|---------------------------|
| WhoGoHost   | whogohost.com        | Popular, easy, Nigerian    |
| Web4Africa  | web4africa.ng        | .edu.ng specialist         |
| Qservers    | qservers.net         | Good local support         |

**Steps:**
1. Visit one of the registrars above.
2. Search for your domain, e.g. `greenfieldabuja.edu.ng`
   *(Note: .edu.ng requires proof of being an educational institution — you may
   need to submit your school's registration documents. Use .com.ng or .ng if
   .edu.ng is too complex to start.)*
3. Purchase the domain (typically ₦5,000–₦15,000 per year).
4. Create an account and pay via bank transfer or card.

### Point Your Domain to Netlify

1. In your Netlify dashboard → Site Settings → Domain Management.
2. Click **"Add custom domain"** and enter your domain (e.g.
   `greenfieldabuja.com.ng`).
3. Netlify will show you DNS records to add. You need two records:
   - **Type**: `A` | **Name**: `@` | **Value**: `75.2.60.5`
   - **Type**: `CNAME` | **Name**: `www` | **Value**: `greenfieldabuja.netlify.app`
4. Log into your domain registrar's control panel.
5. Find **"DNS Management"** or **"Nameservers"**.
6. Add the two records above.
7. Wait 24–48 hours for DNS to propagate (take effect worldwide).
8. Netlify provides a **free SSL certificate** automatically (your site will show
   the padlock 🔒 in browsers).

---

## AFTER DEPLOYMENT — 5 NEXT STEPS CHECKLIST

After your website is live, complete these five important steps:

### ✅ 1. Replace Placeholder Images
- Go to `https://picsum.photos` — the site currently uses random placeholder photos.
- Take real photographs of your school campus, classrooms, students (with guardian
  consent), and staff.
- Replace the `https://picsum.photos/seed/...` URLs in the HTML files with either:
  - Upload images to your `assets/images/` folder and use relative paths, e.g.
    `assets/images/campus-front.jpg`
  - Or upload to a free image CDN like Cloudinary and use those URLs.

### ✅ 2. Add Your School's Real Logo
- Replace the SVG shield crest in the navigation with your actual school logo.
- Save your logo as `assets/logo.png` (recommended size: 100×100px).
- In `css/style.css`, find `.nav-crest` and update it to show an `<img>` tag
  instead of the SVG.

### ✅ 3. Create Student & Staff Accounts in Supabase
- Log into your Supabase dashboard → Authentication → Users.
- Create accounts for your school admin, all teaching staff, and all students.
- For each user, set the correct `role` and `student_id` or `subject` in the
  user metadata (see Part 1, Step 7 above).
- Communicate login credentials to students and staff securely.

### ✅ 4. Enter Real School Data
- In Supabase → Table Editor → `students`: Add your student records.
- In Supabase → Table Editor → `staff`: Add your staff records.
- In Supabase → Table Editor → `announcements`: Add real announcements that will
  appear in the ticker bar. Delete or update the sample data.
- Update all the placeholder text in the HTML files with your school's real
  address, phone numbers, email addresses, and social media links.

### ✅ 5. Test Everything on Mobile and Announce the Website
- Open your website on a mobile phone (Android and iPhone if possible).
- Test: the ticker scrolls, the hamburger menu opens, the contact form submits,
  the portal login works with a real account.
- Once everything works, announce the website to parents via WhatsApp, SMS, and
  at the next school event.
- Consider printing the URL on your school letterhead, report cards, and notice
  boards.

---

## TROUBLESHOOTING

| Problem | Solution |
|---|---|
| Contact form shows error | Check that your Supabase URL and anon key are correctly pasted in `supabase-client.js`. Check the browser console (F12 → Console) for error messages. |
| Login not working | Ensure the user account exists in Supabase Authentication → Users. Check that Email auth is enabled. |
| Images not loading | Check internet connection. picsum.photos requires internet access. For offline use, download images and save locally. |
| Ticker bar not moving | Check that `main.js` is loading correctly. Open browser console (F12) for errors. |
| Website looks broken on phone | Resize your browser window to test. If specific elements are broken, check the CSS media queries at the bottom of `style.css`. |
| RLS blocking data access | Double-check user metadata — the `role` field must be set correctly. Use Supabase logs (Dashboard → Logs) to see failed queries. |

---

## TECHNICAL SUMMARY

| Component | Technology | Cost |
|---|---|---|
| Frontend | HTML5, CSS3, Vanilla JS | Free |
| Fonts | Google Fonts (Poppins + Merriweather) | Free |
| Images | picsum.photos (placeholders) | Free |
| Database | Supabase (PostgreSQL) | Free tier |
| Auth | Supabase Auth | Free tier |
| Hosting | Netlify | Free tier |
| Domain | .ng or .com.ng registrar | ~₦5,000–15,000/yr |
| SSL | Netlify auto-provision | Free |

**Supabase Free Tier limits**: 500MB database, 50,000 monthly active users,
2GB file storage. This is more than enough for a secondary school.

**Netlify Free Tier limits**: 100GB bandwidth/month, unlimited sites.
More than sufficient.

---

*Built for Greenfield Secondary School, Abuja, FCT, Nigeria.*
*Last updated: 2024. Replace with your real school name before deployment.*
