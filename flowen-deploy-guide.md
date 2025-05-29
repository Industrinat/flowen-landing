# Flowen Deploy Guide: CodeSandbox ➔ GitHub ➔ VS Code ➔ Vercel

A complete guide to updating the Flowen project via CodeSandbox and publishing it to Vercel via GitHub.

---

## ✨ PART 1 – Make code changes in CodeSandbox and push to GitHub

1. **Open the project in CodeSandbox** (linked to GitHub)
2. **Create a new branch:**

   * Click the Git icon (left sidebar)
   * Click the current branch name > "Create new branch"
   * Name it e.g., `update-kanban` and click "Create & switch"
3. **Make your code changes**
4. **Commit & Push:**

   * Enter a commit message (e.g., `Fix layout`)
   * Click "Create Commit"
   * Click "Push to GitHub"

---

## 💻 PART 2 – Pull changes in VS Code

5. **Open the project folder in VS Code**
6. **Open a terminal and run:**

   ```bash
   git fetch
   git checkout update-kanban
   ```
7. **(Optional) Run the project locally:**

   ```bash
   npm install
   npm run dev
   ```

---

## 🚀 PART 3 – Deploy to Vercel via GitHub

### Option A: Merge into `main`

> Use this if Vercel is set to deploy from the `main` branch.

```bash
git checkout main
git pull origin main
git merge update-kanban
git push origin main
```

### Option B: Deploy directly from the feature branch

> Use this if Vercel is configured to deploy preview branches.

```bash
git push origin update-kanban
```

---

## 🔗 Deployment URLs

* Production: [https://flowen-site.vercel.app](https://flowen-site.vercel.app)
* Preview (branch): `https://flowen-site-git-{branch}-industrinat.vercel.app`

---

### 🛠️ How to open `.md` files

Markdown (`.md`) files can be opened and edited in:

* **VS Code** – with syntax highlighting and preview (use the `Markdown Preview` extension)
* **GitHub** – files are rendered nicely in the web UI
* **Obsidian** – if you use it for notes
* **Typora** – a markdown-focused editor
* **Notepad++ / Sublime Text** – for lightweight editing
* **Mac TextEdit / Windows Notepad** – simple, but lacks formatting support

To preview in VS Code:

* Press `Ctrl+Shift+V` or right-click the file tab and choose **"Open Preview"**

You can also convert `.md` to `.docx` using tools like:

* [https://pandoc.org/](https://pandoc.org/)
* VS Code extension: `Markdown PDF`

For support or issues, contact Daniel or check GitHub Actions / Vercel logs.
