
// ============================================================
// Big Hero 6ix - Line Following ECE 5 Robot
// UC San Diego ECE 5: Making, Breaking, Hacking Stuff
// Team Big Hero 6ix - ECE 5 Lab 4 Project Documentation
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
      heroCard.style.transition = 'transform 0.08s ease-out';
      heroCard.style.transform = `perspective(1200px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg)`;
    });
    heroCard.addEventListener('mouseleave', () => {
      heroCard.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
      heroCard.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    });
    heroCard.addEventListener('mouseenter', () => {
      heroCard.style.transition = 'none';
    });
  }

  // --- Subsystem Prototyping Timeline Data & Controller ---
  const timelineData = [
    {
      id: "1A",
      title: "4-Potentiometer Gain Tuning Deck",
      stepBadge: "CHALLENGE 1A - POTENTIOMETERS & SPEED CONTROL",
      body: "The 4 potentiometers map values from 0 to 100 across a 12-bit ADC range of 0 to 4095. Turning the potentiometer clockwise moves the wiper toward the 3.3V rail, increasing the mapped reading. To reverse the direction, swap the outer 3.3V and GND wires on the breadboard or invert the mapping in code using (100 - mapped_reading). Mapped to ESP32-S3 pins: IO1 (Kd), IO2 (Ki), IO3 (Kp), and IO4 (Base Speed).",
      images: [
        {
          src: "images/hardware/ch1a_pots_breadboard.png",
          title: "Breadboard Hardware Build",
          badge: "BREADBOARD BUILD",
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
      stepBadge: "CHALLENGE 1B - PHOTORESISTOR SENSING",
      body: "The 7-channel reflectance array uses 5mm CdS photoresistors paired with 10k Ohm pull-down resistors in voltage divider circuits. The calibrated ADC range for the white poster board is roughly 2100-2400, while the black electrical tape reads roughly 3000-3500. A ground clearance of 4-5 mm gives clear contrast between the white track and the black line.",
      images: [
        {
          src: "images/hardware/ch1b_ldr_breadboard.png",
          title: "7-Sensor Breadboard Array",
          badge: "BREADBOARD ARRAY",
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
      title: "L298N Dual H-Bridge Motor Driver & Motors",
      stepBadge: "CHALLENGE 1C - PREPPING THE MOTORS & DRIVER",
      body: "The L298N motor driver lets the ESP32-S3 control motor speed and direction while drawing motor power from an external 6xAA 9V battery pack. Hardware PWM on IO8 and IO13 controls speed, while IO9-IO12 control directional H-bridge logic. Hot glue secures the delicate motor brass tabs to prevent wires from snapping during test runs, and rubber tire treads minimize wheel slip.",
      images: [
        {
          src: "images/hardware/ch1c_l298n_wired.png",
          title: "L298N Driver Interface",
          badge: "MOTOR DRIVER WIRING",
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
      body: "Designed in Onshape with two functional changes: (1) a dedicated slot to hold the ESP32-S3 microcontroller securely in place, and (2) a diagonal structural beam to increase the rigidity of the 3D-printed chassis.",
      images: [
        {
          src: "images/hardware/ch1d_onshape_slot.png",
          title: "ESP32 Mounting Slot CAD",
          badge: "ONSHAPE CAD MOD 1",
          desc: "3D CAD model displaying the custom slot designed to hold the ESP32 board securely."
        },
        {
          src: "images/hardware/ch1d_onshape_beam.png",
          title: "Rigidity Cross-Beam CAD",
          badge: "ONSHAPE CAD MOD 2",
          desc: "3D CAD model displaying the diagonal structural beam added for chassis rigidity."
        }
      ]
    },
    {
      id: "2",
      title: "Challenge 2: Systems Integration & Line Following Code",
      stepBadge: "CHALLENGE 2 - FULL INTEGRATION & LINE FOLLOWING",
      body: "Full systems integration: mounting the 7-photoresistor sensor comb (IO8 to IO2), 4-potentiometer tuning deck (IO13, IO12, IO11, IO10), and L298N motor driver (IO42, IO41, IO40, IO37, IO39, IO38) onto the 3D-printed chassis. The closed-loop line following firmware executes a 200 Hz PID control loop, white/black surface normalization, deadband motor compensation, and dynamic recovery on sharp curves.",
      images: [
        {
          src: "images/real_robot_hero.jpg",
          title: "Assembled Line Following Robot",
          badge: "HARDWARE CHASSIS",
          desc: "Two-wheel drive chassis with dual DC gear motors, front ball caster, 7-sensor comb, and breadboard circuit bays."
        },
        {
          src: "images/slides/slide_2_objective.png",
          title: "Lab 4 Presentation Slides",
          badge: "LAB 4 PRESENTATION",
          desc: "ECE 5 Lab 4 presentation slides documenting our build challenges and line tracking goals."
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
      const colClass = data.images.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';
      panelImages.className = `grid ${colClass} gap-5`;
      panelImages.innerHTML = data.images
        .map(
          (img) => `
          <div class="group relative overflow-hidden rounded-2xl border border-edge bg-carbon/80 transition-all duration-300 hover:border-cyan/40 cursor-pointer" onclick="openImageLightbox('${img.src}', '${escapeSingleQuotes(img.title)}', '${escapeSingleQuotes(img.desc)}')">
            <div class="relative h-48 sm:h-56 bg-[#08090D] flex items-center justify-center p-4 overflow-hidden">
              <img src="${img.src}" alt="${img.title}" class="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]">
            </div>
            <div class="p-4 border-t border-edge/60 bg-surface/50">
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
      sub: 'ESP32-S3 microcontroller with 12-bit ADC and USB serial communication',
      callouts: [
        ['MCU', 'ESP32-S3 DevBoard (EnVision Maker Studio edition)'],
        ['ADC', '12-bit ADC reading analog voltages from photoresistors and potentiometers'],
        ['COMMS', 'USB Serial Monitor active for live sensor readings and debugging'],
        ['LOGIC', '3.3V logic rail isolated from high-current 9V motor power rails'],
      ],
    },
    comb: {
      img: 'images/hardware/ch1b_ldr_breadboard.png',
      title: '7-Photoresistor Sensor Array',
      sub: '7-channel optical reflectance array with 10k Ohm voltage dividers',
      callouts: [
        ['SENSORS', '7 discrete 5 mm CdS photoresistors mapped to analog inputs IO8 to IO2 (Far Left to Far Right)'],
        ['DIVIDERS', '10k Ohm pull-down resistor network converting resistance to analog voltage'],
        ['READINGS', 'White surface: 2100-2400 ADC | Black surface: 3000-3500 ADC'],
        ['HEIGHT', '4-5 mm ground clearance calibrated for clear white-to-black surface contrast'],
      ],
    },
    l298n: {
      img: 'images/hardware/ch1c_l298n_wired.png',
      title: 'L298N Dual H-Bridge Motor Driver',
      sub: 'Bi-directional DC motor control with power isolation',
      callouts: [
        ['OUTPUT', 'Dual H-Bridge driving two yellow TT DC gear motors'],
        ['PWM', 'Speed control via PWM: IO42 (Left ENA) and IO37 (Right ENB)'],
        ['DIR', 'Direction logic control on IO41, IO40 (Left) and IO39, IO38 (Right)'],
        ['POWER', 'Dedicated 9V external battery pack with common ground isolation'],
      ],
    },
    pots: {
      img: 'images/hardware/ch1a_pots_breadboard.png',
      title: '4-Potentiometer Tuning Deck',
      sub: '4-channel potentiometer deck for speed and gain calibration',
      callouts: [
        ['IO13', 'Base Speed potentiometer mapped from 0 to 100% in Challenge 2 (IO4 in Ch 1A)'],
        ['IO12', 'Proportional gain (Kp) potentiometer for error correction (IO3 in Ch 1A)'],
        ['IO11', 'Integral gain (Ki) potentiometer for steady-state error elimination (IO2 in Ch 1A)'],
        ['IO10', 'Derivative gain (Kd) potentiometer for oscillation damping (IO1 in Ch 1A)'],
      ],
    },
    frame: {
      img: 'images/hardware/ch1d_onshape_slot.png',
      title: '3D-Printed Chassis & Power Assembly',
      sub: 'Custom 3D-printed chassis with integrated ESP32 slot and diagonal beam',
      callouts: [
        ['MOD 1', 'Dedicated slot to firmly hold the ESP32-S3 board'],
        ['MOD 2', 'Diagonal structural beam added to improve chassis rigidity'],
        ['CASTER', 'Omnidirectional front ball caster providing smooth low-friction pivot'],
        ['BATTERY', 'Battery bay positioned low to keep the robot stable'],
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
      name: "ESP32Potentiometer_Code.ino",
      label: "Real-time gain tuning bank · IO1-IO4 (Standalone Test)",
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

  delay(100);   // 10 Hz serial print update
}`
    },
    {
      name: "ESP32Photoresistor_Code.ino",
      label: "7-sensor LDR array normalization · IO1-IO7 (Standalone Test)",
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
      label: "L298N dual H-bridge motor driver · IO42/IO37 PWM, IO41/IO40/IO39/IO38 DIR",
      code: `/* ============================================================
   ESP32Motor_Driver_Code.ino - Challenge 1C
   L298N dual H-bridge motor driver bring-up and verification
   Left Motor: ENA=42, IN1=41, IN2=40
   Right Motor: ENB=37, IN3=39, IN4=38
   ============================================================ */

#include <Arduino.h>
#include <L298NX2.h>

enum side {LEFT, RIGHT};

// Left Motor (ENA, IN1, IN2), Right Motor (ENB, IN3, IN4)
L298NX2 DriveMotors(42, 41, 40, 37, 39, 38);

int speed = 75;

void runMotorAtSpeed(side _side, int speed) {
  if (_side == LEFT) {
    DriveMotors.setSpeedA(abs(speed));
    if (speed > 0) DriveMotors.forwardA();
    else DriveMotors.backwardA();
  }
  if (_side == RIGHT) {
    DriveMotors.setSpeedB(abs(speed));
    if (speed > 0) DriveMotors.forwardB();
    else DriveMotors.backwardB();
  }
}

void setup() {
  delay(1500);  // Settling delay before motors spin up
}

void loop() {
  // Forward 3s
  runMotorAtSpeed(LEFT, speed);
  runMotorAtSpeed(RIGHT, speed);
  delay(3000);

  // Backward 3s
  runMotorAtSpeed(LEFT, -speed);
  runMotorAtSpeed(RIGHT, -speed);
  delay(3000);

  // Stop 3s
  runMotorAtSpeed(LEFT, 0);
  runMotorAtSpeed(RIGHT, 0);
  delay(3000);
}`
    },
    {
      name: "Robot_LineFollower_Template.ino",
      label: "Integrated PID line following control algorithm · IO8-IO2, IO10-IO13, IO46",
      code: `/* ============================================================
   Robot_LineFollower_Template.ino - Challenge 2 Line Following
   UCSD ECE 5 Lab 4 Line Following Robot with PID Control
   Team: Big Hero 6ix (Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj)
   ============================================================ */

#include <Arduino.h>
#include <L298NX2.h>

#define PRINTALLDATA   0   // 0 = untethered run (Slide 12 & 15), 1 = debug
#define NOMINALSPEED  45   // Base motor speed to overcome gearbox deadband

// Motor Driver: Left (ENA=42, IN1=41, IN2=40), Right (ENB=37, IN3=39, IN4=38)
L298NX2 DriveMotors(42, 41, 40, 37, 39, 38);
enum side {LEFT, RIGHT};

// 7 Photoresistors from Left to Right looking from rear (IO8 down to IO2)
int LDR_Pin[] = {8, 7, 6, 5, 4, 3, 2};

// Potentiometer Tuning Deck (IO10-IO13)
const int S_pin = 13; // Speed
const int P_pin = 12; // Proportional (Kp)
const int I_pin = 11; // Integral (Ki)
const int D_pin = 10; // Derivative (Kd)
const int led_Pins[] = {46}; // Calibration status LED

int totalPhotoResistors = sizeof(LDR_Pin) / sizeof(LDR_Pin[0]);
float Mn[20], Mx[20], LDRf[20];
int LDR[20];
int SpRead = 0, kPRead = 0, kIRead = 0, kDRead = 0;
float error = 0, lasterror = 0, sumerror = 0, last_valid_error = 0;
float kP = 0, kI = 0, kD = 0;
int Turn = 0, M1P = 0, M2P = 0;
int M1SpeedtoMotor = 0, M2SpeedtoMotor = 0;

void runMotorAtSpeed(side _side, int speed) {
  if (abs(speed) > 0 && abs(speed) < NOMINALSPEED) {
    speed = (speed > 0) ? NOMINALSPEED : -NOMINALSPEED;
  }
  speed = constrain(speed, -255, 255);
  if (_side == LEFT) {
    DriveMotors.setSpeedA(abs(speed));
    if (speed > 0) DriveMotors.forwardA();
    else DriveMotors.backwardA();
  }
  if (_side == RIGHT) {
    DriveMotors.setSpeedB(abs(speed));
    if (speed > 0) DriveMotors.backwardB(); // Mirrored physical motor mounting
    else DriveMotors.forwardB();
  }
}

void PID_Turn() {
  kP = (kPRead / 1023.0) * 1.5;
  kI = (kIRead / 1023.0) * 0.05;
  kD = (kDRead / 1023.0) * 0.8;

  sumerror = constrain(sumerror + error, -200, 200);
  float dError = error - lasterror;

  Turn = (kP * error) + (kI * sumerror) + (kD * dError);
  M1P = -Turn;  // Left motor delta
  M2P = Turn;   // Right motor delta
  lasterror = error;
}

void RunMotors() {
  M1SpeedtoMotor = constrain(SpRead + M1P, -255, 255);
  M2SpeedtoMotor = constrain(SpRead + M2P, -255, 255);
  runMotorAtSpeed(LEFT, M1SpeedtoMotor);
  runMotorAtSpeed(RIGHT, M2SpeedtoMotor);
}

void loop() {
  readPotentiometers();
  readPhotoresistors();
  calculateError();
  PID_Turn();
  RunMotors();
  delay(5); // ~200 Hz deterministic control loop
}`
    }
  ];

  let currentSketchIndex = 0;

  function highlightCode(raw) {
    const esc = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return esc
      .replace(/(\/\/.*?$|\/\*[\s\S]*?\*\/)/gm, '<span class="tok-cmt">$1</span>')
      .replace(/(#[a-zA-Z_]+)/g, '<span class="tok-pre">$1</span>')
      .replace(/\b(void|int|float|double|bool|const|uint8_t|uint16_t|enum|if|else|for|while|return|sizeof|pinMode|ledcSetup|ledcAttachPin|ledcWrite|digitalWrite|analogRead|constrain|abs|delay|Serial|setup|loop)\b/g, '<span class="tok-kw">$1</span>')
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

  window.copyCurrentCode = function () {
    const sketch = sketches[currentSketchIndex];
    if (!sketch) return;
    navigator.clipboard.writeText(sketch.code).then(() => {
      showToast('Source copied to clipboard', 'success');
    }).catch(() => {
      showToast('Failed to copy code', 'error');
    });
  };

  // Initialize Code Studio Tab 0
  window.selectSketchTab(0);
})();
