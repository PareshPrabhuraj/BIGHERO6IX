/*
 * ECE 5 Project 4: Autonomous Line-Following Robot
 * Student: Paresh Prabhu Raj (A19386710 | ECE5_FA26_A00)
 * UC San Diego | Jacobs School of Engineering
 *
 * Closed-Loop PID Line Tracking Firmware Template
 * Compatible with ESP32-S3 and Arduino AVR Architectures
 */

#include <Arduino.h>

// Pin Definitions (Configurable for Lab 4 hardware)
const int PIN_MOTOR_L_PWM = 5;
const int PIN_MOTOR_L_DIR = 6;
const int PIN_MOTOR_R_PWM = 9;
const int PIN_MOTOR_R_DIR = 10;

const int SENSOR_PINS[5] = {A0, A1, A2, A3, A4};
const int NUM_SENSORS = 5;

// Calibration Bounds
int sensor_min[NUM_SENSORS] = {1023, 1023, 1023, 1023, 1023};
int sensor_max[NUM_SENSORS] = {0, 0, 0, 0, 0};

// PID Controller Gains
float Kp = 0.25;
float Ki = 0.00;
float Kd = 1.20;

// PID Controller State Variables
float last_error = 0.0;
float integral_sum = 0.0;
const float INTEGRAL_LIMIT = 200.0;
const int BASE_SPEED = 140;

unsigned long last_time = 0;

void setMotorSpeeds(int leftSpeed, int rightSpeed) {
    leftSpeed = constrain(leftSpeed, -255, 255);
    rightSpeed = constrain(rightSpeed, -255, 255);

    // Left Motor Control
    if (leftSpeed >= 0) {
        digitalWrite(PIN_MOTOR_L_DIR, HIGH);
        analogWrite(PIN_MOTOR_L_PWM, leftSpeed);
    } else {
        digitalWrite(PIN_MOTOR_L_DIR, LOW);
        analogWrite(PIN_MOTOR_L_PWM, -leftSpeed);
    }

    // Right Motor Control
    if (rightSpeed >= 0) {
        digitalWrite(PIN_MOTOR_R_DIR, HIGH);
        analogWrite(PIN_MOTOR_R_PWM, rightSpeed);
    } else {
        digitalWrite(PIN_MOTOR_R_DIR, LOW);
        analogWrite(PIN_MOTOR_R_PWM, -rightSpeed);
    }
}

float readLineError() {
    long weighted_sum = 0;
    long total_val = 0;

    for (int i = 0; i < NUM_SENSORS; i++) {
        int raw = analogRead(SENSOR_PINS[i]);
        int val = map(raw, sensor_min[i], sensor_max[i], 0, 1000);
        val = constrain(val, 0, 1000);

        weighted_sum += (long)val * (i * 1000);
        total_val += val;
    }

    if (total_val < 50) {
        // Line lost: retain last known direction for recovery
        return (last_error > 0) ? 2000.0 : -2000.0;
    }

    float position = (float)weighted_sum / (float)total_val;
    float setpoint = (NUM_SENSORS - 1) * 500.0;
    return (position - setpoint);
}

void setup() {
    Serial.begin(115200);

    pinMode(PIN_MOTOR_L_PWM, OUTPUT);
    pinMode(PIN_MOTOR_L_DIR, OUTPUT);
    pinMode(PIN_MOTOR_R_PWM, OUTPUT);
    pinMode(PIN_MOTOR_R_DIR, OUTPUT);

    for (int i = 0; i < NUM_SENSORS; i++) {
        pinMode(SENSOR_PINS[i], INPUT);
    }

    // Auto-calibration sequence: sweep across track for 2 seconds
    unsigned long calib_start = millis();
    while (millis() - calib_start < 2000) {
        for (int i = 0; i < NUM_SENSORS; i++) {
            int reading = analogRead(SENSOR_PINS[i]);
            if (reading < sensor_min[i]) sensor_min[i] = reading;
            if (reading > sensor_max[i]) sensor_max[i] = reading;
        }
        delay(10);
    }

    last_time = micros();
}

void loop() {
    unsigned long current_time = micros();
    float dt = (current_time - last_time) / 1000000.0;
    if (dt <= 0.0) dt = 0.001;
    last_time = current_time;

    float error = readLineError();

    // Proportional term
    float P = Kp * error;

    // Integral term with anti-windup clamping
    integral_sum += error * dt;
    integral_sum = constrain(integral_sum, -INTEGRAL_LIMIT, INTEGRAL_LIMIT);
    float I = Ki * integral_sum;

    // Derivative term
    float D = Kd * ((error - last_error) / dt);
    last_error = error;

    float correction = P + I + D;

    int leftSpeed = BASE_SPEED - (int)correction;
    int rightSpeed = BASE_SPEED + (int)correction;

    setMotorSpeeds(leftSpeed, rightSpeed);

    delay(5);
}
