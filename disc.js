// ====== DANH SÁCH NHẠC (phát đúng thứ tự dưới đây, hết bài cuối thì quay lại bài đầu) ======
// Thêm bài: copy file .mp3 vào thư mục "music" rồi thêm 1 dòng { title, file }.
const PLAYLIST = [
  { title: "BINGO",    file: "music/Bingo ( Piano Ver. ) - Nguyên ft. Mc Wiz & Boyzed.mp3" },
  { title: "Chờ chút...",    file: "music/chờ chút... CONGB _ TINH HÀ SAY HI _ OFFICIAL VISUALIZER.mp3" },
  { title: "Yêu",    file: "music/Lyrics __ YÊU 5 - Rhymastic.mp3" },
  { title: "Inlove",    file: "music/inlove.mp3" },
  { title: "Nhiều hơn", file: "music/Low G _ Nhiều Hơn _ OFFICIAL VISUALIZER.mp3" },
  { title: "Nơi này có anh",    file: "music/Sơn Tùng MTP - Nơi Này Có Anh (Việt Nam Lyrics _ Subtitles).mp3" },
  // { title: "Tên bài tiếp theo", file: "music/ten-file.mp3" },
];
// =========================================

// ====== ẢNH VÀ LỜI CHÚC BAY LÊN TRONG BẦU TRỜI 360° ======
// Ảnh: copy vào thư mục "assets" rồi ghi tên file vào đây (thiếu file thì tự bỏ qua).
const PHOTOS = [
  "assets/2026081.JPG",
  "assets/2026082.JPG",
  "assets/2026083.JPG",
  "assets/2325290_25.jpg",
  "assets/Screenshot 2026-08-20 173852.png",
  "assets/Screenshot 2026-10-15 144612.png",
  "assets/20260818003517_1.jpg",
  "assets/20260821231716_1.jpg",
  "assets/20260830131707_1.jpg",
  "assets/20260901200340_1.jpg",
  "assets/20260901201801_1.jpg",
  "assets/20260904214021_1.jpg",
  "assets/d649119d-e7ca-4e80-ab8e-54ff19f3a2b0.jpg",
  "assets/Messenger_creation_992FFBEC-4995-499A-BE7A-0905CBEAB0B2.jpg",
  "assets/Screenshot_20260918_062435_TikTok.jpg",
  "assets/Screenshot_20260918_215808_TikTok.jpg",
  "assets/Screenshot_20260918_215836_TikTok.jpg",
];
// Lời chúc: mỗi dòng nằm trong một đám mây bay lên. Thêm bớt tùy ý.
const WISHES = [
  "Anh yêu em",
  "Mong em luôn cười thật tươi",
  "Mỗi ngày bên em đều đặc biệt",
  "Cảm ơn em đã đến bên anh",
  "Chúng mình mãi bên nhau nhé",
  "Em là điều đẹp nhất của anh",
];
// =========================================

const disc = document.getElementById("disc");
const hint = document.getElementById("hint");
const songEl = document.getElementById("song");
const countEl = document.getElementById("count");
const seek = document.getElementById("seek");
const toggleBtn = document.getElementById("toggle");
const stage = document.getElementById("stage");
const curEl = document.getElementById("cur");
const durEl = document.getElementById("dur");

const fmt = (s) => (isFinite(s) ? Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "0:00");

const audio = new Audio();
audio.preload = "auto";
let current = 0;
let failStreak = 0;     // đếm bài lỗi liên tiếp để khỏi lặp vô hạn

let scrubbing = false;
function setSeek(pct) {
  seek.value = pct * 10;
  seek.style.setProperty("--fill", pct + "%");
}

function loadTrack(i) {
  current = (i + PLAYLIST.length) % PLAYLIST.length;   // vòng lại đầu/cuối danh sách
  const t = PLAYLIST[current];
  audio.src = t.file;
  songEl.textContent = t.title;
  countEl.textContent = "Bài " + (current + 1) + " / " + PLAYLIST.length;
  setSeek(0);
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: "Gửi em" });
  }
}

function playTrack(i) {
  loadTrack(i);
  hint.textContent = "Chạm vào đĩa để nghe nhạc";
  return audio.play();
}

function setUI(on) {
  stage.classList.toggle("playing", on);
}

