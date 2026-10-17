# VibhillionAI — Static Website + Admin Panel

Pure HTML/CSS/JS site. Server, database, build step emi avasaram ledu.
**Code: GitHub · Hosting: Cloudflare Pages · Content updates: `admin.html`**

---

## 1. Pages
| File | Page |
|---|---|
| `index.html` | Home (AI Features section tho) |
| `exams.html` | All exams |
| `exam.html?id=appsc` | Main exam page shows categories; selecting a category opens its Overview, Exam Pattern, Roadmap, and Papers |
| `roadmaps.html` | All roadmaps |
| `papers.html` | Model & previous papers (filter + search) |
| `whatsapp.html` | WhatsApp channels |
| `about.html` | About |
| `admin.html` | **Admin Panel** (meeru matrame — site lo link ledu) |

Content antha okka file lo undi: `assets/js/data.js`. Admin Panel ee file ni update chesthundi.

---

## 2. One-time setup (≈ 20 min)

### Step A — GitHub repo
1. GitHub lo kotha repo create cheyandi, ex: `vibhillionai-website` (Private aina ok).
2. Ee folder lo unna **anni files** repo root lo upload cheyandi
   (GitHub website → *Add file → Upload files* → folder contents drag-drop → *Commit*).

### Step B — Cloudflare Pages
1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**
2. GitHub connect chesi mee repo select cheyandi.
3. Build settings: **Framework preset: None**, **Build command: khaali**, **Build output directory: `/`**
4. **Save and Deploy** → `xxxx.pages.dev` link vasthundi, check cheyandi.
5. Project → **Custom domains** → `vibhillionai.com` and `www.vibhillionai.com` add cheyandi.
   - Domain Cloudflare DNS lo lekapothe, Cloudflare ichina nameservers ni mee registrar lo pettandi.
   - Mee domain email (MX records) unte, avi Cloudflare DNS lo copy ayyayo check cheyandi.
6. Kotha site live ayyaka matrame paatha AI web ni stop cheyandi.

### Step C — Admin token
1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens → Generate new token**
2. Repository access: **Only select repositories** → mee website repo
3. Permissions → Repository → **Contents: Read and write**
4. `https://vibhillionai.com/admin.html` open chesi → **GitHub Setup** → username, repo, branch (`main`), token → **Save & Load**

### Step D — Admin page protect (required)
`admin.html` static page kabatti HTML/JavaScript lo password pettadam secure kaadu — source ni chusi password gate ni bypass cheyochu. Cloudflare Access ni page serve avvakamunde authentication kosam use cheyandi.

1. Cloudflare dashboard → **Zero Trust → Access → Applications → Add application → Self-hosted**.
2. Mee production custom hostnames (`vibhillionai.com`, `www.vibhillionai.com`) add chesi, path ni `/admin.html*` ga set cheyandi.
3. Policy: **Allow → Emails** → mee exact email addresses matrame add cheyandi. Email one-time PIN (OTP) identity provider enable cheyandi. Public/Everyone allow policy vadakandi.
4. Pages project → **Settings → General → Enable access policy** tho preview deployments ni kuda protect cheyandi. Preview URLs default ga public untayi.
5. `*.pages.dev` production hostname ni preview protection okkate protect cheyyadu. Cloudflare [Pages Access setup](https://developers.cloudflare.com/pages/platform/known-issues/#enable-access-on-your-pagesdev-domain) prakaram production `pages.dev` hostname ki Access enable chesi, preview protection ni malli verify cheyandi.
6. Incognito/private window lo production custom domains, production `pages.dev` hostname, mariyu preview URL nunchi `/admin.html` open chesi, anni Access login/deny chupistunnayo test cheyandi.

Access login tarvata kuda publish cheyadaniki Admin Panel lo GitHub token setup avasaram.

---

## 3. Daily use — Admin Panel
| Pani | Ela |
|---|---|
| Paper add | **Papers → ＋ Add Paper** → exam, title, year → upload a file, paste HTML code, add an external link, or choose Coming soon |
| Paper edit / order / delete | List lo **Edit / ↑ ↓ / Delete** |
| Main exam / category content | **Exams & Subsections** → main exam settings manage its identity and categories. Add categories at any depth to edit their Overview, Exam Pattern, and Roadmap. Add a paper and assign it to a category to show it on that category page. |
| Kotha exam | **＋ New Exam** |
| Homepage student photos | **Student Carousel** → update any of the 3 image URLs or upload a photo, then **Publish** |
| WhatsApp link | **WhatsApp Channels** → link paste |
| Play Store / social links | **Site Settings** |
| Live cheyadam | Pai **🚀 Publish** → 1–2 nimishallo site update |

- **Preview draft** — publish cheyakunda mundu changes chudochu. Exam pages and subsection links keep draft-preview mode, and each subsection also has its own **Preview** button in the admin.
- Student carousel images homepage phone number kindha automatic ga rotate avuthayi. Upload cheste image files kuda GitHub publish lo include avuthayi.
- Changes browser lo draft ga save avuthayi — refresh chesina pothayi kaadu (upload files matram malli select cheyali).
- Okka Publish = okka GitHub commit. Tappu jarigite GitHub → Commits lo paatha version ki revert cheyochu.

### Subsection detail formats
**Overview** — Enter the category description, then optional quick facts (`Label | Value`) and subjects (one per line).

**Quick facts** — `Label | Value`
```
Conducting Body | APPSC
Level | State
```
**Exam Pattern** — `## Stage` tarvata `Paper | Questions / Marks | Nature`
```
## Group-2 Screening Test
General Studies & Mental Ability | 150 Qs · 150 marks | Qualifying
```
**Roadmap** — `## Phase | Duration` tarvata `- point`
```
## Core Subjects | Week 2–8
- AP History, Polity, Economy
- Daily 2 topics + 25 MCQs
```

---

## 4. GitHub lekunda (offline mode)
Admin Panel lo changes chesi **Download data.js** → `assets/js/data.js` replace chesi upload cheyandi.
Carousel/blog/banner image files ni kuda downloaded `data.js` lo chupinchina paths (`assets/carousel/`, `assets/blog/`, `assets/banners/`) lo manual ga add cheyandi.
Paper files ni manual ga `papers/` folder lo pettali.

## 5. Limits (Cloudflare Pages free)
- Prathi file max 25 MiB · site ki max 20,000 files · nelaki 500 deploys
- Pedda PDFs unte compress cheyandi leda external link vaadandi.

## 6. Logo
SVG logo `assets/js/main.js` lo `LOGO` ga undi. Original logo kosam `assets/logo.png` add chesi
`LOGO` ni `<img class="brand-logo" src="assets/logo.png" alt="VibhillionAI">` ga marchandi.

⚠️ Exam pattern details general guidance kosam — kotha notification vachinappudu Admin Panel lo update cheyandi.
