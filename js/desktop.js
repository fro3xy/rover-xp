const lines = [
  "Need a file? I still remember where everything is.",
  "Try the Start button. Green means go.",
  "Microsoft Bob was my first house. XP was the backyard.",
  "Merlin, Links, Courtney — good company. I kept the desk.",
  "Vista packed me up. I never really left the hill.",
  "The contract address is CTjNx5hbF6fKQGnvBxqfWyxTuvMStqZNBMqZdJ7dpump.",
  "Search for bob, bark, or vista. I'll fetch something."
];

const catalog = [
  { q: ["rover", "dog", "companion", "goodest"], t: "Rover.acs", d: "Default Search Companion character for Windows XP." },
  { q: ["bob", "1995", "retriever", "house"], t: "Rover Retriever", d: "First gig: Microsoft Bob, March 1995, guide to a virtual house." },
  { q: ["xp", "2001", "october", "debut"], t: "Windows XP Search", d: "Shipped October 25, 2001. Open Search from the Start menu." },
  { q: ["agent", "sdk", "srchasst", "file", "windir"], t: "Microsoft Agent", d: "Animation engine. Character files lived under %windir%\\srchasst." },
  { q: ["merlin", "links", "courtney", "cat", "wizard"], t: "Other companions", d: "Merlin the wizard, Links the cat, and Courtney could take his place." },
  { q: ["vista", "retired", "2007"], t: "Windows Vista", d: "The animated companion was retired when Vista arrived in 2007." },
  { q: ["bark", "voice", "sound", "foley"], t: "Voice reel", d: "Barks and foley, recorded in-house. He never spoke English in the UI." },
  { q: ["personality", "patient", "silly"], t: "Personality", d: "Patient, eager, and a little silly. The unused notes say he knew he was software." },
  { q: ["contract", "ca", "address"], t: "Contract address", d: "CTjNx5hbF6fKQGnvBxqfWyxTuvMStqZNBMqZdJ7dpump" }
];

const boot = document.getElementById("boot");
const welcome = document.getElementById("welcome");
const desktop = document.getElementById("desktop");
const startBtn = document.getElementById("startBtn");
const startMenu = document.getElementById("startMenu");
const tasks = document.getElementById("tasks");
const balloon = document.getElementById("balloon");
const balloonText = document.getElementById("balloonText");
const roverPet = document.getElementById("roverPet");
const context = document.getElementById("context");
const shutdown = document.getElementById("shutdown");

let z = 20;
let line = 0;
let booted = false;
const CA = "CTjNx5hbF6fKQGnvBxqfWyxTuvMStqZNBMqZdJ7dpump";

function speak(text) {
  balloonText.textContent = text;
  roverPet.classList.add("talking");
  setTimeout(() => roverPet.classList.remove("talking"), 1400);
}

