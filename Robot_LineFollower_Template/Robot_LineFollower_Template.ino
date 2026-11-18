/*
 * ECE 5 Project 4: Line-Following Robot Starter Template
 * Team: Big Hero 6ix (Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj)
 * Course: UC San Diego ECE 5 (Prof. Karcher Morris) - Fall Quarter 2026
 *
 * Course starter template for upcoming Challenge 2 (line following implementation).
 * Current project status: Hardware bring-up and motor spin testing (Challenge 1C) complete.
 * Closed-loop line following and PID tuning will be built out in this template during Challenge 2.
 */

#include <Arduino.h>

// Motor control pin assignments (Lab 4 default starter pins)
const int PIN_MOTOR_L_PWM = 5;
const int PIN_MOTOR_L_DIR = 6;
const int PIN_MOTOR_R_PWM = 9;
const int PIN_MOTOR_R_DIR = 10;

// Sensor pins (starter template configured for 5 analog inputs)
const int SENSOR_PINS[5] = {A0, A1, A2, A3, A4};
const int NUM_SENSORS = 5;

// Sensor calibration bounds
int sensor_min[NUM_SENSORS] = {1023, 1023, 1023, 1023, 1023};
int sensor_max[NUM_SENSORS] = {0, 0, 0, 0, 0};

// Initial PID controller gains
float Kp = 0.25;
float Ki = 0.00;
float Kd = 1.20;

// PID state variables
float last_error = 0.0;
float integral_sum = 0.0;
const float INTEGRAL_LIMIT = 200.0;
const int BASE_SPEED = 140;

unsigned long last_time = 0;

// Updates motor direction pins and PWM outputs
void setMotorSpeeds(int leftSpeed, int rightSpeed) {
    leftSpeed = constrain(leftSpeed, -255, 255);
    rightSpeed = constrain(rightSpeed, -255, 255);

    // Left motor direction and speed
    if (leftSpeed >= 0) {
        digitalWrite(PIN_MOTOR_L_DIR, HIGH);
        analogWrite(PIN_MOTOR_L_PWM, leftSpeed);
    } else {
        digitalWrite(PIN_MOTOR_L_DIR, LOW);
        analogWrite(PIN_MOTOR_L_PWM, -leftSpeed);
    }

    // Right motor direction and speed
    if (rightSpeed >= 0) {
        digitalWrite(PIN_MOTOR_R_DIR, HIGH);
        analogWrite(PIN_MOTOR_R_PWM, rightSpeed);
    } else {
        digitalWrite(PIN_MOTOR_R_DIR, LOW);
        analogWrite(PIN_MOTOR_R_PWM, -rightSpeed);
    }
}

// Calculates line position using weighted average of sensor readings
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

    // If total reading is too low, line is lost: keep turning toward last known side
    if (total_val < 50) {
        return (last_error > 0) ? 2000.0 : -2000.0;
    }

    float position = (float)weighted_sum / (float)total_val;
    float setpoint = (NUM_SENSORS - 1) * 500.0;
    return (position - setpoint);
}

void setup() {
    Serial.begin(115200);

    // Motor driver pin modes
    pinMode(PIN_MOTOR_L_PWM, OUTPUT);
    pinMode(PIN_MOTOR_L_DIR, OUTPUT);
    pinMode(PIN_MOTOR_R_PWM, OUTPUT);
    pinMode(PIN_MOTOR_R_DIR, OUTPUT);

    // Sensor pin modes
    for (int i = 0; i < NUM_SENSORS; i++) {
        pinMode(SENSOR_PINS[i], INPUT);
    }

    // Sweep sensors over black line and white background for 2 seconds to calibrate
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

    // Integral term with anti-windup clamp
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
