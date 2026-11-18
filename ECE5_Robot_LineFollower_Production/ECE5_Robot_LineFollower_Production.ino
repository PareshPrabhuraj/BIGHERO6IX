/*
 * ECE 5 Project 4: Line-Following Robot
 * Team: Big Hero 6ix (Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj)
 * Course: UC San Diego ECE 5 (Prof. Karcher Morris) - Fall Quarter 2026
 * 
 * Final Line Follower Robot Firmware
 * Control Flow:
 *   1. ReadPotentiometers() -> Reads tuning pots for Speed, Kp, Ki, Kd
 *   2. ReadPhotoresistors()  -> Reads 7 LDR sensor array
 *   3. CalcError()          -> Determines line position and tracking error
 *   4. PID_Turn()           -> Computes steering turn value with integral clamping
 *   5. RunMotors()          -> Drives left and right motors through L298N
 */

#include <Arduino.h>

// Debug and Operational Toggles
// Set to 1 when connected via USB for bench calibration and testing
// Set to 0 when running untethered on the track to avoid Serial print slowdowns
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
// Fallback pin definitions for Arduino Uno boards used in early lab sessions
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

// Sensor readings and calibration buffers
int LDR[NUM_SENSORS];
int white_vals[NUM_SENSORS];
int black_vals[NUM_SENSORS];
int delta_vals[NUM_SENSORS];

// Potentiometer readings (0 to 100 scale)
int speedRead = DEFAULT_NOMINAL_SPEED;
int kPRead = 25;
int kIRead = 0;
int kDRead = 12;

// PID controller gains and state variables
float kP = 25.0;
float kI = 0.00;
float kD = 0.12;

float error = 0.0;
float lasterror = 0.0;
float sumerror = 0.0;
float Turn = 0.0;

// Motor speed outputs
int nominalSpeed = DEFAULT_NOMINAL_SPEED;
int M1SpeedtoMotor = 0; // Left motor PWM speed
int M2SpeedtoMotor = 0; // Right motor PWM speed

// Helper: maps raw analog reading to a clean 0-100 range
int ReadPotentiometerHelper(int pin) {
    int raw = analogRead(pin);
    int mapped = map(raw, 0, ADC_MAX_VAL, 0, 100);
    return constrain(mapped, 0, 100);
}

// 1. Read potentiometers for live tuning
void ReadPotentiometers() {
    speedRead = ReadPotentiometerHelper(PIN_POT_SPEED);
    kPRead    = ReadPotentiometerHelper(PIN_POT_KP);
    kIRead    = ReadPotentiometerHelper(PIN_POT_KI);
    kDRead    = ReadPotentiometerHelper(PIN_POT_KD);

    // Map pot values to usable motor speeds and PID gains
    nominalSpeed = map(speedRead, 0, 100, 20, 200);
    kP = (float)kPRead / 1.0;
    kI = (float)kIRead / 1000.0;
    kD = (float)kDRead / 100.0;
}

// 2. Read all 7 photoresistors in the sensor comb
void ReadPhotoresistors() {
    for (int i = 0; i < NUM_SENSORS; i++) {
        LDR[i] = analogRead(LDR_PINS[i]);
    }
}

// Helper: find the sensor detecting the black tape
// Checks that the darkest reading is at least 2x the sensor average
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

    // Average sensor reading across the comb
    long avgVal = totalVal / NUM_SENSORS;

    // If the maximum reading is less than twice the average, we are not solidly on the line
    if (maxDarkValue < (avgVal * 2)) {
        return -1; // Line lost or even ambient background
    }

    return darkestIndex;
}

// 3. Calculate line tracking error (-3.0 to +3.0)
void CalcError() {
    int darkestIdx = getDarkestIndex();

    if (darkestIdx == -1) {
        // Line lost: steer in the direction of the last known error to recover the track
        if (lasterror > 0) {
            error = 3.0;
        } else if (lasterror < 0) {
            error = -3.0;
        } else {
            error = 0.0;
        }
        return;
    }

    // 7 sensors indexed 0 to 6. Center sensor is index 3.
    // Negative error = line is to the left; positive error = line is to the right
    error = (float)(darkestIdx - 3);
}

// 4. Calculate PID steering correction
void PID_Turn() {
    // Proportional, Integral, and Derivative terms
    float pTerm = error * kP;
    float iTerm = sumerror * kI;
    float dTerm = (error - lasterror) * kD;

    Turn = pTerm + iTerm + dTerm;

    // Accumulate error for the integral term
    sumerror = sumerror + error;

    // Anti-windup clamping to prevent the integral sum from growing unbounded
    if (sumerror > 5.0) {
        sumerror = 5.0;
    } else if (sumerror < -5.0) {
        sumerror = -5.0;
    }

    lasterror = error;
}

// Helper: drive an individual motor channel on the L298N
void runMotorAtSpeed(int pwmPin, int in1Pin, int in2Pin, int speedVal) {
    speedVal = constrain(speedVal, -255, 255);

    if (speedVal > 0) {
        // Forward rotation
        digitalWrite(in1Pin, HIGH);
        digitalWrite(in2Pin, LOW);
        analogWrite(pwmPin, speedVal);
    } else if (speedVal < 0) {
        // Reverse rotation
        digitalWrite(in1Pin, LOW);
        digitalWrite(in2Pin, HIGH);
        analogWrite(pwmPin, -speedVal);
    } else {
        // Motor brake / stop
        digitalWrite(in1Pin, LOW);
        digitalWrite(in2Pin, LOW);
        analogWrite(pwmPin, 0);
    }
}

