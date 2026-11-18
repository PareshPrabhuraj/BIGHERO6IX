
// ============================================================
// Big Hero 6ix - Autonomous Line-Following Robot
// UC San Diego ECE 5: Making, Breaking, Hacking Stuff
// Production Firmware Architecture & Interactive Hardware Showcase
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
    const navHeight = 84;
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
  const sections = ['overview', 'timeline', 'anatomy', 'slides', 'code', 'poster', 'team'];

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('glass', 'border-edge/70');
      header.classList.remove('border-edge/40');
    } else {
      header.classList.remove('glass', 'border-edge/70');
      header.classList.add('border-edge/40');
    }

    const scrollPos = window.scrollY + 220;
    for (let i = sections.length - 1; i >= 0; i--) {
      const sec = document.getElementById(sections[i]);
      if (sec && sec.offsetTop <= scrollPos) {
        navLinks.forEach((link) => {
          if (link.getAttribute('data-nav-target') === sections[i]) {
            link.classList.add('bg-cyan/15', 'text-cyan', 'shadow-[inset_0_0_0_1px_rgba(0,240,255,0.3)]');
            link.classList.remove('text-mute');
          } else {
            link.classList.remove('bg-cyan/15', 'text-cyan', 'shadow-[inset_0_0_0_1px_rgba(0,240,255,0.3)]');
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
      images: [
        {
          src: "images/real_robot_hero.jpg",
          title: "Assembled Robot Platform",
          badge: "REAL HARDWARE",
          desc: "Fully assembled two-wheel drive robot platform with 3D-printed chassis, breadboard electronics, and optoelectronic sensor bar."
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

  function escapeSingleQuotes(str) {
    return (str || '').replace(/'/g, "\'");
  }

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
    const panelTitle = document.getElementById('timeline-title');
    const panelBody = document.getElementById('timeline-body');
    const panelImages = document.getElementById('timeline-images');

    if (panelWatermark) panelWatermark.textContent = data.id;
    if (panelTitle) panelTitle.textContent = data.title;
    if (panelBody) panelBody.textContent = data.body;
    if (panelImages && data.images) {
      panelImages.innerHTML = data.images
        .map(
          (img) => `
          <div class="group relative overflow-hidden rounded-2xl border border-edge bg-carbon/80 transition-all duration-300 hover:border-cyan/40 cursor-pointer" onclick="openImageLightbox('${img.src}', '${escapeSingleQuotes(img.title)}', '${escapeSingleQuotes(img.desc)}')">
            <div class="relative h-48 sm:h-56 bg-[#08090D] flex items-center justify-center p-3 overflow-hidden">
              <img src="${img.src}" alt="${img.title}" class="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]">
            </div>
            <div class="p-4">
              <p class="text-[13px] font-bold text-cream">${img.title}</p>
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
      title: 'ESP32-S3 Microcontroller Board',
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
      title: '7-Photoresistor Sensor Array',
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
      title: '3D-Printed Chassis & Power Assembly',
      sub: 'Custom 3D-printed chassis with integrated ESP32 cradle slot and diagonal cross-beam',
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
      window.closeImageLightbox();
    }
  });

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


  // Initialize Code Studio Tab 0
  window.selectSketchTab(0);
})();
