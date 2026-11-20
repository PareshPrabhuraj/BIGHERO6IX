# ECE 5 Project 4: Robot Hardware BOM, Pinout and Wiring Guide

**Team:** Big Hero 6ix (Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj)  
**Course:** UC San Diego ECE 5 (Prof. Karcher Morris) - Fall Quarter 2026  
**Platform:** ESP32-S3 Dev Module + L298N Dual H-Bridge Motor Driver  
**Current Milestone:** Hardware Bring-Up & Motor Validation (Challenge 1C Complete; Line Following Code Planned for Challenge 2)  

---

## 1. System Bill of Materials (BOM)

| Component | Quantity | Role on Robot | Notes and Lab Specs |
| :--- | :--- | :--- | :--- |
| **ESP32-S3 Dev Board** | 1 | Microcontroller | Dual-core 240 MHz, 12-bit ADC, USB-C interface for code uploads and serial debugging |
| **L298N Dual H-Bridge Driver** | 1 | Motor Driver | Drives left and right DC motors; remove jumpers on ENA and ENB for PWM speed control |
| **TT DC Gear Motors** | 2 | Drive Motors | Yellow hobby gear motors (1:48 gear ratio, 3V-6V rated) |
| **Drive Wheels** | 2 | Main Wheels | 65 mm rubber wheels pressed directly onto the motor output shafts |
| **Front Ball Caster** | 1 | Balance and Pivot | Omnidirectional ball caster mounted under the front chassis plate |
| **CdS Photoresistors (LDR)** | 7 | Line Tracking Sensors | 5 mm photoresistors mounted facing downward; dark > 1M Ohm, light < 10k Ohm |
| **Carbon Film Resistors (10k Ohm)** | 7 | Voltage Divider Pull-Downs | 1/4W 5% resistors connected between sensor taps and ground |
| **Rotary Potentiometers (10k Ohm)** | 4 | Gain Tuning Bank | Breadboard trimpots for tuning Speed, Kp, Ki, and Kd directly on the track |
| **6xAA Battery Pack** | 1 | Motor Power Supply | 9.0V nominal (6 standard 1.5V AA cells) wired to L298N power terminal |
| **3D-Printed Chassis** | 1 | Structural Frame | Standard ECE 5 lab chassis holding motors, caster, and battery pack |
| **Half-Size Solderless Breadboards** | 2 | Circuit Prototyping | One mounted across front for LDR comb; one on top for ESP32 and potentiometers |
| **Jumper Wires** | 40+ | Interconnects | Male-to-male and male-to-female jumper wires for breadboard and motor driver pins |

---

## 2. ESP32-S3 Pin Mapping Tables

### A. Challenge 1C Motor Driver Test Pinout (Current Verified State)
Tested with `ESP32Motor_Driver_Code.ino` to verify both DC gear motors spin forward, backward, and stop:
| Function | Motor Driver Pin | ESP32-S3 Test Pin | Notes |
| :--- | :--- | :--- | :--- |
| Left Motor Speed (PWM) | `ENA` | `IO42` | PWM speed signal from ESP32 |
| Left Motor In 1 | `IN1` | `IO41` | Direction logic pin 1 |
| Left Motor In 2 | `IN2` | `IO40` | Direction logic pin 2 |
| Right Motor Speed (PWM) | `ENB` | `IO37` | PWM speed signal from ESP32 |
| Right Motor In 3 | `IN3` | `IO39` | Direction logic pin 1 |
| Right Motor In 4 | `IN4` | `IO38` | Direction logic pin 2 |

### B. Challenge 2 Integrated Hardware Pinout (First Revision)
When all circuits are mounted to the chassis for Challenge 2 line following, the physical pins wired on the robot are mapped as follows:

| Subsystem | Function Name | ESP32-S3 Pin | Direction | Circuit Details and Notes |
| :--- | :--- | :--- | :--- | :--- |
| **L298N Motor Driver** | Left Motor PWM (`ENA`) | `IO42` | Digital Out | Hardware PWM speed signal for Left Motor (retains Ch 1C wiring) |
| | Left Motor Dir 1 (`IN1`) | `IO41` | Digital Out | Left motor direction logic pin 1 |
| | Left Motor Dir 2 (`IN2`) | `IO40` | Digital Out | Left motor direction logic pin 2 |
| | Right Motor PWM (`ENB`) | `IO37` | Digital Out | Hardware PWM speed signal for Right Motor (retains Ch 1C wiring) |
| | Right Motor Dir 1 (`IN3`) | `IO39` | Digital Out | Right motor direction logic pin 1 |
| | Right Motor Dir 2 (`IN4`) | `IO38` | Digital Out | Right motor direction logic pin 2 |
| **LDR Sensor Comb** | LDR 0 (Far Left) | `IO8` | Analog In | Left-to-right looking from rear (robot oriented with sensors forward) |
| | LDR 1 (Mid Left) | `IO7` | Analog In | 10k Ohm pull-down divider midpoint to GND |
| | LDR 2 (Inner Left) | `IO6` | Analog In | 10k Ohm pull-down divider midpoint to GND |
| | LDR 3 (Center) | `IO5` | Analog In | Centerline tracking reference |
| | LDR 4 (Inner Right) | `IO4` | Analog In | 10k Ohm pull-down divider midpoint to GND |
| | LDR 5 (Mid Right) | `IO3` | Analog In | 10k Ohm pull-down divider midpoint to GND |
| | LDR 6 (Far Right) | `IO2` | Analog In | Left-to-right looking from rear (robot oriented with sensors forward) |
| **Potentiometers** | Speed Trim (`S_pin`) | `IO13` | Analog In | Reads 0-4095; maps to nominal speed (0-100 scale) |
| | Proportional Gain ($K_p$, `P_pin`) | `IO12` | Analog In | Reads 0-4095; scales proportional steering response |
| | Integral Gain ($K_i$, `I_pin`) | `IO11` | Analog In | Reads 0-4095; scales integral error accumulation |
| | Derivative Gain ($K_d$, `D_pin`) | `IO10` | Analog In | Reads 0-4095; dampens steering oscillations |
| **Status Indicator** | Calibration LED (`led_Pins`) | `IO46` | Digital Out | Visual feedback during White/Black calibration routines |

