# Big Hero 6ix - ECE 5 Line-Following Robot

**University of California, San Diego**  
**ECE 5: Making, Breaking, Hacking Stuff (Prof. Karcher Morris)**  
**Fall Quarter 2026 | Team: Big Hero 6ix**  
**Team Members:** Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj  
**Project Site:** [https://pareshprabhuraj.github.io/BIGHERO6IX/](https://pareshprabhuraj.github.io/BIGHERO6IX/)

---

## 1. Project Status & Current Milestone

**Current Milestone:** Hardware Bring-Up & Motor Validation (Challenge 1C Complete)  
**Next Milestone:** Challenge 2 - Full Chassis Integration & Line Following Implementation

### What We Have Physically Completed So Far:
1. **Challenge 1A (Potentiometers):** Wired 4 rotary 10k potentiometers on a breadboard to analog input pins on the ESP32-S3 DevBoard. Verified live analog reads mapped from 0 to 100 on the Serial Monitor (`ESP32Potentiometer_Code.ino`).
2. **Challenge 1B (Photoresistors):** Built and calibrated a 7-channel CdS photoresistor (LDR) reflectance comb using 10k Ohm pull-down resistors in voltage divider circuits. Measured surface reflectance contrast between white poster board and black electrical tape (`ESP32Photoresistor_Code.ino`).
3. **Challenge 1C (Motor Driver Spin Test):** Wired our L298N dual H-bridge motor driver to an external 6xAA (9V) battery pack and two yellow 1:48 TT DC gear motors. Successfully ran our motor test sketch (`ESP32Motor_Driver_Code.ino`) to verify that both left and right motors spin forward, spin backward, and stop cleanly.
4. **Challenge 1D (Chassis CAD):** Modeled two functional chassis modifications in Onshape: a dedicated recessed slot to hold the ESP32-S3 board securely, and a diagonal cross-beam to prevent frame flex.

### Current Project State & Next Steps:
Physically, we have completed bench testing our sensor dividers, potentiometers, and motor driver. Both DC motors are confirmed spinning under driver control. **We have not yet implemented or tested the closed-loop line following steering code.** Our next step for Challenge 2 is to mount all subsystems onto the 3D-printed chassis and build out the line tracking algorithm starting from `Robot_LineFollower_Template.ino`.

---

## 2. Repository Layout

```
BIGHERO6IX/
├── README.md                                 # Project status, hardware pinouts, and test instructions
├── docs/                                     # GitHub Pages project showcase and lab documentation
├── hardware/
│   └── ROBOT_HARDWARE_PINOUT_AND_WIRING.md   # Circuit wiring, BOM, and motor driver pinouts
├── ESP32Potentiometer_Code/
│   └── ESP32Potentiometer_Code.ino           # Challenge 1A: 4-potentiometer tuning bank test
├── ESP32Photoresistor_Code/
│   └── ESP32Photoresistor_Code.ino           # Challenge 1B: 7-LDR sensor array calibration test
├── ESP32Motor_Driver_Code/
│   └── ESP32Motor_Driver_Code.ino            # Challenge 1C: L298N motor driver spin test (current state)
└── Robot_LineFollower_Template/
    └── Robot_LineFollower_Template.ino       # Course starter template for upcoming Challenge 2
```

---

## 3. Hardware Subsystems & Test Pinouts

### Challenge 1A: Standalone Potentiometer Breadboard Test
During Challenge 1A bench testing, the 4 potentiometers were wired to pins IO1 through IO4 to verify analog reads:
| Parameter | Function | Standalone Lab Pin | Notes |
| :--- | :--- | :--- | :--- |
| **Speed** | Base Motor Speed (0-100) | `IO4` | Clockwise increases nominal forward PWM |
| **$K_p$** | Proportional Gain (0-100) | `IO3` | Adjusts turning response to current error |
| **$K_i$** | Integral Gain (0-100) | `IO2` | Corrects steady-state drift on wide turns |
| **$K_d$** | Derivative Gain (0-100) | `IO1` | Dampens oscillations and reduces wobble |

### Challenge 1B: 7-Photoresistor (LDR) Reflectance Array
The 7 sensors use 10k Ohm resistors to GND to form voltage dividers:
| Sensor | Position on Bumper | Standalone Lab Pin | Notes |
| :--- | :--- | :--- | :--- |
| **LDR 0** | Far Left | `IO1` | Higher reading on dark line, lower on white board |
| **LDR 1** | Mid Left | `IO2` | Calibrated ground clearance: 4-5 mm |
| **LDR 2** | Inner Left | `IO3` | 10k Ohm pull-down resistor to GND |
| **LDR 3** | Center | `IO4` | Centerline reference sensor |
| **LDR 4** | Inner Right | `IO5` | 10k Ohm pull-down resistor to GND |
| **LDR 5** | Mid Right | `IO6` | Calibrated ground clearance: 4-5 mm |
| **LDR 6** | Far Right | `IO7` | Higher reading on dark line, lower on white board |

### Challenge 1C: L298N Motor Driver Spin Test (Current Verified State)
Tested with `ESP32Motor_Driver_Code.ino` using the `L298NX2` Arduino library:
| Function | Motor Driver Pin | ESP32-S3 Lab Test Pin | Description |
| :--- | :--- | :--- | :--- |
| Left Motor Speed (PWM) | `ENA` | `IO42` | Controls left motor speed |
| Left Motor In 1 | `IN1` | `IO41` | Left motor direction pin 1 |
| Left Motor In 2 | `IN2` | `IO40` | Left motor direction pin 2 |
| Right Motor Speed (PWM) | `ENB` | `IO37` | Controls right motor speed |
| Right Motor In 3 | `IN3` | `IO39` | Right motor direction pin 1 |
| Right Motor In 4 | `IN4` | `IO38` | Right motor direction pin 2 |

*Note: For final full integration (Challenge 2), motor driver control pins are planned for IO8-IO13 so pins IO1-IO7 remain dedicated to the 7 LDR sensor array.*

---

## 4. Building and Flashing the Test Sketches

### Flashing the Motor Spin Test (`ESP32Motor_Driver_Code`)
1. Open the Arduino IDE and ensure the **ESP32 by Espressif** board package is installed.
2. Under **Tools > Board**, select **ESP32S3 Dev Module**.
3. Install the **L298NX2** library via **Tools > Manage Libraries...** (search `L298NX2` by Andrea Lombardo).
4. Connect the ESP32-S3 via USB-C (ensure battery power to the ESP32 5V rail is disconnected while USB is connected).
5. Open `ESP32Motor_Driver_Code/ESP32Motor_Driver_Code.ino`.
6. Click **Upload**. After flashing, elevate the robot chassis so the wheels spin freely in the air, connect battery power, and observe:
   - Both motors spin forward for 3 seconds.
   - Both motors spin backward for 3 seconds.
   - Both motors stop for 3 seconds.

### Flashing Sensor & Potentiometer Calibration Sketches
- `ESP32Potentiometer_Code/ESP32Potentiometer_Code.ino`: Open Serial Monitor at 115200 baud to observe real-time mapped readings (0-100) as you turn each potentiometer.
- `ESP32Photoresistor_Code/ESP32Photoresistor_Code.ino`: Open Serial Monitor at 115200 baud to view raw ADC readings across all 7 photoresistors over light and dark surfaces.

### Lab Safety Reminders
- **Prevent Dual Power Back-Feeding:** Never connect the 6xAA battery pack to the ESP32 5V pin while the USB-C cable is connected to a computer. Disconnect the 5V jumper before plugging in USB.
- **Strain Relief:** Yellow TT DC motor solder tabs are fragile. Ensure hot glue is applied over the wire solder joints before testing wheel rotation.
- **Bench Safety:** Always place the robot on a stand or block so the wheels are off the table when testing motor driver code.
