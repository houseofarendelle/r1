/* ============================================================
   script.js — Interactive Apology Website
   ============================================================ */
(() => {
  'use strict';

  // ─── DOM references ───────────────────────────────────────
  const cursorGlow    = document.getElementById('cursor-glow');
  const particleCvs   = document.getElementById('particle-canvas');
  const confettiCvs   = document.getElementById('confetti-canvas');
  const progressFill  = document.getElementById('progress-fill');

  const pageLanding   = document.getElementById('page-landing');
  const pageApology   = document.getElementById('page-apology');
  const pageMemories  = document.getElementById('page-memories');
  const pageFinal     = document.getElementById('page-final');

  const btnHear       = document.getElementById('btn-hear');
  const btnNope       = document.getElementById('btn-nope');
  const nopeMsg       = document.getElementById('nope-msg');
  const btnContinue   = document.getElementById('btn-continue');
  const btnNext       = document.getElementById('btn-next');
  const btnSmile      = document.getElementById('btn-smile');
  const btnClose      = document.getElementById('btn-close');

  const pages = [pageLanding, pageApology, pageMemories, pageFinal];
  let currentPage = 0;

  // ─── "Nope" sequence data ────────────────────────────────
  const nopeSequence = [
    { msg: 'Are you sureeee? 🥺',                           nopeLabel: '🙃 Still Nope' },
    { msg: 'Please? I promise this won\'t take long 😭',    nopeLabel: '🙃 Nope Nope'  },
    { msg: 'You\'re making this difficult 😂',               nopeLabel: '🙃 Hmm...'     },
    { msg: 'Okay okay... this is my final attempt 🥺',       nopeLabel: '🙈 ...'         },
  ];
  let nopeIndex = 0;
  let hearScale = 1;
  let nopeScale = 1;

  // ─── Custom cursor ───────────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top  = `${e.clientY}px`;
  });

  document.querySelectorAll('button, a').forEach((el) => {
    el.addEventListener('mouseenter', () => cursorGlow.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursorGlow.classList.remove('hover'));
  });





  // ─── Ripple effect on buttons ─────────────────────────────
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const circle = document.createElement('span');
      circle.classList.add('ripple');
      const d = Math.max(btn.clientWidth, btn.clientHeight);
      circle.style.width = circle.style.height = `${d}px`;
      const rect = btn.getBoundingClientRect();
      circle.style.left = `${e.clientX - rect.left - d / 2}px`;
      circle.style.top  = `${e.clientY - rect.top  - d / 2}px`;
      btn.appendChild(circle);
      circle.addEventListener('animationend', () => circle.remove());
    });
  });

  // ─── Page transitions ────────────────────────────────────
  function goToPage(index) {
    if (index === currentPage || index < 0 || index >= pages.length) return;
    const outPage = pages[currentPage];
    const inPage  = pages[index];

    outPage.classList.remove('active');
    outPage.classList.add('exit');

    setTimeout(() => {
      outPage.classList.remove('exit');
      inPage.classList.add('active');
      currentPage = index;
      updateProgress();
      triggerTypewriter(inPage);

      // Retrigger memory card animations
      if (index === 2) {
        inPage.querySelectorAll('.memory-item').forEach((item) => {
          item.style.animation = 'none';
          // Force reflow
          void item.offsetHeight;
          item.style.animation = '';
        });
      }
    }, 500);
  }

  function updateProgress() {
    const pct = (currentPage / (pages.length - 1)) * 100;
    progressFill.style.width = `${pct}%`;
  }

  // ─── Typewriter effect ───────────────────────────────────
  function triggerTypewriter(page) {
    const heading = page.querySelector('.typewriter-heading');
    if (!heading) return;
    const fullText = heading.getAttribute('data-text');
    heading.textContent = '';
    let i = 0;
    const interval = setInterval(() => {
      heading.textContent += fullText[i];
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, 55);
  }

  // Trigger initial typewriter
  triggerTypewriter(pageLanding);
  updateProgress();

  // ─── Landing page buttons ────────────────────────────────
  btnHear.addEventListener('click', () => goToPage(1));

  btnNope.addEventListener('click', () => {
    if (nopeIndex >= nopeSequence.length) {
      // After exhausting sequence, just go to apology
      goToPage(1);
      return;
    }

    const seq = nopeSequence[nopeIndex];

    // Show message
    nopeMsg.textContent = seq.msg;
    nopeMsg.classList.remove('visible');
    void nopeMsg.offsetHeight;
    nopeMsg.classList.add('visible');

    // Update nope button text
    btnNope.textContent = seq.nopeLabel;

    // Scale hear-me-out button bigger
    hearScale += 0.2;
    btnHear.style.transform = `scale(${hearScale})`;
    btnHear.style.zIndex = '5';

    // Scale nope button smaller (but not below 0.5)
    if (nopeIndex < 3) {
      nopeScale = Math.max(0.5, nopeScale - 0.1);
      btnNope.style.transform = `scale(${nopeScale})`;
    }

    // On last step, make hear-me-out near full width
    if (nopeIndex === 3) {
      btnHear.style.width = '90%';
      btnHear.style.padding = '18px 0';
      btnHear.style.fontSize = '1.2rem';
    }

    nopeIndex++;
  });

  // ─── Apology → Memories ──────────────────────────────────
  btnContinue.addEventListener('click', () => goToPage(2));

  // ─── Memories → Final ────────────────────────────────────
  btnNext.addEventListener('click', () => goToPage(3));

  // ─── Final page ──────────────────────────────────────────
  btnSmile.addEventListener('click', () => {
    launchConfetti();
    launchFloatingHearts();
    launchSparkles();
  });

  btnClose.addEventListener('click', () => {
    const card = pageFinal.querySelector('.glass-card');
    card.style.transition = 'transform 0.8s ease, opacity 0.8s ease';
    card.style.transform = 'scale(0.85)';
    card.style.opacity = '0';
    setTimeout(() => {
      pageFinal.innerHTML = `
        <div class="glass-card" style="opacity:0;transform:scale(0.9);transition:all 0.7s ease;">
          <h1 style="font-family:'Pacifico',cursive;font-size:2rem;margin-bottom:12px;
            background:var(--btn-primary-bg);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
            Take Care 💕
          </h1>
          <p style="color:var(--text-secondary);font-weight:300;line-height:1.7;">
            I hope this made you smile, even just a little. 🌸
          </p>
        </div>`;
      const newCard = pageFinal.querySelector('.glass-card');
      requestAnimationFrame(() => {
        newCard.style.opacity = '1';
        newCard.style.transform = 'scale(1)';
      });
    }, 700);
  });

  // ─── Confetti ─────────────────────────────────────────────
  function launchConfetti() {
    const symbols = ['❤️', '💕', '💖', '💗', '🌸', '✨', '💜', '💙'];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement('div');
      el.classList.add('confetti-heart');
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      el.style.left = `${Math.random() * 100}vw`;
      el.style.fontSize = `${0.8 + Math.random() * 1.2}rem`;
      el.style.animationDuration = `${2 + Math.random() * 3}s`;
      el.style.animationDelay = `${Math.random() * 0.8}s`;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    }
  }

  // ─── Floating hearts burst ────────────────────────────────
  function launchFloatingHearts() {
    for (let i = 0; i < 20; i++) {
      const h = document.createElement('div');
      h.classList.add('floating-heart');
      h.textContent = '❤️';
      h.style.left = `${Math.random() * 100}vw`;
      h.style.animationDuration = `${5 + Math.random() * 6}s`;
      h.style.animationDelay = `${Math.random() * 2}s`;
      h.style.fontSize = `${1 + Math.random() * 1.5}rem`;
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 12000);
    }
  }

  // ─── Sparkles burst ──────────────────────────────────────
  function launchSparkles() {
    for (let i = 0; i < 15; i++) {
      const s = document.createElement('div');
      s.classList.add('sparkle');
      s.textContent = '✨';
      s.style.left = `${Math.random() * 100}vw`;
      s.style.top  = `${Math.random() * 100}vh`;
      s.style.animationDuration = `${1.5 + Math.random() * 2}s`;
      s.style.animationDelay = `${Math.random() * 1}s`;
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 6000);
    }
  }

  // ─── Ambient floating hearts (always running) ─────────────
  function spawnAmbientHeart() {
    const h = document.createElement('div');
    h.classList.add('floating-heart');
    h.textContent = ['💗', '💕', '🤍', '💜'][Math.floor(Math.random() * 4)];
    h.style.left = `${Math.random() * 100}vw`;
    h.style.animationDuration = `${8 + Math.random() * 8}s`;
    h.style.fontSize = `${0.6 + Math.random() * 0.8}rem`;
    document.body.appendChild(h);
    h.addEventListener('animationend', () => h.remove());
  }
  setInterval(spawnAmbientHeart, 3000);

  // Ambient sparkles
  function spawnAmbientSparkle() {
    const s = document.createElement('div');
    s.classList.add('sparkle');
    s.textContent = '✨';
    s.style.left = `${Math.random() * 100}vw`;
    s.style.top  = `${Math.random() * 100}vh`;
    s.style.animationDuration = `${2 + Math.random() * 3}s`;
    s.style.fontSize = `${0.5 + Math.random() * 0.5}rem`;
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }
  setInterval(spawnAmbientSparkle, 4000);

  // ─── Particle Background ─────────────────────────────────
  const pCtx = particleCvs.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 60;

  function resizeCanvas() {
    particleCvs.width  = window.innerWidth;
    particleCvs.height = window.innerHeight;
    confettiCvs.width  = window.innerWidth;
    confettiCvs.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x  = Math.random() * particleCvs.width;
      this.y  = Math.random() * particleCvs.height;
      this.r  = 1 + Math.random() * 2.5;
      this.dx = (Math.random() - 0.5) * 0.4;
      this.dy = (Math.random() - 0.5) * 0.4;
      this.alpha = 0.15 + Math.random() * 0.35;
    }
    update() {
      this.x += this.dx;
      this.y += this.dy;
      if (this.x < 0 || this.x > particleCvs.width)  this.dx *= -1;
      if (this.y < 0 || this.y > particleCvs.height) this.dy *= -1;
    }
    draw() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      pCtx.beginPath();
      pCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      pCtx.fillStyle = isDark
        ? `rgba(200, 170, 255, ${this.alpha})`
        : `rgba(140, 100, 180, ${this.alpha * 0.6})`;
      pCtx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  // Draw connecting lines between close particles
  function drawLines() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) {
          const alpha = (1 - dist / 140) * (isDark ? 0.12 : 0.06);
          pCtx.beginPath();
          pCtx.moveTo(particles[i].x, particles[i].y);
          pCtx.lineTo(particles[j].x, particles[j].y);
          pCtx.strokeStyle = isDark
            ? `rgba(200, 170, 255, ${alpha})`
            : `rgba(140, 100, 180, ${alpha})`;
          pCtx.lineWidth = 0.5;
          pCtx.stroke();
        }
      }
    }
  }

  function animateParticles() {
    pCtx.clearRect(0, 0, particleCvs.width, particleCvs.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    drawLines();
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

})();