*Hardware Architecture Note:* The integrated line follower retains the exact L298N motor driver wiring tested in Challenge 1C (pins IO37-IO42), allocates analog pins IO8 down to IO2 to the 7-sensor photoresistor comb (oriented left-to-right from rear as IO8 to IO2), and remaps the 4 gain tuning potentiometers to pins IO10-IO13.

---

## 3. Circuit Schematics and Wiring Notes

### A. Photoresistor Voltage Divider Circuit
Each of the 7 photoresistors forms an analog voltage divider with a 10k Ohm carbon film resistor:
- **Top Rail:** 3.3V from the ESP32 `3V3` pin connects to one lead of the photoresistor.
- **Midpoint Tap:** The connection between the other photoresistor lead and the 10k Ohm resistor goes directly to the designated ESP32 analog pin (`IO1` through `IO7`).
- **Bottom Rail:** The remaining lead of the 10k Ohm resistor connects to the common breadboard ground rail (`GND`).

**Voltage Behavior:**
- When a sensor is over the **white background**, light reflectance is high, photoresistor resistance drops (under 10k Ohm), and the midpoint voltage rises toward 3.3V (higher ADC reading).
- When a sensor is over the **black electrical tape**, light reflectance is low, photoresistor resistance increases (well above 100k Ohm), and the midpoint voltage drops toward ground (lower ADC reading).

### B. Potentiometer Wiring
For each 10k Ohm rotary potentiometer:
- **Pin 1 (Outer):** Connected to the 3.3V power bus rail.
- **Pin 2 (Wiper / Center):** Connected to the respective analog pin (`IO47`, `IO35`, `IO39`, `IO42`).
- **Pin 3 (Outer):** Connected to the common ground bus rail (`GND`).

Turning the knob clockwise increases the wiper voltage from 0V to 3.3V (0 to 4095 on the 12-bit ADC).

---

## 4. Power Distribution and Grounding Architecture

### A. Power Rails
1. **Motor Power Rail (9.0V Nominal):**
   - The red lead from the 6xAA battery pack connects to the screw terminal marked **12V** on the L298N board.
   - *Course Note:* The L298N terminal is labelled "12V", but its onboard regulator accepts 7V to 12V DC input. Connecting 9V here is the standard ECE 5 lab configuration. Never connect 9V into the 5V terminal.
2. **Common Ground (0V Reference):**
   - The black lead from the 6xAA battery pack connects to the L298N `GND` screw terminal.
   - A jumper wire connects the L298N `GND` terminal to an ESP32 `GND` pin.
   - All breadboard ground buses tie directly into this common ground.
3. **Logic Rail (3.3V Regulated):**
   - Output from the ESP32 onboard 3.3V regulator (`3V3` pin).
   - Powers the 4 potentiometers and the high side of the 7 LDR voltage dividers.

### B. Critical Safety Rule: Avoid Simultaneous USB and Battery Power
**Caution:** Never connect the ESP32 to a computer USB port while the L298N 5V output wire is plugged into the ESP32 5V pin.
- **When programming or running serial diagnostics:** Unplug the 5V jumper wire running from the L298N driver to the ESP32 board. Power the ESP32 solely via the USB-C cable from your laptop.
- **When running untethered track tests:** Disconnect the USB-C cable completely. Verify the battery pack power switch is OFF, reconnect the 5V jumper wire from the L298N to the ESP32 5V pin, place the robot on the track, and turn the battery switch ON.

---

## 5. Mechanical Assembly and Lab Tips

1. **TT Motor Tab Strain Relief:**
   - The copper solder tabs on the yellow TT motors are thin and snap easily under vibration or repeated wire bending.
   - Solder stranded jumper wires to the tabs, then apply a drop of hot glue over each solder joint and the motor casing to act as strain relief.
2. **Photoresistor Comb Alignment:**
   - Place all 7 photoresistors in a neat, straight row across the front breadboard.
   - Maintain a uniform pitch of roughly 8 mm to 10 mm between neighboring sensor heads so the comb spans the width of the black tape.
   - Ensure the bottom faces of the LDRs sit approximately 5 mm to 8 mm above the floor for clean optical contrast.
3. **Ambient Light Shielding:**
   - The fluorescent ceiling lights in the ECE 5 lab and EnVision MakerStudio can cause glare on the track.
   - Cut a small cardstock or black paper skirt and tape it around the front sensor comb to shield the sensors from ambient overhead lighting.
4. **Wire Dressing:**
   - Keep breadboard jumpers neatly trimmed and pressed flat against the chassis plates. Loose dangling wires can rub against the rubber drive wheels and throw off steering balance.
