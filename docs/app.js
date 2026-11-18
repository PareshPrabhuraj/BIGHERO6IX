
// ============================================================
// Big Hero 6ix - Autonomous Line-Following Robot
// UC San Diego ECE 5: Making, Breaking, Hacking Stuff
// Self-Contained Controller & 60 FPS Simulation Physics Engine
// ============================================================

(function () {
  'use strict';

  // --- Strict Zero Em/En Dash Invariant ---
  // Ensure all emitted strings use standard hyphens or colons

  // --- Toast Notification Utility ---
  function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-[13px] font-medium shadow-2xl backdrop-blur-xl transition-all duration-300 pointer-events-auto ${
      type === 'success'
        ? 'border-mint/40 bg-surface/90 text-mint glow-mint'
        : type === 'info'
        ? 'border-cyan/40 bg-surface/90 text-cyan glow-cyan'
        : 'border-red-400/40 bg-surface/90 text-red-400'
    }`;
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    toast.innerHTML = `
      <span class="h-2 w-2 rounded-full ${type === 'success' ? 'bg-mint' : type === 'info' ? 'bg-cyan' : 'bg-red-400'}"></span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      setTimeout(() => toast.remove(), 350);
    }, 2800);
  }
  window.showToast = showToast;

  // --- Smooth Scrolling ---
  window.scrollToSection = function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    const navHeight = 72;
    const pos = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
    window.scrollTo({ top: pos, behavior: 'smooth' });
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      mobileMenu.classList.add('hidden');
    }
  };

  // --- Navbar Scroll & Spy ---
  const header = document.querySelector('header');
  const navLinks = document.querySelectorAll('[data-nav-target]');
  const sections = ['overview', 'timeline', 'anatomy', 'lab', 'competition', 'poster', 'team'];

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('glass', 'border-edge/70');
      header.classList.remove('border-transparent');
    } else {
      header.classList.remove('glass', 'border-edge/70');
      header.classList.add('border-transparent');
    }

    const scrollPos = window.scrollY + 200;
    for (let i = sections.length - 1; i >= 0; i--) {
      const sec = document.getElementById(sections[i]);
      if (sec && sec.offsetTop <= scrollPos) {
        navLinks.forEach((link) => {
          if (link.getAttribute('data-nav-target') === sections[i]) {
            link.classList.add('bg-white/[0.06]', 'text-cyan');
            link.classList.remove('text-mute');
          } else {
            link.classList.remove('bg-white/[0.06]', 'text-cyan');
            link.classList.add('text-mute');
          }
        });
        break;
      }
    }
  }, { passive: true });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // --- Hero 3D Card Tilt ---
  const heroCard = document.getElementById('hero-tilt-card');
  if (heroCard) {
    heroCard.addEventListener('mousemove', (e) => {
      const rect = heroCard.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroCard.style.transform = `perspective(1200px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg)`;
    });
    heroCard.addEventListener('mouseleave', () => {
      heroCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      heroCard.style.transition = 'transform 0.4s ease';
    });
    heroCard.addEventListener('mouseenter', () => {
      heroCard.style.transition = 'none';
    });
  }

  // --- Subsystem Prototyping Timeline Data & Controller ---
  const timelineData = [
    {
      id: "1A",
      title: "4-Potentiometer Real-Time Tuning Deck",
      stepBadge: "CHALLENGE 1A - POTENTIOMETERS & SPEED CONTROL",
      body: "The 4 potentiometers map values from 0 to 100 across a 12-bit ADC range of 0 to 4095. Turning the potentiometer clockwise moves the wiper toward the 3.3V rail, increasing the mapped telemetry. To reverse the direction, swap the outer 3.3V and GND wires on the breadboard or invert the mapping in code using (100 - mapped_reading). Mapped to ESP32-S3 pins: IO1 (Kd), IO2 (Ki), IO3 (Kp), and IO4 (Base Speed).",
      chips: ["IO1: Kd", "IO2: Ki", "IO3: Kp", "IO4: Speed", "12-bit ADC (0-4095)", "Mapped 0-100", "CW Wiper to 3.3V"],
      images: [
        {
          src: "images/hardware/ch1a_pots_breadboard.png",
          title: "Breadboard Hardware Build",
          badge: "REAL HARDWARE",
          desc: "4-potentiometer tuning deck wired to ESP32-S3 DevBoard on breadboard."
        },
        {
          src: "images/hardware/ch1a_pots_schematic.png",
          title: "Circuit Wiring Schematic",
          badge: "WIRING DIAGRAM",
          desc: "Potentiometer pinout schematic showing wiper lines to IO1-IO4 and 3.3V / GND rails."
        }
      ]
    },
    {
      id: "1B",
      title: "7-Photoresistor Reflectance Sensor Bar",
      stepBadge: "CHALLENGE 1B - OPTOELECTRONIC SURFACE SENSING",
      body: "The 7-channel reflectance array utilizes 5mm CdS photoresistors paired with 10k Ohm pull-down resistors in voltage divider configurations. The calibrated ADC range for the white surface is roughly 2100-2400, while the black surface reads roughly 3000-3500. A height of 4-5 mm from the ground provides the optimal dynamic range and signal contrast.",
      chips: ["7x CdS Photoresistors", "10k Ohm Dividers", "White: 2100-2400 ADC", "Black: 3000-3500 ADC", "4-5 mm Height"],
      images: [
        {
          src: "images/hardware/ch1b_ldr_breadboard.png",
          title: "7-Sensor Breadboard Array",
          badge: "REAL HARDWARE",
          desc: "7 photoresistors with 10k Ohm pull-down resistors wired to ESP32-S3 analog inputs."
        },
        {
          src: "images/hardware/ch1b_ldr_schematic.png",
          title: "Sensor Array Schematic",
          badge: "WIRING DIAGRAM",
          desc: "7-channel voltage divider schematic mapping sensor nodes to ESP32-S3 pins IO1-IO7."
        }
      ]
    },
    {
      id: "1C",
      title: "L298N Dual H-Bridge Motor Driver & Actuation",
      stepBadge: "CHALLENGE 1C - PREPPING THE MOTORS & DRIVER",
      body: "The L298N motor driver allows the microcontroller to control the speed and direction of the motors while providing enough power from an external 9V battery pack to drive the DC motors. PWM on IO8/IO13 controls speed while IO9-IO12 control directional H-bridge logic. Hot glue is used to anchor motor brass terminals and prevent lead fatigue during driving. Textured tire treads provide high traction to prevent wheel slip.",
      chips: ["L298N Dual H-Bridge", "PWM IO8 / IO13", "DIR IO9-IO12", "9V Battery Isolation", "Hot Glue Strain Relief", "Textured Treads"],
      images: [
        {
          src: "images/hardware/ch1c_l298n_wired.png",
          title: "L298N Driver Interface",
          badge: "REAL HARDWARE",
          desc: "L298N dual full-bridge motor driver wired to ESP32-S3 DevBoard."
        },
        {
          src: "images/hardware/ch1c_tt_motors_glue.png",
          title: "TT DC Gear Motors",
          badge: "STRAIN RELIEF",
          desc: "Yellow TT DC gear motors with hot glue strain relief on solder contacts."
        },
        {
          src: "images/hardware/esp32_devboard_pinout.png",
          title: "ESP32-S3 DevBoard Pinout",
          badge: "PINOUT SILKSCREEN",
          desc: "Maker Studio DevBoard back silkscreen showing IO pin mapping."
        }
      ]
    },
    {
      id: "1D",
      title: "Chassis CAD with 2 Functional Changes",
      stepBadge: "CHALLENGE 1D - ONSHAPE 3D CAD CHASSIS",
      body: "Engineered in Onshape with two critical functional changes: (1) a dedicated slot to securely hold the ESP32-S3 microcontroller in place without adhesive, and (2) a structural diagonal cross-beam to increase the torsional rigidity of the 3D-printed chassis. These modifications eliminate frame flex under high motor torques.",
      chips: ["Onshape 3D CAD", "ESP32 Mounting Slot", "Rigidity Cross-Beam", "3D-Printed Chassis", "Anti-Flex Geometry"],
      images: [
        {
          src: "images/hardware/ch1d_onshape_slot.png",
          title: "ESP32 Mounting Slot CAD",
          badge: "ONSHAPE CAD MOD 1",
          desc: "3D CAD model displaying the integrated mounting cradle designed to hold the ESP32 board."
        },
        {
          src: "images/hardware/ch1d_onshape_beam.png",
          title: "Rigidity Cross-Beam CAD",
          badge: "ONSHAPE CAD MOD 2",
          desc: "3D CAD model displaying the diagonal structural cross-beam engineered for chassis rigidity."
        }
      ]
    },
    {
      id: "2",
      title: "Systems Integration & Competition Readiness",
      stepBadge: "CHALLENGE 2 - FULL ELECTROMECHANICAL INTEGRATION",
      body: "Complete integration of all breadboard subsystems onto the 3D-printed chassis. Features strict electrical power isolation between the 9V motor pack and 3.3V ESP32 microcontroller, front ball caster balance, low-CG battery bay, and discrete closed-loop steering software tuned for the competition tournament.",
      chips: ["Full Integration", "Isolated 9V Rail", "Low-CG Battery Bay", "Front Ball Caster", "Closed-Loop Control"],
      images: [
        {
          src: "images/placeholder_chassis.svg",
          title: "Integrated Mobile Robot Prototype",
          badge: "SYSTEM PROTOTYPE",
          desc: "Complete autonomous mobile robot platform with breadboard, sensors, and drive assembly."
        },
        {
          src: "images/slides/slide_2_objective.png",
          title: "Lab 4 Architecture Deliverable",
          badge: "COURSE DELIVERABLE",
          desc: "Official Lab 4 Robotics engineering objective and system integration scope."
        }
      ]
    }
  ];

  window.selectTimelineStep = function (index) {
    const data = timelineData[index];
    if (!data) return;

    document.querySelectorAll('[data-timeline-btn]').forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('border-cyan/40', 'bg-surface', 'glow-cyan');
        btn.classList.remove('border-edge', 'bg-surface/50');
        const num = btn.querySelector('.timeline-step-num');
        if (num) { num.classList.add('text-cyan'); num.classList.remove('text-mute'); }
        const chevron = btn.querySelector('.timeline-chevron');
        if (chevron) { chevron.classList.remove('opacity-0'); chevron.classList.add('opacity-100'); }
      } else {
        btn.classList.remove('border-cyan/40', 'bg-surface', 'glow-cyan');
        btn.classList.add('border-edge', 'bg-surface/50');
        const num = btn.querySelector('.timeline-step-num');
        if (num) { num.classList.remove('text-cyan'); num.classList.add('text-mute'); }
        const chevron = btn.querySelector('.timeline-chevron');
        if (chevron) { chevron.classList.add('opacity-0'); chevron.classList.remove('opacity-100'); }
      }
    });

    const panelWatermark = document.getElementById('timeline-watermark');
    const panelStep = document.getElementById('timeline-step-badge');
    const panelTitle = document.getElementById('timeline-title');
    const panelBody = document.getElementById('timeline-body');
    const panelChips = document.getElementById('timeline-chips');
    const panelImages = document.getElementById('timeline-images');

    if (panelWatermark) panelWatermark.textContent = data.id;
    if (panelStep) panelStep.textContent = data.stepBadge || `CHALLENGE ${data.id} - STEP ${index + 1} OF ${timelineData.length}`;
    if (panelTitle) panelTitle.textContent = data.title;
    if (panelBody) panelBody.textContent = data.body;
    if (panelChips) {
      panelChips.innerHTML = data.chips
        .map(
          (c) => `<span class="rounded-full border border-edge bg-carbon/60 px-3.5 py-1.5 font-mono text-[10.5px] tracking-wider text-cyan">${c}</span>`
        )
        .join('');
    }
    if (panelImages && data.images) {
      panelImages.innerHTML = data.images
        .map(
          (img) => `
          <div class="group relative overflow-hidden rounded-2xl border border-edge bg-carbon/80 transition-all duration-300 hover:border-cyan/40 cursor-pointer" onclick="openImageLightbox('${img.src}', '${img.title.replace(/'/g, "\'")}', '${img.desc.replace(/'/g, "\'")}')">
            <div class="relative h-44 sm:h-52 overflow-hidden">
              <img src="${img.src}" alt="${img.title}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]">
              <div class="absolute inset-0 bg-gradient-to-t from-carbon/90 via-transparent to-transparent"></div>
              <span class="absolute top-3 left-3 rounded-full border border-cyan/30 bg-carbon/80 px-2.5 py-1 font-mono text-[9px] font-semibold tracking-wider text-cyan backdrop-blur-md">${img.badge}</span>
              <span class="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-edge bg-carbon/70 text-mute opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-cyan">🔍</span>
            </div>
            <div class="p-4">
              <p class="text-[13px] font-bold text-cream">${img.title}</p>
              <p class="mt-1 text-[11.5px] leading-relaxed text-mute line-clamp-2">${img.desc}</p>
            </div>
          </div>`
        )
        .join('');
    }
  };

  // --- Hardware Bento Modal Lightbox ---
  const bentoData = {
    esp32: {
      img: 'images/hardware/esp32_devboard_pinout.png',
      title: 'ESP32-S3 Core Compute Brain',
      sub: 'ESP32-S3 microcontroller with 12-bit ADC and USB CDC telemetry',
      callouts: [
        ['MCU', 'ESP32-S3 DevBoard (EnVision Maker Studio edition)'],
        ['ADC', '12-bit SAR ADC resolving optical contrast between white floor and black line'],
        ['COMMS', 'USB CDC serial telemetry active for real-time serial monitor debugging'],
        ['LOGIC', 'Native 3.3V rail isolated from high-current motor power rails'],
      ],
    },
    comb: {
      img: 'images/hardware/ch1b_ldr_breadboard.png',
      title: '7-Photoresistor Optoelectronic Sensor Array',
      sub: '7-channel optical reflectance array with 10k Ohm voltage dividers',
      callouts: [
        ['SENSORS', '7 discrete 5 mm CdS photoresistors mapped to analog inputs IO1 to IO7'],
        ['DIVIDERS', '10k Ohm pull-down resistor network converting resistance to analog voltage'],
        ['READINGS', 'White surface: 2100-2400 ADC | Black surface: 3000-3500 ADC'],
        ['HEIGHT', 'Tuned to 4-5 mm ground clearance for optimal optical signal contrast'],
      ],
    },
    l298n: {
      img: 'images/hardware/ch1c_l298n_wired.png',
      title: 'L298N Dual H-Bridge Motor Driver',
      sub: 'Bi-directional high-current DC motor actuation with power isolation',
      callouts: [
        ['OUTPUT', 'Dual H-Bridge driving two yellow TT DC gear motors'],
        ['PWM', 'Speed control via hardware PWM on IO8 and IO13'],
        ['DIR', 'Direction logic control on IO9, IO10, IO11, and IO12'],
        ['POWER', 'Dedicated 9V external battery pack with common ground isolation'],
      ],
    },
    pots: {
      img: 'images/hardware/ch1a_pots_breadboard.png',
      title: '4-Potentiometer Real-Time Tuning Deck',
      sub: '4-channel potentiometer deck for real-time speed and gain calibration',
      callouts: [
        ['IO4', 'Base Speed potentiometer mapped from 0 to 100'],
        ['IO3', 'Proportional gain (Kp) potentiometer for error correction'],
        ['IO2', 'Integral gain (Ki) potentiometer for steady-state error elimination'],
        ['IO1', 'Derivative gain (Kd) potentiometer for oscillation damping'],
      ],
    },
    frame: {
      img: 'images/hardware/ch1d_onshape_slot.png',
      title: 'Onshape CAD 3D-Printed Chassis',
      sub: 'Custom 3D-printed chassis with 2 critical functional engineering improvements',
      callouts: [
        ['MOD 1', 'Integrated snap-in cradle slot to firmly hold the ESP32-S3 board'],
        ['MOD 2', 'Diagonal structural cross-beam engineered to maximize torsional rigidity'],
        ['CASTER', 'Omnidirectional front ball caster providing smooth low-friction pivot'],
        ['BATTERY', 'Low center-of-gravity battery bay preventing tip-over during rapid turns'],
      ],
    },
  };

  window.openBentoModal = function (cardId) {
    const item = bentoData[cardId];
    if (!item) return;

    document.getElementById('bento-modal-img').src = item.img;
    document.getElementById('bento-modal-img').alt = item.title;
    document.getElementById('bento-modal-title').textContent = item.title;
    document.getElementById('bento-modal-sub').textContent = item.sub;
    const calloutsContainer = document.getElementById('bento-modal-callouts');
    calloutsContainer.innerHTML = item.callouts
      .map(
        ([k, v]) => `
        <div class="rounded-2xl border border-edge bg-carbon/50 p-4">
          <p class="font-mono text-[10px] tracking-[0.25em] text-mint">${k}</p>
          <p class="mt-2 text-[13px] leading-relaxed text-cream">${v}</p>
        </div>`
      )
      .join('');

    const modal = document.getElementById('bento-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  };

  window.closeBentoModal = function () {
    const modal = document.getElementById('bento-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  };

  // --- Universal Image Lightbox Modal ---
  window.openImageLightbox = function (src, title, caption) {
    const modal = document.getElementById('image-modal');
    if (!modal) return;
    document.getElementById('image-modal-img').src = src;
    document.getElementById('image-modal-img').alt = title || 'Hardware Photo';
    document.getElementById('image-modal-title').textContent = title || '';
    document.getElementById('image-modal-caption').textContent = caption || '';
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  };

  window.closeImageLightbox = function () {
    const modal = document.getElementById('image-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  };

  // Close modals on escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeBentoModal();
      window.closePosterLightbox();
      window.closeImageLightbox();
    }
  });
  // Close modal on escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeBentoModal();
      window.closePosterLightbox();
    }
  });

  // --- Real-Time 60 FPS Canvas Track Simulation Engine ---
  const TRACK_W = 960;
  const TRACK_H = 620;
  const SENSOR_OFFSETS = [-18, -12, -6, 0, 6, 12, 18];
  const PTS = [
    [160, 520], [430, 540], [700, 520], [845, 455], [880, 335], [810, 235],
    [795, 130], [705, 75],  [585, 95],  [505, 200], [420, 105], [330, 215],
    [245, 115], [130, 175], [85, 290],  [105, 415]
  ];

  function buildTrack() {
    const dense = [];
    const n = PTS.length;
    for (let i = 0; i < n; i++) {
      const p0 = PTS[(i - 1 + n) % n];
      const p1 = PTS[i];
      const p2 = PTS[(i + 1) % n];
      const p3 = PTS[(i + 2) % n];
      for (let j = 0; j < 50; j++) {
        const t = j / 50;
        const t2 = t * t;
        const t3 = t2 * t;
        dense.push({
          x: 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
          y: 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
        });
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = TRACK_W;
    canvas.height = TRACK_H;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#161922'; // Sleek dark track surface
    ctx.fillRect(0, 0, TRACK_W, TRACK_H);

    // Track centerline (black guide tape)
    ctx.strokeStyle = '#050608';
    ctx.lineWidth = 14;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    dense.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.stroke();

    // Subtle track boundary border
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    dense.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.stroke();

    const img = ctx.getImageData(0, 0, TRACK_W, TRACK_H);
    return { dense, canvas, data: img.data };
  }

  function sampleDark(track, x, y) {
    const xi = Math.round(x);
    const yi = Math.round(y);
    if (xi < 0 || yi < 0 || xi >= TRACK_W || yi >= TRACK_H) return 0;
    const i = (yi * TRACK_W + xi) * 4;
    // Dark line has low RGB values (~5), background is ~22
    const lum = (track.data[i] + track.data[i + 1] + track.data[i + 2]) / 3;
    return lum < 12 ? 1.0 : 0.0;
  }

  const track = buildTrack();

  const sim = {
    x: PTS[0][0],
    y: PTS[0][1],
    h: Math.atan2(PTS[1][1] - PTS[0][1], PTS[1][0] - PTS[0][0]),
    v: 0,
    turn: 0,
    e: 0,
    prevE: 0,
    sumE: 0,
    lp: 60,
    rp: 60,
    laps: 0,
    time: 0,
    trail: [],
    hist: new Array(100).fill(0),
    readings: [0, 0, 0, 0, 0, 0, 0],
    running: true,
    speed: 60,
    kp: 32,
    ki: 6,
    kd: 22,
    nearest: 0,
  };

  const simCanvas = document.getElementById('track-sim-canvas');
  const simCtx = simCanvas ? simCanvas.getContext('2d') : null;
  const waveCanvas = document.getElementById('sim-error-waveform');
  const waveCtx = waveCanvas ? waveCanvas.getContext('2d') : null;

  if (simCanvas) {
    simCanvas.width = TRACK_W;
    simCanvas.height = TRACK_H;
  }
  if (waveCanvas) {
    waveCanvas.width = 300;
    waveCanvas.height = 74;
  }

  // Sliders and controls
  const sliderSpeed = document.getElementById('slider-speed');
  const sliderKp = document.getElementById('slider-kp');
  const sliderKi = document.getElementById('slider-ki');
  const sliderKd = document.getElementById('slider-kd');

  function updateSliderFill(slider) {
    if (!slider) return;
    const val = slider.value;
    slider.style.setProperty('--fill', `${val}%`);
    const valBadge = document.getElementById(`${slider.id}-value`);
    if (valBadge) valBadge.textContent = val;
  }

  [sliderSpeed, sliderKp, sliderKi, sliderKd].forEach((s) => {
    if (s) {
      s.addEventListener('input', () => {
        sim[s.dataset.param] = parseFloat(s.value);
        updateSliderFill(s);
      });
      updateSliderFill(s);
    }
  });

  window.setSimParams = function (speed, kp, ki, kd, presetName) {
    sim.speed = speed;
    sim.kp = kp;
    sim.ki = ki;
    sim.kd = kd;
    if (sliderSpeed) { sliderSpeed.value = speed; updateSliderFill(sliderSpeed); }
    if (sliderKp) { sliderKp.value = kp; updateSliderFill(sliderKp); }
    if (sliderKi) { sliderKi.value = ki; updateSliderFill(sliderKi); }
    if (sliderKd) { sliderKd.value = kd; updateSliderFill(sliderKd); }
    showToast(`Tune loaded: ${presetName || 'Optimal'}`);
  };

  window.toggleSimPlay = function () {
    sim.running = !sim.running;
    const btn = document.getElementById('sim-pause-btn');
    if (btn) btn.innerHTML = sim.running ? '⏸ Pause' : '▶ Play';
  };

  window.resetSim = function () {
    sim.x = PTS[0][0];
    sim.y = PTS[0][1];
    sim.h = Math.atan2(PTS[1][1] - PTS[0][1], PTS[1][0] - PTS[0][0]);
    sim.v = 0;
    sim.turn = 0;
    sim.e = 0;
    sim.prevE = 0;
    sim.sumE = 0;
    sim.laps = 0;
    sim.time = 0;
    sim.trail = [];
    sim.hist.fill(0);
    showToast('Robot reset to start line');
  };

  // Main 60 FPS Physics & Render Loop
  const DT = 1 / 60;
  const FWD = 24;

  function loop() {
    if (sim.running) {
      sim.time += DT;

      // 1. Raycast sensor sampling
      let weighted = 0;
      let total = 0;
      for (let i = 0; i < 7; i++) {
        const off = SENSOR_OFFSETS[i];
        const sx = sim.x + Math.cos(sim.h) * FWD - Math.sin(sim.h) * off;
        const sy = sim.y + Math.sin(sim.h) * FWD + Math.cos(sim.h) * off;
        const val = sampleDark(track, sx, sy);
        sim.readings[i] = val;
        total += val;
        weighted += (i - 3) * val;
      }

      if (total > 0.05) {
        sim.e = weighted / total;
      }

      // 2. Closed-Loop Steering Law
      sim.sumE = Math.max(-100, Math.min(100, sim.sumE + sim.e * DT));
      const dE = (sim.e - sim.prevE) / DT;
      sim.turn = (sim.kp * 0.4) * sim.e + (sim.ki * 0.05) * sim.sumE + (sim.kd * 0.04) * dE;
      sim.prevE = sim.e;

      // 3. Differential Drive Kinematics
      sim.lp = Math.max(0, Math.min(100, sim.speed + sim.turn));
      sim.rp = Math.max(0, Math.min(100, sim.speed - sim.turn));

      const vTarget = ((sim.lp + sim.rp) / 2) * 1.8;
      sim.v += (vTarget - sim.v) * 0.15;
      const omega = (sim.lp - sim.rp) * 0.05;
      sim.h += omega * DT;

      sim.x += Math.cos(sim.h) * sim.v * DT;
      sim.y += Math.sin(sim.h) * sim.v * DT;

      // Update history
      sim.hist.push(sim.e);
      if (sim.hist.length > 100) sim.hist.shift();

      // Update trail
      sim.trail.push({ x: sim.x, y: sim.y });
      if (sim.trail.length > 90) sim.trail.shift();

      // Check lap progress
      const distToStart = Math.hypot(sim.x - PTS[0][0], sim.y - PTS[0][1]);
      if (distToStart < 35 && sim.time > 4.0) {
        sim.laps += 1;
        sim.time = 0;
      }
    }

    // Render Canvas
    if (simCtx) {
      // Draw track
      simCtx.drawImage(track.canvas, 0, 0);

      // Draw fading trail
      if (sim.trail.length > 1) {
        for (let i = 1; i < sim.trail.length; i++) {
          const alpha = i / sim.trail.length;
          simCtx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.35})`;
          simCtx.lineWidth = 3;
          simCtx.beginPath();
          simCtx.moveTo(sim.trail[i - 1].x, sim.trail[i - 1].y);
          simCtx.lineTo(sim.trail[i].x, sim.trail[i].y);
          simCtx.stroke();
        }
      }

      // Draw Robot Sprite
      simCtx.save();
      simCtx.translate(sim.x, sim.y);
      simCtx.rotate(sim.h);

      // Robot chassis body
      simCtx.fillStyle = '#0d0e12';
      simCtx.strokeStyle = '#00f0ff';
      simCtx.lineWidth = 1.8;
      simCtx.shadowColor = 'rgba(0, 240, 255, 0.4)';
      simCtx.shadowBlur = 10;
      simCtx.beginPath();
      simCtx.roundRect(-22, -16, 44, 32, 6);
      simCtx.fill();
      simCtx.stroke();
      simCtx.shadowBlur = 0;

      // Wheels
      simCtx.fillStyle = '#1f2430';
      simCtx.fillRect(-10, -20, 20, 4); // Left wheel
      simCtx.fillRect(-10, 16, 20, 4);  // Right wheel

      // Front caster ball
      simCtx.fillStyle = '#10b981';
      simCtx.beginPath();
      simCtx.arc(16, 0, 3.5, 0, Math.PI * 2);
      simCtx.fill();

      // Sensor bar comb
      simCtx.fillStyle = '#1f2430';
      simCtx.fillRect(FWD - 2, -20, 4, 40);

      // 7 Sensor dots
      for (let i = 0; i < 7; i++) {
        const off = SENSOR_OFFSETS[i];
        const val = sim.readings[i];
        simCtx.fillStyle = val > 0.5 ? '#00f0ff' : '#334155';
        simCtx.beginPath();
        simCtx.arc(FWD, off, val > 0.5 ? 3.5 : 2, 0, Math.PI * 2);
        simCtx.fill();
      }

      simCtx.restore();
    }

    // Render Rolling Waveform Canvas
    if (waveCtx) {
      waveCtx.clearRect(0, 0, 300, 74);
      waveCtx.strokeStyle = '#1f2430';
      waveCtx.lineWidth = 1;
      waveCtx.beginPath();
      waveCtx.moveTo(0, 37);
      waveCtx.lineTo(300, 37);
      waveCtx.stroke();

      waveCtx.strokeStyle = '#00f0ff';
      waveCtx.lineWidth = 2;
      waveCtx.beginPath();
      for (let i = 0; i < sim.hist.length; i++) {
        const x = (i / 100) * 300;
        const y = 37 - (sim.hist[i] / 3) * 32;
        if (i === 0) waveCtx.moveTo(x, y);
        else waveCtx.lineTo(x, y);
      }
      waveCtx.stroke();
    }

    // Update HUD elements
    const hudError = document.getElementById('hud-error');
    const hudTurn = document.getElementById('hud-turn');
    const hudVelocity = document.getElementById('hud-velocity');
    const hudTime = document.getElementById('hud-time');
    const hudLaps = document.getElementById('hud-laps');
    const barLeft = document.getElementById('pwm-bar-left');
    const barRight = document.getElementById('pwm-bar-right');
    const pwmValLeft = document.getElementById('pwm-val-left');
    const pwmValRight = document.getElementById('pwm-val-right');

    if (hudError) hudError.textContent = sim.e.toFixed(3);
    if (hudTurn) hudTurn.textContent = `${(sim.turn * 5.7).toFixed(1)} °/s`;
    if (hudVelocity) hudVelocity.textContent = `${Math.round(sim.v)} px/s`;
    if (hudTime) hudTime.textContent = `${sim.time.toFixed(1)} s`;
    if (hudLaps) hudLaps.textContent = `LAP ${sim.laps}`;

    if (barLeft) barLeft.style.height = `${Math.round(sim.lp)}%`;
    if (barRight) barRight.style.height = `${Math.round(sim.rp)}%`;
    if (pwmValLeft) pwmValLeft.textContent = `L ${Math.round(sim.lp)}`;
    if (pwmValRight) pwmValRight.textContent = `R ${Math.round(sim.rp)}`;

    // Update 7-channel sensor comb DOM bars
    for (let i = 0; i < 7; i++) {
      const bar = document.getElementById(`sensor-bar-${i}`);
      if (bar) {
        bar.style.opacity = sim.readings[i] > 0.5 ? '1' : '0.25';
        bar.style.transform = sim.readings[i] > 0.5 ? 'scaleY(1.2)' : 'scaleY(1)';
      }
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // --- Embedded Code Studio Tabs & Copy ---
  const sketches = [
    {
      name: "ECE5_Robot_LineFollower_Production.ino",
      label: "Main closed-loop navigation",
      code: `/* ============================================================
   ECE5_Robot_LineFollower_Production.ino
   Team Big Hero 6ix - UC San Diego ECE 5, Lab 4 Finale
   Closed-loop line following on the ESP32-S3
   ------------------------------------------------------------
   7-sensor comb (LDR + 10k dividers): IO5, IO6, IO7, IO14..IO17
   Tuning pots:  IO1 (Kd) · IO2 (Ki) · IO3 (Kp) · IO4 (Speed)
   L298N: PWM IO8/IO13 · DIR IO9/IO10 · IO11/IO12
   ============================================================ */

#define POT_KD   1
#define POT_KI   2
#define POT_KP   3
#define POT_SPD  4

const uint8_t SENSORS[7] = {5, 6, 7, 14, 15, 16, 17};

#define PWM_L  8      // L298N ENA - left wheel PWM
#define PWM_R  13     // L298N ENB - right wheel PWM
#define IN_L1  9
#define IN_L2  10
#define IN_R1  11
#define IN_R2  12

float Kp, Ki, Kd;
int   baseSpeed;
float error = 0, prevError = 0, sumError = 0;

void setup() {
  Serial.begin(115200);

  const int pwmPins[] = {PWM_L, PWM_R};
  for (int i = 0; i < 2; i++) {
    pinMode(pwmPins[i], OUTPUT);
    ledcAttachPin(pwmPins[i], i);
  }
  ledcSetup(0, 20000, 10);
  ledcSetup(1, 20000, 10);

  const int dirPins[] = {IN_L1, IN_L2, IN_R1, IN_R2};
  for (int i = 0; i < 4; i++) pinMode(dirPins[i], OUTPUT);

  for (int i = 0; i < 7; i++) pinMode(SENSORS[i], INPUT);
}

void loop() {
  /* ---- live analog gain trim (no recompilation) ---- */
  Kd  = analogRead(POT_KD)  / 4095.0 * 40.0;
  Ki  = analogRead(POT_KI)  / 4095.0 * 8.0;
  Kp  = analogRead(POT_KP)  / 4095.0 * 80.0;
  baseSpeed = (int)(analogRead(POT_SPD) / 4095.0 * 100.0);

  /* ---- weighted line position: e = Sum[(i-3)*s_i] / Sum[s_i] ---- */
  float s[7], total = 0, weighted = 0;
  for (int i = 0; i < 7; i++) {
    s[i] = (4095.0 - analogRead(SENSORS[i])) / 4095.0;  // dark = high
    total  += s[i];
    weighted += (i - 3) * s[i];
  }
  error = (total > 0.05) ? weighted / total : prevError;  // hold on loss

  /* ---- Control law with anti-windup (sum clamped to +/-200) ---- */
  sumError = constrain(sumError + error * 0.016, -200.0, 200.0);
  float turn = Kp * error
             + Ki * sumError * 0.016
             + Kd * (error - prevError) / 0.016;
  prevError = error;

  /* ---- differential drive mix ---- */
  int lPwm = constrain(baseSpeed + turn, 0, 100);
  int rPwm = constrain(baseSpeed - turn, 0, 100);

  digitalWrite(IN_L1, HIGH); digitalWrite(IN_L2, LOW);
  digitalWrite(IN_R1, HIGH); digitalWrite(IN_R2, LOW);
  ledcWrite(0, (int)(lPwm * 10.23));
  ledcWrite(1, (int)(rPwm * 10.23));

  Serial.printf("e=%.3f turn=%.2f L=%d R=%d\n", error, turn, lPwm, rPwm);
  delay(5);
}`
    },
    {
      name: "ESP32Potentiometer_Code.ino",
      label: "Real-time gain tuning bank · IO1-IO4",
      code: `/* ============================================================
   ESP32Potentiometer_Code.ino - Challenge 1A
   4-potentiometer real-time tuning deck
   IO1 (Kd) · IO2 (Ki) · IO3 (Kp) · IO4 (Speed)
   ============================================================ */

const uint8_t POTS[4] = {1, 2, 3, 4};   // ADC1 channels

float kd, ki, kp;
int   speedPct;

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 4; i++) pinMode(POTS[i], INPUT);
}

void loop() {
  /* raw 12-bit counts -> engineering units */
  kd       = analogRead(POTS[0]) / 4095.0 * 40.0;   // derivative gain
  ki       = analogRead(POTS[1]) / 4095.0 * 8.0;    // integral gain
  kp       = analogRead(POTS[2]) / 4095.0 * 80.0;   // proportional gain
  speedPct = (int)(analogRead(POTS[3]) / 4095.0 * 100.0);

  Serial.printf("Kp=%.2f  Ki=%.2f  Kd=%.2f  Speed=%d%%\n",
                kp, ki, kd, speedPct);

  delay(100);   // 10 Hz telemetry refresh
}`
    },
    {
      name: "ESP32Photoresistor_Code.ino",
      label: "7-sensor LDR array normalization · IO1-IO7",
      code: `/* ============================================================
   ESP32Photoresistor_Code.ino - Challenge 1B
   7-channel photoresistor reflectance bar with per-sensor
   normalization. 10k Ohm voltage dividers, 4 mm ride height.
   ============================================================ */

const uint8_t LDR[7] = {1, 2, 3, 4, 5, 6, 7};
const int POSITION[7] = {-18, -12, -6, 0, 6, 12, 18};  // mm offsets

int   blackRef[7];    // ADC count over black tape
int   whiteRef[7];    // ADC count over white floor
bool  calibrated = false;

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 7; i++) pinMode(LDR[i], INPUT);
}

