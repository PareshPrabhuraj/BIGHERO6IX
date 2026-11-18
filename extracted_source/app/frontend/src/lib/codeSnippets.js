export const SKETCHES = [
  {
    name: "ECE5_Robot_LineFollower_Production.ino",
    label: "Main closed-loop PID navigation",
    code: `/* ============================================================
   ECE5_Robot_LineFollower_Production.ino
   Team Big Hero 6ix - UC San Diego ECE 5, Lab 4 Finale
   Closed-loop PID line following on the ESP32-S3
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
    ledcAttachPin(pwmPins[i], i);          // 20 kHz, 10-bit
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

  /* ---- PID law with anti-windup (sum clamped to +/-200) ---- */
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

  Serial.printf("e=%.3f turn=%.2f L=%d R=%d\\n", error, turn, lPwm, rPwm);
  delay(5);
}`,
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

  Serial.printf("Kp=%.2f  Ki=%.2f  Kd=%.2f  Speed=%d%%\\n",
                kp, ki, kd, speedPct);

  delay(100);   // 10 Hz telemetry refresh
}`,
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
  /* capture min/max per channel, then store normalization table */
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
    /* normalize: 1.0 = pure black line, 0.0 = pure white floor */
    s[i] = constrain((float)(raw - whiteRef[i]) / (blackRef[i] - whiteRef[i]), 0.0, 1.0);
  }

  Serial.print("BAR ");
  for (int i = 0; i < 7; i++) {
    Serial.printf("[%d]%d=%.2f  ", POSITION[i], LDR[i], s[i]);
  }
  Serial.println();

  delay(20);
}`,
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
  /* direction: positive = forward, negative = reverse */
  digitalWrite(IN_L1, lPct >= 0); digitalWrite(IN_L2, lPct < 0);
  digitalWrite(IN_R1, rPct >= 0); digitalWrite(IN_R2, rPct < 0);

  ledcWrite(0, constrain(abs(lPct), 0, 100) * 10.23);
  ledcWrite(1, constrain(abs(rPct), 0, 100) * 10.23);
}

void loop() {
  /* forward ramp */
  for (int p = 0; p <= 100; p += 5) { drive(p, p);  delay(50); }
  /* pivot turn in place */
  drive(70, -70);  delay(600);
  /* hard brake */
  drive(0, 0);     delay(1000);
}`,
  },
];
