# 🪐 Orbit: an encrypted school planner

Orbit is a planner built for school. It's not a calendar clone. Instead of giving you an empty grid to fill in, it looks at everything you owe, ranks it, and **plans your study time for you**.

It runs entirely in your browser and is hosted free on GitHub Pages. Everything you enter is **encrypted behind your own username and password**.

## Features

| | |
|---|---|
| 🚀 **Launchpad** | Your daily home screen: the top 3 "mission" items, today's timeline (classes, deadlines, study blocks), a day streak, and weekly stats. |
| 📈 **Workload forecast** | A 14-day bar chart of how much work each day holds, colored against your personal daily capacity. You can spot an overloaded Thursday a week ahead. |
| ✨ **Auto-planner** | Give an assignment an effort estimate and Orbit splits it into study sessions on your lightest days. **Exams and quizzes use spaced repetition** (sessions 1, 2, 4, 7… days before) instead of cramming. |
| 🎯 **Smart priority** | Every item gets a Critical / High / Steady / Chill rating from *work left ÷ time left × grade weight*, not just its due date. |
| ⌨️ **Natural-language quick add** | Type `Calc midterm oct 14 9am #math ~5h 25%` and press Enter. Class, type, date, time, effort and weight are all detected. |
| 🌅 **Horizon view** | Three weeks laid out as one lane per class, showing deadlines and planned study blocks together. |
| 🗓 **Month heat map** | Each day is tinted by workload, and clicking a day shows its details. |
| 🎒 **Classes & grades** | Color-coded classes with meeting times, a weekly schedule, a live weighted grade, and "you need X% on the rest to reach 90%". |
| ⏱ **Focus mode** | A Pomodoro-style orbit timer tied to a task. Logged time counts against the estimate and checks off study blocks. |
| 📷 **Screenshots** | Upload (or paste, or drag in, or snap with your phone camera) pictures of your class schedule, syllabus, assignment sheets and notes. Attach them to a class or a specific assignment; your schedule is one tap away on the Launchpad. Images are compressed and **encrypted** like everything else. |
| ✅ **Steps** | Break big projects into subtasks and watch the progress bar fill. |
| 📱 **Works on phones** | Responsive layout with a bottom nav. It can be installed to your home screen and works offline. |
| 🌗 **Light / dark / auto** themes, keyboard shortcuts (`N` add, `1`–`7` views, `L` lock, `?` help), confetti 🎉 |

## Why it works this way (research notes)

The design is based on well-established study and planning practices:

- **Spaced repetition beats cramming.** Spreading exam review over several days leads to much better long-term retention than the same total time in one session (the "spacing effect"). Orbit schedules exam sessions on expanding intervals.
- **Backward planning / chunking.** Breaking a big deadline into small dated sessions reduces procrastination and "planning fallacy" overruns. The auto-planner does this chunking for you and front-loads work.
- **Prioritise by importance *and* urgency** (the Eisenhower idea), and weigh them by effort. That's why a 20% exam in 8 days can outrank a 5% worksheet due tomorrow.
- **Workload visibility.** Seeing load per day, not just deadlines, is what lets you rebalance before you're overloaded. Most calendar apps don't show this.
- **Timeboxed focus (Pomodoro)** with short breaks helps sustain attention, and **streaks** encourage a daily habit.
- **Low-friction capture.** If adding a task takes more than a few seconds, people stop doing it. That's the reason for quick add.

## Security

- **Accounts:** usernames are unique (case-insensitive) on each device. Passwords must be 10+ characters and pass a strength check that rejects common words, sequences, and your username.
- **The password is never stored**, not even as a hash. It's run through **PBKDF2-SHA256 with 600,000 iterations** (the OWASP recommendation) and a random salt, which produces a key-encryption key.
- A random 256-bit **data key** encrypts all your planner data with **AES-256-GCM**, using a fresh random IV on every save. The data key is itself stored encrypted ("wrapped") by your password key. The username is bound into every ciphertext, so encrypted data can't be swapped between accounts.
- **Wrong password = decryption fails.** The login doesn't compare hashes. It either opens the vault or it doesn't.
- **Recovery code:** at sign-up you get a one-time 120-bit recovery code, which also wraps the data key. It's the only way to reset a forgotten password, and it rotates after use.
- **Brute-force slowdown:** repeated failed logins trigger an escalating lockout (up to 15 min) on top of the deliberately slow key derivation.
- **Auto-lock** after inactivity (default 15 min, configurable). The key only lives in memory, so locking or reloading forgets it.
- **Strict Content-Security-Policy:** no third-party scripts, fonts, trackers, or network calls. All user text is rendered with `textContent` (never `innerHTML`), which blocks script injection.

**Where is my data?** It's stored *encrypted* in this browser (planner data in local storage, screenshots in IndexedDB — same key, AES-256-GCM, fresh IV per file). Nothing is uploaded, which also means nothing syncs automatically. To use another device or keep a safety copy, go to **Settings → Encrypted backup** and restore the file on the other device from the login screen. The backup stays encrypted.

> Because nothing is sent to a server, nobody (including the site owner) can reset your password without your recovery code. Keep it safe!

## Hosting it on GitHub Pages

1. Merge this into `main`.
2. In the repo on GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The included workflow (`.github/workflows/pages.yml`) deploys on every push to `main`. The site appears at `https://<your-username>.github.io/<repo-name>/`.

## Running locally

It's plain HTML/CSS/JavaScript with no build step. Serve the folder over `localhost` (the browser only allows its encryption API on `https://` or `localhost`):

```bash
npx http-server .   # or: python3 -m http.server
```

## Project layout

```
index.html          app entry (strict CSP)
css/style.css       all styling, light + dark themes
js/app.js           login/sign-up screens, shell, saving, auto-lock, quick add
js/vault.js         accounts + encryption (PBKDF2, AES-GCM, recovery codes)
js/logic.js         priority, auto-planner, workload forecast, grades, streaks, .ics export
js/parse.js         natural-language quick-add parser
js/views.js         Launchpad, Horizon, Month, Tasks, Classes, Focus, Settings, editors
js/ui.js            modals, toasts, confetti
js/attach.js        screenshot upload, gallery, viewer, Files page
js/files.js         IndexedDB storage + image compression
sw.js               offline cache (app files only, never your data)
```
