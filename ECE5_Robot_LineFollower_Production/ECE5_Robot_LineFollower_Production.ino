/*
 * ECE 5 Project 4: Autonomous Line-Following Robot
 * Principal: Paresh Prabhu Raj (A19386710 | ECE5_FA26_A00)
 * Course: ECE 5 (Making, Breaking, Hacking Stuff | Prof. Karcher Morris)
 * 
 * Production Closed-Loop PID Line Tracking Firmware
 * Architecture:
 *   1. ReadPotentiometers() -> Maps Speed, Kp, Ki, Kd to 0-100 engineering scale
 *   2. ReadPhotoresistors()  -> Reads 7 LDR voltage dividers
 *   3. CalcError()          -> Evaluates weighted centroid with 2x noise rejection
 *   4. PID_Turn()           -> Discrete PID feedback with integral anti-windup
 *   5. RunMotors()          -> Differential H-bridge PWM motor actuation
 */

#include <Arduino.h>

// Debug and Operational Toggles
// Set to 1 when tethered via USB serial for calibration and diagnostics
// Set to 0 when running untethered on competition track to eliminate serial latency
#define PRINTALLDATA 0

// Nominal base forward speed (0-255 PWM scale)
#define DEFAULT_NOMINAL_SPEED 40

#if defined(ARDUINO_ARCH_ESP32)
// ESP32-S3 Pin Definitions
const int PIN_POT_SPEED = 47;
const int PIN_POT_KP    = 35;
const int PIN_POT_KI    = 39;
const int PIN_POT_KD    = 42;

const int NUM_SENSORS = 7;
const int LDR_PINS[NUM_SENSORS] = {1, 2, 3, 4, 5, 6, 7};

// L298N Dual H-Bridge Motor Driver Pins
const int PIN_MOTOR_L_PWM = 8;
const int PIN_MOTOR_L_IN1 = 9;
const int PIN_MOTOR_L_IN2 = 10;
const int PIN_MOTOR_R_IN3 = 11;
const int PIN_MOTOR_R_IN4 = 12;
const int PIN_MOTOR_R_PWM = 13;

const int ADC_MAX_VAL = 4095;
#else
// Arduino AVR (Uno) Pin Definitions for Cross-Platform Fallback
const int PIN_POT_SPEED = A0;
const int PIN_POT_KP    = A1;
const int PIN_POT_KI    = A2;
const int PIN_POT_KD    = A3;

const int NUM_SENSORS = 7;
// Note: Uno has 6 standard analog pins, A0-A5; using digital pins with analogRead where available
const int LDR_PINS[NUM_SENSORS] = {A0, A1, A2, A3, A4, A5, A0};

const int PIN_MOTOR_L_PWM = 5;
const int PIN_MOTOR_L_IN1 = 6;
const int PIN_MOTOR_L_IN2 = 7;
const int PIN_MOTOR_R_IN3 = 8;
const int PIN_MOTOR_R_IN4 = 9;
const int PIN_MOTOR_R_PWM = 10;

const int ADC_MAX_VAL = 1023;
#endif

// Sensor Raw Buffers & Calibration Stores
int LDR[NUM_SENSORS];
int white_vals[NUM_SENSORS];
int black_vals[NUM_SENSORS];
int delta_vals[NUM_SENSORS];

// Potentiometer Mapped Readings (0 to 100 Scale)
int speedRead = DEFAULT_NOMINAL_SPEED;
int kPRead = 25;
int kIRead = 0;
int kDRead = 12;

// PID Controller Parameters and State Variables
float kP = 0.25;
float kI = 0.00;
float kD = 0.12;

float error = 0.0;
float lasterror = 0.0;
float sumerror = 0.0;
float Turn = 0.0;

// Motor Actuation Variables
int nominalSpeed = DEFAULT_NOMINAL_SPEED;
int M1SpeedtoMotor = 0; // Left Motor Speed
int M2SpeedtoMotor = 0; // Right Motor Speed

// Helper: Maps analog reading to 0-100 scale
int ReadPotentiometerHelper(int pin) {
    int raw = analogRead(pin);
    int mapped = map(raw, 0, ADC_MAX_VAL, 0, 100);
    return constrain(mapped, 0, 100);
}

