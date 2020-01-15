#define DELAY 10000L

long ts = -DELAY;
String inputString = "";

void setup() {
  Serial.begin(9600);
  inputString.reserve(200);
}

void loop() {
  if (millis() - ts > DELAY) {
    ts = millis();
    
    Serial.println("test");
    delay(100);
    Serial.println(135);
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();

    if (inChar == '\n') {
      Serial.print("received: ");
      Serial.println(inputString);
      inputString = "";
    }
    else inputString += inChar;
  }
}
