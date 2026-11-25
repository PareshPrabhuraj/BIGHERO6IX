/* ************************************************************************************************* */
// UCSD ECE 5 Lab 4: Line Following Robot with PID
// Team: Big Hero 6ix (Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj)
// Based on ECE 5 Lab 4 V 4.0 by MingWei Yeoh, Korey Huynh, and Karcher Morris
/* ************************************************************************************************* */

#include <Arduino.h>
#include <L298NX2.h>

// Robot Settings
#define PRINTALLDATA        1  // 0 for track run, 1 for serial debug
#define NOMINALSPEED        45 // Base motor speed

// Motor driver pins (Left: ENA, IN1, IN2 | Right: ENB, IN3, IN4)
L298NX2 DriveMotors(42, 41, 40, 37, 39, 38);

enum side {LEFT, RIGHT};

// 7 photoresistors from left to right (IO8 to IO2)
int LDR_Pin[] = {8, 7, 6, 5, 4, 3, 2};

// Potentiometer pins
const int S_pin = 13; // Speed
const int P_pin = 12; // Proportional
const int I_pin = 11; // Integral
const int D_pin = 10; // Derivative

int led_Pins[] = {46}; // Calibration LED

// Potentiometer readings
int SpRead = 0;
int kPRead = 0;
int kIRead = 0;
int kDRead = 0;

// Calibration and sensor variables
float Mn[20];
float Mx[20];
float LDRf[20];
int LDR[20];
int rawPResistorData[20];
int totalPhotoResistors = sizeof(LDR_Pin) / sizeof(LDR_Pin[0]);
int numLEDs = sizeof(led_Pins) / sizeof(led_Pins[0]);
int MxRead;
float CriteriaForMax;
int leftHighestPR, highestPResistor, rightHighestPR;
float AveRead, WeightedAve;

// Motor control and PID variables
int M1SpeedtoMotor, M2SpeedtoMotor;
int Turn, M1P = 0, M2P = 0;
float error = 0, lasterror = 0, sumerror = 0;
float last_valid_error = 0;
float kP, kI, kD;

// Forward declarations
void Calibrate();
void CalibrateHelper(int numberOfMeasurements, boolean ifCalibratingBlack);
void setLeds(int x);
void ReadPotentiometers();
int ReadPotentiometerHelper(int pin, int min_res, int max_res, int min_val, int max_val);
void ReadPhotoResistors();
void RunMotors();
void runMotorAtSpeed(side _side, int speed);
void CalcError();
void PID_Turn();
void Print();

void setup() {
#if PRINTALLDATA
  Serial.begin(9600);
#endif

  for (int i = 0; i < numLEDs; i++) {
    pinMode(led_Pins[i], OUTPUT);
  }

  runMotorAtSpeed(LEFT, 0);
  runMotorAtSpeed(RIGHT, 0);

  Calibrate();

  ReadPotentiometers();
}

void loop() {
  ReadPotentiometers();
  ReadPhotoResistors();
  CalcError();
  PID_Turn();
  RunMotors();

#if PRINTALLDATA
  Print();
#else
  delay(5);
#endif
}

// Calibration routine
void Calibrate() {
  int numberOfMeasurements = 20;

  CalibrateHelper(numberOfMeasurements, false); // White

  setLeds(0);
  delay(2000);

  CalibrateHelper(numberOfMeasurements, true);  // Black

#if PRINTALLDATA
  Serial.print("White Vals: ");
  for (int i = 0; i < totalPhotoResistors; i++) {
    Serial.print(String(Mn[i]) + " ");
  }
  Serial.println();

  Serial.print("Black Vals: ");
  for (int i = 0; i < totalPhotoResistors; i++) {
    Serial.print(String(Mx[i]) + " ");
  }
  Serial.println();

  Serial.print("Delta Vals: ");
  for (int i = 0; i < totalPhotoResistors; i++) {
    Serial.print(String(Mx[i] - Mn[i]) + " ");
  }
  Serial.println();
#endif

  setLeds(1);
  delay(1500);
  setLeds(0);
}

void CalibrateHelper(int numberOfMeasurements, boolean ifCalibratingBlack) {
#if PRINTALLDATA
  if (ifCalibratingBlack)
    Serial.println("\nCalibrating Black");
  else
    Serial.println("\nCalibrating White");
#endif

  for (int i = 0; i < 4; i++) {
    setLeds(1);
    delay(250);
    setLeds(0);
    delay(250);
  }

  setLeds(1);
  delay(250);

  for (int i = 0; i < numberOfMeasurements; i++) {
    for (int pin = 0; pin < totalPhotoResistors; pin++) {
      LDRf[pin] = LDRf[pin] + (float)analogRead(LDR_Pin[pin]);
      delay(2);
    }
#if PRINTALLDATA
    Serial.print(". ");
#endif
  }

  for (int pin = 0; pin < totalPhotoResistors; pin++) {
    if (ifCalibratingBlack) {
      Mx[pin] = round(LDRf[pin] / (float)numberOfMeasurements);
    } else {
      Mn[pin] = round(LDRf[pin] / (float)numberOfMeasurements);
    }
    LDRf[pin] = 0.0;
  }

#if PRINTALLDATA
  Serial.println(" Done!");
#endif
  setLeds(0);
  delay(250);
}