function tickClock() {
  const now = new Date();
  document.getElementById("clock").textContent = now.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function windows() {
  return [...document.querySelectorAll(".window")];
}

function winId(el) {
  return el.id.replace("win-", "");
}

function refreshTasks() {
  tasks.innerHTML = "";
  windows().forEach((w) => {
    if (w.classList.contains("dialog")) return;
    if (!w.classList.contains("open") && !w.classList.contains("minimized")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "task" + (w.classList.contains("open") && !w.classList.contains("minimized") ? " active" : "");
    b.textContent = w.dataset.title || w.querySelector(".titlebar span")?.textContent || winId(w);
    b.addEventListener("click", () => {
      if (w.classList.contains("minimized") || !w.classList.contains("open")) openWindow(winId(w));
      else if (Number(w.style.zIndex) >= z - 1) minimize(w);
      else focusWindow(w);
    });
    tasks.appendChild(b);
  });
}

function focusWindow(w) {
  windows().forEach((x) => x.classList.add("inactive"));
  w.classList.remove("inactive");
  w.style.zIndex = ++z;
  refreshTasks();
}

function closeStart() {
  startMenu.classList.remove("open");
  startBtn.classList.remove("active");
  startBtn.setAttribute("aria-expanded", "false");
}

function openWindow(id) {
  const w = document.getElementById("win-" + id);
  if (!w) return;
  closeStart();
  w.classList.add("open");
  w.classList.remove("minimized");
  focusWindow(w);
  if (window.matchMedia("(max-width: 800px)").matches) {
    w.scrollIntoView({ block: "nearest" });
  }
}

function closeWindow(w) {
  w.classList.remove("open", "minimized", "maximized");
  const max = w.querySelector(".cap.max");
  if (max) max.textContent = "□";
  refreshTasks();
}

function minimize(w) {
  w.classList.add("minimized");
  w.classList.remove("open");
  refreshTasks();
}

function toggleMax(w) {
  w.classList.toggle("maximized");
  const max = w.querySelector(".cap.max");
  if (max) max.textContent = w.classList.contains("maximized") ? "❐" : "□";
  focusWindow(w);
}

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

windows().forEach((w) => {
  w.addEventListener("pointerdown", () => focusWindow(w));
  w.querySelectorAll("[data-act]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const act = btn.dataset.act;
      if (act === "close") closeWindow(w);
      if (act === "min") minimize(w);
      if (act === "max") toggleMax(w);
    });
  });
  const bar = w.querySelector(".titlebar");
  if (!bar) return;
  bar.addEventListener("dblclick", (e) => {
    if (e.target.closest(".cap") || w.classList.contains("dialog")) return;
    toggleMax(w);
  });
  bar.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest(".cap") || w.classList.contains("maximized")) return;
    const r = w.getBoundingClientRect();
    const parent = desktop.getBoundingClientRect();
    const ox = e.clientX - r.left;
    const oy = e.clientY - r.top;
    function move(ev) {
      const left = ev.clientX - parent.left - ox;
      const top = ev.clientY - parent.top - oy;
      w.style.left = Math.max(-r.width + 80, left) + "px";
      w.style.top = Math.max(0, top) + "px";
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });
});

document.querySelectorAll(".icon").forEach((el) => {
  el.addEventListener("click", () => {
    document.querySelectorAll(".icon").forEach((i) => i.classList.remove("selected"));
    el.classList.add("selected");
    if (window.matchMedia("(max-width: 800px)").matches) openWindow(el.dataset.open);
  });
  el.addEventListener("dblclick", () => openWindow(el.dataset.open));
});

document.querySelectorAll(".start-item, .context [data-open], .jump").forEach((el) => {
  el.addEventListener("click", () => openWindow(el.dataset.open));
});

document.getElementById("caBar").addEventListener("click", (e) => {
  e.stopPropagation();
  openWindow("contract");
});

startBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  startMenu.classList.toggle("open");
  const on = startMenu.classList.contains("open");
  startBtn.classList.toggle("active", on);
  startBtn.setAttribute("aria-expanded", on ? "true" : "false");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("#startMenu") && !e.target.closest("#startBtn")) closeStart();
  if (!e.target.closest("#context")) context.classList.remove("open");
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeStart();
    context.classList.remove("open");
    shutdown.classList.remove("open");
  }
});

desktop.addEventListener("contextmenu", (e) => {
  if (e.target.closest(".window") || e.target.closest(".taskbar") || e.target.closest(".start-menu")) return;
  e.preventDefault();
  context.style.left = Math.min(e.clientX, window.innerWidth - 190) + "px";
  context.style.top = Math.min(e.clientY, window.innerHeight - 140) + "px";
  context.classList.add("open");
});

document.getElementById("refreshDesktop").addEventListener("click", () => {
  speak("Desktop refreshed. The hill is still green.");
});

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const root = tab.closest(".window");
    root.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    root.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    root.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add("active");
  });
});

function runSearch() {
  const raw = document.getElementById("q").value.trim();
  const q = raw.toLowerCase();
  const box = document.getElementById("results");
  if (!q) {
    box.innerHTML = "<p>Rover sits. Waiting is part of the job.</p>";
    return;
  }
  const hits = catalog.filter((item) => item.q.some((k) => q.includes(k) || k.includes(q)));
  if (!hits.length) {
    box.innerHTML = `<p>Search Companion could not find "${esc(raw)}". Try rover, bob, vista, or bark.</p>`;
    speak("Nothing in this folder. Try bob, bark, or vista.");
    return;
  }
  box.innerHTML = "<ul>" + hits.map((h) => `<li><strong>${esc(h.t)}</strong><br>${esc(h.d)}</li>`).join("") + "</ul>";
  speak("Found something. I marked it with a paw.");
}

document.getElementById("doSearch").addEventListener("click", runSearch);
document.getElementById("q").addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
});