audio.addEventListener("playing", () => { failStreak = 0; hint.hidden = true; setUI(true); });
audio.addEventListener("pause", () => setUI(false));
audio.addEventListener("ended", () => playTrack(current + 1).catch(() => {}));   // hết list -> về bài 1
audio.addEventListener("error", () => {
  if (++failStreak < PLAYLIST.length) playTrack(current + 1).catch(() => {});    // bỏ qua file lỗi/thiếu
  else {
    setUI(false);
    hint.textContent = "Không mở được file nhạc. Kiểm tra thư mục music/ và tên file (phân biệt hoa/thường).";
    hint.hidden = false;
  }
});
audio.addEventListener("timeupdate", () => {
  if (audio.duration && !scrubbing) setSeek((audio.currentTime / audio.duration) * 100);
  if (!scrubbing) curEl.textContent = fmt(audio.currentTime);
});
audio.addEventListener("loadedmetadata", () => { durEl.textContent = fmt(audio.duration); });

function togglePlay() {
  if (!audio.src || audio.error) { failStreak = 0; playTrack(audio.src ? current : 0).catch(() => {}); }
  else if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}

disc.addEventListener("click", togglePlay);
toggleBtn.addEventListener("click", togglePlay);
document.getElementById("next").addEventListener("click", () => playTrack(current + 1).catch(() => {}));
document.getElementById("prev").addEventListener("click", () => playTrack(current - 1).catch(() => {}));

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("nexttrack", () => playTrack(current + 1).catch(() => {}));
  navigator.mediaSession.setActionHandler("previoustrack", () => playTrack(current - 1).catch(() => {}));
}

// ----- Kéo thanh tua bài -----
seek.addEventListener("pointerdown", () => { scrubbing = true; });
seek.addEventListener("input", () => {
  scrubbing = true;
  seek.style.setProperty("--fill", seek.value / 10 + "%");
  if (audio.duration) {
    audio.currentTime = (seek.value / 1000) * audio.duration;
    curEl.textContent = fmt(audio.currentTime);
  }
});
["change", "pointerup", "pointercancel", "keyup"].forEach((n) => seek.addEventListener(n, () => { scrubbing = false; }));

// ----- Kéo thanh âm lượng -----
const vol = document.getElementById("volume");
const volPct = document.getElementById("volpct");
const muteBtn = document.getElementById("mute");
let lastVol = 80;

function setVolume(v) {
  audio.volume = v / 100;          // iPhone/Safari không cho chỉnh bằng code, khi đó dùng nút âm lượng của máy
  vol.value = v;
  vol.style.setProperty("--fill", v + "%");
  volPct.textContent = v + "%";
  muteBtn.classList.toggle("off", v === 0);
}
vol.addEventListener("input", () => { setVolume(+vol.value); if (+vol.value > 0) lastVol = +vol.value; });
muteBtn.addEventListener("click", () => setVolume(+vol.value > 0 ? 0 : lastVol || 80));
setVolume(80);

// ----- Vừa quét QR xong là phát luôn -----
// Trình duyệt có thể chặn tự phát; khi đó chạm vào BẤT KỲ đâu trên màn hình là nhạc chạy.
if (PLAYLIST.length) {
  loadTrack(0);
  audio.play().catch(() => {
    hint.hidden = false;
    document.addEventListener("pointerdown", function once(e) {
      if (e.target.closest(".controls")) return;       // để các nút tự xử lý
      document.removeEventListener("pointerdown", once);
      audio.play().catch(() => {});
    });
  });
}


// ================= BẦU TRỜI 360° =================
// Người xem đứng ở giữa, kéo ngang để xoay một vòng; ảnh và mây lời chúc bay lên liên tục.
const world = document.getElementById("world");
const tip = document.getElementById("tip");
const TAU = Math.PI * 2;
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const AUTO = calm ? 0 : 0.07;          // tự xoay chậm (rad/giây) khi không kéo
const skyItems = [];
let W = innerWidth, H = innerHeight;
addEventListener("resize", () => { W = innerWidth; H = innerHeight; });

function addSky(el, o) {
  world.appendChild(el);
  const it = Object.assign({ el, dead: false, par: 1, max: 1, tilt: Math.random() * 10 - 5,
                             offset: Math.random() * 4000 }, o);
  skyItems.push(it);
  return it;
}

