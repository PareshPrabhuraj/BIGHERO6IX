/* ************************************************************************************************* */
// UCSD ECE 5 Lab 4 Code: Line Following Robot with PID 
// Team: Big Hero 6ix (Simar Singh, Gavin Huang, John Barojas, Paresh Prabhu Raj)
// Line Following Code
// Based on ECE 5 Lab 4 V 4.0 by MingWei Yeoh, Korey Huynh, and Karcher Morris
/* ************************************************************************************************* */

/*
   This is code for your PID controlled line following robot.

   ******      Code Table of Contents      ******

  - Line_Follower_Code_Basic
   > Declare libraries     - declares global variables so each variable can be accessed from every function
   > Declare Pins          - where the user sets what pin everything is connected to 
   > Settings              - settings that can improve robot functionality and help to debug
   > Setup (Main)          - runs once at beginning when you press button on arduino or when you open serial monitor
   > Loop  (Main)          - loops forever calling on a series of function
   
  - Calibration 
   > Main Calibrate()      - runs calibration function calls and synchronizes calibration state with different led animations
  
  - Helper_Functions
   > setLEDs               - turns on all LEDs in the LED_Pin array on or off
   > Read Potentiometers   - reads each potentiometer
   > Read Photoresistors   - reads each photoresistor
   > Run Motors            - runs motors
   > Calculate Error       - calculate error from photoresistor readings
   > PID Turn              - takes the error and implements PID control
   > Print                 - used for printing information but should disable when not debugging because it slows down program

*/

// Include files needed
#include <Arduino.h>
#include <L298NX2.h> // Using "L298N" library found through arduino library manager developed by Andrea Lombardo

// ************************************************************************************************* //
// ************************************************************************************************* //
// Change Robot Settings here

#define PRINTALLDATA        0  // Turn to 1 for serial debug; set to 0 when running robot untethered (Slide 12 & 15)
#define NOMINALSPEED        45 // Base motor speed to overcome gearbox friction (Slide 15)

// ************************************************************************************************* //

// ****** DECLARE PINS HERE  ****** 

// Taken from LEFT TO RIGHT of the robot looking from the rear (wheels closest, photoresistors farthest)
//                  Left Motors   Right motors 
L298NX2 DriveMotors(  42, 41, 40,      37, 39, 38);
//                 ENA, IN1, IN2, ENB, IN3, IN4

enum side {LEFT, RIGHT};

// 7 photoresistors from Left to Right looking from rear (IO8 down to IO2)
int LDR_Pin[] = {8, 7, 6, 5, 4, 3, 2};      

// Potentiometer Pins (IO10-IO13)
const int S_pin = 13; // Speed
const int P_pin = 12; // Proportional
const int I_pin = 11; // Integral
const int D_pin = 10; // Derivative
                                                                 
int led_Pins[] = {46};  // Calibration indicator LED

// ****** DECLARE Variables HERE  ****** 

// Variables Potentiometer Reading
int SpRead = 0; // speed increase
int kPRead = 0; // proportional gain
int kIRead = 0; // integral gain
int kDRead = 0; // derivative gain

// Variables for Calibration and Error Calculation
float Mn[20]; 
float Mx[20];
float LDRf[20];
int LDR[20];    
int rawPResistorData[20];  
int totalPhotoResistors = sizeof(LDR_Pin) / sizeof(LDR_Pin[0]);  
int numLEDs = sizeof(led_Pins) / sizeof(led_Pins[0]); 
int MxRead, MxIndex;
float CriteriaForMax;
int leftHighestPR, highestPResistor, rightHighestPR;
float AveRead, WeightedAve;   

// For Motor Control
int M1SpeedtoMotor, M2SpeedtoMotor;
int Turn, M1P = 0, M2P = 0;
float error = 0, lasterror = 0, sumerror = 0;
float last_valid_error = 0;
float kP, kI, kD;

// ************************************************************************************************* //
// setup - runs once
void setup() {
#if PRINTALLDATA
  Serial.begin(9600);                            // For serial communication set up
#endif

  for (int i = 0; i < numLEDs; i++)
    pinMode(led_Pins[i], OUTPUT);                // Initialize all LEDs to output
  
  // Keep motors stopped during calibration
  runMotorAtSpeed(LEFT, 0);
  runMotorAtSpeed(RIGHT, 0);

  Calibrate();                                   // Calibrate black and white sensing

  ReadPotentiometers();                          // Read potentiometer values (Sp, P, I, & D)

} // end setup()

