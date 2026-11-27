/* Where the form sends responses: the Vercel function in api/submit.js */
const FORM_ENDPOINT = "/api/submit";

{
  const $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const root = document.documentElement;
  let rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.toggle("rm", rm);
  const narrow = () => innerWidth <= 700;
  const T = (ms) => (rm ? 0 : ms);

  /* ── Projects, in tab order ── */
  const P = [
    {
      k: "lfc",
      tab: "Liffey Founders' Club",
      short: "LFC",
      color: "#3255A4",
      ink: "#fff",
      status: "In progress",
      title: "Experience design",
      body: "A space for aspiring founders to validate their ideas. I'm shaping the event through attendee research, journey maps and event formats.",
      img: "assets/images/lfc/LFC-800.webp",
      alt: "Attendees at a Liffey Founders' Club session",
      page: "work/lfc.html",
    },
    {
      k: "gdg",
      tab: "GDG Girona",
      short: "GDG",
      color: "#C8323F",
      ink: "#fff",
      status: "In progress",
      title: "Organizational management",
      body: "GDG Girona is a volunteer-run developer community. I'm redesigning its team structure and event planning so the work holds up when volunteers rotate.",
      img: "assets/images/gdg/gdg-800.webp",
      alt: "A GDG Girona workshop in a computer lab",
      page: "work/gdg.html",
    },
    {
      k: "audit",
      tab: "Audits & Docs",
      short: "Audits",
      color: "#1E8A57",
      ink: "#fff",
      status: "",
      title: "Breaking down complex systems",
      body: "",
      img: "assets/images/audits/desk-1200.webp",
      alt: "Hands annotating printed documents beside a stack of tabbed papers",
      cap: "",
      page: "work/audits.html",
      /* the skimmable overview: the same as the top of the case page */
      facts: [
        ["Role", "Student panel member"],
        ["Timeline", "Oct 2025 to Oct 2026"],
        ["Where", "AQU Catalunya, AQUA Andorra"],
      ],
      lede: "Two accreditation audits taught me to question systems I didn't build myself, how to write down how they're actually working, and how to properly justify assumptions I make based on instinct.",
      result: "Both degrees have been approved, with my inputs written into the final reports.",
      links: [
        [
          "AQU Catalunya report",
          "https://estudis.aqu.cat/euc/en/Informes/Repositori/Cercar?titulacioId=10863&pagina=1&ordre=des",
        ],
        [
          "AQUA Andorra report",
          "https://www.aqua.ad/pla_estudi/avaluacio-del-pla-destudis-del-batxelor-en-disseny-i-desenvolupament-de-videojocs-de-la",
        ],
      ],
      nums: [
        ["500+", "pages reviewed"],
        ["20+", "stakeholders interviewed"],
        ["2/2", "degrees approved"],
      ],
    },
  ];
  const byK = Object.fromEntries(P.map((p) => [p.k, p]));
  const TAB =
    "M0 0L36.5333 39.2298C44.0625 47.3147 48.2747 57.9361 48.333 68.9838L48.9241 180.884C48.9734 190.224 46.0496 199.336 40.5759 206.904L0 263V0Z";
  const TABH =
    "M0 49L39.23 12.47C47.31 4.94 57.94.73 68.98.67L180.88.08C190.22.03 199.34 2.95 206.9 8.42L263 49H0Z";

  /* ── Build the files ── */
  const files = $("#files"),
    folder = $("#folder"),
    scene = $("#scene");
  P.forEach((p, i) => {
    const f = document.createElement("div");
    f.setAttribute("role", "link");
    f.className = "file mat m-card";
    f.dataset.k = p.k;
    f.id = "file-" + p.k;
    f.style.setProperty("--c", p.color);
    f.setAttribute("aria-label", `${p.tab}: ${p.title}. Click or tap to read the case study.`);
    f.style.setProperty("--rot", ["-.5deg", ".6deg", "-.25deg"][i]);
    f.style.setProperty("--dx", ["0px", "3px", "-2px"][i]);
    f.style.setProperty("--dy", ["0px", "4px", "2px"][i]);
    f.innerHTML = `<div class="sheetin mat m-sheet"><div class="ftxt${p.facts ? " ov" : ""}"><div class="photo">${p.img ? `<img src="${p.img}" alt="${p.alt}" loading="lazy">` : '<div class="ph label">Image to come</div>'}${p.cap ? `<span class="pcap">${p.cap}</span>` : ""}</div><div class="label"><span>Case file 0${i + 1}</span>${p.status ? `<span class="chip">${p.status}</span>` : ""}</div><h2${p.title.length > 24 ? ' class="long"' : ""}>${p.title}</h2>${p.facts ? `<dl class="ffacts">${p.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl><p class="flede">${p.lede}</p><p class="fres"><b>Results</b>${p.result}</p><div class="flinks">${p.links.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener">${t}</a>`).join("")}</div><div class="fnums">${p.nums.map(([n, l]) => `<span><b>${n}</b>${l}</span>`).join("")}</div>` : `<p>${p.body}</p>`}</div>
  <img class="cue" src="assets/notes/note-casestudy.png" alt=""></div>
  <button class="ftab" id="tab-${p.k}" aria-label="${p.tab}" style="--ty:${3 + i * 32}%;--tx:${i * 33}%;color:${p.ink}">
   <span class="tshape mat m-card" aria-hidden="true"></span>
   <span class="lab">0${i + 1}</span></button>`;
    files.appendChild(f);
  });
  /* tab silhouettes as masks, so the tab can carry the same card texture as its divider */
  const svgMask = (w, h, d) =>
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}' preserveAspectRatio='none'><path d='${d}'/></svg>`)}")`;
  root.style.setProperty("--tabv", svgMask(49, 263, TAB));
  root.style.setProperty("--tabh", svgMask(263, 49, TABH));
  function narrowTabs() {}
  narrowTabs();

  /* index slip on the inside cover */
  const idx = $("#indextpl").content.firstElementChild;
  const idxL = idx.cloneNode(true),
    idxR = idx.cloneNode(true);
  [idxL, idxR].forEach((el) => {
    el.querySelector("ol").removeAttribute("id");
    el.querySelector("ol").innerHTML = P.map(
      (p, i) => `<li><button data-k="${p.k}"><span>0${i + 1}</span>${p.tab}</button></li>`,
    ).join("");
  });
  $("#inside").appendChild(idxL);
  $("#leftflat").appendChild(idxR);
  $("#leftflat").insertAdjacentHTML(
    "beforeend",
    '<button class="closef" id="closef"><img src="assets/notes/note-close.png" alt="Close the folder"></button>',
  );
  $("#inside").insertAdjacentHTML(
    "beforeend",
    '<span class="closef" aria-hidden="true"><img src="assets/notes/note-close.png" alt=""></span>',
  );
  $("#closef").addEventListener("click", closeFolder);
  $("#closem").addEventListener("click", closeFolder);
  // stickers on the inside cover
  const stickers = [
    /* add your own: {src:'assets/stickers/name.png', alt:'', x:'58%', y:'60%', w:'26%', rot:-6, stamp:false}
    x/y are the sticker's centre on the inside cover. stamp:true gives it a perforated postage-stamp edge. */
    { src: "assets/stickers/stamp-horse.webp", alt: "", x: "31%", y: "54%", w: "33%", rot: -6 },
    { src: "assets/stickers/stamp-oranges.webp", alt: "", x: "72%", y: "58%", w: "20%", rot: 7 },
    { src: "assets/stickers/butterfly.webp", alt: "", x: "47%", y: "70%", w: "22%", rot: -14 },
    { src: "assets/stickers/coffee.webp", alt: "", x: "74%", y: "85%", w: "25%", rot: 5 },
  ];
  const stickerHTML = stickers
    .map(
      (t) =>
        `<img class="stk${t.stamp ? " stampf" : ""}" src="${t.src}" alt="${t.alt || ""}" style="left:${t.x};top:${t.y};width:${t.w};--r:${t.rot || 0}deg">`,
    )
    .join("");
  $("#inside").insertAdjacentHTML("beforeend", stickerHTML);
  $("#leftflat").insertAdjacentHTML("beforeend", stickerHTML);
  idxR.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) switchTab(b.dataset.k);
  });
  idxL.querySelectorAll("button").forEach((b) => (b.tabIndex = -1));

  /* ── Folder state ── */
  let cur = null,
    opened = false,
    busy = false,
    order = P.map((p) => p.k);
  function stack() {
    order.forEach((k, i) => {
      const f = $("#file-" + k);
      f.style.setProperty("--z", i + 1);
      const front = i === order.length - 1;
      f.classList.toggle("front", front);
      f.tabIndex = front && opened ? 0 : -1;
      f.setAttribute("aria-hidden", front && opened ? "false" : "true");
    });
  }
  function setFront(k) {
    order = order.filter((x) => x !== k).concat(k);
    cur = k;
    stack();
    $$(".ftab").forEach((b) => {
      const on = b.id === "tab-" + k;
      b.setAttribute("aria-pressed", opened && on);
      b.tabIndex = (opened ? on : b.id === "tab-" + P[0].k) ? 0 : -1;
    });
    $$(".index button").forEach((b) => b.setAttribute("aria-current", b.dataset.k === k));
  }
  setFront(P[0].k);
  let flatT = 0;
  function settle(on) {
    scene.classList.toggle("settled", on);
    $("#work").classList.toggle("is-open", on);
  }
  function openFolder(k) {
    if (opened) return;
    opened = true;
    busy = true;
    setFront(k);
    folder.classList.add("open");
    clearTimeout(flatT);
    flatT = setTimeout(() => {
      settle(true);
      busy = false;
      hintTilt();
    }, T(1200));
  }
  /* close: the cover swings back over the files */
  function closeFolder() {
    if (!opened || busy || caseOpen) return;
    busy = true;
    settle(false);
    void folder.offsetWidth;
    $("#work").classList.remove("is-open");
    requestAnimationFrame(() => {
      folder.classList.remove("open");
      opened = false;
      setFront(cur);
      $$(".ftab").forEach((b) => (b.tabIndex = b.id === "tab-" + cur ? 0 : -1));
      setTimeout(() => {
        busy = false;
        $("#tab-" + cur).focus({ preventScroll: true });
      }, T(1150));
    });
  }
  function hintTilt() {
    if (rm || matchMedia("(hover:hover)").matches) return;
    const f = $("#file-" + cur);
    f.classList.add("hint");
    setTimeout(() => f.classList.remove("hint"), 900);
  }
  /* pull-and-drop: the chosen file lifts out from behind, comes forward and drops in front */
  async function switchTab(k) {
    if (!opened) {
      openFolder(k);
      return;
    }
    if (k === cur || busy) return;
    const nf = $("#file-" + k),
      of = $("#file-" + cur);
    if (rm) {
      setFront(k);
      return;
    }
    busy = true;
    nf.classList.add("lifting");
    const up = narrow() ? "0 -12%" : "1.5% -13%";
    of.animate([{ translate: "0 0" }, { translate: "0 .8%" }], {
      duration: 320,
      easing: "ease-out",
      fill: "forwards",
    });
    await nf.animate(
      [
        { translate: "0 0", scale: 1 },
        { translate: up, scale: 1.02 },
      ],
      { duration: 330, easing: "cubic-bezier(.3,0,.2,1)", fill: "forwards" },
    ).finished;
    setFront(k);
    const a = nf.animate(
      [
        { translate: up, scale: 1.02 },
        { translate: "0 0", scale: 1 },
      ],
      { duration: 400, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" },
    );
    of.animate([{ translate: "0 .8%" }, { translate: "0 0" }], {
      duration: 400,
      easing: "ease-in-out",
      fill: "forwards",
    }).finished.then(() => of.getAnimations().forEach((x) => x.cancel()));
    await a.finished;
    nf.getAnimations().forEach((x) => x.cancel());
    nf.classList.remove("lifting");
    busy = false;
  }
  $("#cover").addEventListener("click", () => {
    if (!opened) openFolder(P[0].k);
    else if (narrow()) closeFolder();
  });
  $("#cover").style.cursor = "pointer";
  files.addEventListener("click", (e) => {
    const t = e.target.closest(".ftab");
    if (t) {
      e.preventDefault();
      e.stopPropagation();
      switchTab(t.closest(".file").dataset.k);
      return;
    }
    if (e.target.closest(".flinks a")) return;
    const f = e.target.closest(".file");
    if (!f) return;
    if (!opened) {
      e.preventDefault();
      openFolder(f.dataset.k);
      return;
    }
    if (!f.classList.contains("front")) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    openCase(f.dataset.k);
  });
  files.addEventListener("keydown", (e) => {
    const f = e.target.classList && e.target.classList.contains("file") && e.target;
    if (f && f.classList.contains("front") && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openCase(f.dataset.k);
    }
  });
  // keyboard: arrows move between tabs, Enter or Space opens
  document.addEventListener("keydown", (e) => {
    const t = e.target.closest && e.target.closest(".ftab");
    if (!t) return;
    const ks = P.map((p) => p.k),
      i = ks.indexOf(t.closest(".file").dataset.k);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      const n = ks[(i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + ks.length) % ks.length];
      if (opened) switchTab(n);
      const nb = $("#tab-" + n);
      $$(".ftab").forEach((b) => (b.tabIndex = b === nb ? 0 : -1));
      nb.focus({ preventScroll: true });
    }
  });

  /* ── Load: zoom out from the name label, stop with the folder closed ── */
  function playLoad() {
    const z = $("#zoomer");
    if (rm) return;
    const lab = $(".nlabel").getBoundingClientRect();
    z.style.setProperty(
      "--z0",
      (Math.min(innerWidth / lab.width, innerHeight / lab.height) * 0.9).toFixed(2),
    );
    z.classList.add("intro");
    z.addEventListener("animationend", () => z.classList.remove("intro"), { once: true });
  }
  function placeNudge() {}

  /* ── Sandbox ── */
  /* Sandbox entries: title, tag, and the clip's file name once there is one
   (assets/video/sandbox/<name>.mp4, with <name>.jpg as the poster) */
  const sbx = [
    ["Videogame design", "Game design", ""],
    ["Cyberdeck build", "Hardware", ""],
    ["3D spatial design", "3D", ""],
    ["Video editing", "Video", ""],
    ["Storytelling", "Writing", ""],
    ["Hardware experiments", "Hardware", ""],
  ];
  const card = (
    s,
    i,
  ) => `<article class="item"><figure><div class="media"${s[2] ? ` data-video="assets/video/sandbox/${s[2]}"` : ""}><div class="ph label">Clip 0${i + 1}</div></div>
 <figcaption><span class="label">${s[1]}</span><h3>${s[0]}</h3><p>Two lines on what it was and why you made it. Placeholder until the clip and the text are in.</p></figcaption></figure></article>`;
  let rowsHtml = "";
  for (let i = 0; i < sbx.length; i += 2)
    rowsHtml += `<div class="row ${(i / 2) % 2 ? "b" : "a"}">${card(sbx[i], i)}${sbx[i + 1] ? card(sbx[i + 1], i + 1) : ""}</div>`;
  $("#grid").innerHTML = rowsHtml;
  // Use a real clip when one exists: assets/video/sandbox/01.mp4 (+ 01.jpg poster)
  $$(".media[data-video]").forEach((m) => {
    const base = m.dataset.video,
      v = document.createElement("video");
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "none";
    v.poster = base + ".jpg";
    v.setAttribute("aria-hidden", "true");
    const s = document.createElement("source");
    s.src = base + ".mp4";
    s.type = "video/mp4";
    v.appendChild(s);
    s.addEventListener("error", () => v.remove(), { once: true });
    v.addEventListener(
      "loadeddata",
      () => {
        m.querySelector(".ph")?.remove();
      },
      { once: true },
    );
    m.appendChild(v);
  });
  const vio = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        const v = e.target.querySelector("video");
        if (!v) return;
        if (e.isIntersecting && !rm) {
          v.preload = "auto";
          v.play().catch(() => {});
        } else v.pause();
      }),
    { threshold: 0.35 },
  );
  $$(".media").forEach((m) => vio.observe(m));

  /* ── House rules ── */
  const rules = [
    [
      "Test assumptions before building",
      "Every project starts with assumptions, and I test them early. It's the scientific method applied to creative work.",
    ],
    [
      "Finish more, start less",
      "Fewer tasks in progress means clear ownership and no one quietly burning out.",
    ],
    [
      "Blameless post-mortems",
      "When something doesn't work as expected, we look at the system, not the person.",
    ],
    [
      "Keep things moving",
      "If I get no progress within 45 minutes of working on a task, I log it, park it, and move to work that can get done.",
    ],
  ];
  $("#rlist").innerHTML = rules
    .map(
      (r, i) =>
        `<li class="rv"><span class="n" aria-hidden="true">0${i + 1}</span><h3>${r[0]}</h3><p>${r[1]}</p><span class="chk" aria-hidden="true"><svg viewBox="0 0 30 30"><path d="M7 16c2.6 2 4.2 4.6 5.2 7.2C15.4 15.6 19 10.4 24 5.6"/></svg></span></li>`,
    )
    .join("");
  /* the boxes tick in reading order once the section is in focus */
  const ruleEls = $$("#rlist li");
  let ticked = false;
  function tickAll() {
    if (ticked) return;
    ticked = true;
    ruleEls.forEach((l, i) =>
      rm ? l.classList.add("done") : setTimeout(() => l.classList.add("done"), 200 + i * 420),
    );
  }
  /* rules text fades and drifts in as it arrives, and out as it leaves */
  const rvEls = $$("#rules .rv");
  function rulesReveal(rl) {
    if (!rm)
      rvEls.forEach((el) => {
        const r = el.getBoundingClientRect(),
          c = (r.top + r.bottom) / 2,
          H = innerHeight;
        const v = clamp((H * 0.94 - c) / (H * 0.22)) * clamp((c - H * 0.1) / (H * 0.2));
        el.style.opacity = v.toFixed(3);
        el.style.transform = v >= 1 ? "" : `translateY(${((1 - v) * (c > H / 2 ? 28 : -28)).toFixed(1)}px)`;
      });
    if (rl.top < innerHeight * 0.05 && rl.bottom > innerHeight * 0.85) tickAll();
  }

  /* ── Contact: the business card ──
   It arrives from the house rules as their green back, flips over as you scroll,
   tilts under the pointer, and flips again on click to show a one-liner. */
  const cardLines = [
    "Cat person. No further questions.",
    "Metallica or Lorde. No in-between.",
    "Yes, I'll make a template for that.",
    "Working almost non-stop since I was 18.",
    "More experience than my CV dates suggest.",
    "Raised in a house where guests always left full.",
    "My carrot cake has a bit of a reputation.",
    "Happiest hosting a full table.",
    "Part of me is still on a beach in Spain.",
    "Raised in Spain, born into a Romanian family.",
    "Moved 10+ times, and counting.",
    "Working through every Agatha Christie I can find.",
    "Obsessed with a good story, well told.",
  ];
  let lineI = Math.floor(Math.random() * cardLines.length);
  function nextLine() {
    lineI = (lineI + 1) % cardLines.length;
    $("#cline").textContent = cardLines[lineI];
  }
  nextLine();
  const bcard = $("#bcard"),
    about = $("#about"),
    bcwrap = $("#bcwrap");
  let flipped = false;
  let hov = false;
  function restState() {
    bcard.classList.toggle(
      "rest",
      !flipped &&
        !hov &&
        !bcard.classList.contains("flipping") &&
        parseFloat(bcard.style.getPropertyValue("--sf") || 0) === 0,
    );
  }
  function flipCard() {
    flipped = !flipped;
    if (flipped) nextLine();
    bcard.classList.add("flipping");
    bcard.style.setProperty("--cf", flipped ? "180deg" : "0deg");
    $("#flipbtn").setAttribute("aria-pressed", flipped);
    bcard.classList.remove("rest");
    setTimeout(() => {
      bcard.classList.remove("flipping");
      restState();
    }, T(820));
  }
  const rsvp = $("#rsvp"),
    bstage = $("#bstage"),
    tuckbtn = $("#tuckbtn");
  const tucked = () => innerWidth <= 860 && !rsvp.classList.contains("cardup");
  function sizeTuck() {
    rsvp.style.setProperty("--bch", bcard.offsetHeight + "px");
  }
  let tuckBusy = false;
  /* bring forward: lift out from behind the invitation, then drop on top of it */
  async function cardUp() {
    if (tuckBusy) return;
    tuckBusy = true;
    if (!rm)
      await bstage.animate([{ translate: "0 0" }, { translate: "0 -56px" }], {
        duration: 240,
        easing: "cubic-bezier(.3,0,.2,1)",
        fill: "forwards",
      }).finished;
    rsvp.classList.add("cardup");
    tuckA11y();
    const a = bstage.animate([{ translate: "0 -56px" }, { translate: "0 18px" }], {
      duration: rm ? 0 : 340,
      easing: "cubic-bezier(.4,0,.2,1)",
      fill: "forwards",
    });
    await a.finished;
    tuckbtn.hidden = false;
    bcard.setAttribute("aria-expanded", "true");
    tuckbtn.focus({ preventScroll: true });
    tuckBusy = false;
  }
  async function cardDown() {
    if (tuckBusy) return;
    tuckBusy = true;
    tuckbtn.hidden = true;
    if (flipped) flipCard();
    if (!rm)
      await bstage.animate([{ translate: "0 18px" }, { translate: "0 -56px" }], {
        duration: 260,
        easing: "cubic-bezier(.3,0,.2,1)",
        fill: "forwards",
      }).finished;
    rsvp.classList.remove("cardup");
    tuckA11y();
    await bstage.animate([{ translate: "0 -56px" }, { translate: "0 0" }], {
      duration: rm ? 0 : 320,
      easing: "cubic-bezier(.4,0,.2,1)",
      fill: "forwards",
    }).finished;
    bstage.getAnimations().forEach((x) => x.cancel());
    bcard.setAttribute("aria-expanded", "false");
    tuckBusy = false;
  }
  tuckbtn.addEventListener("click", cardDown);
  bcard.addEventListener(
    "click",
    (e) => {
      if (tucked()) {
        e.preventDefault();
        e.stopPropagation();
        cardUp();
        return;
      }
      if (e.target.closest("a,#flipbtn")) return;
      flipCard();
    },
    true,
  );
  bcard.addEventListener("keydown", (e) => {
    if (tucked() && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      cardUp();
    }
  });
  function tuckA11y() {
    const t = innerWidth <= 860;
    if (t) {
      bcard.setAttribute("role", "button");
      bcard.tabIndex = 0;
      bcard.setAttribute(
        "aria-label",
        rsvp.classList.contains("cardup") ? "Business card" : "Take my business card",
      );
    } else {
      bcard.removeAttribute("role");
      bcard.removeAttribute("tabindex");
      bcard.removeAttribute("aria-label");
      rsvp.classList.remove("cardup");
      tuckbtn.hidden = true;
    }
  }
  addEventListener("resize", () => {
    sizeTuck();
    tuckA11y();
  });
  document.fonts.ready.then(() => {
    sizeTuck();
    tuckA11y();
  });
  sizeTuck();
  tuckA11y();
  $("#flipbtn").addEventListener("click", (e) => {
    e.stopPropagation();
    if (!tucked()) flipCard();
  });
  /* foil: light is top centre, so the bright band sits where the card faces it */
  function foil(rx, ry) {
    const l = [0, -0.42, 0.91],
      n = [
        Math.sin((ry * Math.PI) / 180),
        -Math.sin((rx * Math.PI) / 180),
        Math.cos((rx * Math.PI) / 180) * Math.cos((ry * Math.PI) / 180),
      ];
    const h = [l[0], l[1], l[2] + 1],
      hl = Math.hypot(...h),
      hh = h.map((v) => v / hl);
    const spec = Math.pow(Math.max(0, n[0] * hh[0] + n[1] * hh[1] + n[2] * hh[2]), 40),
      diff = Math.max(0, n[0] * l[0] + n[1] * l[1] + n[2] * l[2]);
    about.style.setProperty(
      "--band",
      clamp(50 + (n[0] - hh[0]) * 320 + (n[1] - hh[1]) * 110, 6, 94).toFixed(1) + "%",
    );
    about.style.setProperty("--fb", (0.86 + diff * 0.16 + spec * 0.4).toFixed(3));
  }
  foil(0, 0);
  if (!rm) {
    bcard.addEventListener("pointermove", (e) => {
      if (innerWidth <= 860 || bcard.classList.contains("flipping")) return;
      hov = true;
      bcard.classList.remove("rest");
      const b = bcard.getBoundingClientRect(),
        ry = ((e.clientX - b.left) / b.width - 0.5) * 14,
        rx = -((e.clientY - b.top) / b.height - 0.5) * 10;
      bcard.style.setProperty("--ry", ry.toFixed(2) + "deg");
      bcard.style.setProperty("--rx", rx.toFixed(2) + "deg");
      foil(rx, ry);
    });
    bcard.addEventListener("pointerleave", () => {
      hov = false;
      bcard.style.setProperty("--ry", "0deg");
      bcard.style.setProperty("--rx", "0deg");
      foil(0, 0);
      setTimeout(restState, 220);
    });
  }
  /* arrival: the invitation slides in from the left, the card from the right, turning over as it lands */
  const invite = $("#form");
  function cardFlip() {
    const H = innerHeight,
      ease = (t) => 1 - Math.pow(1 - t, 3);
    const ti = rm ? 1 : ease(clamp((H - invite.getBoundingClientRect().top) / (H * 0.6)));
    const tc = rm ? 1 : ease(clamp((H - bcwrap.getBoundingClientRect().top) / (H * 0.6)));
    invite.style.transform =
      ti >= 1 ? "" : `translateX(${(-(1 - ti) * 60).toFixed(2)}vw) rotate(${(-(1 - ti) * 5).toFixed(2)}deg)`;
    bcwrap.style.transform =
      tc >= 1 ? "" : `translateX(${((1 - tc) * 60).toFixed(2)}vw) rotate(${((1 - tc) * 9).toFixed(2)}deg)`;
    bcard.style.setProperty("--sf", ((1 - tc) * 180).toFixed(1) + "deg");
    restState();
  }

  /* ── Blind-embossed roses for the invitation ──
   Shapes are drawn as a height map (brighter grey = higher), then lit from the top
   by an SVG lighting filter, so they read as raised paper rather than a drawing. */
  (function () {
    const fl = Math.sin((42 * Math.PI) / 180),
      ch = (sl) => `type="linear" slope="${sl}" intercept="${(0.5 - sl * fl).toFixed(4)}"`;
    document.body.insertAdjacentHTML(
      "beforeend",
      `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><filter id="embf" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB">
  <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"/>
  <feGaussianBlur stdDeviation="1"/>
  <feDiffuseLighting surfaceScale="2.8" diffuseConstant="1" lighting-color="#fff"><feDistantLight azimuth="270" elevation="42"/></feDiffuseLighting>
  <feComponentTransfer><feFuncR ${ch(0.3)}/><feFuncG ${ch(0.32)}/><feFuncB ${ch(0.37)}/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>
 </filter></svg>`,
    );
    const g = (v) => `rgb(${v},${v},${v})`,
      f = (n) => +n.toFixed(2);
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const leaf = (x, y, a, l = 11, w = 0.5) =>
      `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><path d="M0 0Q${f(l * 0.45)} ${f(-l * w)} ${f(l)} 0Q${f(l * 0.45)} ${f(l * w)} 0 0Z" fill="${g(140)}"/><path d="M${f(l * 0.12)} 0L${f(l * 0.8)} 0" stroke="${g(185)}" stroke-width=".7" stroke-linecap="round"/></g>`;
    const rose = (x, y, r, rot = 0) => {
      let s = `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})">`;
      for (let i = 0; i < 5; i++)
        s += `<ellipse cx="${f(0.5 * r)}" rx="${f(0.52 * r)}" ry="${f(0.45 * r)}" transform="rotate(${i * 72})" fill="${g(120)}"/>`;
      for (let i = 0; i < 5; i++)
        s += `<path d="M${f(0.34 * r)} 0L${f(r)} 0" transform="rotate(${i * 72 + 36})" stroke="${g(72)}" stroke-width="${f(r * 0.08)}" stroke-linecap="round"/>`;
      for (let i = 0; i < 5; i++)
        s += `<ellipse cx="${f(0.3 * r)}" rx="${f(0.34 * r)}" ry="${f(0.3 * r)}" transform="rotate(${i * 72 + 36})" fill="${g(170)}"/>`;
      s += `<circle r="${f(0.33 * r)}" fill="${g(212)}"/>`;
      let d = "";
      for (let t = 0; t <= 3.2 * Math.PI; t += 0.25) {
        const rr = r * (0.03 + (0.095 * t) / Math.PI);
        d += (d ? "L" : "M") + f(Math.cos(t) * rr) + " " + f(Math.sin(t) * rr);
      }
      return (
        s +
        `<path d="${d}" fill="none" stroke="${g(145)}" stroke-width="${f(r * 0.065)}" stroke-linecap="round"/></g>`
      );
    };
    const bud = (x, y, a, r = 4) =>
      `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><path d="M0 ${f(-r * 1.5)}Q${f(r)} ${f(-r * 0.2)} 0 ${f(r * 0.6)}Q${f(-r)} ${f(-r * 0.2)} 0 ${f(-r * 1.5)}Z" fill="${g(185)}"/>${leaf(0, r * 0.5, -62, r * 1.5, 0.35)}${leaf(0, r * 0.5, -118, r * 1.5, 0.35)}</g>`;
    const stem = (d, w = 1.3) =>
      `<path d="${d}" fill="none" stroke="${g(96)}" stroke-width="${w}" stroke-linecap="round"/>`;
    // leaves and buds along a sampled curve
    function dress(pts, every, side0 = 1) {
      let s = "",
        side = side0;
      for (let i = every; i < pts.length - 2; i += every) {
        const [p, q] = [pts[i], pts[i + 1]],
          a = (Math.atan2(q[1] - p[1], q[0] - p[0]) * 180) / Math.PI;
        s +=
          rnd() < 0.12
            ? bud(p[0], p[1], a + side * 55 + 90, 3.6)
            : leaf(p[0], p[1], a + side * (38 + rnd() * 22), 14 + rnd() * 6);
        side = -side;
      }
      return s;
    }
    const curve = (fx, fy, n) => Array.from({ length: n + 1 }, (_, i) => [fx(i / n), fy(i / n)]);
    const path = (pts) => "M" + pts.map((p) => f(p[0]) + " " + f(p[1])).join("L");
    // one side of the frame: a cluster in each corner, joined by a climbing vine
    function side(W, H, m, big) {
      let s = "";
      const top = curve(
          (t) => m + t * W * (big ? 0.26 : 0.2),
          (t) => m + 4 - Math.sin(t * Math.PI) * 3,
          40,
        ),
        down = [];
      s += stem(path(top)) + dress(top, 5, -1);
      const y0 = m + 30,
        y1 = H - m - 26,
        len = big ? y1 - y0 : Math.min(y1 - y0, 140);
      const vn = curve(
        (t) => m + 5 + Math.sin((t * len) / 46) * 4.5,
        (t) => y0 + t * len,
        Math.max(8, Math.round(len / 7)),
      );
      s += stem(path(vn)) + dress(vn, 4, 1);
      // roses climbing the vine
      if (big)
        for (let y = y0 + 90; y < y1 - 70; y += 95 + rnd() * 35) {
          const x = m + 5 + Math.sin((y - y0) / 46) * 4.5;
          s +=
            leaf(x, y + 5, 140, 15) +
            leaf(x, y + 5, 40, 15) +
            leaf(x, y - 6, -120, 12) +
            rose(x + (rnd() - 0.5) * 5, y, 9 + rnd() * 4, rnd() * 72);
        }
      // top corner cluster
      const k = big ? 1 : 0.72;
      s +=
        leaf(m + 30 * k, m + 30 * k, 50, 17 * k) +
        leaf(m + 44 * k, m + 8 * k, -15, 16 * k) +
        leaf(m + 10 * k, m + 48 * k, 100, 16 * k) +
        rose(m + 8 * k, m + 9 * k, 16 * k, 10) +
        rose(m + 36 * k, m + 22 * k, 11 * k, 40) +
        rose(m + 12 * k, m + 38 * k, 9 * k, 70) +
        bud(m + 56 * k, m + 7 * k, 70, 4.4 * k) +
        bud(m + 6 * k, m + 60 * k, 170, 4 * k) +
        rose(top[20][0], top[20][1] - 1, big ? 9 : 6, 20) +
        (big ? rose(top[34][0], top[34][1], 7, 50) : "");
      // bottom corner
      {
        const bot = curve(
          (t) => m + t * W * (big ? 0.18 : 0.16),
          (t) => H - m - 4 + Math.sin(t * Math.PI) * 3,
          30,
        );
        s +=
          stem(path(bot)) +
          dress(bot, big ? 4 : 6, 1) +
          leaf(m + 28 * k, H - m - 26 * k, -50, 16 * k) +
          leaf(m + 40 * k, H - m - 6 * k, 15, 15 * k) +
          rose(m + 8 * k, H - m - 9 * k, 14 * k, 30) +
          rose(m + 32 * k, H - m - 20 * k, 9 * k, 0) +
          (big ? rose(m + 10, H - m - 34, 8, 60) : "") +
          bud(bot[24][0], bot[24][1], 95, 3.8 * k);
      }
      return s;
    }
    const box = $("#emboss"),
      form = box.parentElement;
    function draw() {
      const W = form.clientWidth,
        H = form.clientHeight;
      if (!W) return;
      seed = 7;
      const big = W >= 560,
        m = big ? 24 : 14,
        half = side(W, H, m, big);
      box.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><g filter="url(#embf)"><rect width="${W}" height="${H}" fill="#000"/>${half}<g transform="translate(${W} 0) scale(-1 1)">${half}</g></g></svg>`;
    }
    new ResizeObserver(draw).observe(form);
    draw();
    // the sprig between sections: a small rose on a stem
    seed = 3;
    const sp = `<svg viewBox="0 0 120 26" width="120" height="26"><g filter="url(#embf)"><rect width="120" height="26" fill="#000"/>${stem("M6 13C30 11 90 15 114 13", 1.2)}${leaf(46, 12.5, 200, 10)}${leaf(46, 12.5, 160, 10)}${leaf(74, 13, -20, 10)}${leaf(74, 13, 20, 10)}${bud(22, 12.5, -90, 3.4)}${bud(98, 13, 90, 3.4)}${rose(60, 13, 7.5, 15)}</g></svg>`;
    document.querySelectorAll(".sprig").forEach((o) => o.insertAdjacentHTML("beforeend", sp));
  })();

  /* ── Form ── */
  const form = $("#form"),
    msg = $("#msg");
  form.addEventListener("change", () => {
    msg.textContent = "";
    msg.classList.remove("err");
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = [...form.querySelectorAll("input[name=need]:checked")];
    if (!v.length) {
      msg.textContent = "Tick at least one box first.";
      msg.classList.add("err");
      return;
    }
    if (form.website.value) return;
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    msg.textContent = "";
    msg.classList.remove("err");
    saveResponse({ blockers: v.map((i) => i.value), contact: form.contact.value.trim() || null })
      .then(() => {
        const st = $("#fstamp");
        st.classList.remove("hit");
        void st.offsetWidth;
        st.classList.add("hit");
        btn.textContent = "Sent";
        $("#srmsg").textContent = "Received, thanks!";
      })
      .catch(() => {
        btn.disabled = false;
        msg.textContent = "That didn't send. Check your connection and try again.";
        msg.classList.add("err");
      });
  });
  async function saveResponse(row) {
    if (!FORM_ENDPOINT) return;
    const r = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    if (!r.ok) throw new Error("Form endpoint returned " + r.status);
  }

  /* ── Metallic confetti, only for Let's chat ──
   Foil reads as metal when its brightness flickers as it turns,
   so each flake is lit by its current angle to the light above. */
  const fx = $("#fx"),
    cx = fx.getContext("2d");
  let parts = [],
    running = false;
  function sizeFx() {
    const d = Math.min(devicePixelRatio || 1, 2);
    fx.width = innerWidth * d;
    fx.height = innerHeight * d;
    cx.setTransform(d, 0, 0, d, 0, 0);
  }
  const metals = [
    [
      [112, 118, 128],
      [250, 252, 255],
    ],
    [
      [28, 48, 118],
      [176, 198, 255],
    ],
    [
      [16, 92, 62],
      [170, 240, 208],
    ],
    [
      [86, 96, 110],
      [226, 234, 244],
    ],
  ];
  function burst() {
    sizeFx();
    const W = innerWidth,
      H = innerHeight,
      n = rm ? 0 : Math.round(clamp(W / 14, 40, 90));
    for (let i = 0; i < n; i++) {
      const L = i % 2 === 0,
        a = (L ? -1.05 : -2.09) + (Math.random() - 0.5) * 0.5,
        v = (13 + Math.random() * 9) * Math.sqrt(H / 850);
      parts.push({
        x: L ? 10 : W - 10,
        y: H + 10,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.25,
        flip: Math.random() * 6.28,
        vf: 0.1 + Math.random() * 0.2,
        s: 7 + Math.random() * 6,
        col: metals[i % metals.length],
        ph: Math.random() * 6.28,
        t: 0,
        d: Math.floor(Math.random() * 10),
      });
    }
    if (!running && parts.length) {
      running = true;
      requestAnimationFrame(tick);
    }
  }
  function tick() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.y < innerHeight + 40 && p.t < 600);
    for (const p of parts) {
      if (p.d > 0) {
        p.d--;
        continue;
      }
      p.t++;
      p.vy += p.vy < 0 ? 0.36 : 0.06;
      p.vy = Math.min(p.vy, 2.6);
      p.vx *= 0.985;
      p.vx += Math.sin(p.t * 0.07 + p.ph) * 0.08;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.flip += p.vf;
      const f = Math.cos(p.flip),
        lit = Math.pow(Math.abs(Math.cos(p.flip + 0.4)), 3),
        [d, l] = p.col;
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(p.rot);
      cx.scale(1, Math.max(0.08, Math.abs(f)));
      cx.fillStyle = `rgb(${d.map((c, k) => Math.round(c + (l[k] - c) * lit)).join(",")})`;
      cx.fillRect(-p.s / 2, -p.s * 0.7, p.s, p.s * 1.4);
      cx.restore();
    }
    if (parts.length) requestAnimationFrame(tick);
    else {
      running = false;
      cx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }
  function whenSettled(cb) {
    let last = -1,
      same = 0;
    const chk = () => {
      if (Math.abs(scrollY - last) < 1) {
        if (++same > 5) return cb();
      } else same = 0;
      last = scrollY;
      requestAnimationFrame(chk);
    };
    setTimeout(chk, 160);
  }
  $("#cta").addEventListener("click", (e) => {
    e.preventDefault();
    go("contact", () => burst());
  });

  /* ── Navigation ── */
  function targetY(k) {
    if (k === "work") return 0;
    const el = $("#" + k),
      top = el.getBoundingClientRect().top + scrollY;
    if (k === "sandbox") return top + innerHeight * 0.28;
    if (k === "rules") return top + innerHeight * 0.26;
    if (k === "contact")
      return top + Math.max(0, (innerWidth <= 860 ? $("#bcwrap") : $("#form")).offsetTop - 80);
    return top;
  }
  function go(k, after) {
    const y = targetY(k);
    scrollTo({ top: y, behavior: rm ? "auto" : "smooth" });
    if (after) whenSettled(after);
  }
  $("#nav").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-go]");
    if (!a) return;
    e.preventDefault();
    go(a.dataset.go);
  });

  /* ── Scroll: fade to black, section colour on the CTA, sandbox edges ── */
  const nav = $("#nav"),
    ww = $("#workwrap"),
    vig = $("#vig"),
    shade = $("#shade"),
    cta = $("#cta");
  const CTA = {
    work: ["#3255A4", "#fff"],
    sandbox: ["#C8323F", "#fff"],
    rules: ["#FFB511", "#141414"],
    contact: ["#00A95C", "#141414"],
  };
  let section = "";
  function onScroll() {
    const fadeLen = ww.offsetHeight - innerHeight,
      p = rm || fadeLen <= 0 ? 0 : clamp((scrollY - ww.offsetTop) / fadeLen);
    vig.style.opacity = Math.min(1, p * 2);
    shade.style.opacity = clamp((p - 0.3) / 0.7);
    const mid = innerHeight * 0.5,
      sb = $("#sandbox").getBoundingClientRect(),
      rl = $("#rules").getBoundingClientRect(),
      ct = $("#contact").getBoundingClientRect();
    const s =
      ct.top < mid ? "contact" : rl.top < mid ? "rules" : sb.top < mid || p > 0.6 ? "sandbox" : "work";
    root.classList.toggle("scrolled", scrollY > 8);
    if (s !== section) {
      section = s;
      root.style.setProperty("--cta", CTA[s][0]);
      root.style.setProperty("--ctaInk", CTA[s][1]);
      $$("nav a[data-go]").forEach((a) => a.setAttribute("aria-current", a.dataset.go === s));
    }
    const under = colourAt(nav.offsetHeight, { p, sb, rl, ct });
    root.style.setProperty("--navbg", `rgb(${under.map(Math.round).join(",")})`);
    nav.classList.toggle("dark", 0.299 * under[0] + 0.587 * under[1] + 0.114 * under[2] < 140);
    document.body.classList.toggle("in-sbx", sb.top < innerHeight * 0.15 && sb.bottom > innerHeight * 0.85);
    cardFlip();
    rulesReveal(rl);
  }
  /* what colour the page is at height y, following the same fades the sections use */
  const C = { bg: [247, 247, 247], night: [20, 18, 16], green: [30, 138, 87] },
    mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  function colourAt(y, { p, sb, rl, ct }) {
    if (ct.top <= y) return C.bg;
    if (rl.top <= y) {
      const fe = innerHeight * 0.26,
        a = Math.min(clamp((y - rl.top) / fe), clamp((rl.bottom - y) / fe));
      return mix(y - rl.top < rl.height / 2 ? C.night : C.bg, C.green, a);
    }
    if (sb.top <= y) return C.night;
    return mix(C.bg, C.night, rm ? 0 : Math.max(clamp((p - 0.3) / 0.7), Math.min(1, p * 2) * 0.5));
  }
  let tk = false;
  addEventListener(
    "scroll",
    () => {
      if (!tk) {
        tk = true;
        requestAnimationFrame(() => {
          onScroll();
          tk = false;
        });
      }
    },
    { passive: true },
  );
  addEventListener("resize", () => {
    narrowTabs();
    placeNudge();
    onScroll();
    if (!cvEl.hidden) sizeCV();
  });

  /* ── Trifold overlays (CV, phone menu): fold out of their trigger ── */
  function makeTri(rootEl, trigger, html, size) {
    const paper = rootEl.querySelector(".cvpaper");
    let b = false;
    rootEl.querySelectorAll(".cvc").forEach((c) => (c.innerHTML = html));
    function open() {
      if (b || !rootEl.hidden) return;
      b = true;
      rootEl.hidden = false;
      size();
      const k = parseFloat(rootEl.style.getPropertyValue("--k")) || 1,
        r = trigger.getBoundingClientRect(),
        pr = paper.getBoundingClientRect();
      rootEl.style.setProperty("--dx", (r.left + r.width / 2 - (pr.left + pr.width / 2)) / k + "px");
      rootEl.style.setProperty("--dy", (r.top + r.height / 2 - (pr.top + pr.height / 2)) / k + "px");
      void rootEl.offsetWidth;
      rootEl.classList.add("show");
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        rootEl.classList.add("open");
        setTimeout(() => {
          rootEl.classList.add("done");
          b = false;
          rootEl.querySelector(".cvx").focus({ preventScroll: true });
        }, T(1250));
      }, T(650));
    }
    function close(after) {
      if (b || rootEl.hidden) return;
      b = true;
      rootEl.classList.remove("done", "open");
      setTimeout(() => {
        rootEl.classList.remove("show");
        setTimeout(() => {
          rootEl.hidden = true;
          document.body.style.overflow = "";
          b = false;
          if (after) after();
          else trigger.focus({ preventScroll: true });
        }, T(650));
      }, T(1250));
    }
    rootEl.addEventListener("click", (e) => {
      if (!e.target.closest(".cvpaper,.cvact .btn")) close();
    });
    return { open, close };
  }
  const cvEl = $("#cv"),
    cvlink = $("#cvlink");
  function sizeCV() {
    const W = 620;
    cvEl.style.setProperty("--k", 1);
    cvEl.style.setProperty("--cw", W + "px");
    const h = $("#cv .flat .cvin").offsetHeight + 52,
      H = Math.max(W * 1.414, h);
    cvEl.style.setProperty("--ch", H + "px");
    cvEl.style.setProperty(
      "--k",
      Math.min(
        1,
        (innerHeight - (innerWidth <= 700 ? 120 : 48)) / H,
        (innerWidth - (innerWidth <= 700 ? 40 : 240)) / W,
      ).toFixed(3),
    );
  }
  const cvTri = makeTri(cvEl, cvlink, $("#cvtpl").innerHTML, sizeCV);
  cvlink.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    cvTri.open();
  });
  const menuEl = $("#menu");
  const menuTri = makeTri(menuEl, $("#menubtn"), $("#menutpl").innerHTML, () => {
    const W = innerWidth - 24;
    menuEl.style.setProperty("--cw", W + "px");
    menuEl.style.setProperty("--ch", Math.max(300, $("#menu .flat .cvin").offsetHeight + 56) + "px");
  });
  $("#menubtn").addEventListener("click", () => menuTri.open());
  menuEl.querySelector(".flat").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-go]");
    if (!a) return;
    e.preventDefault();
    const k = a.dataset.go;
    menuTri.close(() => (k === "contact" ? go("contact", burst) : go(k)));
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!cvEl.hidden) cvTri.close();
    else if (!menuEl.hidden) menuTri.close();
    else if (!caseOpen && opened && scrollY < innerHeight * 0.5) closeFolder();
  });

  /* ── Case study: the front file lifts out of the folder and grows into the case study paper ── */
  function caseRect() {
    return { left: 0, top: 0, width: document.documentElement.clientWidth, height: innerHeight };
  }
  const px = (r) => ({
    left: r.left + "px",
    top: r.top + "px",
    width: r.width + "px",
    height: r.height + "px",
  });
  const frontFile = () => $("#file-" + cur);
  const frontPage = () => frontFile().querySelector(".sheetin");
  function paperOverlay(r, withText) {
    const o = document.createElement("div");
    o.className = "raise mat m-sheet";
    Object.assign(o.style, px(r));
    if (withText) o.innerHTML = frontFile().querySelector(".ftxt").outerHTML;
    document.body.appendChild(o);
    return o;
  }
  const CASE_FILES = { "gdg.html": "gdg", "lfc.html": "lfc", "audits.html": "audit" };
  const casev = $("#casev"),
    cscroll = $("#cscroll"),
    cpaper = $("#cpaper");
  let caseOpen = null,
    caseBusy = false,
    casePushed = false;
  async function loadCase(k) {
    const res = await fetch(byK[k].page);
    const d = new DOMParser().parseFromString(await res.text(), "text/html");
    d.querySelectorAll("[src]").forEach((el) => {
      const v = el.getAttribute("src");
      if (!/^(https?:|data:|\/)/.test(v))
        el.setAttribute("src", v.startsWith("../") ? v.slice(3) : "work/" + v);
    });
    return { html: d.querySelector(".content").innerHTML, style: d.body.getAttribute("style") || "" };
  }
  function fillCase(d) {
    casev.setAttribute("style", d.style);
    cpaper.innerHTML = `<div class="content">${d.html}</div>`;
    cscroll.scrollTop = 0;
  }
  async function openCase(k, instant) {
    if (caseBusy || caseOpen) return;
    caseBusy = true;
    const dataP = loadCase(k),
      mobile = innerWidth <= 700,
      sheet = frontPage();
    casev.hidden = false;
    casev.classList.add("m");
    document.body.style.overflow = "hidden";
    if (!(rm || instant)) {
      const r = sheet.getBoundingClientRect(),
        o = paperOverlay(r, false);
      sheet.style.visibility = "hidden";
      if (mobile) {
        await o.animate(
          [
            { ...px(r) },
            {
              ...px({ left: 0, top: 0, width: document.documentElement.clientWidth, height: innerHeight }),
              borderRadius: "0",
            },
          ],
          { duration: 450, easing: "cubic-bezier(.6,0,.2,1)", fill: "forwards" },
        ).finished;
      } else {
        await o.animate([{ transform: "none" }, { transform: "translateY(-12px) rotate(-.8deg)" }], {
          duration: 240,
          easing: "ease-out",
          fill: "forwards",
        }).finished;
        casev.classList.add("bg");
        await o.animate(
          [
            { ...px(r), transform: "translateY(-12px) rotate(-.8deg)" },
            { ...px(caseRect()), transform: "none", borderRadius: "0" },
          ],
          { duration: 620, easing: "cubic-bezier(.6,0,.2,1)", fill: "forwards" },
        ).finished;
      }
      fillCase(await dataP);
      casev.classList.add("bg", "show");
      o.remove();
    } else {
      fillCase(await dataP);
      sheet.style.visibility = "hidden";
      casev.classList.add("bg", "show");
    }
    caseOpen = k;
    if (!instant) {
      history.pushState({ case: k }, "", "#case-" + k);
      casePushed = true;
    }
    casev.querySelector(".cback").focus({ preventScroll: true });
    caseBusy = false;
  }
  async function closeCase() {
    if (caseBusy || !caseOpen) return;
    caseBusy = true;
    const mobile = casev.classList.contains("m"),
      sheet = frontPage();
    if (!rm) {
      casev.classList.add("leaving");
      await wait(200);
    }
    const pr = cpaper.getBoundingClientRect(),
      top = Math.max(pr.top, 0);
    const from = mobile
      ? { left: 0, top: 0, width: document.documentElement.clientWidth, height: innerHeight }
      : { left: pr.left, top, width: pr.width, height: innerHeight - top + 8 };
    const r = sheet.getBoundingClientRect();
    if (!rm) {
      const o = paperOverlay(from, false);
      casev.classList.remove("show", "leaving", "bg");
      await o.animate([{ ...px(from) }, { ...px(r), borderRadius: "2px" }], {
        duration: mobile ? 420 : 620,
        easing: "cubic-bezier(.6,0,.2,1)",
        fill: "forwards",
      }).finished;
      sheet.style.visibility = "";
      await o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" }).finished;
      o.remove();
    } else sheet.style.visibility = "";
    casev.hidden = true;
    casev.classList.remove("show", "bg", "leaving", "m");
    cpaper.innerHTML = "";
    document.body.style.overflow = "";
    caseOpen = null;
    caseBusy = false;
    frontFile().focus({ preventScroll: true });
  }
  casev.addEventListener("click", async (e) => {
    const back =
      e.target.closest("[data-back]") ||
      (!e.target.closest(".paper,.cnav") && caseOpen && !caseBusy ? casev : null);
    if (back) {
      e.preventDefault();
      if (casePushed) {
        casePushed = false;
        history.back();
      } else {
        history.replaceState(null, "", location.pathname);
        closeCase();
      }
      return;
    }
    const a = e.target.closest("a[href]");
    if (!a) return;
    const k = CASE_FILES[(a.getAttribute("href") || "").split("/").pop()];
    if (k && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      casev.classList.add("leaving");
      const d = await loadCase(k);
      await wait(200);
      setFront(k);
      fillCase(d);
      casev.classList.remove("leaving");
      caseOpen = k;
      history.replaceState({ case: k }, "", "#case-" + k);
    }
  });
  addEventListener("popstate", () => {
    if (caseOpen && !location.hash.startsWith("#case-")) closeCase();
    else if (!caseOpen) {
      const m = location.hash.match(/^#case-(gdg|lfc|audit)$/);
      if (m) {
        openNow(m[1]);
        openCase(m[1]);
      }
    }
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && caseOpen) {
      if (casePushed) {
        casePushed = false;
        history.back();
      } else closeCase();
    }
  });
  /* open the folder on a file with no animation (deep links and coming back from a case page) */
  function openNow(k) {
    if (!opened) {
      opened = true;
      folder.style.transition = "none";
      $(".cover").style.transition = "none";
      folder.classList.add("open");
      settle(true);
      requestAnimationFrame(() => {
        folder.style.transition = "";
        $(".cover").style.transition = "";
      });
    }
    setFront(k);
    scrollTo(0, 0);
  }
  function returnFromCase() {
    const m = location.hash.match(/^#work-(gdg|lfc|audit)$/);
    if (!m) return false;
    history.replaceState(null, "", location.pathname);
    openNow(m[1]);
    if (rm) return true;
    requestAnimationFrame(() => {
      const r = frontPage().getBoundingClientRect(),
        o = paperOverlay(caseRect(), false);
      o.animate([{ ...px(caseRect()) }, { ...px(r) }], {
        duration: 620,
        easing: "cubic-bezier(.6,0,.2,1)",
        fill: "forwards",
      })
        .finished.then(
          () => o.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }).finished,
        )
        .then(() => o.remove());
    });
    return true;
  }
  addEventListener("pageshow", (e) => {
    if (e.persisted) $$(".raise").forEach((o) => o.remove());
  });
  function openFromHash() {
    const m = location.hash.match(/^#case-(gdg|lfc|audit)$/);
    if (!m) return false;
    openNow(m[1]);
    openCase(m[1], true);
    return true;
  }

  document.fonts.ready.then(() => {
    placeNudge();
    onScroll();
    if (returnFromCase() || openFromHash()) return;
    playLoad();
  });
  placeNudge();
  onScroll();
}
