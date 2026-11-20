# Big Hero 6ix - ECE 5 Line-Following Robot

**University of California, San Diego**  
**ECE 5: Making, Breaking, Hacking Stuff (Prof. Karcher Morris)**  
**Fall Quarter 2026 | Team: Big Hero 6ix**  
**Team Members:** Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj  
**Project Site:** [https://pareshprabhuraj.github.io/BIGHERO6IX/](https://pareshprabhuraj.github.io/BIGHERO6IX/)

---

## 1. Project Status & Current Milestone

**Current Milestone:** Challenge 2 - Line Following First Revision (Hardware IO Pin Integration)  
**Codebase State:** First revision committed (`Robot_LineFollower_Template/Robot_LineFollower_Template.ino`) with full physical ESP32-S3 pin mappings.

### What We Have Physically Completed So Far:
1. **Challenge 1A (Potentiometers):** Wired 4 rotary 10k potentiometers on a breadboard to analog input pins on the ESP32-S3 DevBoard. Verified live analog reads mapped from 0 to 100 on the Serial Monitor (`ESP32Potentiometer_Code.ino`).
2. **Challenge 1B (Photoresistors):** Built and calibrated a 7-channel CdS photoresistor (LDR) reflectance comb using 10k Ohm pull-down resistors in voltage divider circuits. Measured surface reflectance contrast between white poster board and black electrical tape (`ESP32Photoresistor_Code.ino`).
3. **Challenge 1C (Motor Driver Spin Test):** Wired our L298N dual H-bridge motor driver to an external 6xAA (9V) battery pack and two yellow 1:48 TT DC gear motors. Successfully ran our motor test sketch (`ESP32Motor_Driver_Code.ino`) to verify that both left and right motors spin forward, spin backward, and stop cleanly.
4. **Challenge 1D (Chassis CAD):** Modeled two functional chassis modifications in Onshape: a dedicated recessed slot to hold the ESP32-S3 board securely, and a diagonal cross-beam to prevent frame flex.
5. **Challenge 2 (Line Follower Rev 1.0):** Integrated physical pin assignments across all subsystems onto the chassis. Committed first revision line following firmware (`Robot_LineFollower_Template.ino`) ready for track calibration and PID algorithm tuning.

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
│   └── ESP32Motor_Driver_Code.ino            # Challenge 1C: L298N motor driver spin test (verified)
└── Robot_LineFollower_Template/
    └── Robot_LineFollower_Template.ino       # Challenge 2: Line following code (Revision 1.0)
```

---

## 3. Hardware Subsystems & Test Pinouts

### Challenge 2 Integrated Hardware Pinout (First Revision)
| Subsystem | Function | ESP32-S3 Pin | Role / Circuit Details |
| :--- | :--- | :--- | :--- |
| **Left Motor Speed (PWM)** | `ENA` | `IO42` | Hardware PWM signal to L298N driver |
| **Left Motor Dir 1** | `IN1` | `IO41` | Left motor direction logic pin 1 |
| **Left Motor Dir 2** | `IN2` | `IO40` | Left motor direction logic pin 2 |
| **Right Motor Speed (PWM)** | `ENB` | `IO37` | Hardware PWM signal to L298N driver |
| **Right Motor Dir 1** | `IN3` | `IO39` | Right motor direction logic pin 1 |
| **Right Motor Dir 2** | `IN4` | `IO38` | Right motor direction logic pin 2 |
| **LDR 0 (Far Left)** | `LDR_Pin[0]` | `IO8` | Left-to-right looking from rear of robot |
| **LDR 1 (Mid Left)** | `LDR_Pin[1]` | `IO7` | 10k Ohm pull-down voltage divider |
| **LDR 2 (Inner Left)** | `LDR_Pin[2]` | `IO6` | 10k Ohm pull-down voltage divider |
| **LDR 3 (Center)** | `LDR_Pin[3]` | `IO5` | Centerline reference sensor |
| **LDR 4 (Inner Right)** | `LDR_Pin[4]` | `IO4` | 10k Ohm pull-down voltage divider |
| **LDR 5 (Mid Right)** | `LDR_Pin[5]` | `IO3` | 10k Ohm pull-down voltage divider |
| **LDR 6 (Far Right)** | `LDR_Pin[6]` | `IO2` | Left-to-right looking from rear of robot |
| **Speed Trim Pot** | `S_pin` | `IO13` | Mapped 0-100 base motor speed |
| **$K_p$ Proportional Pot** | `P_pin` | `IO12` | Proportional steering gain |
| **$K_i$ Integral Pot** | `I_pin` | `IO11` | Steady-state error accumulation gain |
| **$K_d$ Derivative Pot** | `D_pin` | `IO10` | Steering oscillation damping gain |
| **Calibration Status LED** | `led_Pins[0]` | `IO46` | Visual indicator during calibration sweep |

---

## 4. Building and Flashing the Sketches

### Flashing the Line Following Code (`Robot_LineFollower_Template`)
1. Open `Robot_LineFollower_Template/Robot_LineFollower_Template.ino` in the Arduino IDE.
2. Select **Tools > Board > ESP32S3 Dev Module**.
3. Verify that the **L298NX2** library by Andrea Lombardo is installed in your Arduino library manager.
4. With battery power disconnected from the ESP32 5V pin, plug in the USB-C cable and click **Upload**.
5. Once uploaded:
   - For bench calibration and testing: set `#define PRINTALLDATA 1` to view live telemetry over Serial Monitor at 9600 baud.
   - For untethered track runs: set `#define PRINTALLDATA 0` to eliminate serial delay and enable the 200 Hz PID control loop.
   - Sweep the front bumper over the white poster board for 2 seconds (LED 46 flashes), then sweep over the black tape for 2 seconds (LED 46 flashes again).
   - Place on the track and observe line following. Use the 4 potentiometers to fine-tune Speed (IO13), Kp (IO12), Ki (IO11), and Kd (IO10) on the fly.

### Flashing the Motor Spin Test (`ESP32Motor_Driver_Code`)
1. Open `ESP32Motor_Driver_Code/ESP32Motor_Driver_Code.ino`.
2. Click **Upload**. After flashing, elevate the robot chassis so the wheels spin freely in the air, connect battery power, and observe:
   - Both motors spin forward for 3 seconds.
   - Both motors spin backward for 3 seconds.
   - Both motors stop for 3 seconds.

### Flashing Standalone Sensor & Potentiometer Calibration Sketches
- `ESP32Potentiometer_Code/ESP32Potentiometer_Code.ino`: Open Serial Monitor at 115200 baud to observe real-time mapped readings (0-100) as you turn each potentiometer.
- `ESP32Photoresistor_Code/ESP32Photoresistor_Code.ino`: Open Serial Monitor at 115200 baud to view raw ADC readings across all 7 photoresistors over light and dark surfaces.

### Lab Safety Reminders
- **Prevent Dual Power Back-Feeding:** Never connect the 6xAA battery pack to the ESP32 5V pin while the USB-C cable is connected to a computer. Disconnect the 5V jumper before plugging in USB.
- **Strain Relief:** Yellow TT DC motor solder tabs are fragile. Ensure hot glue is applied over the wire solder joints before testing wheel rotation.
- **Bench Safety:** Always place the robot on a stand or block so the wheels are off the table when testing motor driver code.