// ************************************************************************************************* //
// loop - runs/loops forever
void loop() {

  ReadPotentiometers(); // Read potentiometers

  ReadPhotoResistors(); // Read photoresistors 

  CalcError();          // Calculates error

  PID_Turn();           // PID Control and Output to motors to turn

  RunMotors();          // Runs motors
  
#if PRINTALLDATA
  Print();              // If PRINTALLDATA Enabled, Print all the data
#else
  delay(5);             // 200 Hz deterministic loop pacing when untethered
#endif
  
} // end loop()

// ************************************************************************************************* //
// function to calibrate

void Calibrate() {

  int numberOfMeasurements = 20;                // set number Of Measurements to take

  CalibrateHelper(numberOfMeasurements, false); // White Calibration

  setLeds(0);                                   // Turn off LEDs to indicate user to calibrate other color
  delay(2000);
  
  CalibrateHelper(numberOfMeasurements, true);  // Black Calibration

#if PRINTALLDATA
  Serial.print("White Vals:  ");
  for (int i = 0; i < totalPhotoResistors; i++)
    Serial.print(String(Mn[i]) + " ");          // Print the White values that will be used by the robot
  Serial.println();

  Serial.print("Black Vals:  ");
  for (int i = 0; i < totalPhotoResistors; i++)
    Serial.print(String(Mx[i]) + " ");          // Print the Black values that will be used by the robot
  Serial.println();

  Serial.print("Delta Vals:  ");
  for (int i = 0; i < totalPhotoResistors; i++)
    Serial.print(String(Mx[i] - Mn[i]) + " ");  // Print the Difference between the White and Black values
  Serial.println();
#endif

  setLeds(1);                                   // Turn LEDs on
  delay(1500);
  setLeds(0);

} // end Calibrate()

void CalibrateHelper(int numberOfMeasurements, boolean ifCalibratingBlack) {
  
#if PRINTALLDATA
  if (ifCalibratingBlack)
    Serial.println("\nCalibrating Black");
  else
    Serial.println("\nCalibrating White");
#endif

  // Indicate that calibration is starting
  for (int i = 0; i < 4; i++) {
      setLeds(1); // turn the LEDs on
      delay(250); // wait
      setLeds(0); // turn the LEDs off
      delay(250); // wait 
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
    if (ifCalibratingBlack) {                                   // updating corresponding array
      Mx[pin] = round(LDRf[pin] / (float)numberOfMeasurements); // take average and store for black
    }
    else {
      Mn[pin] = round(LDRf[pin] / (float)numberOfMeasurements); // take average and store for white
    }
    LDRf[pin] = 0.0;
  }

#if PRINTALLDATA
  Serial.println(" Done!");
#endif
  setLeds(0);
  delay(250);
}

// Set all LEDs to a certain brightness
void setLeds(int x) {
  for (int i = 0; i < numLEDs; i++)
    digitalWrite(led_Pins[i], x);
}

// **********Recall your Challenge #1 Code********************************************************************** //
// function to read and map values from potentiometers
void ReadPotentiometers() {
  SpRead = ReadPotentiometerHelper(S_pin, 0, 4095, 0, 100);
  kPRead = ReadPotentiometerHelper(P_pin, 0, 4095, 0, 100);
  kIRead = ReadPotentiometerHelper(I_pin, 0, 4095, 0, 100);
  kDRead = ReadPotentiometerHelper(D_pin, 0, 4095, 0, 100);
} // end ReadPotentiometers()

int ReadPotentiometerHelper(int pin, int min_resolution, int max_resolution, int min_potentiometer, int max_potentiometer) {
  return map(analogRead(pin), min_resolution, max_resolution, min_potentiometer, max_potentiometer); 
}

// **********Recall your Challenge #2 Code********************************************************************** //
// Function to read photo resistors and map from 0 to 100
void ReadPhotoResistors() {
  for (int i = 0; i < totalPhotoResistors; i++) { 
    rawPResistorData[i] = analogRead(LDR_Pin[i]);
    // Handles both normal and inverted polarity dividers safely
    if (Mx[i] != Mn[i]) {
      LDR[i] = map(rawPResistorData[i], Mn[i], Mx[i], 0, 100);
    } else {
      LDR[i] = 50;
    }
    LDR[i] = constrain(LDR[i], 0, 100);
  }    
} // end ReadPhotoResistors()