// 5. Differential motor steering control
void RunMotors() {
    // Turn > 0 means the line shifted right, so turn right (speed up left, slow down right)
    // Turn < 0 means the line shifted left, so turn left (slow down left, speed up right)
    M1SpeedtoMotor = nominalSpeed + (int)Turn;
    M2SpeedtoMotor = nominalSpeed - (int)Turn;

    // Constrain PWM speeds to valid 8-bit range (0 to 255)
    M1SpeedtoMotor = constrain(M1SpeedtoMotor, 0, 255);
    M2SpeedtoMotor = constrain(M2SpeedtoMotor, 0, 255);

    // Send PWM and direction signals to the L298N
    runMotorAtSpeed(PIN_MOTOR_L_PWM, PIN_MOTOR_L_IN1, PIN_MOTOR_L_IN2, M1SpeedtoMotor);
    runMotorAtSpeed(PIN_MOTOR_R_PWM, PIN_MOTOR_R_IN3, PIN_MOTOR_R_IN4, M2SpeedtoMotor);
}

// Calibration sequence run during bench setup
void calibrateSensors() {
    Serial.println("Calibrating white surface (place sensors over white posterboard)...");
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

    Serial.println("Calibrating black line (place sensors directly over black tape)...");
    for (int i = 0; i < 20; i++) {
        for (int j = 0; j < NUM_SENSORS; j++) {
            if (i == 0) black_vals[j] = analogRead(LDR_PINS[j]);
            else black_vals[j] = (black_vals[j] + analogRead(LDR_PINS[j])) / 2;
        }
        delay(50);
        Serial.print(".");
    }
    Serial.println(" Done!");

    Serial.print("White readings: ");
    for (int j = 0; j < NUM_SENSORS; j++) {
        Serial.print(white_vals[j]); Serial.print(" ");
    }
    Serial.println();

    Serial.print("Black readings: ");
    for (int j = 0; j < NUM_SENSORS; j++) {
        Serial.print(black_vals[j]); Serial.print(" ");
    }
    Serial.println();

    Serial.print("Delta (Black - White): ");
    for (int j = 0; j < NUM_SENSORS; j++) {
        delta_vals[j] = black_vals[j] - white_vals[j];
        Serial.print(delta_vals[j]); Serial.print(" ");
    }
    Serial.println();
}

void setup() {
    Serial.begin(115200);

    // Motor driver pin configurations
    pinMode(PIN_MOTOR_L_PWM, OUTPUT);
    pinMode(PIN_MOTOR_L_IN1, OUTPUT);
    pinMode(PIN_MOTOR_L_IN2, OUTPUT);
    pinMode(PIN_MOTOR_R_PWM, OUTPUT);
    pinMode(PIN_MOTOR_R_IN3, OUTPUT);
    pinMode(PIN_MOTOR_R_IN4, OUTPUT);

    // Start with motors halted
    runMotorAtSpeed(PIN_MOTOR_L_PWM, PIN_MOTOR_L_IN1, PIN_MOTOR_L_IN2, 0);
    runMotorAtSpeed(PIN_MOTOR_R_PWM, PIN_MOTOR_R_IN3, PIN_MOTOR_R_IN4, 0);

    // Sensor pin configurations
    for (int i = 0; i < NUM_SENSORS; i++) {
        pinMode(LDR_PINS[i], INPUT);
    }

    // Potentiometer pin configurations
    pinMode(PIN_POT_SPEED, INPUT);
    pinMode(PIN_POT_KP, INPUT);
    pinMode(PIN_POT_KI, INPUT);
    pinMode(PIN_POT_KD, INPUT);

#if PRINTALLDATA
    calibrateSensors();
#endif
}

void loop() {
    // Main robot control sequence:
    // 1. Read potentiometer adjustments
    // 2. Sample photoresistors
    // 3. Compute tracking error
    // 4. Calculate PID steering value
    // 5. Update motor PWM outputs
    ReadPotentiometers();
    ReadPhotoresistors();
    CalcError();
    PID_Turn();
    RunMotors();

#if PRINTALLDATA
    // Print telemetry to Serial Monitor during tethered bench testing
    Serial.print("Speed: "); Serial.print(speedRead);
    Serial.print(" | Kp: "); Serial.print(kPRead);
    Serial.print(" | Ki: "); Serial.print(kIRead);
    Serial.print(" | Kd: "); Serial.print(kDRead);
    Serial.print(" | Err: "); Serial.print(error);
    Serial.print(" | Turn: "); Serial.print(Turn);
    Serial.print(" | L_PWM: "); Serial.print(M1SpeedtoMotor);
    Serial.print(" | R_PWM: "); Serial.print(M2SpeedtoMotor);
    Serial.println();
    delay(50);
#else
    // Small loop settling delay during untethered track operation
    delay(5);
#endif
}