// 1. Read Potentiometers for Real-Time Parameter Adjustment
void ReadPotentiometers() {
    speedRead = ReadPotentiometerHelper(PIN_POT_SPEED);
    kPRead    = ReadPotentiometerHelper(PIN_POT_KP);
    kIRead    = ReadPotentiometerHelper(PIN_POT_KI);
    kDRead    = ReadPotentiometerHelper(PIN_POT_KD);

    // Map 0-100 pot values to control gains
    nominalSpeed = map(speedRead, 0, 100, 20, 200);
    kP = (float)kPRead / 1.0;
    kI = (float)kIRead / 1000.0;
    kD = (float)kDRead / 100.0;
}

// 2. Read All Photoresistors into LDR Array
void ReadPhotoresistors() {
    for (int i = 0; i < NUM_SENSORS; i++) {
        LDR[i] = analogRead(LDR_PINS[i]);
    }
}

// Helper: Identify Darkest Photoresistor with 2x Noise Threshold Check
int getDarkestIndex() {
    int darkestIndex = 0;
    int maxDarkValue = -1;
    long totalVal = 0;

    for (int i = 0; i < NUM_SENSORS; i++) {
        totalVal += LDR[i];
        if (LDR[i] > maxDarkValue) {
            maxDarkValue = LDR[i];
            darkestIndex = i;
        }
    }

    // Average sensor reading
    long avgVal = totalVal / NUM_SENSORS;

    // Course Heuristic: To verify sensor is on black line, reading must exceed 2x average
    if (maxDarkValue < (avgVal * 2)) {
        // Line lost or ambient lighting even: return -1 to signal no line lock
        return -1;
    }

    return darkestIndex;
}

// 3. Calculate Line Tracking Error (-3.0 to +3.0)
void CalcError() {
    int darkestIdx = getDarkestIndex();

    if (darkestIdx == -1) {
        // Line lost: retain direction of last known error to execute recovery turn
        if (lasterror > 0) {
            error = 3.0;
        } else if (lasterror < 0) {
            error = -3.0;
        } else {
            error = 0.0;
        }
        return;
    }

    // 7 sensors indexed 0 to 6. Centerline is index 3.
    // Error is defined as (darkestIdx - 3)
    // Left displacement gives negative error, Right displacement gives positive error
    error = (float)(darkestIdx - 3);
}

// 4. Calculate PID Steering Correction
void PID_Turn() {
    // Proportional, Integral, Derivative calculation
    float pTerm = error * kP;
    float iTerm = sumerror * kI;
    float dTerm = (error - lasterror) * kD;

    Turn = pTerm + iTerm + dTerm;

    // Accumulate integral sum
    sumerror = sumerror + error;

    // Integrator Anti-Windup Clamping (limits saturation on sustained arcs)
    if (sumerror > 5.0) {
        sumerror = 5.0;
    } else if (sumerror < -5.0) {
        sumerror = -5.0;
    }

    lasterror = error;
}

// Helper: Drive Single Motor via L298N Channel
void runMotorAtSpeed(int pwmPin, int in1Pin, int in2Pin, int speedVal) {
    speedVal = constrain(speedVal, -255, 255);

    if (speedVal > 0) {
        digitalWrite(in1Pin, HIGH);
        digitalWrite(in2Pin, LOW);
        analogWrite(pwmPin, speedVal);
    } else if (speedVal < 0) {
        digitalWrite(in1Pin, LOW);
        digitalWrite(in2Pin, HIGH);
        analogWrite(pwmPin, -speedVal);
    } else {
        digitalWrite(in1Pin, LOW);
        digitalWrite(in2Pin, LOW);
        analogWrite(pwmPin, 0);
    }
}

// 5. Differential Motor Actuation
void RunMotors() {
    // Differential speed steering
    // Turn > 0 (track right): steer right by slowing down right motor, speeding up left
    M1SpeedtoMotor = nominalSpeed + (int)Turn;
    M2SpeedtoMotor = nominalSpeed - (int)Turn;

    // Clamp to 8-bit PWM bounds
    M1SpeedtoMotor = constrain(M1SpeedtoMotor, 0, 255);
    M2SpeedtoMotor = constrain(M2SpeedtoMotor, 0, 255);

    // Apply to H-Bridge
    runMotorAtSpeed(PIN_MOTOR_L_PWM, PIN_MOTOR_L_IN1, PIN_MOTOR_L_IN2, M1SpeedtoMotor);
    runMotorAtSpeed(PIN_MOTOR_R_PWM, PIN_MOTOR_R_IN3, PIN_MOTOR_R_IN4, M2SpeedtoMotor);
}

