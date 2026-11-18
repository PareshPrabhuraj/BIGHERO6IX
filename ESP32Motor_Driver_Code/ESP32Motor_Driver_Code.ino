/*
 * ECE 5 Project 4: L298N Motor Driver Test (Challenge 1C)
 * Team: Big Hero 6ix (Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj)
 * Course: UC San Diego ECE 5 (Prof. Karcher Morris) - Fall Quarter 2026
 *
 * Verifies bidirectional motor driving with the L298NX2 library.
 * Tests forward, backward, and stop states on both DC gear motors.
 */

#include <Arduino.h>
#include <L298NX2.h>

enum side {LEFT, RIGHT};

// Motor driver pin assignments
// Note: Lab 4 default test pins shown below. In the final robot assembly,
// motor driver control pins are mapped to IO8-IO13 (ENA=8, IN1=9, IN2=10, IN3=11, IN4=12, ENB=13)
// so pins IO1-IO7 remain dedicated to the 7 LDR sensor array.
//                  Left Motor     Right Motor
L298NX2 DriveMotors(42, 41, 40,    37, 39, 38);
//                  ENA, IN1, IN2, ENB, IN3, IN4

// Initial test PWM speed (0 to 255)
int speed = 75;

// Commands a specified motor channel to rotate in a given direction at a given speed
void runMotorAtSpeed(side _side, int speed) {
  if (_side == LEFT) {
    DriveMotors.setSpeedA(abs(speed));
    if (speed > 0) {
      DriveMotors.forwardA();
    } else {
      DriveMotors.backwardA();
    }
  }
  if (_side == RIGHT) {
    DriveMotors.setSpeedB(abs(speed));
    if (speed > 0) {
      DriveMotors.forwardB();
    } else {
      DriveMotors.backwardB();
    }
  }
}

void setup() {
  // 1.5 second settling delay before motors spin up
  delay(1500);
}

void loop() {
  // Drive both motors forward for 3 seconds
  runMotorAtSpeed(LEFT, speed);
  runMotorAtSpeed(RIGHT, speed);
  delay(3000);

  // Drive both motors backward for 3 seconds
  runMotorAtSpeed(LEFT, -speed);
  runMotorAtSpeed(RIGHT, -speed);
  delay(3000);

  // Stop both motors for 3 seconds
  runMotorAtSpeed(LEFT, 0);
  runMotorAtSpeed(RIGHT, 0);
  delay(3000);
}
