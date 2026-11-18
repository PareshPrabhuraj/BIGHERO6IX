/*
 * ECE 5 Project 4: Potentiometer Gain Tuning Bank (Challenge 1A)
 * Team: Big Hero 6ix (Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj)
 * Course: UC San Diego ECE 5 (Prof. Karcher Morris) - Fall Quarter 2026
 *
 * Reads 4 rotary potentiometers on breadboard to verify analogRead scaling (0-100).
 * Pins used in standalone Challenge 1A test bench:
 *   Speed -> IO4, Kp -> IO3, Ki -> IO2, Kd -> IO1
 * Note: On the final integrated robot, these pots are moved to IO47, IO35, IO39, and IO42
 * so pins IO1-IO7 can be dedicated to the 7 photoresistors in the sensor comb.
 */

#include <Arduino.h>

// Potentiometer pin definitions for Challenge 1A standalone bench test
const int S_pin = 4;  // Speed potentiometer - analog pin IO4
const int P_pin = 3;  // Proportional gain - analog pin IO3
const int I_pin = 2;  // Integral gain - analog pin IO2
const int D_pin = 1;  // Derivative gain - analog pin IO1

// Scaled values (0 to 100)
int Sp = 0; // Speed scaling
int kP = 0; // Proportional gain coefficient
int kI = 0; // Integral gain coefficient
int kD = 0; // Derivative gain coefficient

// Helper to read and map analog ADC value (12-bit, 0-4095) to 0-100 scale
int ReadPotentiometerHelper(int pin, int min_resolution, int max_resolution, int min_potentiometer, int max_potentiometer) {
  int raw = analogRead(pin);
  int mapped = map(raw, min_resolution, max_resolution, min_potentiometer, max_potentiometer);
  return constrain(mapped, min_potentiometer, max_potentiometer);
}

// Reads all four potentiometers and maps them to 0-100 scale
void ReadPotentiometers() {
  Sp = ReadPotentiometerHelper(S_pin, 0, 4095, 0, 100);
  kP = ReadPotentiometerHelper(P_pin, 0, 4095, 0, 100);
  kI = ReadPotentiometerHelper(I_pin, 0, 4095, 0, 100);
  kD = ReadPotentiometerHelper(D_pin, 0, 4095, 0, 100);
}

// Prints potentiometer values to the Serial Monitor
void Print() {
  Serial.print("Speed (IO4): ");
  Serial.print(Sp);
  Serial.print(" | Kp (IO3): ");
  Serial.print(kP);
  Serial.print(" | Ki (IO2): ");
  Serial.print(kI);
  Serial.print(" | Kd (IO1): ");
  Serial.println(kD);

  delay(200); // 200 ms pacing delay for readable serial monitor streaming
}

void setup() {
  // Use 115200 baud for ESP32-S3 USB CDC serial communication
  Serial.begin(115200);
}

void loop() {
  ReadPotentiometers();
  Print();
}