// Calibration Sequence for Setup
void calibrateSensors() {
    Serial.println("Calibrating White (Place on white surface)...");
    for (int i = 0; i < 20; i++) {
        for (int j = 0; j < NUM_SENSORS; j++) {
            if (i == 0) white_vals[j] = analogRead(LDR_PINS[j]);
            else white_vals[j] = (white_vals[j] + analogRead(LDR_PINS[j])) / 2;
        }
        delay(50);
        Serial.print(".");
    }
    Serial.println(" Done!");

    delay(1000);

    Serial.println("Calibrating Black (Place on black line)...");
    for (int i = 0; i < 20; i++) {
        for (int j = 0; j < NUM_SENSORS; j++) {
            if (i == 0) black_vals[j] = analogRead(LDR_PINS[j]);
            else black_vals[j] = (black_vals[j] + analogRead(LDR_PINS[j])) / 2;
        }
        delay(50);
        Serial.print(".");
    }
    Serial.println(" Done!");

    Serial.print("White Vals: ");
    for (int j = 0; j < NUM_SENSORS; j++) {
        Serial.print(white_vals[j]); Serial.print(" ");
    }
    Serial.println();

    Serial.print("Black Vals: ");
    for (int j = 0; j < NUM_SENSORS; j++) {
        Serial.print(black_vals[j]); Serial.print(" ");
    }
    Serial.println();

    Serial.print("Delta Vals: ");
    for (int j = 0; j < NUM_SENSORS; j++) {
        delta_vals[j] = black_vals[j] - white_vals[j];
        Serial.print(delta_vals[j]); Serial.print(" ");
    }
    Serial.println();
}

void setup() {
    Serial.begin(115200);

    // Motor driver pin modes
    pinMode(PIN_MOTOR_L_PWM, OUTPUT);
    pinMode(PIN_MOTOR_L_IN1, OUTPUT);
    pinMode(PIN_MOTOR_L_IN2, OUTPUT);
    pinMode(PIN_MOTOR_R_PWM, OUTPUT);
    pinMode(PIN_MOTOR_R_IN3, OUTPUT);
    pinMode(PIN_MOTOR_R_IN4, OUTPUT);

    // Initial stop
    runMotorAtSpeed(PIN_MOTOR_L_PWM, PIN_MOTOR_L_IN1, PIN_MOTOR_L_IN2, 0);
    runMotorAtSpeed(PIN_MOTOR_R_PWM, PIN_MOTOR_R_IN3, PIN_MOTOR_R_IN4, 0);

    // Sensor pin modes
    for (int i = 0; i < NUM_SENSORS; i++) {
        pinMode(LDR_PINS[i], INPUT);
    }

    pinMode(PIN_POT_SPEED, INPUT);
    pinMode(PIN_POT_KP, INPUT);
    pinMode(PIN_POT_KI, INPUT);
    pinMode(PIN_POT_KD, INPUT);

#if PRINTALLDATA
    calibrateSensors();
#endif
}

void loop() {
    // Execution cycle conforming to Lab 4 control loop hierarchy
    ReadPotentiometers();
    ReadPhotoresistors();
    CalcError();
    PID_Turn();
    RunMotors();

#if PRINTALLDATA
    // High-frequency telemetry for bench calibration
    Serial.print("Sp: "); Serial.print(speedRead);
    Serial.print(" P: "); Serial.print(kPRead);
    Serial.print(" I: "); Serial.print(kIRead);
    Serial.print(" D: "); Serial.print(kDRead);
    Serial.print(" | Error: "); Serial.print(error);
    Serial.print(" | Turn: "); Serial.print(Turn);
    Serial.print(" | LMotor: "); Serial.print(M1SpeedtoMotor);
    Serial.print(" | RMotor: "); Serial.print(M2SpeedtoMotor);
    Serial.println();
    delay(50);
#else
    // Small loop settling delay for untethered track operation
    delay(5);
#endif
}