void calibrate() {
  for (int i = 0; i < 7; i++) {
    blackRef[i] = 3400;    // measured over black electrical tape
    whiteRef[i] = 420;     // measured over white poster board
  }
  calibrated = true;
}

void loop() {
  if (!calibrated) { calibrate(); }

  float s[7];
  for (int i = 0; i < 7; i++) {
    int raw = analogRead(LDR[i]);
    s[i] = constrain((float)(raw - whiteRef[i]) / (blackRef[i] - whiteRef[i]), 0.0, 1.0);
  }

  Serial.print("BAR ");
  for (int i = 0; i < 7; i++) {
    Serial.printf("[%d]%d=%.2f  ", POSITION[i], LDR[i], s[i]);
  }
  Serial.println();

  delay(20);
}`
    },
    {
      name: "ESP32Motor_Driver_Code.ino",
      label: "L298N PWM + directional control",
      code: `/* ============================================================
   ESP32Motor_Driver_Code.ino - Challenge 1C
   L298N dual H-bridge: PWM on IO8/IO13, direction on IO9-IO12.
   9V motor pack is strictly isolated from the ESP32 logic rail.
   ============================================================ */

#define PWM_L   8     // ENA
#define PWM_R   13    // ENB
#define IN_L1   9
#define IN_L2   10
#define IN_R1   11
#define IN_R2   12

