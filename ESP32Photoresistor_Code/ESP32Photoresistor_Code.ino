/*
 * ECE 5 Project 4: Photoresistor Array Test (Challenge 1B)
 * Team: Big Hero 6ix (Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj)
 * Course: UC San Diego ECE 5 (Prof. Karcher Morris) - Fall Quarter 2026
 *
 * Reads raw analog voltage values from the 7 CdS photoresistor dividers on pins IO1-IO7.
 * Used during breadboard assembly to verify optical contrast between white paper and black tape.
 */

#include <Arduino.h>

// Photoresistor pin assignments (ESP32-S3 ADC1 pins IO1 through IO7)
const int LDR_Pin[] = {1, 2, 3, 4, 5, 6, 7};
const int totalPhotoResistors = sizeof(LDR_Pin) / sizeof(LDR_Pin[0]);

// Buffer for storing raw analog readings
int LDR[totalPhotoResistors];

// Reads all 7 photoresistor voltage divider outputs
void ReadPhotoResistors() {
  for (int i = 0; i < totalPhotoResistors; i++) {
    LDR[i] = analogRead(LDR_Pin[i]);
    delay(2); // Short settling delay between ADC channel reads
  }
}

// Prints sensor readings to the Serial Monitor
void Print() {
  for (int i = 0; i < totalPhotoResistors; i++) {
    Serial.print(LDR[i]);
    Serial.print(" ");
  }
  Serial.println();
  delay(200); // 200 ms pacing delay for readable serial monitor streaming
}

void setup() {
  // Use 115200 baud for ESP32-S3 USB CDC serial communication
  Serial.begin(115200);
}

void loop() {
  ReadPhotoResistors();
  Print();
}
