# 🪐 Orbit: study smarter, with your planner in the background

Orbit turns your classwork into things you can study. Upload a PDF of your notes, a study guide, or a worksheet and Orbit builds a **study set**: flashcards, an adaptive Learn mode, practice tests, a match game, and key points. It then brings each card back for review right before you'd forget it. Your class calendar still works, but it runs quietly in the background and feeds your test dates into what you study.

Everything runs in your browser and is hosted free on GitHub Pages. All your data is **encrypted behind your username and password**.

## Study features

| | |
|---|---|
| 📄 **PDF → study set** | Drop in a PDF (or several) and Orbit reads it, finds vocabulary (`Term: definition`, `Term – definition`), definition sentences ("Osmosis is…"), Q&A pairs, and important facts for fill-in-the-blank cards. You review and edit the cards before saving. It also works with pasted notes and **imports Quizlet exports** (tab-separated). |
| 🃏 **Flashcards** | Flip cards and sort them into *know it* / *still learning*, then re-study only the misses. Shuffle, swap sides, star cards. |
| 🪐 **Learn** | Adaptive rounds. Each card must be answered correctly by **multiple choice**, then by **typing** it. Misses come back a few questions later. Typing is forgiving of small typos, and there's an "I was right" override. |
| 📝 **Test** | Build a practice test from multiple-choice, true/false, and written questions, then get a score and see every mistake. |
| ⚡ **Match** | Race the clock pairing terms with definitions. Wrong pairs cost a second, and your best time is saved. |
| 🧠 **Review (spaced repetition)** | A daily queue across all your sets. Rate each card Again / Hard / Good / Easy and Orbit schedules the next review (10 min → 1 day → 3 → a week → a month…). |
| 🌌 **Orbits** | Every card moves New → Launching → Outer orbit → Inner orbit → **Mastered**, so you can see exactly how ready you are, per set and per test. |
| 🎯 **Exam boost** *(the planner in the background)* | When a class has an exam or quiz within a week, that class's unmastered cards are pulled into your daily review early. Home shows each upcoming test with a "% ready" bar and a Study button. |
| ✨ **Key points** | The most information-dense sentences from your material, plus the main topics, for quick skimming. |

## AP courses

Pick your AP classes from the built-in catalog of **23 AP courses**. Each comes set up from its official College Board Course and Exam Description (CED): every unit with its exam weighting, the exam's sections, question counts, and timing, plus study tips.

- **Import the CED.** Upload the free CED PDF and Orbit reads each unit's topics, learning objectives, and essential knowledge, then turns them into cards for the right unit.
- **AP Classroom material.** AP Classroom has no public API and sits behind your College Board sign-in, so Orbit can't (and shouldn't) log in for you. Instead, print any progress check or resource to PDF (Ctrl/⌘+P → Save as PDF) or copy its text, and add it. Orbit detects the unit and pulls out **multiple-choice questions with their answer keys** into a question bank. It makes flashcards from notes too.
- **Unit tests.** Timed at the real exam's per-question pace, using your question bank first and then questions generated from your cards.
- **Practice AP exams.** Full-length, half-length, or multiple-choice only, with the real exam's sections and timing. MCQs are spread across units by their official weighting. There's a Bluebook-style question navigator and mark-for-review, and sections auto-submit when time runs out. You self-score FRQs against the rubric. Results show an **estimated 1–5 score** and a per-unit breakdown pointing to your weakest units.
- **FRQ bank.** Paste released free-response questions (free on each course's "Past FRQs" page) with their scoring guidelines. If there are none, CED learning objectives are used as prompts.
- **AP exam date.** Add it to the Planner, and the exam boost kicks in for that course's cards in the final week.
- **Study plan to exam day.** One click fills your Planner with unit reviews, weighted by exam weight and how much you've mastered, then switches to weekly full practice exams for the final stretch.
- **Focus next.** Recommends the units most worth your time: exam weight × unmastered cards × recent unit-test scores.
- **Study my mistakes.** After any test, missed questions go into a starred "Mistakes" deck, along with the answer explanation when the source had one.
- **Real rubric scales** for free response: SAQ out of 3, DBQ out of 7, LEQ out of 6, AP Psych AAQ/EBQ out of 7, English essays out of 6.
- **Score trend** chart across unit tests and practice exams, plus an **FRQ task-verb guide** (identify vs. describe vs. explain vs. justify…).
- Exams you leave midway can be resumed, and auto-lock never interrupts an exam in progress.

**Regular classes:** your own PDFs come first. If you have none, the AP & Courses page suggests free, openly-licensed material for each class, such as an OpenStax textbook (downloadable PDF) and Khan Academy, which you can upload to make a study set.

## Planner (background)

The original planner lives under **Planner**: an overview with a workload forecast, a 3-week Horizon view, a month heat map, and tasks, plus natural-language quick add (`Calc midterm oct 14 9am #math !exam`), classes with grades, screenshots of schedules and work, and a focus timer.

## Why it works this way (research notes)

The design is based on well-established study and planning practices:

- **Retrieval practice ("the testing effect").** Actively recalling an answer (quizzing, typing it out) builds much stronger memory than rereading notes. That's why Learn moves from recognising the answer (multiple choice) to recalling it (typing).
- **Spaced repetition.** Reviewing just before you'd forget, at growing intervals, is one of the most reliably proven ways to remember things long-term. Orbit uses a variant of the SM-2 algorithm (the one behind Anki and SuperMemo).
- **Interleaving and immediate feedback.** Mixing cards and showing the right answer straight away helps you avoid memorising wrong answers.

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

**Where is my data?** It's stored *encrypted* in this browser. Study sets and planner data are in local storage. PDFs, their extracted text, and screenshots are in IndexedDB. Everything uses the same key: AES-256-GCM with a fresh IV per file. PDFs are read on your device and never uploaded anywhere. Nothing is uploaded, which also means nothing syncs automatically. To use another device or keep a safety copy, go to **Settings → Encrypted backup** and restore the file on the other device from the login screen. The backup stays encrypted.

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
js/study.js         Home, Library, study sets, Flashcards / Learn / Test / Match / Review
js/srs.js           spaced-repetition scheduling, orbits, review queue, exam boost
js/gen.js           card generator (glossary, definitions, Q&A, fill-in-the-blank, key points)
js/pdf.js           PDF text extraction (uses the bundled pdf.js)
js/ap.js            AP courses: units, CED import, AP Classroom material, unit tests, practice exams
js/apcatalog.js     AP course catalog (units, exam weightings, exam formats) + free resources for regular classes
js/apparse.js       CED parser, multiple-choice/answer-key parser, FRQ splitter, unit detection
vendor/pdfjs/       Mozilla pdf.js (Apache-2.0), bundled so no outside servers are contacted
js/ui.js            modals, toasts, confetti
js/attach.js        screenshot upload, gallery, viewer, Files page
js/files.js         IndexedDB storage + image compression
sw.js               offline cache (app files only, never your data)
```