// **********Recall your Challenge #3 Code********************************************************************** //
// function to start motors using nominal speed + speed addition from potentiometer
void RunMotors() {
  // Straight line boost: add a bit of speed when centered on track
  int speedBoost = 0;
  if (abs(error) < 0.4) {
    speedBoost = 15;
  }

  int leftTarget = NOMINALSPEED + SpRead + speedBoost + M1P;
  int rightTarget = NOMINALSPEED + SpRead + speedBoost + M2P;

  M1SpeedtoMotor = constrain(leftTarget, -255, 255);
  M2SpeedtoMotor = constrain(rightTarget, -255, 255);
  
  runMotorAtSpeed(LEFT, M1SpeedtoMotor);  // left motor
  runMotorAtSpeed(RIGHT, M2SpeedtoMotor); // right motor
} // end RunMotors()

// A function that commands a specified motor to move towards a given direction at a given speed
void runMotorAtSpeed(side _side, int speed) {
  // Deadband check: if commanded speed is non-zero, ensure it's at least NOMINALSPEED to overcome stall
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
    // Right motor is mounted mechanically mirrored (180 deg) on chassis
    if (speed > 0)
      DriveMotors.backwardB();
    else if (speed < 0)
      DriveMotors.forwardB();
    else
      DriveMotors.stopB();
  }
}

// ************************************************************************************************* //
// Calculate error from photoresistor readings
void CalcError() {
  MxRead = -99;
  AveRead = 0.0;
  for (int i = 0; i < totalPhotoResistors; i++) {
    if (MxRead < LDR[i]) {
      MxRead = LDR[i];
      MxIndex = -1 * (i - 3);
      highestPResistor = i;
    }
    AveRead = AveRead + (float)LDR[i] / (float)totalPhotoResistors;
  }
  
  CriteriaForMax = 1.3; 
  if (MxRead > CriteriaForMax * AveRead) { // Highest reading actually sees the black tape
    if (highestPResistor != 0)
      leftHighestPR = highestPResistor - 1;
    else
      leftHighestPR = highestPResistor;

    if (highestPResistor != totalPhotoResistors - 1)
      rightHighestPR = highestPResistor + 1;
    else
      rightHighestPR = highestPResistor;

    // Weighted average across peak neighborhood
    float numerator = (float)(LDR[leftHighestPR] * leftHighestPR) + (float)(LDR[highestPResistor] * highestPResistor) + (float)(LDR[rightHighestPR] * rightHighestPR);
    float denominator = (float)LDR[leftHighestPR] + (float)LDR[highestPResistor] + (float)LDR[rightHighestPR];

    if (denominator > 0) {
      WeightedAve = numerator / denominator;
      error = (WeightedAve - 3.0); // Centers on index 3 (-3.0 to +3.0)
      last_valid_error = error;
    }
  } else {
    // If line lost on sharp curve, steer back toward last seen side
    if (last_valid_error > 0) {
      error = 3.0;
    } else if (last_valid_error < 0) {
      error = -3.0;
    }
  }
} // end CalcError()

// ************************************************************************************************* //
// PID Function
void PID_Turn() {
  kP = (float)kPRead * 1.0;     // Proportional gain scaling
  kI = (float)kIRead * 0.001;   // Integral gain scaling
  kD = (float)kDRead * 0.15;    // Derivative gain scaling

  Turn = error * kP + sumerror * kI + (error - lasterror) * kD; // PID

  // Anti-windup clamp
  if (sumerror > 5)
    sumerror = 5;
  else if (sumerror < -5)
    sumerror = -5;

  if (abs(error) < 0.2)
    sumerror = 0; // Reset sumerror when well-centered

  // Slide 13 Fix: Line Following Signs (NOT Line Avoiding!)
  // If line is on Left (Turn < 0), Left motor slows down and Right motor speeds up
  // If line is on Right (Turn > 0), Left motor speeds up and Right motor slows down
  if (Turn < 0) {
    M1P = Turn;
    M2P = -Turn;
  }
  else if (Turn > 0) {
    M1P = Turn;
    M2P = -Turn;
  }
  else {
    M1P = 0;
    M2P = 0;
  }

  lasterror = error;
  sumerror = sumerror + error;

} // end PID_Turn()

// ************************************************************************************************* //
// function to print values of interest
void Print() {
  Serial.print(" Sp: " + String(SpRead) + " P: " + String(kP) + " I: " + String(kI) + " D: " + String(kD) + "  PResistor Val : ");

  for (int i = 0; i < totalPhotoResistors; i++) {
    Serial.print(LDR[i]);
    Serial.print(" ");
  }

  Serial.print(" Error: " + String(error));
  Serial.println("  LMotor:  " + String(M1SpeedtoMotor) + "  RMotor:  " + String(M2SpeedtoMotor));
  
  setLeds(0); 
  delay(100);
  setLeds(1); 
  delay(100); 
} // end Print()
