# Big Hero 6ix - ECE 5 Line-Following Robot

**University of California, San Diego**  
**ECE 5: Making, Breaking, Hacking Stuff (Prof. Karcher Morris)**  
**Fall Quarter 2026 | Team: Big Hero 6ix**  
**Team Members:** Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj  
**Project Site:** [https://pareshprabhuraj.github.io/BIGHERO6IX/](https://pareshprabhuraj.github.io/BIGHERO6IX/)

---

## 1. Project Overview

This repository contains the Arduino firmware, circuit wiring diagrams, and lab documentation for Team **Big Hero 6ix** in UC San Diego ECE 5 (Project 4: Line-Following Robot).

Our robot uses differential drive steering to follow a black electrical tape track on a white surface. The system runs on an ESP32-S3 microcontroller, reading a 7-photoresistor sensor comb across the front bumper and driving two DC gear motors through an L298N dual H-bridge motor driver. Four potentiometers on the top breadboard let us tune base speed and PID control gains directly on the track without re-flashing code over USB.

### Robot Hardware Summary:
- **Microcontroller:** ESP32-S3 Dev Module (dual-core, 12-bit ADC, USB-C)
- **Motor Driver:** L298N Dual H-Bridge Driver module (jumpers removed on ENA and ENB for PWM speed control)
- **Motors & Chassis:** Two yellow 1:48 TT DC gear motors with 65 mm rubber wheels, front ball caster, and 3D-printed chassis
- **Track Sensors:** 7 CdS photoresistors (LDRs) in a front-mounted sensor comb with 10k Ohm voltage divider resistors to GND
- **Tuning Potentiometers:** 4 rotary 10k Ohm potentiometers for live Speed, Kp, Ki, and Kd gain adjustments
- **Power:** 6xAA battery pack (9.0V nominal) powering the L298N motor driver rail, with onboard 5V regulator powering the ESP32 during untethered track runs

---

## 2. Repository Layout

```
BIGHERO6IX/
├── README.md                                 # Project overview, pinouts, and build instructions
├── docs/                                     # GitHub Pages site and lab documentation
├── hardware/
│   └── ROBOT_HARDWARE_PINOUT_AND_WIRING.md   # Complete BOM, breadboard wiring, and power safety rules
├── ESP32Potentiometer_Code/
│   └── ESP32Potentiometer_Code.ino           # Challenge 1A: 4-potentiometer tuning bank test
├── ESP32Photoresistor_Code/
│   └── ESP32Photoresistor_Code.ino           # Challenge 1B: 7-LDR sensor array calibration test
├── ESP32Motor_Driver_Code/
│   └── ESP32Motor_Driver_Code.ino            # Challenge 1C: L298N motor driver test
├── Robot_LineFollower_Template/
│   └── Robot_LineFollower_Template.ino       # Course starter template code
└── ECE5_Robot_LineFollower_Production/
    └── ECE5_Robot_LineFollower_Production.ino # Complete competition robot firmware with live PID tuning
```

---

## 3. Hardware Pinout Tables

### Challenge 1A: Standalone Potentiometer Breadboard Test
During the initial Challenge 1A lab bench exercise, the 4 potentiometers were wired to pins IO1 through IO4 to verify analog reads:
| Parameter | Function | Standalone Lab Pin | Notes |
| :--- | :--- | :--- | :--- |
| **Speed** | Base Motor Speed (0-100) | `IO4` | Clockwise increases nominal forward PWM |
| **$K_p$** | Proportional Gain (0-100) | `IO3` | Adjusts turning response to current error |
| **$K_i$** | Integral Gain (0-100) | `IO2` | Corrects steady-state drift on wide turns |
| **$K_d$** | Derivative Gain (0-100) | `IO1` | Dampens oscillations and reduces wobble |

### Final Robot Production Pinout
On the assembled robot, the 7 LDRs take pins IO1 through IO7, so the 4 potentiometers are moved to ADC1 pins IO47, IO35, IO39, and IO42:

#### Potentiometers (Gain Bank)
| Parameter | Function | Production Pin | Mapping Range |
| :--- | :--- | :--- | :--- |
| **Speed** | Nominal Forward Speed | `IO47` | Mapped to PWM 20-200 |
| **$K_p$** | Proportional Gain | `IO35` | Scaled for steering turn differential |
| **$K_i$** | Integral Gain | `IO39` | Scaled with anti-windup clamp |
| **$K_d$** | Derivative Gain | `IO42` | Scaled for rate-of-change damping |

#### Photoresistor (LDR) Sensor Comb
The 7 sensors are mounted side-by-side along the front bumper breadboard across the black tape track:
| Sensor | Position on Bumper | ESP32-S3 Pin | Circuit Connection |
| :--- | :--- | :--- | :--- |
| **LDR 0** | Far Left | `IO1` | Midpoint between LDR and 10k resistor to GND |
| **LDR 1** | Mid Left | `IO2` | Midpoint between LDR and 10k resistor to GND |
| **LDR 2** | Inner Left | `IO3` | Midpoint between LDR and 10k resistor to GND |
| **LDR 3** | Center | `IO4` | Midpoint between LDR and 10k resistor to GND |
| **LDR 4** | Inner Right | `IO5` | Midpoint between LDR and 10k resistor to GND |
| **LDR 5** | Mid Right | `IO6` | Midpoint between LDR and 10k resistor to GND |
| **LDR 6** | Far Right | `IO7` | Midpoint between LDR and 10k resistor to GND |

#### L298N Motor Driver Connections
*Note: Remove the factory black jumpers on ENA and ENB so the ESP32 can send analogWrite PWM signals.*
| Driver Pin | ESP32-S3 Pin | Function |
| :--- | :--- | :--- |
| `ENA` | `IO8` | Left motor PWM speed |
| `IN1` | `IO9` | Left motor direction 1 (HIGH for forward) |
| `IN2` | `IO10` | Left motor direction 2 (LOW for forward) |
| `IN3` | `IO11` | Right motor direction 1 (HIGH for forward) |
| `IN4` | `IO12` | Right motor direction 2 (LOW for forward) |
| `ENB` | `IO13` | Right motor PWM speed |

---

## 4. Building and Flashing the Code

### Using the Arduino IDE
1. Open the Arduino IDE and install the ESP32 board package by Espressif (`esp32` version 2.0.x or 3.x).
2. Under **Tools > Board**, select **ESP32S3 Dev Module**.
3. Set the following board settings:
   - **USB CDC On Boot:** `Enabled` (required to see `Serial.print()` output in the Serial Monitor)
   - **Flash Mode:** `QIO 80MHz`
   - **Partition Scheme:** `Default 4MB with spiffs`
   - **Upload Speed:** `921600`
4. Select the serial port matching your USB-C cable (for example `/dev/cu.usbmodem*` on macOS).
5. Open `ECE5_Robot_LineFollower_Production/ECE5_Robot_LineFollower_Production.ino` and click **Upload**.

### Using the Command Line (`arduino-cli`)
```bash
# Compile with USB CDC enabled (ESP32-S3 board option CDCOnBoot=cdc)
arduino-cli compile --fqbn esp32:esp32:esp32s3:CDCOnBoot=cdc ECE5_Robot_LineFollower_Production

# Upload to the ESP32-S3
arduino-cli upload -p /dev/cu.usbmodem* --fqbn esp32:esp32:esp32s3:CDCOnBoot=cdc ECE5_Robot_LineFollower_Production
```

### Lab Safety Reminders
- **Disconnect the 5V power wire** from the L298N to the ESP32 before plugging the ESP32 into a computer USB port. Having battery power and USB power connected simultaneously can damage your computer port or the board regulator.
- When ready for track testing: unplug the USB cable, set the robot on the starting line, reconnect the 5V jumper, and turn on the battery pack switch.
