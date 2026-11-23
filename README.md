# Big Hero 6ix

ECE 5 Line-Following Robot at UC San Diego (Prof. Karcher Morris).

- **Team Members:** Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj
- **Project Site:** [https://pareshprabhuraj.github.io/BIGHERO6IX/](https://pareshprabhuraj.github.io/BIGHERO6IX/)

---

## Hardware Pinout (ESP32-S3)

| Subsystem | Pin | Details |
| :--- | :--- | :--- |
| **Left Motor (L298N)** | `IO42` (ENA), `IO41` (IN1), `IO40` (IN2) | PWM speed + direction logic |
| **Right Motor (L298N)** | `IO37` (ENB), `IO39` (IN3), `IO38` (IN4) | PWM speed + direction logic |
| **Photoresistors (LDR)** | `IO8, IO7, IO6, IO5, IO4, IO3, IO2` | Left to right sensor array |
| **Potentiometers** | `IO13` (Speed), `IO12` (Kp), `IO11` (Ki), `IO10` (Kd) | Real-time tuning deck |
| **Indicator LED** | `IO46` | Calibration status |

---

## Repository Structure

- `Robot_LineFollower_Template/`: Integrated PID line-following sketch
- `ESP32Motor_Driver_Code/`: Motor driver direction and PWM spin test
- `ESP32Photoresistor_Code/`: 7-LDR sensor array calibration test
- `ESP32Potentiometer_Code/`: 4-potentiometer gain tuning test
- `docs/`: GitHub Pages project website
- `hardware/`: Wiring notes and bill of materials

---

## Uploading Firmware

1. Open `Robot_LineFollower_Template/Robot_LineFollower_Template.ino` in Arduino IDE.
2. Target Board: **ESP32S3 Dev Module**.
3. Library dependency: **L298NX2** by Andrea Lombardo.
4. Set `#define PRINTALLDATA 0` for untethered track runs (or `1` for serial monitor debug).
5. Disconnect battery 5V jumper before plugging in USB-C, then click Upload.