function buildSky() {
  const pool = [];                                    // xen kẽ ảnh và lời chúc
  for (let i = 0; i < Math.max(PHOTOS.length, WISHES.length); i++) {
    if (PHOTOS[i]) pool.push({ photo: PHOTOS[i] });
    if (WISHES[i]) pool.push({ wish: WISHES[i] });
  }
  if (!pool.length) return;
  const total = Math.max(18, pool.length);            // đủ nhiều để vòng 360° không trống

  for (let i = 0; i < total; i++) {
    const d = pool[i % pool.length];
    const el = document.createElement("div");
    const o = { theta: (i / total) * TAU + (Math.random() - .5) * .12,
                speed: (38 + Math.random() * 34) * (calm ? .4 : 1),
                size: .85 + Math.random() * .3 };
    const it = addSky(el, o);
    if (d.photo) {
      el.className = "photo";
      const img = new Image();
      img.alt = "";
      img.onerror = () => { it.dead = true; el.remove(); };   // thiếu ảnh -> bỏ qua
      img.src = d.photo;
      el.appendChild(img);
    } else {
      el.className = "wish";
      el.textContent = d.wish;
    }
  }

  for (let i = 0; i < 8; i++) {                       // mây trang trí ở xa, trôi chậm
    const el = document.createElement("div");
    el.className = "wish ghost";
    addSky(el, { theta: Math.random() * TAU, par: .55, max: .3,
                 speed: (10 + Math.random() * 8) * (calm ? .4 : 1), size: 1.4 + Math.random() * .9 });
  }
}

let yaw = 0, vel = 0, dragging = false, lastX = 0, lastT = 0, prevNow = performance.now();

function frame(now) {
  const dt = Math.min(.05, (now - prevNow) / 1000);
  prevNow = now;
  const t = now / 1000;
  if (!dragging) { vel *= Math.exp(-dt * 2.2); yaw += (vel + AUTO) * dt; }   // quán tính sau khi thả tay

  const cycle = H + 360;
  for (const it of skyItems) {
    if (it.dead) continue;
    let phi = (((it.theta - yaw * it.par) % TAU) + TAU) % TAU;
    if (phi > Math.PI) phi -= TAU;                    // góc so với hướng đang nhìn
    const z = Math.cos(phi);                          // 1 = ngay phía trước, <0 = sau lưng
    if (z < .08) { it.el.style.opacity = 0; continue; }

    const p = ((t * it.speed + it.offset) % cycle) / cycle;   // 0 = đáy màn hình, 1 = đỉnh
    const y = H + 180 - p * cycle;
    const x = Math.sin(phi) * W * .95;
    const fade = Math.max(0, Math.min(1, p / .1, (1 - p) / .15));
    const s = it.size * (.55 + .45 * z);              // xa thì nhỏ hơn
    const sway = Math.sin(t * .7 + it.offset) * 3;

    it.el.style.opacity = (fade * Math.min(1, z * 1.8) * it.max).toFixed(3);
    it.el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) translate(-50%,-50%) rotate(" +
                            (it.tilt + sway).toFixed(2) + "deg) scale(" + s.toFixed(3) + ")";
    it.el.style.zIndex = Math.round(z * 10);
  }
  requestAnimationFrame(frame);
}

addEventListener("pointerdown", (e) => {
  if (e.target.closest("button, input")) return;
  dragging = true; vel = 0; lastX = e.clientX; lastT = e.timeStamp;
});
addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dy = -((e.clientX - lastX) / W) * 2.2;        // kéo sang phải -> thế giới trượt sang phải
  const dtm = Math.max(1, e.timeStamp - lastT) / 1000;
  yaw += dy;
  vel = Math.max(-4, Math.min(4, (dy / dtm) * .6 + vel * .4));
  lastX = e.clientX; lastT = e.timeStamp;
  tip.classList.add("hide");
});
["pointerup", "pointercancel"].forEach((n) => addEventListener(n, () => { dragging = false; }));
addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { vel = -1.2; tip.classList.add("hide"); }
  if (e.key === "ArrowRight") { vel = 1.2; tip.classList.add("hide"); }
});

buildSky();
requestAnimationFrame(frame);