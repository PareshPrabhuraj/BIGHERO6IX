# ECE 5 Project 4: Robot Hardware BOM, Pinout and Wiring Guide

**Team:** Big Hero 6ix (Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj)  
**Course:** UC San Diego ECE 5 (Prof. Karcher Morris) - Fall Quarter 2026  
**Platform:** ESP32-S3 Dev Module + L298N Dual H-Bridge Motor Driver  

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

## 2. ESP32-S3 Pin Mapping Table

All analog inputs are connected to ESP32-S3 ADC1 channels to ensure reliable `analogRead()` readings during operation.

| Subsystem | Function Name | ESP32-S3 Pin | Direction | Circuit Details and Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Potentiometers** | Speed Trim | `IO47` | Analog In | Reads 0-4095; maps to nominal forward PWM (20-200) |
| | Proportional Gain ($K_p$) | `IO35` | Analog In | Reads 0-4095; scales steering correction relative to line error |
| | Integral Gain ($K_i$) | `IO39` | Analog In | Reads 0-4095; scales error accumulation over time |
| | Derivative Gain ($K_d$) | `IO42` | Analog In | Reads 0-4095; dampens rapid steering oscillation |
| **LDR Sensor Comb** | LDR 0 (Far Left) | `IO1` | Analog In | Midpoint between top LDR lead (3.3V) and 10k resistor to GND |
| | LDR 1 (Mid Left) | `IO2` | Analog In | Midpoint between top LDR lead (3.3V) and 10k resistor to GND |
| | LDR 2 (Inner Left) | `IO3` | Analog In | Midpoint between top LDR lead (3.3V) and 10k resistor to GND |
| | LDR 3 (Center) | `IO4` | Analog In | Aligned with black line when robot is centered |
| | LDR 4 (Inner Right) | `IO5` | Analog In | Midpoint between top LDR lead (3.3V) and 10k resistor to GND |
| | LDR 5 (Mid Right) | `IO6` | Analog In | Midpoint between top LDR lead (3.3V) and 10k resistor to GND |
| | LDR 6 (Far Right) | `IO7` | Analog In | Midpoint between top LDR lead (3.3V) and 10k resistor to GND |
| **L298N Motor Driver** | Left Motor PWM (`ENA`) | `IO8` | Digital Out | PWM speed control signal for left motor (remove onboard jumper) |
| | Left Motor Dir 1 (`IN1`) | `IO9` | Digital Out | Logic HIGH for forward rotation |
| | Left Motor Dir 2 (`IN2`) | `IO10` | Digital Out | Logic LOW for forward rotation |
| | Right Motor Dir 1 (`IN3`) | `IO11` | Digital Out | Logic HIGH for forward rotation |
| | Right Motor Dir 2 (`IN4`) | `IO12` | Digital Out | Logic LOW for forward rotation |
| | Right Motor PWM (`ENB`) | `IO13` | Digital Out | PWM speed control signal for right motor (remove onboard jumper) |

*Note on Challenge 1A standalone test:* In the initial breadboard potentiometer lab prior to assembling the sensor comb, pots were wired to pins IO4 (Speed), IO3 (Kp), IO2 (Ki), and IO1 (Kd). In the final robot assembly, those pins are remapped to IO47, IO35, IO39, and IO42 so pins IO1 through IO7 can be used exclusively for the 7 photoresistors.

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
