# How to publish this site on GitHub Pages

You'll do this entirely in your web browser. No command line. ~10 minutes.

---

## Step 1: Create a new GitHub repository

1. Open <https://github.com> and sign in.
2. Click the **+** (top-right) → **New repository**.
3. Fill in:
   - **Repository name:** `cardio-trial-matcher` (any name works, but this is clean)
   - **Public** (required for free GitHub Pages)
   - **Leave everything else unchecked**; do NOT add a README, .gitignore, or license. We already have those.
4. Click **Create repository**.

You'll land on an empty repo page that says "Quick setup."

---

## Step 2: Upload the project files

1. On that empty-repo page, look for the link **"uploading an existing file"** (in the middle of the page). Click it.
2. In a separate **Finder window**, open your folder:
   `Documents/Claude/Projects/Cardiology trials/cardio-trial-matcher/`
3. Select **all the contents** of that folder (Cmd+A); files AND folders. Important: select what's INSIDE the folder, not the folder itself.
4. **Drag everything** into the GitHub upload area in your browser.
5. Wait for all files to finish uploading (you'll see a list build up; should be ~18 items including the `.github` folder).
6. Scroll down. In the "Commit changes" box:
   - Title: `Initial upload`
   - Click the green **Commit changes** button.

> ⚠️ **If the `.github` folder doesn't appear in the upload list:** macOS sometimes hides dotfiles. In Finder, press **Cmd+Shift+.** to show hidden files, then redo the drag. The `.github/workflows/deploy.yml` file is essential; it's the script that builds the site.

---

## Step 3: Turn on GitHub Pages

1. In your new repo, click the **Settings** tab (top of the page, far right).
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions** from the dropdown. (Not "Deploy from a branch.")
4. That's it; no save button needed.

---

## Step 4: Wait for the site to build

1. Click the **Actions** tab (top of the repo).
2. You'll see a workflow called "Deploy to GitHub Pages" running with a yellow spinning circle. It takes about **2 minutes** the first time.
3. When the circle turns into a green checkmark ✅, you're done.

> If you see a red ❌ instead: click into the failed run, scroll through the log, and copy any red error text back to me; I'll fix it.

---

## Step 5: Get your URL

1. Go back to **Settings → Pages**.
2. At the top of that page you'll see:
   > **Your site is live at https://<your-username>.github.io/cardio-trial-matcher/**
3. Click the URL. Bookmark it. **Send it to your colleague**; it works in any browser, on any device.

---

## Updating the site later

Whenever you want to change something (add a new trial, edit a criterion):

1. Edit the file locally in your `Cardiology trials` folder.
2. In your repo on GitHub, navigate to that file → click the pencil icon (✏️ Edit) → paste in the new content → **Commit changes**.
3. The Action re-runs automatically and your site updates in ~2 minutes.

(For bigger changes you'll eventually want **GitHub Desktop**; it's a free app that lets you drag a folder and click "push" to update everything at once. Search "GitHub Desktop download.")

---

## Troubleshooting

**"404 page not found" when I open the URL** → wait another minute, the Action may still be running. Hard-refresh with Cmd+Shift+R.

**Blank page with no errors** → open browser dev tools (Cmd+Option+I → Console). The error will tell you what's wrong. Most often it's the `base` path in `vite.config.js` not matching your repo name. Make sure `vite.config.js` says `base: './'` (with the dot).

**The Action failed at "npm install"** → this can happen if the `package.json` upload got corrupted. Re-upload it.

---

That's the whole flow. Once it's live, your colleague just needs the URL; nothing else to install.
