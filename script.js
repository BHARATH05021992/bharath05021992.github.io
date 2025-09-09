// script.js
// Controls:
// - code monitor streaming + hover/touch/keyboard speed control + pointer sensitivity
// - scroll-snap navigation + active link highlight (IntersectionObserver)
// - testimonials slider
// - CV download generator
// - contact form demo + toast
// - background parallax blobs react to mouse (light touch)

(() => {
  /* ---------- helpers ---------- */
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  /* ---------- CODE MONITOR (infinite-ish scroll) ---------- */
  const codeViewport = $('#codeViewport');
  // sample code lines (expanded)
  const sampleLines = [
    "import { createScene } from '3d-engine';",
    "const app = new App({renderer:'webgl'});",
    "function render() { requestAnimationFrame(render); app.render(); }",
    "await fetch('/api/data').then(res => res.json());",
    "const state = { user: 'bharath', role: 'dev' };",
    "router.post('/login', handleLogin);",
    "console.log('Render loop running');",
    "const geometry = new THREE.BoxGeometry(1,1,1);",
    "useEffect(()=>{ init(); },[]);",
    "// TODO: optimize critical path",
    "const res = await db.query('SELECT * FROM projects');",
    "if (!isProd) enableHotReload();",
    "render();",
    "const skills = ['JS','Node','3D','UX'];",
    "export default function App(){ return <div/> }",
    "let speed = 0.1;"
  ];

  // create many lines to allow continuous feel
  function populateCodeLines() {
    codeViewport.innerHTML = '';
    for (let i = 0; i < 80; i++) {
      const line = document.createElement('div');
      line.className = 'code-line';
      const txt = sampleLines[i % sampleLines.length];
      // simple highlight
      line.innerHTML = txt
        .replace(/\b(const|let|function|await|if|return|import|from|new|export)\b/g, '<span style="color:#8fb7ff">$1</span>')
        .replace(/('.*?')/g, '<span style="color:#ffd280">$1</span>')
        .replace(/(\/\/.*$)/g, '<span style="color:#7a8aa6">$1</span>');
      codeViewport.appendChild(line);
    }
    // duplicate set for smooth wrap
    const clone = codeViewport.cloneNode(true);
    clone.id = 'codeViewportClone';
    clone.style.position = 'absolute';
    clone.style.top = codeViewport.scrollHeight + 'px';
    codeViewport.parentElement.appendChild(clone);
  }
  populateCodeLines();

  // state
  let speedTarget = 18; // px/sec (slow)
  let speedCurrent = speedTarget;
  const SPEED_SLOW = 18;
  const SPEED_FAST = 220;
  let pos = 0;
  let last = performance.now();
  const clone = $('#codeViewportClone') || null;
  const height = codeViewport.scrollHeight;

  function tick(now) {
    const dt = (now - last) / 1000;
    last = now;
    // lerp speed gently for smoothness
    speedCurrent += (speedTarget - speedCurrent) * Math.min(1, dt * 8);
    pos += speedCurrent * dt;
    if (pos >= height) pos -= height;
    codeViewport.style.transform = `translateY(${-pos}px)`;
    if (clone) clone.style.transform = `translateY(${-pos}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // interactions: hover, focus, touch, pointermove
  const monitor = $('.monitor');
  const viewport = codeViewport;
  function setFast() { speedTarget = SPEED_FAST; }
  function setSlow() { speedTarget = SPEED_SLOW; }

  monitor.addEventListener('mouseenter', setFast);
  monitor.addEventListener('mouseleave', setSlow);
  viewport.addEventListener('focus', setFast);
  viewport.addEventListener('blur', setSlow);

  // pointermove inside monitor to vary speed based on vertical position (subtle)
  monitor.addEventListener('pointermove', (e) => {
    const r = monitor.getBoundingClientRect();
    const y = Math.max(0, Math.min(r.height, e.clientY - r.top));
    const t = y / r.height; // 0..1 (top..bottom)
    // closer to bottom => a little faster, top => slower
    const variable = SPEED_SLOW + (SPEED_FAST - SPEED_SLOW) * (1 - Math.abs(t - 0.7));
    speedTarget = Math.max(SPEED_SLOW, Math.min(SPEED_FAST, variable));
  });

  // touch events
  monitor.addEventListener('touchstart', setFast, {passive:true});
  monitor.addEventListener('touchend', setSlow, {passive:true});

  /* ---------- NAVIGATION & SCROLL-SNAP ACTIVE LINK ---------- */
  const navLinks = $$('.nav-link');
  const sections = $$('.panel');
  // click anchors smooth scroll to panel top
  navLinks.forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const id = a.getAttribute('href').slice(1);
      document.getElementById(id).scrollIntoView({behavior:'smooth', block:'start'});
    });
  });

  // IntersectionObserver to update active nav
  const io = new IntersectionObserver((entries) => {
    entries.forEach(ent => {
      const id = ent.target.id;
      const link = navLinks.find(n => n.getAttribute('href') === '#' + id);
      if (link) {
        if (ent.isIntersecting && ent.intersectionRatio > 0.5) {
          navLinks.forEach(n => n.classList.remove('active'));
          link.classList.add('active');
        }
      }
    });
  }, {threshold:[0.5], root: document.querySelector('.snap-container')});

  sections.forEach(s => io.observe(s));

  // quick "work" button from hero
  $('#scroll-work').addEventListener('click', () => {
    document.getElementById('work').scrollIntoView({behavior:'smooth', block:'start'});
  });

  /* ---------- TESTIMONIALS SLIDER ---------- */
  const tWindow = $('#t-window');
  const tItems = $$('.t-item', tWindow);
  let tIndex = 0;
  function showTestimonial(i) {
    tWindow.style.transform = `translateX(${-i * 100}%)`;
  }
  $('#t-right').addEventListener('click', () => { tIndex = (tIndex + 1) % tItems.length; showTestimonial(tIndex); });
  $('#t-left').addEventListener('click', () => { tIndex = (tIndex - 1 + tItems.length) % tItems.length; showTestimonial(tIndex); });
  setInterval(()=> { tIndex = (tIndex + 1) % tItems.length; showTestimonial(tIndex); }, 7000);

  /* ---------- CV DOWNLOAD (text generator) ---------- */
  function generateCVText(){
    return `
Bharath — 3D Web Designer & Full-stack Developer

Profile:
- 3D web designer, full-time developer and entrepreneur owning an art gallery.
- Built and hosted multiple websites end-to-end.
- Published research paper on humanised robotics.
- Strong experience in JS, Node.js, UI/UX, 3D UI concepts, and product development.
- Founded art and entrepreneurship clubs. Volunteered with NGOs and social projects.

Education & Achievements:
- 10th marks: Very good. Significant improvement across school years.
- Excelled in Olympiads and competitive exams.

Experience:
- Hosted several production sites; handled deployment, CI and scaling.
- Internships: multiple roles in full-stack & product teams.
- Entrepreneur: Art gallery management & sales, product ideation and execution.
- Projects: Realtime dashboards, 3D portfolio engine, automation toolkits, CMS for art gallery.

Contact:
Email: bharath@example.com
Based in: India

(Generated CV - lightweight text export)
    `.trim();
  }

  function triggerDownload(filename, text) {
    const blob = new Blob([text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const downloadButtons = [ $('#download-cv-btn'), $('#cv-download-2'), $('#download-cv-3') ];
  downloadButtons.forEach(btn => btn && btn.addEventListener('click', () => {
    triggerDownload('Bharath_CV.txt', generateCVText());
    showToast('CV downloaded (demo).');
  }));

  /* ---------- CONTACT FORM (demo) ---------- */
  const contactForm = $('#contactForm');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(contactForm);
    const name = fd.get('name') || 'there';
    showToast(`Thanks ${name}! (demo message sent)`);
    contactForm.reset();
  });

  $('#copy-email')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('bharath@example.com');
      showToast('Email copied to clipboard');
    } catch {
      showToast('Could not copy (fallback)');
    }
  });

  /* ---------- TOAST ---------- */
  const toastEl = $('#toast');
  let toastTimer = null;
  function showToast(msg, time = 3000){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toastEl.classList.remove('show'), time);
  }

  /* ---------- COPY / EMAIL fallback ---------- */
  $('#email-me')?.addEventListener('click', () => {
    location.href = 'mailto:bharath@example.com?subject=Work%20Enquiry';
  });

  /* ---------- YEAR fill ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- BACKGROUND PARALLAX (subtle) ---------- */
  const blobs = $$('.bg-blobs .blob');
  let px = 0, py = 0;
  document.addEventListener('pointermove', (e) => {
    px = (e.clientX / window.innerWidth) - 0.5;
    py = (e.clientY / window.innerHeight) - 0.5;
    blobs.forEach((b, i) => {
      const rx = px * (20 + i * 6);
      const ry = py * (20 + i * 6);
      b.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    });
  }, {passive:true});

  /* ---------- small accessibility tweaks ---------- */
  // allow keyboard nav: press numbers 1..6 to jump to panels
  document.addEventListener('keydown', (e) => {
    if (/^[1-6]$/.test(e.key)) {
      const idx = Number(e.key) - 1;
      if (sections[idx]) sections[idx].scrollIntoView({behavior:'smooth', block:'start'});
    }
  });

  /* ---------- initial focus hint for monitor ---------- */
  // small a11y: focus monitor for keyboard users
  codeViewport.setAttribute('tabindex', '0');
  codeViewport.setAttribute('role', 'log');

  /* ---------- finish ---------- */
  // quick ready indicator
  console.log('UI ready — code monitor running, CV generator enabled, panels snap active.');
})();
