# Big Hero 6ix - ECE 5 Autonomous Line-Following Robot

**University of California, San Diego**  
**ECE 5: Making, Breaking, Hacking Stuff (Prof. Karcher Morris)**  
**Fall Quarter 2026 | Team: Big Hero 6ix**  
**Team Members:** Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj  
**Project Site:** [https://pareshprabhuraj.github.io/BIGHERO6IX/](https://pareshprabhuraj.github.io/BIGHERO6IX/)

---

## 1. Project Overview

This repository contains the Arduino C++ firmware, circuit wiring diagrams, and project documentation for Team **Big Hero 6ix** in the UC San Diego ECE 5 Line-Following Robot project.

Target Hardware:
- **Microcontroller**: ESP32-S3 Dev Module (240 MHz dual-core, 12-bit ADC)
- **Motor Driver**: L298N Dual H-Bridge Driver
- **Sensors**: 7x CdS Photoresistor (LDR) optical reflectance array with 10k Ohm voltage dividers
- **Tuning Pots**: 4x 10k Ohm Rotary Potentiometers for real-time Speed, Kp, Ki, and Kd tuning
- **Power**: 6xAA Battery Pack (9.0V nominal) supplying the L298N high-current rail

---

## 2. Repository Structure

```
BIGHERO6IX/
├── README.md
├── docs/                                         # GitHub Pages project portfolio & code viewer
├── hardware/
│   └── ROBOT_HARDWARE_PINOUT_AND_WIRING.md       # Full BOM, electrical wiring & safety rules
├── ESP32Photoresistor_Code/
│   └── ESP32Photoresistor_Code.ino               # Challenge 1B: 7-LDR sensor array calibration
├── ESP32Potentiometer_Code/
│   └── ESP32Potentiometer_Code.ino               # Challenge 1A: 4-potentiometer real-time gain bank
├── ESP32Motor_Driver_Code/
│   └── ESP32Motor_Driver_Code.ino                # Challenge 1C: L298N dual H-bridge motor driver
├── Robot_LineFollower_Template/
│   └── Robot_LineFollower_Template.ino           # Base line follower starter template
└── ECE5_Robot_LineFollower_Production/
    └── ECE5_Robot_LineFollower_Production.ino    # Complete closed-loop line follower robot firmware
```

---

## 3. Hardware Pinout Table

### Challenge 1A: Potentiometer Control Bank
Used to tune gains dynamically without re-flashing firmware:
| Parameter | Function | ESP32-S3 Pin | Notes |
| :--- | :--- | :--- | :--- |
| **Speed** | Base PWM Speed (0-100) | `IO4` | Clockwise increases speed |
| **$K_p$** | Proportional Gain (0-100) | `IO3` | Controls steering aggressiveness |
| **$K_i$** | Integral Gain (0-100) | `IO2` | Eliminates steady-state curve offset |
| **$K_d$** | Derivative Gain (0-100) | `IO1` | Dampens oscillations / wobble |

### Challenge 1B: Photoresistor (LDR) Sensor Array
Arranged along the front sensor bar across the black electrical tape track:
| Sensor | Role | ESP32-S3 Pin | Circuit Tap |
| :--- | :--- | :--- | :--- |
| **LDR 0** | Far Left | `IO1` | Midpoint of LDR & 10k pull-down to GND |
| **LDR 1** | Mid Left | `IO2` | Midpoint of LDR & 10k pull-down to GND |
| **LDR 2** | Inner Left | `IO3` | Midpoint of LDR & 10k pull-down to GND |
| **LDR 3** | Center Alignment | `IO4` | Midpoint of LDR & 10k pull-down to GND |
| **LDR 4** | Inner Right | `IO5` | Midpoint of LDR & 10k pull-down to GND |
| **LDR 5** | Mid Right | `IO6` | Midpoint of LDR & 10k pull-down to GND |
| **LDR 6** | Far Right | `IO7` | Midpoint of LDR & 10k pull-down to GND |

### Challenge 1C: L298N Motor Driver Interface
*Important: Remove the onboard black jumpers from `ENA` and `ENB` before connecting PWM pins.*
| Driver Pin | ESP32-S3 Pin | Signal Role |
| :--- | :--- | :--- |
| `ENA` | `IO8` | Left Motor PWM Speed |
| `IN1` | `IO9` | Left Motor Direction 1 (HIGH = Forward) |
| `IN2` | `IO10` | Left Motor Direction 2 (LOW = Forward) |
| `IN3` | `IO11` | Right Motor Direction 1 (HIGH = Forward) |
| `IN4` | `IO12` | Right Motor Direction 2 (LOW = Forward) |
| `ENB` | `IO13` | Right Motor PWM Speed |

---

## 4. Compilation & Flashing Instructions

When compiling and flashing via Arduino IDE or `arduino-cli`:
1. **Board**: `ESP32S3 Dev Module`
2. **USB CDC On Boot**: `Enabled` (Mandatory for `Serial.print()` output over USB-C)
3. **Flash Mode**: `QIO 80MHz`
4. **Partition Scheme**: `Default 4MB with spiffs`
5. **Port**: Select the active `/dev/cu.usbmodem*` port

Command line flashing:
```bash
arduino-cli compile --fqbn esp32:esp32:esp32s3 --build-property "build.extra_flags=-DARDUINO_USB_CDC_ON_BOOT=1" <sketch_path>
arduino-cli upload -p <port> --fqbn esp32:esp32:esp32s3 <sketch_path>
```
