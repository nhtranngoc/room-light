#define FASTLED_ESP8266_RAW_PIN_ORDER
#include <FastLED.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <PubSubClient.h>
#include "secrets.h" // Haven't tested this yet

extern char* ssid;
extern char* password;
extern char* mqtt_server;

#define LED_PIN 12
#define COLOR_ORDER GRB
#define CHIPSET NEOPIXEL
#define NUM_LEDS 150

CRGB leds[NUM_LEDS];

int gStatusCounter = 0;
bool gSetFlag = false;
int fpsCounter = 0;
uint32_t secondTimer = 0;

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  FastLED.addLeds<CHIPSET, LED_PIN>(leds, NUM_LEDS).setCorrection( TypicalSMD5050 ).setTemperature( Halogen );
  //Setup wifi
  delay(10);
  // Show working status, normal.
  leds[gStatusCounter] = CRGB::Green;
  gStatusCounter++;
  
  FastLED.show();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println(".");
    leds[gStatusCounter] = CRGB::Yellow;
    FastLED.show();
    gStatusCounter++;
  }

  ArduinoOTA.setHostname("Room-Light");
  ArduinoOTA.onStart([]() {
    Serial.println("Start\n");
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("End");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  ArduinoOTA.begin();

  // Show WiFi connected status on the strip
  leds[gStatusCounter] = CRGB::Green;
  FastLED.show();
  gStatusCounter++;
  
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void callback(char* topic, byte* payload, unsigned int length) {
//  Serial.print("Message arrived on: ");
//  Serial.print(topic);
//  Serial.println();

  // For debugging purposes
  //  for (int i=0; i<length; i++) {
  //    Serial.print((char)payload[i]);
  //  }
  //  Serial.println();

  // Subscribe to different topics
  if (strcmp(topic,"/esp/strip")==0) {
    // Set universal color for the whole strip
    // Payload is a buffer with 3 hex colors in rgb order;
    // @TODO: Work on payload validation.
    fill_solid(leds, NUM_LEDS, CRGB(payload[0],payload[1],payload[2]));
    FastLED.show();
  }
  
  if (strcmp(topic, "/esp/stripH")==0) {
    //Same as /esp/strip, but payload is a literal string of Hex color. To use with existing MQTT app.
    int color = atoi((char*)payload);
    fill_solid(leds, NUM_LEDS, CRGB(color));
    FastLED.show();
  }

  //Make sure to change payload size to at least NUM_LEDS*3 to accomodate frame transfer (can be found in PubSubClient.h)
  if (strcmp(topic, "/esp/pixels")==0) {
    // Set different colors for each pixel
    // Payload is a buffer of 450 bytes, containing rgb values for the LEDs
    Serial.println(payload[0]);
    for (int i=0;i<NUM_LEDS;i++) {
      leds[i].r = payload[i*3];
      leds[i].g = payload[i*3+1];
      leds[i].b = payload[i*3+2];
    }
    FastLED.show();
  }

  //Generalize this for use with the existing MQTT app
  if (strcmp(topic, "/esp/switch")==0) {
    if ((payload[0] == 0x00) || ((char*)payload == "0")) {
      fill_solid(leds, NUM_LEDS, CRGB::Black);
    } else if ((payload[0] == 0x01) || ((char*)payload == "1")){
      fill_solid(leds, NUM_LEDS, CRGB::White);
    }
    FastLED.show();
  }

  if (strcmp(topic, "/esp/gradient")==0) {
    fill_gradient_RGB(leds, (uint16_t)payload[0], CRGB(payload[1],payload[2],payload[3]), (uint16_t)payload[4], CRGB(payload[5],payload[6],payload[7]));
    FastLED.show();
  }

  if (strcmp(topic, "/esp/colorTemp")==0) {
    FastLED.setTemperature(CRGB(payload[0], payload[1], payload[2]));
    FastLED.show();
  }
  
  fpsCounter++;
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("ESP8266Client", "/lwt", 0, true, "stayin alive ah ah ah")) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("/esp/test", "hello world");
      // ... and resubscribe
      client.subscribe("/esp/strip");
      client.subscribe("/esp/pixels");
      client.subscribe("/esp/switch");
      client.subscribe("/esp/gradient");
      client.subscribe("/esp/colorTemp");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void loop() {
  ArduinoOTA.handle();
  if (!client.connected()) {
    leds[gStatusCounter] = CRGB::Yellow;
    FastLED.show();
    gStatusCounter++;
    reconnect();
  }
  // Notify that setting up is finished.
  if (!gSetFlag) {
    leds[gStatusCounter] = CRGB::Green;
    FastLED.show();
    delay(500);
    FastLED.clear();
    FastLED.show();
    gSetFlag = true;
  }
  client.loop();
  if (millis() - secondTimer >= 1000U) {
      secondTimer = millis();
      Serial.printf("FPS: %d\n", fpsCounter);
      fpsCounter = 0;
  }     
}

