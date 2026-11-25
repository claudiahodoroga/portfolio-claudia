/* Where the form sends responses: the Vercel function in api/submit.js */
const FORM_ENDPOINT = "/api/submit";

{
  const $ = (s) => document.querySelector(s),
    $$ = (s) => [...document.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const root = document.documentElement;
  let rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
    rm = e.matches;
    layout();
    playLoad();
  });
  let narrow = innerWidth <= 700;
  const C = {
    red: "#B73333",
    blue: "#2843AF",
    orange: "#E9931A",
    yellow: "#F6DC7C",
    sky: "#B9DDF3",
    green: "#2E7D4F",
  };

  const CASE_PAGES = { gdg: "work/gdg.html", lfc: "work/lfc.html", audit: "work/audits.html" };
  /* projects, in tab order from the draft */
  const projects = {
    lfc: {
      tab: "Liffey Founders Club",
      short: "LFC",
      color: C.blue,
      ink: "#fff",
      title: "Experience Design",
      body: [
        "A space for potential founders to validate their ideas. I'm giving the event shape: research, attendee journeys and event formats.",
      ],
      snips: [
        ["attendee_journey.pdf", "map"],
        ["interview_notes.doc", "doc"],
      ],
    },
    gdg: {
      tab: "GDG Girona",
      short: "GDG",
      color: C.red,
      ink: "#fff",
      title: "Organizational Management",
      body: [
        "I'm building a sustainable operating system for a volunteer tech ambassador community.",
        "Google Developer Group Girona (aka GDG Girona) is a ....",
      ],
      snips: [
        ["roles_v2.xlsx", "sheet"],
        ["devfest_attendance.csv", "chart"],
      ],
    },
    audit: {
      tab: "Audits &amp;<br>Documentation",
      short: "Audits",
      color: C.green,
      ink: "#fff",
      title: "Audits & Documentation",
      body: [
        "Degree accreditation audits and technical documentation: inspecting dense documents, interviewing stakeholders and building knowledge trees.",
      ],
      snips: [
        ["self_report_draft_03.docx", "redline"],
        ["knowledge_tree.md", "tree"],
      ],
    },
  };
  const art = {
    sheet: () =>
      `<div class="ms">${Array.from({ length: 15 }, (_, i) => `<span class="${i >= 6 && i < 9 ? "h" : ""}"></span>`).join("")}</div>`,
    chart: () =>
      `<div class="mc">${[40, 55, 48, 70, 92].map((h) => `<i style="height:${h}%"></i>`).join("")}</div>`,
    doc: () =>
      `<div class="ml" style="width:90%"></div><div class="ml hl" style="width:75%"></div><div class="ml" style="width:84%"></div><div class="ml" style="width:60%"></div><div class="ml hl" style="width:70%"></div>`,
    redline: () =>
      `<div class="ml" style="width:88%"></div><div class="ml ul" style="width:70%"></div><div class="ml" style="width:92%"></div><div class="ml ul" style="width:50%"></div><div class="ml" style="width:78%"></div>`,
    map: () =>
      `<svg viewBox="0 0 200 90" aria-hidden="true"><path d="M10 70 C50 10 80 80 110 40 S170 20 190 60" fill="none" stroke="#111" stroke-width="2" stroke-dasharray="5 4"/>${[
        [10, 70],
        [62, 42],
        [110, 40],
        [150, 34],
        [190, 60],
      ]
        .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="7" fill="${i === 2 ? C.red : C.blue}"/>`)
        .join("")}</svg>`,
    tree: () =>
      `<svg viewBox="0 0 200 100" aria-hidden="true"><g stroke="#111" stroke-width="1.5">${[
        [100, 18, 40, 60],
        [100, 18, 100, 60],
        [100, 18, 160, 60],
        [40, 60, 20, 90],
        [40, 60, 60, 90],
        [160, 60, 180, 90],
      ]
        .map(([a, b, c, d]) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`)
        .join("")}</g>${[
        [100, 18, C.red],
        [40, 60, C.blue],
        [100, 60, C.blue],
        [160, 60, C.blue],
        [20, 90, C.orange],
        [60, 90, C.orange],
        [180, 90, C.orange],
      ]
        .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="8" fill="${c}"/>`)
        .join("")}</svg>`,
  };
  const torn = () => {
    let pts = ["0 0", "100% 0", "100% 94%"];
    for (let x = 92; x > 0; x -= 8) pts.push(`${x}% ${93 + Math.random() * 7}%`);
    pts.push("0 96%");
    return `polygon(${pts.join(",")})`;
  };
  const folder = $("#folder"),
    tabs = $("#tabs"),
    sheet = $("#sheet"),
    pagesEl = $("#pages");
  const inside = $("#inside");
  function placeSheet() {
    const home = narrow ? null : folder.classList.contains("settled") ? $("#leftflat") : inside;
    if (!home) {
      if (sheet.parentNode !== pagesEl) pagesEl.prepend(sheet);
    } else if (sheet.parentNode !== home) home.appendChild(sheet);
  }
  placeSheet();
  const defPos = () =>
    narrow
      ? [
          { x: 50, y: 70, r: -4 },
          { x: 70, y: 75, r: 4 },
        ]
      : [
          { x: 5, y: 8, r: -2 },
          { x: 40, y: 21, r: 2 },
        ];
  const pos = {};
  Object.keys(projects).forEach((k) => (pos[k] = defPos()));
  const tornCache = {};
  let zTop = 3,
    curTab = "";
  function renderSnips(k) {
    $$(".snip").forEach((e) => e.remove());
    projects[k].snips.forEach((g, i) => {
      const d = document.createElement("div"),
        p = pos[k][i],
        key = k + i;
      tornCache[key] = tornCache[key] || torn();
      d.className = "snip";
      d.tabIndex = 0;
      d.setAttribute("role", "img");
      d.setAttribute("aria-label", `Clipping from ${g[0]}. Drag it, or move it with the arrow keys.`);
      d.style.left = p.x + "%";
      d.style.top = p.y + "%";
      d.style.setProperty("--r", p.r + "deg");
      d.innerHTML = `<div class="sh" style="clip-path:${tornCache[key]}"></div><div class="tape"></div><div class="paper" style="clip-path:${tornCache[key]}"><span class="fn">${g[0]}</span>${art[g[1]]()}</div>`;
      pagesEl.appendChild(d);
      let ox = 0,
        oy = 0,
        on = false;
      const save = (x, y) => {
        const R = pagesEl.getBoundingClientRect();
        p.x = (x / R.width) * 100;
        p.y = (y / R.height) * 100;
        d.style.left = p.x + "%";
        d.style.top = p.y + "%";
      };
      d.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        d.setPointerCapture(e.pointerId);
        on = true;
        const R = pagesEl.getBoundingClientRect();
        ox = e.clientX - R.left - d.offsetLeft;
        oy = e.clientY - R.top - d.offsetTop;
        d.style.zIndex = ++zTop;
        d.classList.add("drag");
      });
      d.addEventListener("pointermove", (e) => {
        if (!on) return;
        const R = pagesEl.getBoundingClientRect();
        save(
          clamp(e.clientX - R.left - ox, 0, R.width - d.offsetWidth),
          clamp(e.clientY - R.top - oy, 0, R.height - d.offsetHeight),
        );
      });
      const end = () => {
        on = false;
        d.classList.remove("drag");
      };
      d.addEventListener("pointerup", end);
      d.addEventListener("pointercancel", end);
      d.addEventListener("keydown", (e) => {
        const m = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key];
        if (!m) return;
        e.preventDefault();
        const R = pagesEl.getBoundingClientRect();
        d.style.zIndex = ++zTop;
        save(
          clamp(d.offsetLeft + m[0], 0, R.width - d.offsetWidth),
          clamp(d.offsetTop + m[1], 0, R.height - d.offsetHeight),
        );
      });
    });
  }
  const TAB =
    "M0 0L36.5333 39.2298C44.0625 47.3147 48.2747 57.9361 48.333 68.9838L48.9241 180.884C48.9734 190.224 46.0496 199.336 40.5759 206.904L0 263V0Z";
  tabs.innerHTML = Object.entries(projects)
    .map(
      ([k, p]) =>
        `<button role="tab" data-k="${k}" style="color:${p.ink}"><svg class="tv" viewBox="0 0 49 263" preserveAspectRatio="none" aria-hidden="true"><path d="${TAB}" fill="${p.color}"/></svg><svg class="th" viewBox="0 0 263 49" preserveAspectRatio="none" aria-hidden="true"><g transform="translate(0 49) rotate(-90)"><path d="${TAB}" fill="${p.color}"/></g></svg><span class="lab"><span class="long">${p.tab}</span><span class="short">${p.short}</span></span></button>`,
    )
    .join("");
  function setTab(k) {
    curTab = k;
    $$("#tabs button").forEach((b) => b.setAttribute("aria-selected", b.dataset.k === k));
    const p = projects[k];
    folder.style.setProperty("--fc", p.color);
    $("#sheetTxt").innerHTML = `<h3>${p.title}</h3>${p.body.map((t) => `<p>${t}</p>`).join("")}`;
    $("#caseLink").href = CASE_PAGES[k];
    renderSnips(k);
  }
  let switching = false,
    closeLock = 0,
    sCur = null,
    sTarget = 1,
    zRaf = 0;
  function applyS() {
    folder.style.transform = fsh.style.transform =
      sCur === 1
        ? `translate(${-Math.round(folder.offsetWidth / 2)}px,${-Math.round(folder.offsetHeight / 2)}px) translateX(var(--shift))`
        : `translate(-50%,-50%) translateX(var(--shift)) scale(${sCur})`;
    if (sCur !== 1) setFlat(false);
  }
  /* Once the folder has finished opening, drop the 3D so text and tabs render sharp */
  let flatT = 0;
  function setFlat(on) {
    if (on === folder.classList.contains("settled")) return;
    folder.classList.toggle("settled", on);
    $("#folderL").classList.toggle("settled", on);
    placeSheet();
  }
  function scheduleFlat(ms) {
    clearTimeout(flatT);
    flatT = setTimeout(() => {
      if (folder.classList.contains("open") && !switching && sCur === 1) setFlat(true);
    }, ms);
  }
  function zoomTick() {
    sCur += (sTarget - sCur) * 0.14;
    if (Math.abs(sTarget - sCur) < 0.0008) {
      sCur = sTarget;
      applyS();
      zRaf = 0;
      return;
    }
    applyS();
    zRaf = requestAnimationFrame(zoomTick);
  }
  const fsh = $("#fsh");
  function syncSh() {
    ["open", "quick", "rev"].forEach((c) => fsh.classList.toggle(c, folder.classList.contains(c)));
  }
  function switchTab(k) {
    if (k === curTab || switching) return;
    if (rm || !folder.classList.contains("open")) {
      setTab(k);
      return;
    }
    if (narrow) {
      switching = true;
      folder.classList.add("swap");
      setTimeout(() => {
        setTab(k);
        folder.classList.remove("swap");
        setTimeout(() => {
          switching = false;
        }, 260);
      }, 260);
      return;
    }
    switching = true;
    clearTimeout(flatT);
    setFlat(false);
    folder.classList.add("quick");
    folder.classList.remove("open");
    syncSh();
    setTimeout(() => {
      setTab(k);
      folder.classList.add("open");
      syncSh();
      setTimeout(() => {
        folder.classList.remove("quick");
        syncSh();
        switching = false;
        scheduleFlat(0);
      }, 560);
    }, 520);
  }
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) switchTab(b.dataset.k);
  });
  tabs.addEventListener("keydown", (e) => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const bs = $$("#tabs button");
    let i = bs.findIndex((b) => b.dataset.k === curTab);
    i = (i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1) + bs.length) % bs.length;
    switchTab(bs[i].dataset.k);
    bs[i].focus();
    e.preventDefault();
  });
  setTab("gdg");

  /* reel */
  const frames = [
    ["Videogame design", C.blue, C.sky],
    ["Cyberdeck build", C.red, C.yellow],
    ["3D spatial design", C.orange, C.yellow],
    ["Video editing", C.sky, C.blue],
    ["Storytelling", C.yellow, C.red],
    ["Hardware experiments", C.blue, C.orange],
  ];
  const reel = $("#reel"),
    caps = $("#caps");
  reel.innerHTML = frames
    .map(
      (f, i) =>
        `<div class="cell" data-i="${i}"><div class="ph" style="background:radial-gradient(circle at 30% 30%,${f[2]} 0 18%,transparent 19%),linear-gradient(150deg,${f[1]},${f[2]})"><i>photo or clip</i></div><span class="edge">${String(i + 1).padStart(2, "0")}</span></div>`,
    )
    .join("");
  caps.innerHTML = frames
    .map((f) => `<div class="cap"><strong>${f[0]}</strong><span class="hn">handwritten note</span></div>`)
    .join("");
  const cells = $$(".cell"),
    capEls = $$(".cap");

  /* SOPs, in Claudia's words */
  const rules = [
    [
      "Test assumptions before scaling",
      "Every project begins with assumptions to verify. If an assumption is proven wrong during research, it's an opportunity to investigate it or re-formulate it. Better to pivot early than to patch up a broken plan later.",
    ],
    [
      "Cap maximum WIP tasks",
      "Limiting active tasks prevents silent burnout and keeps task ownership clear. Especially important in volunteer and cross-functional teams.",
    ],
    [
      "No-blame, candid post-mortems",
      "Evaluation isn't about who made what mistake. It's about seeing patterns, spotting bottlenecks, and improving the approach for the next cycles.",
    ],
    [
      "45-minute unblock rule",
      "Don't stay blocked on a task for more than 45 minutes straight. Log the issue, park the task temporarily, and move on to the next non-dependent work package. Don't let momentum stall.",
    ],
  ];
  $("#rules").innerHTML = rules
    .map(
      (r, i) =>
        `<div class="rule"><strong>${r[0]}</strong><p>${r[1]}</p><div class="stamp" style="animation-delay:${0.9 + i * 0.35}s">APPROVED</div></div>`,
    )
    .join("");
  const stamps = $$(".rule .stamp");

  /* card tilt */
  const card = $("#card");
  card.addEventListener("pointermove", (e) => {
    const b = card.getBoundingClientRect();
    card.style.setProperty("--tilt", (((e.clientX - b.left) / b.width - 0.5) * -6).toFixed(2) + "deg");
  });
  card.addEventListener("pointerleave", () => card.style.setProperty("--tilt", "-1deg"));

  /* confetti: two poppers from the bottom corners */
  const hero = $("#top"),
    cv = $("#confetti"),
    cx = cv.getContext("2d");
  const cols = [C.red, C.blue, C.orange, C.yellow, C.sky, C.green];
  let parts = [],
    hts = [],
    raf = 0,
    W = 0,
    H = 0;
  const BW = 18;
  const r = (a, b) => a + Math.random() * (b - a);
  function sizeCv() {
    const b = hero.getBoundingClientRect(),
      d = devicePixelRatio || 1;
    W = b.width;
    H = b.height;
    cv.width = W * d;
    cv.height = H * d;
    cx.setTransform(d, 0, 0, d, 0, 0);
  }
  function step(p) {
    if (p.d > 0) {
      p.d--;
      return;
    }
    p.ph += 0.08;
    p.vx *= 0.985;
    if (p.vy < 0) p.vy += 0.38;
    else {
      p.vy = Math.min(p.vy + 0.12, 3.6);
      p.x += Math.sin(p.ph) * 1.2;
    }
    p.x += p.vx;
    p.y += p.vy;
    p.r += p.vr;
    if (p.x < 4) {
      p.x = 4;
      p.vx = Math.abs(p.vx) * 0.4;
    }
    if (p.x > W - 4) {
      p.x = W - 4;
      p.vx = -Math.abs(p.vx) * 0.4;
    }
    if (p.vy > 0) {
      const b = clamp(Math.floor(p.x / BW), 0, hts.length - 1),
        fl = H - hts[b] - 4;
      if (p.y >= fl) {
        p.y = fl;
        p.s = true;
        p.r = r(-0.6, 0.6);
        hts[b] += 4;
      }
    }
  }
  function draw() {
    cx.clearRect(0, 0, W, H);
    for (const p of parts) {
      if (p.d > 0) continue;
      cx.save();
      cx.translate(p.x, p.y);
      cx.rotate(p.r);
      cx.scale(1, p.s ? 0.4 : Math.cos(p.ph));
      cx.fillStyle = p.c;
      cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cx.restore();
    }
  }
  function burst(instant) {
    cancelAnimationFrame(raf);
    sizeCv();
    hts = new Array(Math.ceil(W / BW) + 1).fill(0);
    const n = Math.round(clamp(W / 20, 36, 72)),
      sx = clamp(W / 1280, 0.4, 1),
      sy = Math.sqrt(H / 800);
    parts = Array.from({ length: n }, (_, i) => {
      const L = i % 2 === 0;
      return {
        x: L ? 8 : W - 8,
        y: H - 10,
        vx: (L ? 1 : -1) * r(3, 12) * sx,
        vy: -r(15, 24) * sy,
        r: r(0, 6.3),
        vr: r(-0.2, 0.2),
        w: r(14, 24),
        h: r(22, 34),
        c: cols[(Math.random() * cols.length) | 0],
        ph: r(0, 6.3),
        s: false,
        d: Math.floor(r(0, 14)),
      };
    });
    if (instant) {
      let g = 0;
      while (parts.some((p) => !p.s) && g++ < 4000)
        parts.forEach((p) => {
          if (!p.s) step(p);
        });
      draw();
      return;
    }
    const loop = () => {
      parts.forEach((p) => {
        if (!p.s) step(p);
      });
      draw();
      if (parts.some((p) => !p.s)) raf = requestAnimationFrame(loop);
    };
    loop();
  }

  /* hero load */
  const form = $("#form"),
    note = $("#note");
  function playLoad() {
    const mode = "stagger",
      items = [...$$(".ld"), form];
    hero.dataset.mode = mode;
    items.forEach((e) => {
      e.classList.remove("in", "land");
      e.style.transitionDelay = "";
    });
    note.classList.remove("in");
    void hero.offsetWidth;
    burst(rm);
    if (rm) {
      items.forEach((e) => e.classList.add("in"));
      note.classList.add("in");
      return;
    }
    items.forEach((e, i) => {
      if (e === form && mode === "land") {
        form.classList.add("land");
        return;
      }
      e.style.transitionDelay = (mode === "together" ? 250 : 250 + i * 200) + "ms";
      e.classList.add("in");
    });
    setTimeout(() => note.classList.add("in"), 3200);
  }
  $("#logo").onclick = () => {
    scrollTo(0, 0);
    playLoad();
  };

  /* sequence: zoom, hold, dim, reel, lights on, SOPs, contact */
  const seq = $("#seq"),
    vig = $("#vig"),
    shade = $("#shade"),
    reelL = $("#reelL"),
    fineL = $("#fineL"),
    nav = $("#nav"),
    logo = $("#logo");
  let B = {};
  function layout() {
    root.classList.toggle("rm", rm);
    $("#reelhint").textContent = rm
      ? "swipe or scroll sideways to see side projects"
      : "keep scrolling to see side projects";
    if (rm) {
      seq.style.height = "";
      update();
      return;
    }
    const vh = innerHeight,
      vw = innerWidth,
      rw = reel.scrollWidth;
    B.z1 = vh * 1.1;
    B.h1 = B.z1 + vh * 0.7;
    B.d1 = B.h1 + vh * 0.8;
    B.s1 = B.d1 + (vw + rw) * 1.1;
    B.l1 = B.s1 + vh * 0.8;
    B.f1 = B.l1 + vh * 1.1;
    B.end = B.f1 + vh * 0.9;
    seq.style.height = B.end + vh + "px";
    update();
  }
  let focusI = -1;
  function setFocus(i) {
    if (i === focusI) return;
    focusI = i;
    cells.forEach((c, j) => c.classList.toggle("focus", j === i));
    capEls.forEach((c, j) => c.classList.toggle("focus", j === i));
  }
  function nearest() {
    let best = 0,
      bd = 1e9;
    const mid = rm ? reelL.getBoundingClientRect().left + reelL.clientWidth / 2 : innerWidth / 2;
    cells.forEach((el, i) => {
      const b = el.getBoundingClientRect(),
        d = Math.abs(b.left + b.width / 2 - mid);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  }
  let current = null;
  function setCurrent(k, zooming) {
    const col = { "": C.blue, work: C.red, sandbox: C.yellow, fine: C.green, contact: C.blue }[k];
    logo.style.backgroundColor = col;
    if (k === current) return;
    current = k;
    $$("nav a").forEach((a) => a.setAttribute("aria-current", a.dataset.go === k));
  }
  /* business card easter egg: a new line every time the card is flipped */
  const cardLines = [
    "Cat person. No further questions.",
    "Either listening to Metallica or Lorde, no in-between.",
    "Yes, I'll make a template for that.",
    "Been working almost non-stop since I was 18.",
    "I pack more expertise than my CV dates suggest.",
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
  function setFine(on, contact) {
    if (on && !fineL.classList.contains("on")) {
      fineL.classList.add("on");
      stamps.forEach((s) => s.classList.add("hit"));
    }
    if (!on && fineL.classList.contains("on")) {
      fineL.classList.remove("on");
      stamps.forEach((s) => s.classList.remove("hit", "done"));
    }
    if (contact && !fineL.classList.contains("contact")) nextLine();
    fineL.classList.toggle("contact", contact);
  }
  function update() {
    if (rm) {
      folder.style.transform = fsh.style.transform = "translate(-50%,-50%)";
      folder.classList.add("open");
      syncSh();
      sCur = 1;
      setFlat(true);
      reelL.classList.add("live");
      fineL.classList.add("live");
      setFine(true, false);
      setFocus(nearest());
      const y = scrollY + innerHeight * 0.4,
        top = seq.offsetTop;
      setCurrent(
        y < top
          ? ""
          : y < reelL.offsetTop + top
            ? "work"
            : y < fineL.offsetTop + top
              ? "sandbox"
              : y < $("#ctext").getBoundingClientRect().top + scrollY
                ? "fine"
                : "contact",
        false,
      );
      const rt = reelL.getBoundingClientRect();
      nav.classList.toggle("dark", rt.top < 40 && rt.bottom > 40);
      return;
    }
    const y = scrollY - seq.offsetTop,
      vw = innerWidth,
      vh = innerHeight,
      rw = reel.scrollWidth;
    const fw = folder.offsetWidth,
      fh = folder.offsetHeight,
      cw = narrow ? fw : fw / 2;
    const sMax = Math.max(vw / cw, vh / fh) * 1.7;
    const now = performance.now(),
      z = ease(clamp(y / (B.z1 * 0.8)));
    sTarget = now < closeLock ? 1 : sMax + (1 - sMax) * z;
    if (sCur === null || root.classList.contains("instant")) {
      sCur = sTarget;
      applyS();
    } else if (!zRaf) zRaf = requestAnimationFrame(zoomTick);
    if (!switching) {
      const isOpen = folder.classList.contains("open");
      if (y >= B.z1 * 0.97 && !isOpen) {
        folder.classList.remove("rev");
        folder.classList.add("open");
        scheduleFlat(root.classList.contains("instant") ? 60 : 1200);
      } else if (y < B.z1 * 0.9 && isOpen) {
        clearTimeout(flatT);
        setFlat(false);
        folder.classList.add("rev");
        folder.classList.remove("open");
        closeLock = now + 650;
        setTimeout(() => {
          folder.classList.remove("rev");
          syncSh();
          update();
        }, 680);
      }
    }
    syncSh();
    const t = ease(clamp((y - B.h1) / (B.d1 - B.h1))),
      l = ease(clamp((y - B.s1) / (B.l1 - B.s1)));
    const k = t * (1 - l);
    vig.style.opacity = Math.min(1, t * 2.2) * (1 - Math.min(1, l * 5));
    shade.style.opacity = clamp((t - 0.35) / 0.65);
    const e0 = (l * 140 - 40).toFixed(2),
      m = `linear-gradient(to left,transparent ${e0}%,#000 ${(+e0 + 40).toFixed(2)}%)`;
    shade.style.webkitMaskImage = shade.style.maskImage = l > 0 ? m : "none";
    const fl = $("#folderL"),
      fon = y < B.d1;
    fl.style.visibility = fon ? "visible" : "hidden";
    fl.style.opacity = fon ? 1 : 0;
    fl.style.pointerEvents = fon ? "" : "none";
    const live = y > B.h1 && y < B.l1;
    reelL.classList.toggle("live", live);
    const sr = clamp((y - B.d1) / (B.s1 - B.d1)),
      rx = vw - sr * (vw + rw);
    $("#reelhint").style.opacity = sr > 0.02 && sr < 0.95 ? 0.65 : 0;
    reel.style.transform = caps.style.transform = `translateX(${rx}px)`;
    if (live) setFocus(nearest());
    fineL.classList.toggle("live", y >= B.s1);
    setFine(y >= B.s1 + (B.l1 - B.s1) * 0.7, y >= B.f1);
    const zooming = y > -vh * 0.05 && z < 0.97;
    nav.classList.toggle("dark", zooming || (t > 0.5 && l < 0.5));
    setCurrent(
      y < -vh * 0.4
        ? ""
        : y < (B.h1 + B.d1) / 2
          ? "work"
          : y < (B.s1 + B.l1) / 2
            ? "sandbox"
            : y < B.f1 - vh * 0.1
              ? "fine"
              : "contact",
      zooming,
    );
  }
  let tick = false;
  addEventListener(
    "scroll",
    () => {
      if (!tick) {
        tick = true;
        requestAnimationFrame(() => {
          update();
          tick = false;
        });
      }
    },
    { passive: true },
  );
  addEventListener("resize", () => {
    const n = innerWidth <= 700;
    if (n !== narrow) {
      narrow = n;
      placeSheet();
      Object.keys(projects).forEach((k) => (pos[k] = defPos()));
      renderSnips(curTab);
    }
    layout();
    if (!cvEl.hidden) sizeCV();
    if (!parts.some((p) => !p.s)) burst(true);
  });
  reelL.addEventListener(
    "scroll",
    () => {
      if (rm) setFocus(nearest());
    },
    { passive: true },
  );

  /* nav jumps land on finished states */
  function jumpTo(y, k) {
    root.classList.add("instant");
    scrollTo(0, y);
    update();
    if (k === "fine" || k === "contact") stamps.forEach((s) => s.classList.add("done"));
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("instant")));
  }
  function target(k) {
    const top = seq.offsetTop;
    if (rm) {
      const el = { work: $("#folderL"), sandbox: reelL, fine: $("#charter"), contact: $("#ctext") }[k];
      return el.getBoundingClientRect().top + scrollY - 80;
    }
    if (k === "work") return top + B.z1 + innerHeight * 0.1;
    if (k === "sandbox") return top + B.d1 + (B.s1 - B.d1) * 0.35;
    if (k === "fine") return top + B.l1 + 2;
    return top + B.f1 + innerHeight * 0.4;
  }
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a[data-go]");
    if (!a) return;
    e.preventDefault();
    jumpTo(target(a.dataset.go), a.dataset.go);
  });

  /* reel controls */
  function goFrame(i) {
    i = clamp(i, 0, cells.length - 1);
    if (rm) {
      cells[i].scrollIntoView({ inline: "center", block: "nearest" });
      setFocus(i);
      return;
    }
    const el = cells[i],
      vw = innerWidth,
      rw = reel.scrollWidth;
    const s = clamp((vw - (vw / 2 - el.offsetLeft - el.offsetWidth / 2)) / (vw + rw));
    scrollTo({ top: seq.offsetTop + B.d1 + s * (B.s1 - B.d1), behavior: "smooth" });
  }

  /* form */
  const msg = $("#msg");
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
        setTab(v[v.length - 1].dataset.tab);
      })
      .catch(() => {
        btn.disabled = false;
        msg.textContent = "That didn't send. Check your connection and try again.";
        msg.classList.add("err");
      });
  });
  /* Sends one form response to the Vercel function, which saves it to Supabase. */
  async function saveResponse(row) {
    if (!FORM_ENDPOINT) return;
    const r = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    if (!r.ok) throw new Error("Form endpoint returned " + r.status);
  }

  /* trifold overlays: fold out of their trigger, refold on close */
  function makeTri(root, trigger, html, size) {
    const paper = root.querySelector(".cvpaper");
    let busy = false;
    root.querySelectorAll(".cvc").forEach((c) => (c.innerHTML = html));
    const T = (v) => (rm ? 0 : v);
    function open() {
      if (busy || !root.hidden) return;
      busy = true;
      root.hidden = false;
      size();
      const k = parseFloat(root.style.getPropertyValue("--k")) || 1,
        r = trigger.getBoundingClientRect(),
        pr = paper.getBoundingClientRect();
      root.style.setProperty("--dx", (r.left + r.width / 2 - (pr.left + pr.width / 2)) / k + "px");
      root.style.setProperty("--dy", (r.top + r.height / 2 - (pr.top + pr.height / 2)) / k + "px");
      void root.offsetWidth;
      root.classList.add("show");
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        root.classList.add("open");
        setTimeout(() => {
          root.classList.add("done");
          busy = false;
          root.querySelector(".cvx").focus({ preventScroll: true });
        }, T(1250));
      }, T(650));
    }
    function close(after) {
      if (busy || root.hidden) return;
      busy = true;
      root.classList.remove("done", "open");
      setTimeout(() => {
        root.classList.remove("show");
        setTimeout(() => {
          root.hidden = true;
          document.body.style.overflow = "";
          busy = false;
          if (after) after();
          else trigger.focus({ preventScroll: true });
        }, T(650));
      }, T(1250));
    }
    root.addEventListener("click", (e) => {
      if (!e.target.closest(".cvpaper,.cvact .btn")) close();
    });
    return { open, close, root };
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
    cvEl.style.setProperty("--k", Math.min(1, (innerHeight - 48) / H, (innerWidth - 240) / W).toFixed(3));
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
    menuEl.style.setProperty("--ch", "300px");
    menuEl.style.setProperty("--ch", Math.max(300, $("#menu .flat .cvin").offsetHeight + 56) + "px");
  });
  $("#menubtn").addEventListener("click", () => menuTri.open());
  menuEl.querySelector(".flat").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-go]");
    if (!a) return;
    e.preventDefault();
    const k = a.dataset.go;
    menuTri.close(() => jumpTo(target(k), k));
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!cvEl.hidden) cvTri.close();
    if (!menuEl.hidden) menuTri.close();
  });
  /* Case study transition: the white sheet lifts off the folder and grows into the case study paper */
  function caseRect() {
    const w = Math.min(820, innerWidth * 0.92),
      cw = document.documentElement.clientWidth,
      top = innerWidth <= 700 ? 72 : 96;
    return { left: (cw - w) / 2, top, width: w, height: innerHeight - top + 8 };
  }
  function px(r) {
    return { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" };
  }
  function paperOverlay(r, withText) {
    const o = document.createElement("div");
    o.className = "raise";
    Object.assign(o.style, px(r));
    if (withText) o.innerHTML = `<div class="txt">${$("#sheetTxt").innerHTML}</div>`;
    document.body.appendChild(o);
    return o;
  }
  $("#caseLink").addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (rm) {
      location.href = href;
      return;
    }
    const r = sheet.getBoundingClientRect(),
      o = paperOverlay(r, true),
      t = caseRect();
    o.animate(
      [
        { transform: "none" },
        { transform: "translateY(-10px) rotate(-.6deg)", boxShadow: "6px 16px 0 rgba(17,17,17,.16)" },
      ],
      { duration: 260, easing: "ease-out", fill: "forwards" },
    )
      .finished.then(() => {
        o.querySelector(".txt").style.opacity = 0;
        return o.animate(
          [
            { ...px(r), transform: "translateY(-10px) rotate(-.6deg)" },
            { ...px(t), transform: "none", boxShadow: "3px 6px 0 rgba(17,17,17,.18)" },
          ],
          { duration: 620, easing: "cubic-bezier(.6,0,.2,1)", fill: "forwards" },
        ).finished;
      })
      .then(() => {
        location.href = href;
      });
  });
  /* Coming back from a case study (index.html#work-gdg): open the folder on that file and shrink the paper back into it */
  function returnFromCase() {
    const m = location.hash.match(/^#work-(gdg|lfc|audit)$/);
    if (!m) return;
    history.replaceState(null, "", location.pathname);
    setTab(m[1]);
    jumpTo(target("work"), "work");
    if (rm) return;
    requestAnimationFrame(() => {
      const r = sheet.getBoundingClientRect(),
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
  }
  addEventListener("pageshow", (e) => {
    if (e.persisted) $$(".raise").forEach((o) => o.remove());
  });
  document.fonts.ready.then(() => {
    layout();
    playLoad();
    returnFromCase();
  });

  /* Phones: keep "Experience Designer & Community Operations" on one line by shrinking it until it fits */
  function fitSub() {
    const el = document.querySelector(".hero .sub");
    el.style.fontSize = "";
    if (innerWidth > 700) return;
    let fs = parseFloat(getComputedStyle(el).fontSize);
    while (el.scrollWidth > el.clientWidth && fs > 12) el.style.fontSize = (fs -= 0.5) + "px";
  }
  document.fonts.ready.then(fitSub);
  addEventListener("resize", fitSub);

  /* The margin note lines up with the intro text, wherever the centred pair ends up */
  function placeNote() {
    const n = document.querySelector("#note");
    n.style.left =
      innerWidth > 700
        ? Math.round(document.querySelector(".intro").getBoundingClientRect().left) + "px"
        : "";
  }
  document.fonts.ready.then(placeNote);
  addEventListener("resize", placeNote);
}
