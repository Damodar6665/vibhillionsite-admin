/* =========================================================
   VibhillionAI — shared layout + page rendering
   ========================================================= */

/* ---------- Data (assets/js/data.js → window.VIBHI_DATA) ----------
   Open with ?preview=1 to view the draft saved in the Admin Panel. */
let RAW = window.VIBHI_DATA || {};
try {
  if (new URLSearchParams(location.search).get("preview") === "1") {
    const d = JSON.parse(localStorage.getItem("vibhi_admin_draft") || "null");
    if (d && d.data) RAW = d.data;
  }
} catch (e) { /* storage unavailable */ }
const SITE = Object.assign({ name: "VibhillionAI", tagline: "", domain: "", phone: "", whatsappNumber: "", playStoreUrl: "#", social: {} }, RAW.site || {});
SITE.social = SITE.social || {};
SITE.year = new Date().getFullYear();
function normalizeSubExam(sub) {
  const normalized = Object.assign({ full: "", about: "", facts: [], pattern: [], subjects: [], roadmap: [], subs: [] }, sub);
  normalized.subs = (Array.isArray(normalized.subs) ? normalized.subs : []).map(normalizeSubExam);
  return normalized;
}
const EXAMS = (RAW.exams || []).map(e => Object.assign({ full: "", icon: "other", color: "#146c43", about: "", official: "", facts: [], pattern: [], subjects: [], roadmap: [], subs: [] }, e, {
  subs: (Array.isArray(e.subs) ? e.subs : []).map(normalizeSubExam)
}));
const MAGAZINES = RAW.magazines || [];
const FAQS = (RAW.faqs || []).filter(f => f && f.question && f.answer);

const BLOG = (RAW.blog || []).slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
const BANNERS = (RAW.banners || []).filter(b => b && b.active !== false);
const STUDENT_CAROUSEL = (RAW.studentCarousel || []).filter(s => s && s.image).slice(0, 3);
const HERO_STUDENT_IMAGE = SITE.heroImage || "assets/student-preparation-hero.png";


const PAPERS = (RAW.papers || []).filter(p => p && p.title);
const CHANNELS = (RAW.channels || []).filter(c => EXAMS.some(e => e.id === c.exam));
const FALLBACK_EXAM = { id: "", name: "Exam", full: "", icon: "other", color: "#555" };

