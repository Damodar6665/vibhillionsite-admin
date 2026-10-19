/* =========================================================
   VibhillionAI — shared layout + page rendering
   ========================================================= */

/* ---------- Data (assets/js/data.js → window.VIBHI_DATA) ----------
   Open with ?preview=1 to view the draft saved in the Admin Panel. */
let RAW = window.VIBHI_DATA || {};
let isDraftActive = false;
try {
  const isExplicitPreview = new URLSearchParams(location.search).get("preview") === "1";
  const draftStr = localStorage.getItem("vibhi_admin_draft");
  if (draftStr) {
    const d = JSON.parse(draftStr);
    if (d && d.data) {
      if (isExplicitPreview) {
        RAW = d.data;
        isDraftActive = true;
      }
    }
  }
} catch (e) { /* storage unavailable */ }
const SITE = Object.assign({ name: "VibhillionAI", tagline: "", domain: "", phone: "", whatsappNumber: "", logoUrl: "assets/vibhillion-mark.jpg", heroImage: "assets/student-preparation-hero.png", playStoreUrl: "#", social: {} }, RAW.site || {});
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
const STUDENT_CAROUSEL = (RAW.studentCarousel || []).filter(s => s && s.image);
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
const imageUrl = value => {
  const src = String(value || "").trim();
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  try { return new URL(src, document.baseURI).href; } catch { return src; }
};
const LOGO = `<img class="brand-logo" src="${esc(imageUrl(SITE.logoUrl || "assets/vibhillion-mark.jpg"))}" alt="VibhillionAI">`;
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
const examIcon = (e, size = "") => {
  const exam = typeof e === "string" ? (examById(e) || { name: e, color: "#146c43" }) : (e || { name: "Exam", color: "#146c43" });
  const name = exam.name || "Exam";
  const bg = exam.color || "#146c43";
  if (exam.iconImage) {
    const src = esc(imageUrl(exam.iconImage));
    return `<span class="exam-icon exam-symbol ${size}" style="background:${esc(bg)}" role="img" aria-label="${esc(name)} logo"><img src="${src}" alt="${esc(name)} logo" loading="lazy" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='grid'"><span class="exam-fallback-symbol" style="display:none">${examSymbol(name)}</span></span>`;
  }
  return `<span class="exam-icon exam-symbol ${size}" style="background:${esc(bg)}" role="img" aria-label="${esc(name)} symbol">${examSymbol(name)}</span>`;
};
const param = k => new URLSearchParams(location.search).get(k);
const withDraftPreview = href => {
  if (!isDraftActive && param("preview") !== "1") return href;
  const [path, hash] = href.split("#", 2);
  const [base, queryString] = path.split("?", 2);
  const query = new URLSearchParams(queryString || "");
  query.set("preview", "1");
  return `${base}?${query}${hash ? `#${hash}` : ""}`;
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
      ${LOGO}
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
  const navMenu = $(".nav-menu", el);
  const closeMenu = () => {
    el.classList.remove("open");
    if (menuButton) {
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation menu");
    }
  };
  if (menuButton) {
    menuButton.onclick = () => {
      const isOpen = el.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    };
  }
  if (navMenu) {
    navMenu.onclick = event => {
      if (event.target && event.target.closest && event.target.closest("a")) closeMenu();
    };
  }
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
  const playStoreHref = /^https?:\/\//i.test(SITE.playStoreUrl || "") ? esc(SITE.playStoreUrl) : "";
  const waNumber = String(SITE.whatsappNumber || "").replace(/\D/g, "");
  const socialLinks = Object.assign({}, SITE.social, { whatsapp: waNumber ? `https://wa.me/${waNumber}` : "" });
  const socialOrder = ["instagram", "youtube", "telegram"];
  const socials = socialOrder.filter(k => ICON[k] && /^https?:\/\//i.test(socialLinks[k] || ""))
    .map(k => `<a href="${esc(socialLinks[k])}" target="_blank" rel="noopener noreferrer" aria-label="${esc(k)}" title="Visit us on ${esc(k)}">${ICON[k]}</a>`).join("");
  const chatLink = ICON.whatsapp && /^https?:\/\//i.test(socialLinks.whatsapp || "")
    ? `<a href="${esc(socialLinks.whatsapp)}" class="whatsapp-float-btn" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="Chat with us on WhatsApp"><span class="whatsapp-logo">${ICON.whatsapp}</span><span class="whatsapp-label">Chat with us</span></a>`
    : "";
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
    <div class="foot-copy"><span>&#169; ${SITE.year} ${SITE.name}. All rights reserved.${SITE.phone ? " · +91 " + SITE.phone : ""}</span></div>
    <div class="foot-social-container"><div class="social-heading">Follow us on social media</div><div class="socials" aria-label="Connect with VibhillionAI"><div class="social-platform-icons">${socials}</div></div></div>
    ${playStoreHref ? `<a class="foot-signature play-store-badge" href="${playStoreHref}" target="_blank" rel="noopener noreferrer" aria-label="Get VibhillionAI on Google Play"><span class="play-download-icon">${PLAY_ICON}</span><span class="play-download-copy"><small>GET IT ON</small><b>Google Play</b></span></a>` : ""}
  </div></div>` + chatLink;
}

/* ---------- Reusable blocks ---------- */
const examCard = (e, showDescription = true) => `
  <a class="exam-card" href="${withDraftPreview(`exam.html?id=${encodeURIComponent(e.id)}`)}">
    ${examIcon(e)}
    <div class="meta"><h4>${e.name}</h4>${showDescription && e.full ? `<p>${e.full}</p>` : ""}</div>
    <span class="chev">${ICON.chev}</span>
  </a>`;

const roadmapMini = e => {
  const sub = (e.subs || []).find(s => s.roadmap && s.roadmap.length) || (e.subs || [])[0];
  const href = sub ? `roadmaps.html?id=${encodeURIComponent(e.id)}&sub=${encodeURIComponent(sub.id)}` : `roadmaps.html?id=${encodeURIComponent(e.id)}`;
  return `
  <a class="mini" href="${withDraftPreview(href)}">
    ${examIcon(e, "sm")}
    <div><b>${esc(e.name)}</b><br><small>${sub ? esc(sub.name) : "Roadmap"}</small></div>
  </a>`;
};

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
  if (!tbody) return;
  const draw = () => {
    let rows = PAPERS.filter(p => (filter === "all" || p.exam === filter) && p.title.toLowerCase().includes(q));
    if (limit) rows = rows.slice(0, limit);
    tbody.innerHTML = rows.length ? rows.map(paperRow).join("") : `<tr><td colspan="4" class="empty">No papers have been added yet. Please check back soon.</td></tr>`;
  };
  root.querySelectorAll(".chip").forEach(b => b.onclick = () => {
    root.querySelectorAll(".chip").forEach(x => x.classList.remove("active"));
    b.classList.add("active"); filter = b.dataset.f; draw();
  });
  const searchInput = $("input", root);
  if (searchInput) searchInput.oninput = ev => { q = ev.target.value.trim().toLowerCase(); draw(); };
  const pre = param("exam");
  const preChip = pre && used.includes(pre) ? $(`.chip[data-f="${pre}"]`, root) : null;
  if (preChip) preChip.click(); else draw();
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
      desktopHeroArt.innerHTML = `<img src="${esc(imageUrl(HERO_STUDENT_IMAGE))}" alt="Student preparing for exams at a study desk">`;
    }
    const carousel = $("#student-carousel");
    if (carousel) {
      if (!STUDENT_CAROUSEL.length) carousel.hidden = true;
      else {
        carousel.innerHTML = `
          <div class="student-carousel-frame" aria-roledescription="carousel">
            ${STUDENT_CAROUSEL.map((slide, i) => `
              <div class="student-slide${i === 0 ? " active" : ""}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${STUDENT_CAROUSEL.length}" aria-hidden="${i !== 0}">
                <img src="${esc(imageUrl(slide.image))}" alt="${esc(slide.alt || "Student preparing for exams")}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
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
          const prevBtn = carousel.querySelector(".prev");
          const nextBtn = carousel.querySelector(".next");
          if (prevBtn) prevBtn.onclick = () => showSlide(current - 1);
          if (nextBtn) nextBtn.onclick = () => showSlide(current + 1);
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
          const img = b.image ? `<img src="${esc(imageUrl(b.image))}" alt="${esc(b.title || "Banner")}" loading="lazy">` : `<div class="banner-fallback">${ICON.grid}</div>`;
          const inner = `${img}<div class="banner-text"><strong>${esc(b.title || "")}</strong>${b.subtitle ? `<span>${esc(b.subtitle)}</span>` : ""}</div>`;
          return b.link
            ? `<a class="banner-card" href="${esc(b.link)}" ${b.link.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${inner}</a>`
            : `<div class="banner-card">${inner}</div>`;
        }).join("")}</div>`;
      }
    }
    $("#popular").innerHTML = EXAMS.map(e => examCard(e, false)).join("");
    const homeBlogSection = $("#home-blog-section");
    const homeBlogList = $("#home-blog-list");
    if (homeBlogSection && homeBlogList) {
      const latestArticles = BLOG.slice(0, 3);
      homeBlogSection.hidden = latestArticles.length === 0;
      homeBlogList.innerHTML = latestArticles.map(a => {
        const title = a.title_en || a.title || a.id;
        const desc = a.desc_en || a.desc || "";
        const img = a.image ? `<div class="blog-thumb"><img src="${esc(imageUrl(a.image))}" alt="${esc(title)}" loading="lazy"></div>` : "";
        return `<a class="card panel blog-card" href="${withDraftPreview(`article.html?id=${encodeURIComponent(a.id)}`)}">
          ${img}<div class="blog-meta"><span class="chip">${esc(a.category || "Guide")}</span><time>${esc(a.date || "")}</time></div>
          <h3>${esc(title)}</h3><p>${esc(desc)}</p><span class="link-arrow">Read article ${ICON.arrow}</span>
        </a>`;
      }).join("");
    }
    $("#rm-mini").innerHTML = EXAMS.filter(e => e.subs && e.subs.some(s => s.roadmap && s.roadmap.length)).slice(0, 6).map(roadmapMini).join("");
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
    const requestedId = param("id");
    const baseExam = requestedId ? examById(requestedId) : EXAMS[0];
    if (!baseExam) {
      document.title = "Exam Not Found | VibhillionAI";
      $("#exam-hero").innerHTML = `<div class="empty"><h1>Exam not found</h1><p>This exam may have been removed or its link may be outdated.</p><a class="b pri" href="exams.html">Browse available exams</a></div>`;
      $("#exam-body").innerHTML = "";
      return;
    }
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
    const categorySwitcher = selected && siblingCategories && siblingCategories.length > 1 ? `
      <div class="category-tabs-wrap" style="margin-bottom:24px">
        <div style="font-size:.84rem;font-weight:700;color:var(--muted);margin-bottom:8px">Switch Category:</div>
        <div class="chips">${siblingCategories.map(sub => `
          <a class="chip ${sub.id === current.id ? "active" : ""}" href="${withDraftPreview(`${examHref}&sub=${encodeURIComponent(sub.id)}`)}">
            ${esc(sub.name)}
          </a>`).join("")}</div>
      </div>` : "";
    const hasSubs = Boolean(baseExam.subs && baseExam.subs.length);
    const categoryCards = !selected && hasSubs ? `
      <section class="sub-exams-section" aria-labelledby="sub-exam-heading">
        <h2 id="sub-exam-heading">Sub-Exams / Categories</h2>
        <div class="sub-exam-grid">${baseExam.subs.map(categoryCard).join("")}</div>
      </section>` : "";
    const childCategories = selected && current.subs && current.subs.length ? `
      <section class="sub-exams-section" style="margin-bottom:24px" aria-labelledby="child-category-heading">
        <h2 id="child-category-heading">Sub-Categories / Streams</h2>
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
    const showDetails = hasSubs ? Boolean(selected) : Boolean(current.about || pattern.length || roadmap.length || papers.length);
    $("#exam-body").innerHTML = `
      ${categorySwitcher}
      ${categoryCards}
      ${childCategories}
      ${showDetails ? `
        <section class="exam-detail-section" id="overview"><h2>Overview</h2>${overviewContent}</section>
        <section class="exam-detail-section" id="pattern"><h2>Exam Pattern</h2>${patternContent}</section>
        <section class="exam-detail-section" id="roadmap"><h2>Roadmap</h2>${roadmapContent}</section>
        <section class="exam-detail-section" id="papers">
          <h2>Papers</h2>
          ${papers.length ? `<div class="card tbl-wrap"><table><thead><tr><th>Exam</th><th>Paper</th><th>Year</th><th>Action</th></tr></thead><tbody>${papers.map(paperRow).join("")}</tbody></table></div>` : `<p class="empty">Papers will be added soon.</p>`}
        </section>` : ""}`;
  },

  roadmaps() {
    const requestedId = param("id");
    const heroEl = $("#rm-hero");
    const bodyEl = $("#rm-body");
    if (!bodyEl) return;

    if (requestedId) {
      const baseExam = examById(requestedId);
      if (!baseExam) {
        document.title = "Roadmap Not Found | VibhillionAI";
        if (heroEl) heroEl.innerHTML = `<section class="page-hero"><div class="container"><div class="crumbs"><a href="${withDraftPreview("index.html")}">Home</a> / <a href="${withDraftPreview("roadmaps.html")}">Roadmaps</a> / Not Found</div><h1>Roadmap Not Found</h1><p>The requested exam roadmap could not be found.</p></div></section>`;
        bodyEl.innerHTML = `<div class="empty"><h1>Roadmap not found</h1><p>This exam roadmap may have been moved or updated.</p><a class="b pri" href="${withDraftPreview("roadmaps.html")}">Browse All Roadmaps</a></div>`;
        return;
      }

      const flatSubs = [];
      const collectFlat = (list, parentNames = []) => {
        (list || []).forEach(s => {
          const names = [...parentNames, s.name];
          flatSubs.push({ sub: s, displayName: names.join(" › ") });
          if (Array.isArray(s.subs) && s.subs.length) collectFlat(s.subs, names);
        });
      };
      collectFlat(baseExam.subs);

      // Selected sub-exam: either from query param or default to first sub with roadmap, or first sub
      const requestedSub = param("sub");
      let selectedItem = requestedSub ? flatSubs.find(item => item.sub.id === requestedSub) : null;
      if (!selectedItem && flatSubs.length) {
        selectedItem = flatSubs.find(item => Array.isArray(item.sub.roadmap) && item.sub.roadmap.length) || flatSubs[0];
      }

      if (!selectedItem) {
        // No sub-exams configured yet
        document.title = `${baseExam.name} Roadmap | VibhillionAI`;
        if (heroEl) {
          heroEl.innerHTML = `
            <section class="page-hero"><div class="container">
              <div class="crumbs"><a href="${withDraftPreview("index.html")}">Home</a> / <a href="${withDraftPreview("roadmaps.html")}">Roadmaps</a> / ${esc(baseExam.name)}</div>
              <div style="display:flex;gap:18px;align-items:center;position:relative;z-index:1">${examIcon(baseExam, "lg")}
                <div>
                  <h1>${esc(baseExam.name)} Preparation Roadmaps</h1>
                  <p>${esc(baseExam.full || "")}</p>
                </div>
              </div>
            </div></section>`;
        }
        bodyEl.innerHTML = `
          <div class="empty" style="text-align:center;padding:40px 20px">
            <h2>No Sub-Exam Roadmaps Yet</h2>
            <p style="color:var(--muted);margin:10px auto 20px;max-width:500px">Roadmaps for ${esc(baseExam.name)} are organized by sub-exams and categories. Roadmaps for this exam will be published shortly.</p>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
              <a class="b pri" href="${withDraftPreview("roadmaps.html")}">Browse Other Roadmaps</a>
              <a class="b" href="${withDraftPreview(`exam.html?id=${encodeURIComponent(baseExam.id)}`)}">View Exam Details</a>
            </div>
          </div>`;
        return;
      }

      const current = selectedItem.sub;
      const displayName = `${baseExam.name} — ${selectedItem.displayName}`;
      const displayFull = current.full || `${baseExam.full || baseExam.name} — ${current.name}`;
      document.title = `${displayName} Roadmap — Step-by-Step Study Plan | VibhillionAI`;

      const breadcrumbs = [
        `<a href="${withDraftPreview("index.html")}">Home</a>`,
        `<a href="${withDraftPreview("roadmaps.html")}">Roadmaps</a>`,
        `<a href="${withDraftPreview(`roadmaps.html?id=${encodeURIComponent(baseExam.id)}`)}">${esc(baseExam.name)}</a>`,
        esc(current.name)
      ].join(" / ");

      const roadmap = Array.isArray(current.roadmap) ? current.roadmap : [];

      if (heroEl) {
        heroEl.innerHTML = `
          <section class="page-hero"><div class="container">
            <div class="crumbs">${breadcrumbs}</div>
            <div style="display:flex;gap:18px;align-items:center;position:relative;z-index:1">${examIcon(baseExam, "lg")}
              <div>
                <h1>${esc(displayName)} Preparation Roadmap</h1>
                <p>${esc(displayFull)}</p>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">
                  <span class="roadmap-badge">${roadmap.length} Phase${roadmap.length === 1 ? "" : "s"} · Step-by-step</span>
                  <span class="roadmap-badge" style="background:var(--o100);color:var(--o600)">Sub-Exam under ${esc(baseExam.name)}</span>
                </div>
              </div>
            </div>
          </div></section>`;
      }

      const examHref = `roadmaps.html?id=${encodeURIComponent(baseExam.id)}`;

      // Category Switcher tabs — STRICTLY SUB-EXAMS (NO MAIN ROADMAP)
      const categorySwitcher = flatSubs.length > 1 ? `
        <div class="category-tabs-wrap" style="margin-bottom:24px">
          <div style="font-size:.84rem;font-weight:700;color:var(--muted);margin-bottom:8px">Select Sub-Exam / Category Roadmap:</div>
          <div class="chips">
            ${flatSubs.map(item => `
              <a class="chip ${item.sub.id === current.id ? "active" : ""}" href="${withDraftPreview(`${examHref}&sub=${encodeURIComponent(item.sub.id)}`)}">
                📂 ${esc(item.displayName)} (${(item.sub.roadmap || []).length} phases)
              </a>
            `).join("")}
          </div>
        </div>` : "";

      const roadmapTimeline = roadmap.length ? `<div class="timeline">${roadmap.map((stage, index) => `
        <div class="step"><span class="dot">${index + 1}</span><div class="card"><h3>${esc(stage.t || "")}</h3><span class="when">${esc(stage.d || "")}</span>
        <ul>${(stage.p || []).map(point => `<li>${esc(point)}</li>`).join("")}</ul></div></div>`).join("")}</div>`
        : `<p class="empty">Roadmap details for ${esc(displayName)} will be added soon.</p>`;

      const companionLinks = `
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-top:24px;padding-top:18px;border-top:1px solid var(--line)">
          <a class="b" href="${withDraftPreview("roadmaps.html")}">← Back to All Roadmaps</a>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <a class="b sm" href="${withDraftPreview(`exam.html?id=${encodeURIComponent(baseExam.id)}&sub=${encodeURIComponent(current.id)}`)}">View Exam Details &amp; Pattern</a>
            <a class="b sm" href="${withDraftPreview(`papers.html?exam=${encodeURIComponent(baseExam.id)}`)}">Practice Previous Papers</a>
          </div>
        </div>`;

      bodyEl.innerHTML = `
        ${categorySwitcher}
        <section class="exam-detail-section" id="roadmap-timeline">
          <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:18px">
            <h2>${esc(displayName)} — Preparation Timeline &amp; Phases</h2>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <span class="pill">${roadmap.length} phases</span>
            </div>
          </div>
          ${roadmapTimeline}
          ${companionLinks}
        </section>`;
      return;
    }

    // Directory Mode (All Exams Roadmaps)
    document.title = "Sub-Exam Preparation Roadmaps — UPSC, APPSC, TGPSC, SSC, RRB, IBPS | VibhillionAI";
    if (heroEl) {
      heroEl.innerHTML = `
        <section class="page-hero"><div class="container">
          <div class="crumbs"><a href="${withDraftPreview("index.html")}">Home</a> / Roadmaps</div>
          <h1>Sub-Exam Preparation Roadmaps</h1>
          <p>Step-by-step study plans and roadmaps for UPSC, APPSC Group 1/2, TGPSC, SSC, RRB NTPC, IBPS, SBI and Banking exams. Subject-wise strategy and timelines categorized by sub-exams.</p>
        </div></section>`;
    }

    let filter = "all", q = "";

    bodyEl.innerHTML = `
      <div class="sec-head" style="margin-bottom:16px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">
        <div class="chips" id="rm-chips">
          ${[["all", "All Exams"], ...EXAMS.map(e => [e.id, e.name])].map(([id, l]) => `
            <button class="chip ${id === "all" ? "active" : ""}" data-rm-filter="${esc(id)}">${esc(l)}</button>
          `).join("")}
        </div>
        <label class="search">${ICON.search}<input type="search" id="rm-search" placeholder="Search roadmaps (e.g. Group 1, Prelims)..."></label>
      </div>
      <div class="info-grid" id="rm-list" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:18px"></div>`;

    const listContainer = $("#rm-list", bodyEl) || $("#rm-list");
    const searchInput = $("#rm-search", bodyEl) || $("#rm-search");

    const drawDirectory = () => {
      let filtered = EXAMS.filter(e => {
        if (filter !== "all" && e.id !== filter) return false;
        if (!q) return true;
        const inExam = (e.name + " " + (e.full || "")).toLowerCase().includes(q);
        const inSubs = (e.subs || []).some(s => (s.name + " " + (s.full || "") + " " + (s.roadmap || []).map(r => r.t).join(" ")).toLowerCase().includes(q));
        return inExam || inSubs;
      });

      if (!listContainer) return;
      if (!filtered.length) {
        listContainer.innerHTML = `<div class="empty" style="grid-column:1/-1">No roadmaps matched your filter. Try searching for another exam or sub-exam.</div>`;
        return;
      }

      listContainer.innerHTML = filtered.map(e => {
        const subs = Array.isArray(e.subs) ? e.subs : [];
        const subsWithRm = subs.filter(s => s.roadmap && s.roadmap.length);
        const firstSub = subsWithRm[0] || subs[0] || null;

        const subChipsHtml = subs.length ? `
          <div class="roadmap-sub-box">
            <div class="roadmap-sub-box-title">Sub-Exams Roadmaps (${subs.length})</div>
            <div class="chips" style="margin-bottom:0;gap:6px">
              ${subs.map(s => `
                <a class="chip" href="${withDraftPreview(`roadmaps.html?id=${encodeURIComponent(e.id)}&sub=${encodeURIComponent(s.id)}`)}" style="font-size:.76rem;padding:4px 10px" title="View ${esc(s.name)} roadmap">
                  📂 ${esc(s.name)}${s.roadmap && s.roadmap.length ? ` · <b style="color:var(--g700)">${s.roadmap.length}p</b>` : ""}
                </a>
              `).join("")}
            </div>
          </div>` : "";

        const subListPreview = subsWithRm.length ? `
          <div style="font-size:.82rem;color:var(--ink2)">
            <ul style="padding-left:18px;margin:4px 0 0;color:var(--muted)">
              ${subsWithRm.slice(0, 3).map(s => `
                <li><span style="color:var(--ink);font-weight:600">${esc(s.name)}:</span> <span style="color:var(--ink2)">${s.roadmap[0] ? esc(s.roadmap[0].t) : ""}</span> <small style="color:var(--o600)">(${s.roadmap.length} phases)</small></li>
              `).join("")}
              ${subsWithRm.length > 3 ? `<li style="list-style:none;font-weight:600;color:var(--o600)">+ ${subsWithRm.length - 3} more sub-exams</li>` : ""}
            </ul>
          </div>` : `<div style="font-size:.82rem;color:var(--muted)">Sub-exam study roadmaps coming soon.</div>`;

        const targetHref = firstSub ? `roadmaps.html?id=${encodeURIComponent(e.id)}&sub=${encodeURIComponent(firstSub.id)}` : `roadmaps.html?id=${encodeURIComponent(e.id)}`;

        return `
          <article class="roadmap-exam-card">
            <div class="roadmap-card-head">
              ${examIcon(e, "sm")}
              <div style="flex:1;min-width:0">
                <h3 style="font-size:1.15rem;display:flex;align-items:center;gap:8px">
                  ${esc(e.name)}
                  ${subsWithRm.length ? `<span class="roadmap-badge">${subsWithRm.length} sub-exam${subsWithRm.length === 1 ? "" : "s"}</span>` : ""}
                </h3>
                <p style="font-size:.8rem;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(e.full || "")}</p>
              </div>
            </div>
            ${subChipsHtml}
            ${subListPreview}
            <div style="margin-top:auto;display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--line)">
              <a class="link-arrow" href="${withDraftPreview(targetHref)}">
                View Sub-Exam Roadmaps ${ICON.arrow}
              </a>
            </div>
          </article>`;
      }).join("");
    };

    bodyEl.querySelectorAll("[data-rm-filter]").forEach(btn => {
      btn.onclick = () => {
        bodyEl.querySelectorAll("[data-rm-filter]").forEach(b => b.classList.toggle("active", b === btn));
        filter = btn.dataset.rmFilter;
        drawDirectory();
      };
    });

    if (searchInput) {
      searchInput.oninput = ev => {
        q = ev.target.value.trim().toLowerCase();
        drawDirectory();
      };
    }

    drawDirectory();
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
      const img = a.image ? `<div class="blog-thumb"><img src="${esc(imageUrl(a.image))}" alt="${esc(title)}" loading="lazy"></div>` : "";
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
    const cover = a.image ? `<div class="article-cover"><img src="${esc(imageUrl(a.image))}" alt="${esc(title)}"></div>` : "";
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
  if (isDraftActive) {
    const bar = document.createElement("div");
    bar.className = "draft-banner";
    bar.style.cssText = "background:linear-gradient(90deg,#fffbeb,#fef3c7);color:#92400e;border-bottom:1px solid #fde68a;padding:8px 16px;font-size:13px;display:flex;align-items:center;justify-content:center;gap:12px;font-weight:600;position:sticky;top:0;z-index:9999;";
    bar.innerHTML = '<span>✏️ <b>Draft Preview Active:</b> Viewing changes from Admin Panel</span><a href="admin.html" style="background:#b45309;color:#fff;padding:3px 10px;border-radius:6px;font-size:12px;text-decoration:none">Back to Admin</a>';
    document.body.prepend(bar);
  }
  const page = document.body.dataset.page;
  renderHeader({ exam: "exams" }[page] || page);
  renderFooter();
  document.querySelectorAll('link[rel~="icon"]').forEach(icon => {
    icon.href = imageUrl(SITE.logoUrl || icon.getAttribute("href"));
    icon.removeAttribute("type");
  });
  document.querySelectorAll('[data-site-image="hero"]').forEach(img => { img.src = imageUrl(HERO_STUDENT_IMAGE); });
  document.querySelectorAll("[data-icon]").forEach(el => el.innerHTML = ICON[el.dataset.icon] || "");
  document.querySelectorAll("[data-logo]").forEach(el => el.innerHTML = LOGO);
  PAGES[page] && PAGES[page]();
});