void setLeds(int x) {
  for (int i = 0; i < numLEDs; i++) {
    digitalWrite(led_Pins[i], x);
  }
}

// Read potentiometers
void ReadPotentiometers() {
  SpRead = ReadPotentiometerHelper(S_pin, 0, 4095, 0, 100);
  kPRead = ReadPotentiometerHelper(P_pin, 0, 4095, 0, 100);
  kIRead = ReadPotentiometerHelper(I_pin, 0, 4095, 0, 100);
  kDRead = ReadPotentiometerHelper(D_pin, 0, 4095, 0, 100);
}

int ReadPotentiometerHelper(int pin, int min_res, int max_res, int min_val, int max_val) {
  return map(analogRead(pin), min_res, max_res, min_val, max_val);
}

// Read photoresistors and normalize
void ReadPhotoResistors() {
  for (int i = 0; i < totalPhotoResistors; i++) {
    rawPResistorData[i] = analogRead(LDR_Pin[i]);
    if (Mx[i] != Mn[i]) {
      LDR[i] = map(rawPResistorData[i], Mn[i], Mx[i], 0, 100);
    } else {
      LDR[i] = 50;
    }
    LDR[i] = constrain(LDR[i], 0, 100);
  }
}

// Drive motors
void RunMotors() {
  int leftTarget = NOMINALSPEED + SpRead + M1P;
  int rightTarget = NOMINALSPEED + SpRead + M2P;

  M1SpeedtoMotor = constrain(leftTarget, -255, 255);
  M2SpeedtoMotor = constrain(rightTarget, -255, 255);

  runMotorAtSpeed(LEFT, M1SpeedtoMotor);
  runMotorAtSpeed(RIGHT, M2SpeedtoMotor);
}

void runMotorAtSpeed(side _side, int speed) {
  int mag = abs(speed);
  if (mag > 0 && mag < NOMINALSPEED) {
    mag = NOMINALSPEED;
  }
  mag = min(mag, 255);

  if (_side == LEFT) {
    DriveMotors.setSpeedA(mag);
    if (speed > 0)
      DriveMotors.forwardA();
    else if (speed < 0)
      DriveMotors.backwardA();
    else
      DriveMotors.stopA();
  }
  if (_side == RIGHT) {
    DriveMotors.setSpeedB(mag);
    if (speed > 0)
      DriveMotors.backwardB();
    else if (speed < 0)
      DriveMotors.forwardB();
    else
      DriveMotors.stopB();
  }
}

// Calculate error from line sensor array
void CalcError() {
  MxRead = -99;
  AveRead = 0.0;
  for (int i = 0; i < totalPhotoResistors; i++) {
    if (MxRead < LDR[i]) {
      MxRead = LDR[i];
      highestPResistor = i;
    }
    AveRead = AveRead + (float)LDR[i] / (float)totalPhotoResistors;
  }

  CriteriaForMax = 1.3;
  if (MxRead > CriteriaForMax * AveRead && MxRead > 20) {
    if (highestPResistor != 0)
      leftHighestPR = highestPResistor - 1;
    else
      leftHighestPR = highestPResistor;

    if (highestPResistor != totalPhotoResistors - 1)
      rightHighestPR = highestPResistor + 1;
    else
      rightHighestPR = highestPResistor;

    float numerator = (float)(LDR[leftHighestPR] * leftHighestPR) + (float)(LDR[highestPResistor] * highestPResistor) + (float)(LDR[rightHighestPR] * rightHighestPR);
    float denominator = (float)LDR[leftHighestPR] + (float)LDR[highestPResistor] + (float)LDR[rightHighestPR];

    if (denominator > 0) {
      WeightedAve = numerator / denominator;
      error = (WeightedAve - 3.0);
      last_valid_error = error;
    }
  } else {
    if (last_valid_error > 0) {
      error = 3.0;
    } else if (last_valid_error < 0) {
      error = -3.0;
    }
  }
}

// PID steering controller
void PID_Turn() {
  kP = (float)kPRead * 1.0;
  kI = (float)kIRead * 0.001;
  kD = (float)kDRead * 0.15;

  Turn = error * kP + sumerror * kI + (error - lasterror) * kD;

  if (sumerror > 5)
    sumerror = 5;
  else if (sumerror < -5)
    sumerror = -5;

  if (abs(error) < 0.2)
    sumerror = 0;

  // Steering direction: turns toward line
  if (Turn < 0) {
    M1P = -Turn;
    M2P = Turn;
  }
  else if (Turn > 0) {
    M1P = -Turn;
    M2P = Turn;
  }
  else {
    M1P = 0;
    M2P = 0;
  }

  lasterror = error;
  sumerror = sumerror + error;
}

// Telemetry output for debugging
void Print() {
  Serial.print(" Sp: " + String(SpRead) + " P: " + String(kP) + " I: " + String(kI) + " D: " + String(kD) + " PResistor Val: ");

  for (int i = 0; i < totalPhotoResistors; i++) {
    Serial.print(LDR[i]);
    Serial.print(" ");
  }

  Serial.print(" Error: " + String(error));
  Serial.println(" LMotor: " + String(M1SpeedtoMotor) + " RMotor: " + String(M2SpeedtoMotor));

  setLeds(0);
  delay(100);
  setLeds(1);
  delay(100);
}