void setup() {
  Serial.begin(115200);

  ledcSetup(0, 20000, 10);            // ch0: 20 kHz, 10-bit
  ledcSetup(1, 20000, 10);            // ch1
  ledcAttachPin(PWM_L, 0);
  ledcAttachPin(PWM_R, 1);

  const int dir[4] = {IN_L1, IN_L2, IN_R1, IN_R2};
  for (int i = 0; i < 4; i++) pinMode(dir[i], OUTPUT);
}

void drive(int lPct, int rPct) {
  digitalWrite(IN_L1, lPct >= 0); digitalWrite(IN_L2, lPct < 0);
  digitalWrite(IN_R1, rPct >= 0); digitalWrite(IN_R2, rPct < 0);

  ledcWrite(0, constrain(abs(lPct), 0, 100) * 10.23);
  ledcWrite(1, constrain(abs(rPct), 0, 100) * 10.23);
}

void loop() {
  for (int p = 0; p <= 100; p += 5) { drive(p, p);  delay(50); }
  drive(70, -70);  delay(600);
  drive(0, 0);     delay(1000);
}`
    }
  ];

  let currentSketchIndex = 0;

  function highlightCode(raw) {
    const esc = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return esc
      .replace(/(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm, '<span class="tok-cmt">$1</span>')
      .replace(/(#[a-zA-Z_]+)/g, '<span class="tok-pre">$1</span>')
      .replace(/\b(void|int|float|double|bool|const|uint8_t|uint16_t|pinMode|ledcSetup|ledcAttachPin|ledcWrite|digitalWrite|analogRead|constrain|abs|delay|Serial|setup|loop)\b/g, '<span class="tok-kw">$1</span>')
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="tok-num">$1</span>');
  }

  window.selectSketchTab = function (idx) {
    currentSketchIndex = idx;
    const sketch = sketches[idx];
    document.querySelectorAll('[data-code-tab]').forEach((tab, i) => {
      if (i === idx) {
        tab.classList.add('bg-cyan/10', 'text-cyan', 'shadow-[inset_0_0_0_1px_rgba(0,240,255,0.3)]');
        tab.classList.remove('text-mute');
      } else {
        tab.classList.remove('bg-cyan/10', 'text-cyan', 'shadow-[inset_0_0_0_1px_rgba(0,240,255,0.3)]');
        tab.classList.add('text-mute');
      }
    });

    const title = document.getElementById('code-header-name');
    const label = document.getElementById('code-header-label');
    const code = document.getElementById('code-panel-body');

    if (title) title.textContent = sketch.name;
    if (label) label.textContent = sketch.label;
    if (code) code.innerHTML = highlightCode(sketch.code);
  };

  // --- Tournament Readiness & Competition Track Disciplines ---
  const compTracks = [
    {
      id: "drag",
      name: "Track 1: Drag Race",
      speed: 85, kp: 18, ki: 2, kd: 24,
      metricTarget: "Sub-5.0s Sprint Target",
      statusBadge: "⏳ Trials: Friday Week 10",
      rationale: "20-foot straight course on white poster board with 3/4-inch black electrical tape. Low Kp prevents divergent high-speed over-correction, while heavy Kd dampens high-speed wobble along the straight line.",
    },
    {
      id: "sweep",
      name: "Track 2: Frequency Sweep",
      speed: 48, kp: 46, ki: 4, kd: 32,
      metricTarget: "100% Course Completion",
      statusBadge: "⏳ Trials: Friday Week 10",
      rationale: "Progressively tighter alternating S-curves. Reduced forward speed maximizes available cornering friction, while aggressive Kp snaps into rapid turns and high Kd prevents overshooting.",
    },
    {
      id: "loop",
      name: "Track 3: Continuous Loop",
      speed: 62, kp: 30, ki: 12, kd: 18,
      metricTarget: "10+ Consecutive Loops",
      statusBadge: "⏳ Trials: Friday Week 10",
      rationale: "Constant curvature closed-circuit track. Tuned Ki counters steady-state centrifugal drift toward the outer tape edge, sustaining loop after loop without operator intervention.",
    },
  ];

  let currentCompTrack = 0;

  window.selectCompTrack = function (idx) {
    currentCompTrack = idx;
    const t = compTracks[idx];

    document.querySelectorAll('[data-comp-tab]').forEach((tab, i) => {
      const nameEl = tab.querySelector('p.text-\\[15px\\]');
      if (i === idx) {
        tab.classList.add('border-cyan/45', 'bg-surface', 'glow-cyan');
        tab.classList.remove('border-edge', 'bg-surface/50');
        if (nameEl) {
          nameEl.classList.remove('text-cream');
          nameEl.classList.add('text-cyan');
        }
      } else {
        tab.classList.remove('border-cyan/45', 'bg-surface', 'glow-cyan');
        tab.classList.add('border-edge', 'bg-surface/50');
        if (nameEl) {
          nameEl.classList.remove('text-cyan');
          nameEl.classList.add('text-cream');
        }
      }
    });

    const speedEl = document.getElementById('comp-speed-val');
    const kpEl = document.getElementById('comp-kp-val');
    const kiEl = document.getElementById('comp-ki-val');
    const kdEl = document.getElementById('comp-kd-val');
    const metricTargetEl = document.getElementById('comp-metric-target');
    const statusBadgeEl = document.getElementById('comp-status-badge');
    const rationaleEl = document.getElementById('comp-rationale-body');

    if (speedEl) speedEl.textContent = t.speed;
    if (kpEl) kpEl.textContent = t.kp;
    if (kiEl) kiEl.textContent = t.ki;
    if (kdEl) kdEl.textContent = t.kd;
    if (metricTargetEl) metricTargetEl.textContent = t.metricTarget;
    if (statusBadgeEl) statusBadgeEl.textContent = t.statusBadge;
    if (rationaleEl) rationaleEl.textContent = t.rationale;
  };

  window.loadCompTuneToSim = function () {
    const t = compTracks[currentCompTrack];
    window.setSimParams(t.speed, t.kp, t.ki, t.kd, t.name);
    window.scrollToSection('lab');
  };

  // --- Academic Poster Lightbox & Pan/Zoom ---
  let posterZoom = 1.0;
  let posterPos = { x: 0, y: 0 };
  let isDragging = false;
  let dragStart = { x: 0, y: 0 };

  const posterImg = document.getElementById('poster-zoom-img');

  function updatePosterTransform() {
    if (posterImg) {
      posterImg.style.transform = `translate(${posterPos.x}px, ${posterPos.y}px) scale(${posterZoom})`;
      document.getElementById('poster-zoom-level').textContent = `${Math.round(posterZoom * 100)}%`;
      posterImg.style.cursor = posterZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in';
    }
  }

  window.openPosterLightbox = function () {
    posterZoom = 1.0;
    posterPos = { x: 0, y: 0 };
    updatePosterTransform();
    const modal = document.getElementById('poster-lightbox');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  };

  window.closePosterLightbox = function () {
    const modal = document.getElementById('poster-lightbox');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  };

  window.zoomPoster = function (delta) {
    posterZoom = Math.max(1.0, Math.min(4.0, posterZoom + delta));
    if (posterZoom === 1.0) posterPos = { x: 0, y: 0 };
    updatePosterTransform();
  };

  window.resetPosterZoom = function () {
    posterZoom = 1.0;
    posterPos = { x: 0, y: 0 };
    updatePosterTransform();
  };

  if (posterImg) {
    posterImg.addEventListener('dblclick', () => {
      posterZoom = posterZoom > 1.0 ? 1.0 : 2.5;
      if (posterZoom === 1.0) posterPos = { x: 0, y: 0 };
      updatePosterTransform();
    });

    posterImg.addEventListener('mousedown', (e) => {
      if (posterZoom > 1.0) {
        isDragging = true;
        dragStart = { x: e.clientX - posterPos.x, y: e.clientY - posterPos.y };
        updatePosterTransform();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        posterPos = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
        updatePosterTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        updatePosterTransform();
      }
    });
  }

  // Initialize Code Studio Tab 0
  window.selectSketchTab(0);
})();
