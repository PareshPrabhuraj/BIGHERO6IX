# ECE 5 Project 4: Robot Hardware BOM, Pinout & Interconnect Architecture
**Principal:** Paresh Prabhu Raj (PID: A19386710 | Section: ECE5_FA26_A00)  
**Course:** ECE 5 (Prof. Karcher Morris)  
**Target Platform:** ESP32-S3 Dev Board + L298N Dual H-Bridge Driver  

---

## 1. Complete System Bill of Materials (BOM)

| Component Description | Quantity | Designation / Role | Specifications / Electrical Characteristics |
| :--- | :--- | :--- | :--- |
| **ESP32-S3 Dev Board** | 1 | Microcontroller Core | 240 MHz dual-core, 12-bit ADC, USB-C programming interface |
| **L298N Dual H-Bridge Driver** | 1 | Motor Driver Board | Dual full-bridge, 2A peak per channel, onboard 5V regulator |
| **TT DC Gear Motors** | 2 | Differential Drive Actuators | 3V-6V rated, 1:48 gear ratio, 200 RPM at 6V unloaded |
| **Drive Wheels** | 2 | Traction Wheels | 65 mm outer diameter, high-friction silicone rubber tread |
| **Front Caster Assembly** | 1 | Passive Support | Omnidirectional ball caster, low-friction rolling pivot |
| **Photoresistors (LDR)** | 7 | Optical Reflectance Array | 5 mm CdS photoresistors, dark resistance >1M Ohm, light <10k Ohm |
| **Carbon Film Resistors** | 7 | Voltage Divider Reference | 10k Ohm, 1/4W, 5% tolerance (course standard for high sensitivity) |
| **Rotary Potentiometers** | 4 | Real-Time Parameter Trimpots | 10k Ohm linear taper, breadboard-friendly pin spacing |
| **6xAA Battery Pack** | 1 | Mobile DC Power Source | 9.0V nominal (6x 1.5V alkaline AA cells), standard barrel / lead wires |
| **3D Printed Chassis** | 1 | Electromechanical Frame | Initial baseline frame in black PLA (must be returned at quarter end) |
| **Half-Size Breadboards** | 2 | Solderless Prototyping | Dual bus rails, isolated tie points for LDR array and pot bank |
| **Jumper Wire Set** | 40+ | Interconnect Harness | M-M and M-F flexible jumpers for board and driver routing |

---

## 2. Microcontroller Pin Mapping Table (ESP32-S3)

All pin designations are mapped to ADC1 channels to avoid conflict with Wi-Fi / core peripherals.

| Subsystem | Function Name | ESP32-S3 Pin | Direction | Electrical Interface / Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Potentiometers** | Speed Trim | `IO47` | Analog Input | 12-bit ADC, maps 0-4095 to base forward speed (0-100 scale) |
| | Proportional Gain ($K_p$) | `IO35` | Analog Input | 12-bit ADC, maps 0-4095 to proportional constant scaling |
| | Integral Gain ($K_i$) | `IO39` | Analog Input | 12-bit ADC, maps 0-4095 to integral constant scaling |
| | Derivative Gain ($K_d$) | `IO42` | Analog Input | 12-bit ADC, maps 0-4095 to derivative constant scaling |
| **LDR Sensor Array** | Photoresistor 0 (Far Left) | `IO1` | Analog Input | Voltage divider tap with 10k resistor to GND |
| | Photoresistor 1 (Mid Left) | `IO2` | Analog Input | Voltage divider tap with 10k resistor to GND |
| | Photoresistor 2 (Inner Left) | `IO3` | Analog Input | Voltage divider tap with 10k resistor to GND |
| | Photoresistor 3 (Center) | `IO4` | Analog Input | Center alignment reference |
| | Photoresistor 4 (Inner Right) | `IO5` | Analog Input | Voltage divider tap with 10k resistor to GND |
| | Photoresistor 5 (Mid Right) | `IO6` | Analog Input | Voltage divider tap with 10k resistor to GND |
| | Photoresistor 6 (Far Right) | `IO7` | Analog Input | Voltage divider tap with 10k resistor to GND |
| **L298N Motor Driver** | Left Motor PWM (`ENA`) | `IO8` | Digital Output | PWM speed control for Left Motor (remove jumper) |
| | Left Motor Dir 1 (`IN1`) | `IO9` | Digital Output | Logic HIGH for forward rotation |
| | Left Motor Dir 2 (`IN2`) | `IO10` | Digital Output | Logic LOW for forward rotation |
| | Right Motor Dir 1 (`IN3`) | `IO11` | Digital Output | Logic HIGH for forward rotation |
| | Right Motor Dir 2 (`IN4`) | `IO12` | Digital Output | Logic LOW for forward rotation |
| | Right Motor PWM (`ENB`) | `IO13` | Digital Output | PWM speed control for Right Motor (remove jumper) |

---

## 3. Power Distribution and Electrical Grounding

### A. Power Rails and Voltage Boundaries
1. **Motor High-Current Rail (9.0V Nominal):**
   - Supplied directly from the 6xAA battery pack.
   - Connected strictly to the **12V** screw terminal on the L298N module.
   - *Course Warning:* The L298N terminal is labelled "12V", but it accepts 7V-12V DC input. Do NOT connect 9V to the 5V terminal.
2. **Common System Ground (0V Reference):**
   - Battery negative lead connects to L298N `GND` screw terminal.
   - Jumper wire connects L298N `GND` terminal to ESP32 `GND` pin.
   - All breadboard ground buses tie directly into this single common reference.
3. **Logic Rail (3.3V Regulated):**
   - Supplied from the ESP32 onboard low-dropout (LDO) regulator.
   - Powers the 4 potentiometers and the pull-up sides of the 7 LDR dividers.

### B. Critical Safety and Isolation Invariant
> [!CAUTION]
> **STRICT DUAL POWER PREVENTION:** Never connect the ESP32 to a computer via USB while the 9V battery pack is powering the ESP32 5V pin.
> - When programming or running serial diagnostics: Disconnect the 5V jumper wire between L298N and ESP32.
> - When running untethered track tests: Unplug the USB cable, verify the chassis switch is OFF, reconnect the 5V wire from L298N to ESP32, then switch battery power ON.

---

## 4. Mechanical & Assembly Directives

1. **Soldering Moratorium:** No sensor or potentiometer pins may be soldered prior to submitting the Challenge 3 line-following video. All connections must remain on solderless breadboards for agile pin re-allocation.
2. **Motor Lead Strain Relief:** Solder flexible stranded jumper leads to the two motor tabs. Immediately encapsulate the tabs with hot glue to prevent the fragile copper solder lugs from breaking under chassis vibration.
3. **Photoresistor Array Geometry:**
   - Mount all 7 LDRs in a straight horizontal line across the front bumper breadboard.
   - Center-to-center pitch: exactly 8 mm to 10 mm.
   - Ground clearance: maintain exactly 5 mm to 8 mm above the track surface.
4. **Optical Light Shield:** Fabricate a cardboard or 3D printed opaque skirt enclosing the sensor bank to reject ceiling fluorescent ambient lighting.