const wikiUrl = "https://the-microsoft-windows-xp.fandom.com/wiki/Rover";
document.getElementById("goWiki").addEventListener("click", () => {
  window.open(wikiUrl, "_blank", "noopener");
});

document.getElementById("copySoon").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(CA);
    document.getElementById("errorText").textContent = "Copied the contract address.";
  } catch {
    document.getElementById("errorText").textContent = CA;
  }
  openWindow("error");
});

roverPet.addEventListener("click", () => {
  if (roverPet.dataset.dragged === "1") {
    delete roverPet.dataset.dragged;
    return;
  }
  line = (line + 1) % lines.length;
  speak(lines[line]);
});

(function dragPet() {
  let dragging = false;
  let ox = 0;
  let oy = 0;
  let moved = false;
  roverPet.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    dragging = true;
    moved = false;
    roverPet.style.cursor = "grabbing";
    ox = e.clientX - roverPet.offsetLeft;
    oy = e.clientY - roverPet.offsetTop;
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    moved = true;
    roverPet.style.left = e.clientX - ox + "px";
    roverPet.style.top = e.clientY - oy + "px";
    roverPet.style.right = "auto";
    roverPet.style.bottom = "auto";
    balloon.style.left = roverPet.offsetLeft - 210 + "px";
    balloon.style.top = roverPet.offsetTop - 10 + "px";
    balloon.style.right = "auto";
    balloon.style.bottom = "auto";
  });
  window.addEventListener("pointerup", () => {
    if (dragging && moved) {
      roverPet.dataset.dragged = "1";
    }
    dragging = false;
    roverPet.style.cursor = "grab";
  });
})();

function showWelcome() {
  if (booted) return;
  booted = true;
  boot.classList.add("hidden");
  welcome.classList.remove("hidden");
}

function enterDesktop() {
  booted = true;
  boot.classList.add("hidden");
  welcome.classList.add("hidden");
  shutdown.classList.remove("open");
  desktop.classList.remove("hidden");
  openWindow("meet");
  speak("Welcome back. The hill looks the same.");
  chime();
}

boot.addEventListener("click", showWelcome);
document.getElementById("loginBtn").addEventListener("click", enterDesktop);
document.getElementById("welcomeOff").addEventListener("click", () => {
  welcome.classList.add("hidden");
  boot.classList.remove("hidden");
  boot.querySelector(".boot-title").textContent = "It is now safe to turn off your computer.";
  boot.querySelector(".boot-bar").classList.add("hidden");
  boot.querySelector(".boot-skip").textContent = "Click to turn the computer back on";
  booted = true;
  boot.onclick = () => {
    boot.querySelector(".boot-title").innerHTML = "Microsoft<em>Windows</em> XP";
    boot.querySelector(".boot-bar").classList.remove("hidden");
    boot.querySelector(".boot-skip").textContent = "Click to continue";
    boot.onclick = null;
    booted = false;
    showWelcome();
  };
});

document.getElementById("logOff").addEventListener("click", () => {
  desktop.classList.add("hidden");
  welcome.classList.remove("hidden");
  closeStart();
});

document.getElementById("turnOff").addEventListener("click", () => {
  closeStart();
  shutdown.classList.add("open");
});
document.getElementById("cancelOff").addEventListener("click", () => shutdown.classList.remove("open"));
document.getElementById("standBy").addEventListener("click", () => {
  shutdown.classList.remove("open");
  speak("Standing by. Tail still wagging.");
});
document.getElementById("doShutdown").addEventListener("click", () => {
  shutdown.classList.remove("open");
  desktop.classList.add("hidden");
  boot.classList.remove("hidden");
  boot.querySelector(".boot-title").textContent = "It is now safe to turn off your computer.";
  boot.querySelector(".boot-bar").classList.add("hidden");
  boot.querySelector(".boot-skip").textContent = "";
});

function chime() {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    [523, 659, 784, 1046].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.06, now + 0.02 + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.08);
      o.stop(now + 1);
    });
  } catch {
    /* autoplay / unsupported */
  }
}

tickClock();
setInterval(tickClock, 1000);
setInterval(() => {
  if (desktop.classList.contains("hidden")) return;
  line = (line + 1) % lines.length;
  balloonText.textContent = lines[line];
}, 14000);

setTimeout(showWelcome, 1400);
refreshTasks();