/* ---------- Icons ---------- */
const S = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const ICON = {
  home: S('<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),
  arrow: S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  chev: S('<path d="M9 6l6 6-6 6"/>'),
  play: S('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),
  doc: S('<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 12h6M10 16h6"/>'),
  route: S('<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 000-6H8a3 3 0 010-6h8"/>'),
  list: S('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>'),
  chat: S('<path d="M4 5h16v11H9l-5 4z"/><path d="M9 10l2 2 4-4"/>'),
  wa: S('<path d="M12 3a9 9 0 00-7.8 13.5L3 21l4.6-1.2A9 9 0 1012 3z"/><path d="M8.5 8.5c0 4 3 7 7 7l1-1.6-2-1-1 1c-1.4-.6-2.4-1.6-3-3l1-1-1-2z" fill="currentColor" stroke="none"/>'),
  search: S('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
  download: S('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  eye: S('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  shield: S('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
  target: S('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>'),
  menu: S('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  grid: S('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
  ext: S('<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>'),
  // exam icons
  upsc: S('<path d="M3 21h18M4 10h16M12 3l8 5H4z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>'),
  appsc: S('<circle cx="12" cy="12" r="8"/><path d="M12 4v16M8 6.5v11M16 6.5v11"/>'),
  tgpsc: S('<path d="M4 20h16M6 20V9l6-5 6 5v11"/><path d="M10 20v-5h4v5M9 11h6"/>'),
  ssc: S('<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M12 8l1.3 2.7 3 .4-2.2 2 .6 3-2.7-1.5-2.7 1.5.6-3-2.2-2 3-.4z"/>'),
  rrb: S('<rect x="6" y="3" width="12" height="13" rx="3"/><path d="M6 10h12M9 19l-2 2M15 19l2 2"/><circle cx="9" cy="13" r=".8" fill="currentColor"/><circle cx="15" cy="13" r=".8" fill="currentColor"/>'),
  bank: S('<path d="M3 21h18M5 10h14M12 3l8 5H4z"/><path d="M7 10v8M12 10v8M17 10v8"/>'),
  jee: S('<circle cx="12" cy="12" r="1.6" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>'),
  neet: S('<path d="M6 3v5a4 4 0 008 0V3"/><path d="M10 12v3a5 5 0 0010 0v-2"/><circle cx="20" cy="11" r="2"/>'),
  dsc: S('<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20l4-4 4 4M7 9h6M7 12h4"/>'),
  other: S('<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5M22 9v6"/>'),
  // social
  youtube: S('<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>'),
  instagram: S('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>'),
  telegram: S('<path d="M21 4L3 11l6 2 2 6 3-4 5 4z"/><path d="M9 13l8-6"/>'),
  whatsapp: S('<path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.3L4 20l1.1-4A8.5 8.5 0 1 1 20.5 11.6Z"/><path d="M8.3 8.1c.3-.6.6-.6.9-.6h.5c.2 0 .4.1.5.4l.8 1.9c.1.2.1.4-.1.6l-.6.8c-.2.2-.2.4 0 .7.6 1 1.4 1.8 2.4 2.3.2.1.4.1.6-.1l.8-1c.2-.2.4-.3.7-.2l1.8.9c.3.1.4.3.4.5 0 .4-.2 1.2-.7 1.6-.5.5-1.2.7-1.9.6-1-.1-2.2-.6-3.5-1.5-1.7-1.2-2.9-2.8-3.3-3.7-.5-1-.5-1.9-.2-2.5.2-.4.5-.7.9-.7Z" fill="currentColor" stroke="none"/>'),
  x: S('<path d="M4 4l16 16M20 4L4 20"/>')
};

const LOGO = `<svg class="brand-logo" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
  <circle cx="32" cy="32" r="28"/>
  <g stroke-width="1.6">
    <path d="M32 6L32 58M9 19L55 45M9 45L55 19"/>
    <path d="M32 14L47 23L47 41L32 50L17 41L17 23Z"/>
    <path d="M32 22L40 27L40 37L32 42L24 37L24 27Z"/>
  </g>
  <g fill="currentColor" stroke="none">
    <circle cx="32" cy="14" r="2.6"/><circle cx="47" cy="23" r="2.6"/><circle cx="47" cy="41" r="2.6"/>
    <circle cx="32" cy="50" r="2.6"/><circle cx="17" cy="41" r="2.6"/><circle cx="17" cy="23" r="2.6"/>
    <circle cx="32" cy="32" r="3.2"/>
  </g>
</svg>`;

const PLAY_ICON = `<svg viewBox="0 0 24 24"><path fill="#34a853" d="M3.6 2.3l10.5 10.5L3.6 21.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1z"/><path fill="#fbbc04" d="M17.6 9.3l-3.5 3.5 3.5 3.5 4-2.3c.9-.5.9-1.9 0-2.4z"/><path fill="#4285f4" d="M14.1 12.8L3.6 21.7c.3.2.8.2 1.2 0l12.8-5.4z"/><path fill="#ea4335" d="M3.6 2.3c.4-.2.9-.2 1.2 0l12.8 7-3.5 3.5z"/></svg>`;

/* ---------- Helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const examById = id => EXAMS.find(e => e.id === id);
const subExamById = (exam, id, parents = []) => {
  for (const sub of (exam.subs || [])) {
    const path = [...parents, sub];
    if (sub.id === id) return { sub, path };
    const nested = subExamById(sub, id, path);
    if (nested) return nested;
  }
  return null;
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const examSymbol = name => {
  const n = String(name || "").toLowerCase();
  if (/\bupsc\b|civil services/.test(n)) return "🏛️";
  if (/\bappsc\b/.test(n)) return "🗺️";
  if (/\btgpsc\b|telangana/.test(n)) return "🏙️";
  if (/\bssc\b/.test(n)) return "📝";
  if (/\brrb\b|railway/.test(n)) return "🚆";
  if (/bank|ibps|\bsbi\b/.test(n)) return "🏦";
  if (/\bjee\b|engineering/.test(n)) return "⚛️";
  if (/\bneet\b|medical/.test(n)) return "🩺";
  if (/\bdsc\b|teacher/.test(n)) return "📚";
  return "🎓";
};
const examIcon = (e, size = "") => `<span class="exam-icon exam-symbol ${size}" style="background:${esc(e.color || "#555")}" role="img" aria-label="${esc(e.name)} symbol">${e.iconImage ? `<img src="${esc(e.iconImage)}" alt="" loading="lazy">` : examSymbol(e.name)}</span>`;
const param = k => new URLSearchParams(location.search).get(k);
const withDraftPreview = href => {
  if (param("preview") !== "1") return href;
  const [path, hash] = href.split("#", 2);
  const query = new URLSearchParams(path.split("?")[1] || "");
  query.set("preview", "1");
  return `${path.split("?")[0]}?${query}${hash ? `#${hash}` : ""}`;
};

/* ---------- Header / Footer ---------- */
const NAV = [
  ["index.html", "Home", "home"],
  ["exams.html", "Exams", "exams"],
  ["index.html#ai-features", "AI Features", "ai"],
  ["roadmaps.html", "Roadmaps", "roadmaps"],
  ["papers.html", "Model Papers", "papers"],
  ["blog.html", "Blog", "blog"],
  ["whatsapp.html", "WhatsApp", "whatsapp"],
  ["about.html", "About", "about"]
];

function renderHeader(active) {
  const el = $("#site-header");
  if (!el) return;
  const selected = active === "home" && location.hash === "#ai-features" ? "ai" : active;
  el.className = "site-header";
  el.innerHTML = `
  <div class="container nav">
    <a href="${withDraftPreview("index.html")}" class="brand" aria-label="VibhillionAI home">
      <img class="brand-logo" src="assets/vibhillion-mark.jpg" alt="">
      <div><div class="brand-name">VIBHILLION <span>AI</span></div><div class="brand-tag">${SITE.tagline}</div></div>
    </a>
    <div class="nav-menu" id="main-navigation">
      <nav class="nav-links" aria-label="Main navigation">
        ${NAV.map(([h, l, k]) => `<a href="${withDraftPreview(h)}" class="${k === selected ? "active" : ""}"${k === selected ? ' aria-current="page"' : ""}>${l}</a>`).join("")}
      </nav>
      <a class="btn btn-primary nav-cta" href="${SITE.playStoreUrl}" target="_blank" rel="noopener">${ICON.play} Open VibhillionAI App</a>
    </div>
    <button class="menu-btn" type="button" aria-label="Open navigation menu" aria-expanded="false" aria-controls="main-navigation">${ICON.menu}</button>
  </div>`;
  const menuButton = $(".menu-btn", el);
  const closeMenu = () => {
    el.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation menu");
  };
  menuButton.onclick = () => {
    const isOpen = el.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  };
  $(".nav-menu", el).onclick = event => {
    if (event.target.closest("a")) closeMenu();
  };
  el.onkeydown = event => {
    if (event.key === "Escape" && el.classList.contains("open")) {
      closeMenu();
      menuButton.focus();
    }
  };
}

function renderFooter() {
  const el = $("#site-footer");
  if (!el) return;
  const waNumber = String(SITE.whatsappNumber || "").replace(/\D/g, "");
  const socialLinks = Object.assign({}, SITE.social, { whatsapp: waNumber ? `https://wa.me/${waNumber}` : "" });
  const socialOrder = ["instagram", "youtube", "telegram", "whatsapp", "x"];
  const socials = socialOrder.filter(k => ICON[k] && /^https?:\/\//i.test(socialLinks[k] || ""))
    .map(k => `<a href="${esc(socialLinks[k])}" target="_blank" rel="noopener noreferrer" aria-label="${esc(k)}" title="${k === "whatsapp" ? "Chat with us on WhatsApp" : `Visit us on ${esc(k)}`}">${ICON[k]}</a>`).join("");
  const phoneHtml = SITE.phone ? `<div class="phone-bar">📞 Call / WhatsApp: <a href="tel:${SITE.phone}">+91 ${SITE.phone}</a> · Free mock tests, previous papers, current affairs &amp; roadmaps · <b>No login required</b></div>` : "";
  el.innerHTML = phoneHtml + `
  <div class="strip"><div class="container strip-grid">
    <a href="${withDraftPreview("index.html")}" class="brand">${LOGO}<div><div class="brand-name">VIBHILLION <span>AI</span></div><div class="brand-tag">${SITE.tagline}</div></div></a>
    <div class="strip-item"><span class="ic">${ICON.grid}</span>Multiple Exams<br>One Platform</div>
    <div class="strip-item"><span class="ic">${ICON.route}</span>Expert Curated<br>Roadmaps</div>
    <div class="strip-item"><span class="ic">${ICON.doc}</span>Mock Tests &amp;<br>Previous Papers</div>
    <div class="strip-item"><span class="ic">${ICON.wa}</span>Daily Current<br>Affairs</div>
  </div></div>
  <div class="foot"><div class="container foot-row">
    <div>© ${SITE.year} ${SITE.name}. All rights reserved.${SITE.phone ? " · +91 " + SITE.phone : ""}</div>
    <nav class="foot-links">${NAV.map(([h, l]) => `<a href="${withDraftPreview(h)}">${l}</a>`).join("")}</nav>
    <div class="foot-connect"><div class="socials" aria-label="Connect with VibhillionAI">${socials}</div></div>
  </div></div>`;
}

/* ---------- Reusable blocks ---------- */
const examCard = (e, showDescription = true) => `
  <a class="exam-card" href="${withDraftPreview(`exam.html?id=${encodeURIComponent(e.id)}`)}">
    ${examIcon(e)}
    <div class="meta"><h4>${e.name}</h4>${showDescription && e.full ? `<p>${e.full}</p>` : ""}</div>
    <span class="chev">${ICON.chev}</span>
  </a>`;

const roadmapMini = e => `
  <a class="mini" href="${withDraftPreview("roadmaps.html")}">
    ${examIcon(e, "sm")}
    <div><b>${e.name}</b><br><small>Roadmap</small></div>
  </a>`;

function paperRow(p) {
  const e = examById(p.exam) || Object.assign({}, FALLBACK_EXAM, { name: p.exam });
  let action;
  const href = p.url ? p.url : (p.file ? "papers/" + encodeURI(p.file) : "");
  if (p.htmlText) action = `<button class="dl" type="button" data-paper-html="${PAPERS.indexOf(p)}">${ICON.eye} View</button>`;
  else if (!href) action = `<span class="chip" style="font-size:.72rem;padding:4px 10px">Coming Soon</span>`;
  else if (p.type === "pdf") action = `<a class="dl" href="${esc(href)}" target="_blank" rel="noopener" ${p.url ? "" : "download"}>${ICON.download} PDF</a>`;
  else action = `<a class="dl" href="${esc(href)}" target="_blank" rel="noopener">${ICON.eye} Open</a>`;
  return `<tr><td><span class="ex">${examIcon(e, "sm")}${e.name}</span></td><td>${esc(p.title)}</td><td>${p.year}</td><td>${action}</td></tr>`;
}

document.addEventListener("click", ev => {
  const trigger = ev.target.closest("[data-paper-html]");
  if (!trigger) return;
  const paper = PAPERS[Number(trigger.dataset.paperHtml)];
  if (!paper || !paper.htmlText) return;
  let dialog = $("#paper-html-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "paper-html-dialog";
    dialog.className = "paper-html-dialog";
    dialog.innerHTML = `<div class="paper-html-dialog-head"><h2></h2><button type="button" class="b" data-paper-dialog-close>Close</button></div><iframe title="Paper content" sandbox="allow-scripts"></iframe>`;
    document.body.append(dialog);
    dialog.querySelector("[data-paper-dialog-close]").onclick = () => dialog.close();
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  }
  dialog.querySelector("h2").textContent = paper.title;
  dialog.querySelector("iframe").srcdoc = paper.htmlText;
  if (!dialog.open) dialog.showModal();
});

function waCard(c) {
  const e = examById(c.exam);
  const btn = c.url
    ? `<a class="wa-btn" href="${c.url}" target="_blank" rel="noopener">Join Channel</a>`
    : `<span class="wa-btn" style="opacity:.55">Coming Soon</span>`;
  return `<div class="wa-card"><div class="top">${examIcon(e, "sm")}<b>${e.name}</b></div><small>${c.desc}</small>${btn}</div>`;
}

/* ---------- Papers table with filter + search ---------- */
function mountPapers(root, limit) {
  const used = [...new Set(PAPERS.map(p => p.exam))].filter(id => examById(id));
  let filter = "all", q = "";
  root.innerHTML = `
    <div class="sec-head" style="margin-bottom:12px">
      <div class="chips">${[["all", "All Exams"], ...used.map(id => [id, examById(id).name])]
        .map(([id, l]) => `<button class="chip ${id === "all" ? "active" : ""}" data-f="${id}">${l}</button>`).join("")}</div>
      <label class="search">${ICON.search}<input type="search" placeholder="Search papers..."></label>
    </div>
    <div class="tbl-wrap"><table><thead><tr><th>Exam</th><th>Paper</th><th>Year</th><th>Action</th></tr></thead><tbody></tbody></table></div>`;
  const tbody = $("tbody", root);
  const draw = () => {
    let rows = PAPERS.filter(p => (filter === "all" || p.exam === filter) && p.title.toLowerCase().includes(q));
    if (limit) rows = rows.slice(0, limit);
    tbody.innerHTML = rows.length ? rows.map(paperRow).join("") : `<tr><td colspan="4" class="empty">No papers have been added yet. Please check back soon.</td></tr>`;
  };
  root.querySelectorAll(".chip").forEach(b => b.onclick = () => {
    root.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
    b.classList.add("active"); filter = b.dataset.f; draw();
  });
  $("input", root).oninput = ev => { q = ev.target.value.trim().toLowerCase(); draw(); };
  const pre = param("exam");
  if (pre && used.includes(pre)) $(`.chip[data-f="${pre}"]`, root).click(); else draw();
}

/* ---------- Pages ---------- */
const PAGES = {
  home() {
    const planCard = $(".plan-card");
    if (planCard) {
      let blastTimer;
      const replayBlast = () => {
        window.clearTimeout(blastTimer);
        planCard.classList.remove("blast-play");
        void planCard.offsetWidth;
        planCard.classList.add("blast-play");
        blastTimer = window.setTimeout(() => planCard.classList.remove("blast-play"), 900);
      };
      planCard.addEventListener("click", event => {
        if (!event.target.closest("a,button")) replayBlast();
      });
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        planCard.addEventListener("pointerenter", replayBlast);
      }
      planCard.addEventListener("keydown", event => {
        if (event.target === planCard && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          replayBlast();
        }
      });
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        if ("IntersectionObserver" in window) {
          const revealObserver = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
              replayBlast();
              revealObserver.disconnect();
            }
          }, { threshold: 0.25 });
          revealObserver.observe(planCard);
        } else {
          replayBlast();
        }
      }
    }
    if (planCard && window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      planCard.addEventListener("pointermove", event => {
        const bounds = planCard.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        planCard.style.setProperty("--plan-tilt-x", `${-y * 7}deg`);
        planCard.style.setProperty("--plan-tilt-y", `${x * 8}deg`);
        planCard.style.setProperty("--plan-light-x", `${(x + 0.5) * 100}%`);
        planCard.style.setProperty("--plan-light-y", `${(y + 0.5) * 100}%`);
      });
      planCard.addEventListener("pointerleave", () => {
        planCard.style.setProperty("--plan-tilt-x", "0deg");
        planCard.style.setProperty("--plan-tilt-y", "0deg");
        planCard.style.setProperty("--plan-light-x", "100%");
        planCard.style.setProperty("--plan-light-y", "0%");
      });
    }
    const desktopHeroArt = $(".hero-art");
    if (desktopHeroArt) {
      desktopHeroArt.classList.add("student-hero-art");
      desktopHeroArt.innerHTML = `<img src="${HERO_STUDENT_IMAGE}" alt="Student preparing for exams at a study desk">`;
    }
    const carousel = $("#student-carousel");
    if (carousel) {
      if (!STUDENT_CAROUSEL.length) carousel.hidden = true;
      else {
        carousel.innerHTML = `
          <div class="student-carousel-frame" aria-roledescription="carousel">
            ${STUDENT_CAROUSEL.map((slide, i) => `
              <div class="student-slide${i === 0 ? " active" : ""}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${STUDENT_CAROUSEL.length}" aria-hidden="${i !== 0}">
                <img src="${esc(slide.image)}" alt="${esc(slide.alt || "Student preparing for exams")}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
                <span class="student-slide-brand">VibhillionAI</span>
                ${slide.caption ? `<div class="student-slide-caption">${esc(slide.caption)}</div>` : ""}
              </div>`).join("")}
            <button class="student-carousel-control prev" type="button" aria-label="Previous image">‹</button>
            <button class="student-carousel-control next" type="button" aria-label="Next image">›</button>
          </div>
          <div class="student-carousel-dots" aria-label="Choose carousel image">
            ${STUDENT_CAROUSEL.map((_, i) => `<button type="button" class="${i === 0 ? "active" : ""}" data-slide="${i}" aria-label="Show image ${i + 1}" aria-current="${i === 0 ? "true" : "false"}"></button>`).join("")}
          </div>`;
        if (STUDENT_CAROUSEL.length > 1) {
          const slides = [...carousel.querySelectorAll(".student-slide")];
          const dots = [...carousel.querySelectorAll(".student-carousel-dots button")];
          let current = 0;
          const showSlide = index => {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, i) => {
              slide.classList.toggle("active", i === current);
              slide.setAttribute("aria-hidden", String(i !== current));
            });
            dots.forEach((dot, i) => {
              dot.classList.toggle("active", i === current);
              dot.setAttribute("aria-current", String(i === current));
            });
          };
          carousel.querySelector(".prev").onclick = () => showSlide(current - 1);
          carousel.querySelector(".next").onclick = () => showSlide(current + 1);
          dots.forEach((dot, i) => dot.onclick = () => showSlide(i));
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            window.setInterval(() => {
              if (!document.hidden) showSlide(current + 1);
            }, 5000);
          }
        }
      }
    }
    const ban = $("#home-banners");
    if (ban) {
      const list = BANNERS.length ? BANNERS : [];
      if (!list.length) ban.style.display = "none";
      else {
        ban.style.display = "";
        ban.innerHTML = `<div class="banner-track">${list.map(b => {
          const img = b.image ? `<img src="${esc(b.image)}" alt="${esc(b.title || "Banner")}" loading="lazy">` : `<div class="banner-fallback">${ICON.grid}</div>`;
          const inner = `${img}<div class="banner-text"><strong>${esc(b.title || "")}</strong>${b.subtitle ? `<span>${esc(b.subtitle)}</span>` : ""}</div>`;
          return b.link
            ? `<a class="banner-card" href="${esc(b.link)}" ${b.link.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${inner}</a>`
            : `<div class="banner-card">${inner}</div>`;
        }).join("")}</div>`;
      }
    }
    $("#popular").innerHTML = EXAMS.map(e => examCard(e, false)).join("");
    $("#rm-mini").innerHTML = EXAMS.filter(e => e.roadmap.length).slice(0, 6).map(roadmapMini).join("");
    mountPapers($("#papers-mini"), 5);
    $("#wa-mini").innerHTML = CHANNELS.map(waCard).join("") ;
    const faqList = $("#home-faqs");
    if (faqList) {
      faqList.innerHTML = FAQS.length ? FAQS.map(faq => `
        <details class="faq-item">
          <summary><span>${esc(faq.question)}</span><span class="faq-chevron" aria-hidden="true">⌄</span></summary>
          <div class="faq-answer">${esc(faq.answer).replace(/\r?\n/g, "<br>")}</div>
        </details>`).join("") : `<p class="faq-empty">No questions have been added yet. Add questions and answers in the admin panel.</p>`;
    }
    document.querySelectorAll("[data-play]").forEach(a => a.href = SITE.playStoreUrl);
  },

  exams() {
    $("#all-exams").innerHTML = EXAMS.map(e => `
      <a class="card panel" href="${withDraftPreview(`exam.html?id=${encodeURIComponent(e.id)}`)}" style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:14px;align-items:center">${examIcon(e, "lg")}
          <div><h3 style="font-size:1.2rem">${e.name}${e.subs && e.subs.length ? ` <small style="color:var(--o600);font-weight:600">· ${e.subs.length} sub-exams</small>` : ""}</h3>
          <p style="color:var(--muted);font-size:.84rem">${e.full}</p></div></div>
        ${e.subs && e.subs.length ? `<div style="display:flex;flex-wrap:wrap;gap:6px">${e.subs.map(s => `<span class="chip" style="font-size:.72rem">${s.name}</span>`).join("")}</div>` : ""}
        <span class="link-arrow">${e.subs && e.subs.length ? "View Sub-Exams / Categories" : "View Exam"} ${ICON.arrow}</span>
      </a>`).join("");
  },

  exam() {
    const baseExam = examById(param("id")) || EXAMS[0];
    if (!baseExam) return;
    const selected = param("sub") ? subExamById(baseExam, param("sub")) : null;
    const current = selected ? selected.sub : baseExam;
    const path = selected ? selected.path : [];
    const displayName = [baseExam.name, ...path.map(sub => sub.name)].join(" ");
    const displayFull = current.full || (path.length ? `${baseExam.full} — ${path.map(sub => sub.name).join(" — ")}` : baseExam.full);
    document.title = `${displayName} — ${displayFull} | VibhillionAI`;
    const breadcrumbs = [
      `<a href="${withDraftPreview("index.html")}">Home</a>`,
      `<a href="${withDraftPreview("exams.html")}">Exams</a>`,
      `<a href="${withDraftPreview(`exam.html?id=${encodeURIComponent(baseExam.id)}`)}">${esc(baseExam.name)}</a>`,
      ...path.map((sub, index) => {
        const href = withDraftPreview(`exam.html?id=${encodeURIComponent(baseExam.id)}&sub=${encodeURIComponent(sub.id)}`);
        return index === path.length - 1 ? esc(sub.name) : `<a href="${href}">${esc(sub.name)}</a>`;
      })
    ].join(" / ");
    $("#exam-hero").innerHTML = `
      <div class="crumbs">${breadcrumbs}</div>
      <div style="display:flex;gap:18px;align-items:center;position:relative;z-index:1">${examIcon(baseExam, "lg")}
        <div><h1>${esc(displayName)}</h1><p>${esc(displayFull)}</p>
        ${path.length ? `<p style="margin-top:6px;font-size:.9rem;color:var(--o600);font-weight:600">Category under ${esc(baseExam.name)}</p>` : current.subs.length ? `<p style="margin-top:6px;font-size:.9rem;color:var(--o600);font-weight:600">${current.subs.length} sub-categories available</p>` : ""}
        <p class="no-login" style="margin-top:10px">No login required — explore available study resources for free.</p>
        </div></div>`;
    const examHref = `exam.html?id=${encodeURIComponent(baseExam.id)}`;
    const siblingCategories = path.length > 1 ? path[path.length - 2].subs : baseExam.subs;
    const categoryCard = sub => `
      <a class="sub-exam-card${selected && sub.id === current.id ? " active" : ""}"
         href="${withDraftPreview(`${examHref}&sub=${encodeURIComponent(sub.id)}`)}"
         ${selected && sub.id === current.id ? 'aria-current="page"' : ""}>
        <h3>${esc(sub.name)}</h3>
        ${sub.full ? `<p>${esc(sub.full)}</p>` : ""}
        ${sub.about ? `<p>${esc(sub.about)}</p>` : ""}
        <span class="link-arrow" style="font-size:.82rem;margin-top:auto">Open category ${ICON.arrow}</span>
      </a>`;
    const visibleSiblingCategories = siblingCategories.filter(sub => !selected || sub.id !== current.id);
    const categoryCards = !selected && visibleSiblingCategories.length ? `
      <section class="sub-exams-section" aria-labelledby="sub-exam-heading">
        <h2 id="sub-exam-heading">Sub-Exams / Categories</h2>
        <div class="sub-exam-grid">${visibleSiblingCategories.map(categoryCard).join("")}</div>
      </section>` : "";
    const childCategories = !selected && path.length && current.subs.length ? `
      <section class="sub-exams-section" aria-labelledby="child-category-heading">
        <h2 id="child-category-heading">Sub-Categories</h2>
        <div class="sub-exam-grid">${current.subs.map(categoryCard).join("")}</div>
      </section>` : "";
    const facts = Array.isArray(current.facts) ? current.facts : [];
    const subjects = Array.isArray(current.subjects) ? current.subjects : [];
    const pattern = Array.isArray(current.pattern) ? current.pattern : [];
    const roadmap = Array.isArray(current.roadmap) ? current.roadmap : [];
    const overviewContent = `
      ${current.about ? `<p style="color:var(--ink2);max-width:820px">${esc(current.about)}</p>` : `<p class="empty">Overview details will be added soon.</p>`}
      ${facts.length ? `<div class="info-grid" style="margin-top:16px">${facts.map(([key, value]) => `<div class="card info"><small>${esc(key)}</small><b>${esc(value)}</b></div>`).join("")}</div>` : ""}
      ${subjects.length ? `<h3 style="margin:20px 0 10px">Important Subjects</h3><div class="chips">${subjects.map(subject => `<span class="chip">${esc(subject)}</span>`).join("")}</div>` : ""}`;
    const patternContent = pattern.length ? pattern.map(stage => `
      <h3 style="margin:18px 0 10px;font-size:1.05rem">${esc(stage.stage || "")}</h3>
      <div class="card tbl-wrap"><table class="pattern"><thead><tr><th>Paper / Section</th><th>Questions / Marks</th><th>Nature</th></tr></thead>
      <tbody>${(stage.rows || []).map(row => `<tr>${row.map(value => `<td>${esc(value)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`).join("")
      : `<p class="empty">Exam pattern details will be added soon.</p>`;
    const roadmapContent = roadmap.length ? `<div class="timeline">${roadmap.map((stage, index) => `
      <div class="step"><span class="dot">${index + 1}</span><div class="card"><h3>${esc(stage.t || "")}</h3><span class="when">${esc(stage.d || "")}</span>
      <ul>${(stage.p || []).map(point => `<li>${esc(point)}</li>`).join("")}</ul></div></div>`).join("")}</div>`
      : `<p class="empty">Roadmap details will be added soon.</p>`;
    const papers = PAPERS.filter(p => p.exam === baseExam.id && (p.subId || "") === (selected ? current.id : ""));
    $("#exam-body").innerHTML = `
      ${categoryCards}
      ${childCategories}
      ${selected ? `
        <section class="exam-detail-section" id="overview"><h2>Overview</h2>${overviewContent}</section>
        <section class="exam-detail-section" id="pattern"><h2>Exam Pattern</h2>${patternContent}</section>
        <section class="exam-detail-section" id="roadmap"><h2>Roadmap</h2>${roadmapContent}</section>
        <section class="exam-detail-section" id="papers">
          <h2>Papers</h2>
          ${papers.length ? `<div class="card tbl-wrap"><table><thead><tr><th>Exam</th><th>Paper</th><th>Year</th><th>Action</th></tr></thead><tbody>${papers.map(paperRow).join("")}</tbody></table></div>` : `<p class="empty">Papers will be added soon.</p>`}
        </section>` : ""}`;
  },

  roadmaps() {
    $("#rm-list").innerHTML = EXAMS.filter(e => e.roadmap.length).map(e => `
      <article class="card panel" style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:12px;align-items:center">${examIcon(e)}<div><h3 style="font-size:1.1rem">${e.name} Roadmap</h3>
        <p style="font-size:.78rem;color:var(--muted)">${e.roadmap.length} phases · step-by-step plan</p></div></div>
        <ol style="padding-left:18px;font-size:.85rem;color:var(--ink2);flex:1">${e.roadmap.map(s => `<li>${s.t} <span style="color:var(--muted)">(${s.d})</span></li>`).join("")}</ol>
      </article>`).join("");
  },

  papers() { mountPapers($("#papers-full")); },

  whatsapp() {
    $("#wa-full").innerHTML = CHANNELS.map(waCard).join("");
  },

  about() { document.querySelectorAll("[data-play]").forEach(a => a.href = SITE.playStoreUrl); },

  blog() {
    const root = $("#blog-list");
    if (!root) return;
    if (!BLOG.length) {
      root.innerHTML = `<p class="empty">Articles coming soon.</p>`;
      return;
    }
    root.innerHTML = BLOG.map(a => {
      const title = a.title_en || a.title || a.id;
      const desc = a.desc_en || a.desc || "";
      const img = a.image ? `<div class="blog-thumb"><img src="${esc(a.image)}" alt="${esc(title)}" loading="lazy"></div>` : "";
      return `<a class="card panel blog-card" href="article.html?id=${encodeURIComponent(a.id)}">
        ${img}
        <div class="blog-meta"><span class="chip">${esc(a.category || "Guide")}</span><time>${esc(a.date || "")}</time></div>
        <h3>${esc(title)}</h3>
        <p>${esc(desc)}</p>
        <span class="link-arrow">Read more ${ICON.arrow}</span>
      </a>`;
    }).join("");
  },

  article() {
    const id = param("id");
    const a = BLOG.find(x => x.id === id) || BLOG[0];
    if (!a) {
      $("#article-hero").innerHTML = `<h1>Article not found</h1>`;
      return;
    }
    const title = a.title_en || a.title || a.id;
    const body = a.body_en || a.body || "<p>Content coming soon.</p>";
    document.title = `${title} | VibhillionAI`;
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute("content", a.desc_en || a.desc || title);
    const pageUrl = location.href;
    const shareText = encodeURIComponent(title + " — VibhillionAI");
    const shareUrl = encodeURIComponent(pageUrl);
    $("#article-hero").innerHTML = `
      <div class="crumbs"><a href="index.html">Home</a> / <a href="blog.html">Blog</a> / ${esc(title)}</div>
      <div class="blog-meta" style="margin-bottom:8px"><span class="chip">${esc(a.category || "")}</span><time>${esc(a.date || "")}</time></div>
      <h1>${esc(title)}</h1>
      <p class="no-login" style="margin-top:12px">No Login Required (Web)</p>`;
    const cover = a.image ? `<div class="article-cover"><img src="${esc(a.image)}" alt="${esc(title)}"></div>` : "";
    const share = `<div class="share-bar">
      <span class="share-label">Share:</span>
      <a class="share-btn wa" href="https://wa.me/?text=${shareText}%20${shareUrl}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="share-btn tg" href="https://t.me/share/url?url=${shareUrl}&text=${shareText}" target="_blank" rel="noopener">Telegram</a>
      <a class="share-btn x" href="https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}" target="_blank" rel="noopener">X</a>
      <a class="share-btn fb" href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" rel="noopener">Facebook</a>
      <button type="button" class="share-btn copy" id="share-copy">Copy link</button>
    </div>`;
    $("#article-body").innerHTML = cover + body + share;
    const copyBtn = $("#share-copy");
    if (copyBtn) copyBtn.onclick = async () => {
      try { await navigator.clipboard.writeText(pageUrl); copyBtn.textContent = "Copied!"; setTimeout(() => copyBtn.textContent = "Copy link", 1500); }
      catch { prompt("Copy this link:", pageUrl); }
    };
  }
};

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  renderHeader({ exam: "exams" }[page] || page);
  renderFooter();
  document.querySelectorAll("[data-icon]").forEach(el => el.innerHTML = ICON[el.dataset.icon] || "");
  document.querySelectorAll("[data-logo]").forEach(el => el.innerHTML = LOGO);
  PAGES[page] && PAGES[page]();
});
