# RAKwireless Standardized LoRaWAN Packet Format
| <img src="./assets/rak_whirl.png" alt="RAKWireless"> | <img src="./assets/rakstar.jpg" alt="RAKstar" > | <img src="./assets/rui3.png" alt="RUI3" > |    
| :-: | :-: | :-: |     

To be able to use one payload decoder for all new RAKwireless devices, the devices are using a packet format that is based on [Cayenne LPP](https://developers.mydevices.com/cayenne/docs/lora/) but with extended data types that are coming from [ElectronicCats CayenneLPP library](https://github.com/ElectronicCats/CayenneLPP) or additional data types defined and added by RAKwireless.    

This data format is used by
- Sensor Hub
- WisBlock example code that is based on the [WisBlock-API](https://github.com/beegee-tokyo/WisBlock-API) and the [WisBlock-Sensor-For-LoRaWAN](https://github.com/beegee-tokyo/WisBlock-Sensor-For-LoRaWAN)
- WisBlock solutions like the RAK10700
- WisNode devices (planned)

A decoder for this extended Cayenne LPP data format is in this repository, the [RAKwireless_Standardized_Payload.js][./RAKwireless_Standardized_Payload.js] file.
It works with Chirpstack, TheThingsNetwork, Helium LoRaWAN servers and the Datacake integration for data processing and visualization.

----

# Packet data format
The packet data is made compatible with the extended Cayenne LPP encoding from [ElectronicCats/CayenneLPP](https://github.com/ElectronicCats/CayenneLPP) ⤴️.    
The content of the packet depends on the WisBlock example or RAKwireless device like the SensorHub :     

| Data                     | Channel # | Channel ID               | Length   | Comment                                           | Device                      | Decoded Field Name |
| --                       | --        | --                       | --       | --                                                | --                          | --                 |
| Battery value            | 1         | _**116**_ <sup>1)</sup>  | 2 bytes  | 0.01 V Unsigned MSB                               | WisBlock RAK4631            | voltage_1          |
| Humidity                 | 2         | 104                      | 1 byte   | in %RH                                            | WisBlock RAK1901, SensorHub | humidity_2         |
| Temperature              | 3         | 103                      | 2 bytes  | in °C                                             | WisBlock RAK1901, SensorHub | temperature_3      | 
| Barometric Pressure      | 4         | 115                      | 2 bytes  | in hPa (mBar)                                     | WisBlock RAK1902, SensorHub | barometer_4        |
| Illuminance              | 5         | 101                      | 2 bytes  | 1 lux unsigned                                    | WisBlock RAK1903            | illuminance_5      |
| Humidity 2               | 6         | 104                      | 1 byte   | in %RH                                            | WisBlock RAK1906            | humidity_6         |
| Temperature 2            | 7         | 103                      | 2 bytes  | in °C                                             | WisBlock RAK1906            | temperature_7      | 
| Barometric Pressure 2    | 8         | 115                      | 2 bytes  | in hPa (mBar)                                     | WisBlock RAK1906            | barometer_8        |
| Gas Resistance 2         | 9         | 2                        | 2 bytes  | 0.01 signed (kOhm)                                | WisBlock RAK1906            | analog_9           |
| GNSS stand. resolution   | 10        | 136                      | 9 bytes  | 3 byte lon/lat 0.0001 °, 3 bytes alt 0.01 meter   | WisBlock RAK1910, RAK12500  | gps_10             |
| GNSS enhanced resolution | 10        | _**137**_ <sup>2)</sup>  | 11 bytes | 4 byte lon/lat 0.000001 °, 3 bytes alt 0.01 meter | WisBlock RAK1910, RAK12500  | gps_10             |
| Soil Temperature         | 11        | 103                      | 2 bytes  | in °C                                             | WisBlock RAK12023/RAK12035  | temperature_11     |
| Soil Humidity            | 12        | 104                      | 1 byte   | in %RH                                            | WisBlock RAK12023/RAK12035  | humidity_12        |
| Soil Humidity Raw        | 13        | 2                        | 2 bytes  | 0.01 signed                                       | WisBlock RAK12023/RAK12035  | analog_in_13       |
| Soil Data Valid          | 14        | 102                      | 1 byte   | bool                                              | WisBlock RAK12023/RAK12035  | presence_14        |
| Illuminance 2            | 15        | 101                      | 2 bytes  | 1 lux unsigned                                    | WisBlock RAK12010           | illuminance_15     |
| VOC                      | 16        | _**138**_ <sup>2)</sup>  | 2 bytes  | VOC index                                         | WisBlock RAK12047           | voc_16             |
| MQ2 Gas                  | 17        | 2                        | 2 bytes  | 0.01 signed                                       | WisBlock RAK12004           | analog_in_17       |
| MQ2 Gas Percentage       | 18        | _**120**_ <sup>1)</sup>  | 1 byte   | 1-100% unsigned                                   | WisBlock RAK12004           | percentage_18      |
| MG812 Gas                | 19        | 2                        | 2 bytes  | 0.01 signed                                       | WisBlock RAK12008           | analog_in_19       |
| MG812 Gas Percentage     | 20        | _**120**_ <sup>1)</sup>  | 1 byte   | 1-100% unsigned                                   | WisBlock RAK12008           | percentage_20      |
| MQ3 Alcohol Gas          | 21        | 2                        | 2 bytes  | 0.01 signed                                       | WisBlock RAK12009           | analog_in_21       |
| MQ3 Alcohol Gas Perc.    | 22        | _**120**_ <sup>1)</sup>  | 1 byte   | 1-100% unsigned                                   | WisBlock RAK12009           | percentage_22      |
| ToF distance             | 23        | 2                        | 2 bytes  | 0.01 signed                                       | WisBlock RAK12014           | analog_in_23       |
| ToF Data Valid           | 24        | 102                      | 1 byte   | bool                                              | WisBlock RAK12014           | presence_24        |
| Gyro triggered           | 25        | _**134**_ <sup>1)</sup>  | 6 bytes  | 2 bytes per axis, 0.01 °/s                        | WisBlock RAK12025           | gyrometer_25       |
| Gesture detected         | 26        | 0                        | 1 byte   | 1 byte with id of gesture                         | WisBlock RAK14008           | digital_in_26      |
| LTR390 UVI value         | 27        | 2                        | 2 bytes  | 0.01 signed                                       | WisBlock RAK12019           | analog_in_27       | 
| LTR390 UVS value         | 28        | 101                      | 2 bytes  | 1 lux unsigned                                    | WisBlock RAK12019           | illuminance_28     | 
| INA219 Current           | 29        | 2                        | 2 bytes  | 0.01 signed                                       | WisBlock RAK16000           | analog_29          | 
| INA219 Voltage           | 30        | 2                        | 2 bytes  | 0.01 signed                                       | WisBlock RAK16000           | analog_30          | 
| INA219 Power             | 31        | 2                        | 2 bytes  | 0.01 signed                                       | WisBlock RAK16000           | analog_31          | 
| Touchpad left            | 32        | 102                      | 1 byte   | bool                                              | WisBlock RAK14002           | presence_32        | 
| Touchpad middle          | 33        | 102                      | 1 byte   | bool                                              | WisBlock RAK14002           | presence_33        | 
| Touchpad right           | 34        | 102                      | 1 byte   | bool                                              | WisBlock RAK14002           | presence_34        | 
| SCD30 CO2 concentration  | 35        | 125                      | 2 bytes  | 1 ppm unsigned                                    | WisBlock RAK12037           | concentration_35   |
| SCD30 temperature        | 36        | 103                      | 2 bytes  | in °C                                             | WisBlock RAK12037           | temperature_36     |
| SCD30 humidity           | 37        | 104                      | 1 byte   | in %RH                                            | WisBlock RAK12037           | humidity_37        |
| MLX90632 sensor temp     | 38        | 103                      | 2 bytes  | in °C                                             | WisBlock RAK12003           | temperature_38     |
| MLX90632 object temp     | 39        | 103                      | 2 bytes  | in °C                                             | WisBlock RAK12003           | temperature_39     |
| PM 1.0 value             | 40        | 103                      | 2 bytes  | in ug/m3                                          | WisBlock RAK12039           | voc_40             |
| PM 2.5 value             | 41        | 103                      | 2 bytes  | in ug/m3                                          | WisBlock RAK12039           | voc_41             |
| PM 10 value              | 42        | 103                      | 2 bytes  | in ug/m3                                          | WisBlock RAK12039           | voc_42             |
| Earthquake event         | 43        | 102                      | 1 byte   | bool                                              | WisBlock RAK12027           | presence_43        |
| Earthquake SI value      | 44        | 2                        | 2 bytes  | analog 10 * m/s                                   | WisBlock RAK12027           | analog_44          |
| Earthquake PGA value     | 45        | 2                        | 2 bytes  | analog 10 * m/s2                                  | WisBlock RAK12027           | analog_45          |
| Earthquake SHUTOFF alert | 46        | 102                      | 1 byte   | bool                                              | WisBlock RAK12027           | presence_46        |
| LPP_CHANNEL_EQ_COLLAPSE  | 47        | 102                      | 1 byte   | bool                                              | WisBlock RAK12027           | presence_47        |
| Switch Status            | 48        | 102                      | 1 byte   | bool                                              | WisBlock RAK13011           | presence_48        |
| SensorHub Wind Speed     | 49        | _**190**_ <sup>1)</sup>  | 2 byte   | 0.01 m/s                                          | SensorHub RK900-09          | wind_speed_49      |
| SensorHub Wind Direction | 50        | _**191**_ <sup>1)</sup>  | 2 byte   | 1º                                                | SensorHub RK900-09          | wind_direction_50  |
| Audio level A weighting  | 51        | 2                        | 2 bytes  | 0.01 dB                                           | WisBlock Audio              | analog_51          |
| Audio level C weighting  | 52        | 2                        | 2 bytes  | 0.01 dB                                           | WisBlock Audio              | analog_52          |
| Audio alarm              | 53        | 102                      | 1 bytes  | bool                                              | WisBlock Audio              | presence_53        |
| Detected sound type      | 54        | 1                        | 1 bytes  | 0 - 255                                           | WisBlock Audio              | digital_out_54     |

### _REMARK_
Channel ID's marked with <sup>_**1)**_</sup> are extensions to the default Cayenne LPP format and need an extended decoder.    
Channel ID's marked with <sup>_**2)**_</sup> are extensions to the default Cayenne LPP format and need an extended decoder. In addition these data types cannot be generated with the CayenneLPP library, they need an extension to the library. The source code for this extension can be found in the [ext](./ext) folder.     

### _REMARK_
A decoder for TTN, Chirpstack, Helium and Datacake can be found in the folder [decoders](./decoders)    
The decoder returns the decoded data as an array. The used named for the sensor values are listed in the column _**Decoded Field Name**_.    
As much as possible standard Cayenne LPP formats are used.

----

# How to format the LoRaWAN payload

When writing application code using the Arduino framework (or alternative PlatformIO where applicable), the [ElectronicCats library _**CayenneLPP**_](https://github.com/ElectronicCats/CayenneLPP) can be used. For some WisBlock specific data types in addition the WisCayenne extension of the ElectronicCats CayenneLPP library is required. The WisCayenne class files can be found in the [ext](./ext) folder.     

The examples are kept as simple as possible, just showing the initialization and how to add values to the payload.    
The channel numbers are defined in a separate header file for both examples.    
There are two examples, one using the CayenneLPP library and a second example using the extension to the library.

### rak_lpp_.h

```cpp
// Cayenne LPP Channel numbers per sensor value
#define LPP_CHANNEL_BATT 1			   // Base Board
#define LPP_CHANNEL_HUMID 2			   // RAK1901, SensorHub
#define LPP_CHANNEL_TEMP 3			   // RAK1901, SensorHub
#define LPP_CHANNEL_PRESS 4			   // RAK1902, SensorHub
#define LPP_CHANNEL_LIGHT 5			   // RAK1903
#define LPP_CHANNEL_HUMID_2 6		   // RAK1906
#define LPP_CHANNEL_TEMP_2 7		   // RAK1906
#define LPP_CHANNEL_PRESS_2 8		   // RAK1906
#define LPP_CHANNEL_GAS_2 9			   // RAK1906
#define LPP_CHANNEL_GPS 10			   // RAK1910/RAK12500
#define LPP_CHANNEL_SOIL_TEMP 11	   // RAK12035
#define LPP_CHANNEL_SOIL_HUMID 12	   // RAK12035
#define LPP_CHANNEL_SOIL_HUMID_RAW 13  // RAK12035
#define LPP_CHANNEL_SOIL_VALID 14	   // RAK12035
#define LPP_CHANNEL_LIGHT2 15		   // RAK12010
#define LPP_CHANNEL_VOC 16			   // RAK12047
#define LPP_CHANNEL_GAS 17			   // RAK12004
#define LPP_CHANNEL_GAS_PERC 18		   // RAK12004
#define LPP_CHANNEL_CO2 19			   // RAK12008
#define LPP_CHANNEL_CO2_PERC 20		   // RAK12008
#define LPP_CHANNEL_ALC 21			   // RAK12009
#define LPP_CHANNEL_ALC_PERC 22		   // RAK12009
#define LPP_CHANNEL_TOF 23			   // RAK12014
#define LPP_CHANNEL_TOF_VALID 24	   // RAK12014
#define LPP_CHANNEL_GYRO 25			   // RAK12025
#define LPP_CHANNEL_GESTURE 26		   // RAK14008
#define LPP_CHANNEL_UVI 27			   // RAK12019
#define LPP_CHANNEL_UVS 28			   // RAK12019
#define LPP_CHANNEL_CURRENT_CURRENT 29 // RAK16000
#define LPP_CHANNEL_CURRENT_VOLTAGE 30 // RAK16000
#define LPP_CHANNEL_CURRENT_POWER 31   // RAK16000
#define LPP_CHANNEL_TOUCH_1 32		   // RAK14002
#define LPP_CHANNEL_TOUCH_2 33		   // RAK14002
#define LPP_CHANNEL_TOUCH_3 34		   // RAK14002
#define LPP_CHANNEL_CO2_2 35		   // RAK12037
#define LPP_CHANNEL_CO2_Temp_2 36	   // RAK12037
#define LPP_CHANNEL_CO2_HUMID_2 37	   // RAK12037
#define LPP_CHANNEL_TEMP_3 38		   // RAK12003
#define LPP_CHANNEL_TEMP_4 39		   // RAK12003
#define LPP_CHANNEL_PM_1_0 40		   // RAK12039
#define LPP_CHANNEL_PM_2_5 41		   // RAK12039
#define LPP_CHANNEL_PM_10_0 42		   // RAK12039
#define LPP_CHANNEL_EQ_EVENT 43		   // RAK12027
#define LPP_CHANNEL_EQ_SI 44		   // RAK12027
#define LPP_CHANNEL_EQ_PGA 45		   // RAK12027
#define LPP_CHANNEL_EQ_SHUTOFF 46	   // RAK12027
#define LPP_CHANNEL_EQ_COLLAPSE 47	   // RAK12027
#define LPP_CHANNEL_SWITCH 48		   // RAK13011
#define LPP_CHANNEL_WIND_SPEED 49	   // SensorHub RK900-09
#define LPP_CHANNEL_WIND_DIR 50		   // SensorHub RK900-09
#define LPP_CHANNEL_AUDIO_LEVEL_A 51	   // WisBlock Audio
#define LPP_CHANNEL_AUDIO_LEVEL_C 52	   // WisBlock Audio
#define LPP_CHANNEL_AUDIO_ALARM 53	   // WisBlock Audio
#define LPP_CHANNEL_AUDIO_TYPE 54	   // WisBlock Audio

```

### main.cpp using ElectronicCats CayenneLPP library

```cpp
#include <Arduino.h>
#include <CayenneLPP.h>
#include <rak_lpp_.h>

/** LoRaWAN packet */
CayenneLPP g_solution_data(255);

void setup()
{
	// Initialize Serial for debug output
	Serial.begin(115200);

	time_t serial_timeout = millis();
	// On nRF52840 the USB serial is not available immediately
	while (!Serial)
	{
		if ((millis() - serial_timeout) < 5000)
		{
			delay(100);
			digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
		}
		else
		{
			break;
		}
	}

	Serial.println("RAKwireless Sensor Node");
	Serial.println("-----------------------");
}

void loop()
{
	// Clear payload
	g_solution_data.reset();

	// Add humidity data
	g_solution_data.addRelativeHumidity(LPP_CHANNEL_HUMID, 32.5);
	// Add temperature data
	g_solution_data.addTemperature(LPP_CHANNEL_TEMP, 16.9);
	// Add barometric pressure data
	g_solution_data.addBarometricPressure(LPP_CHANNEL_PRESS, 1024);

	// Send routines need pointer to the payload and payload size
	// This can be obtained with g_solution_data.getSize() and g_solution_data.getBuffer()

	// Send the packet
	api.lorawan.send(g_solution_data.getSize(), g_solution_data.getBuffer());

	// Sleep for 60 seconds
	api.system.sleep.all(60000);
}
```

### main.cpp using the extension to the ElectronicCats CayenneLPP library

```cpp
#include <Arduino.h>
#include <wisblock_cayenne.h> // CayenneLPP class extension for some RAKwireless data types
#include <rak_lpp_.h>

/** LoRaWAN packet */
WisCayenne g_solution_data(255);

void setup()
{
	// Initialize Serial for debug output
	Serial.begin(115200);

	time_t serial_timeout = millis();
	// On nRF52840 the USB serial is not available immediately
	while (!Serial)
	{
		if ((millis() - serial_timeout) < 5000)
		{
			delay(100);
			digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
		}
		else
		{
			break;
		}
	}

	Serial.println("RAKwireless Sensor Node");
	Serial.println("-----------------------");
}

void loop()
{
	// Clear payload
	g_solution_data.reset();

	// Add VOC data
	g_solution_data.addVoc_index(LPP_CHANNEL_VOC, 30);
	// Add location data in extended precision
	g_solution_data.addGNSS_6(LPP_CHANNEL_GPS, 144213730, 1210069140, 30);

	// Send routines need pointer to the payload and payload size
	// This can be obtained with g_solution_data.getSize() and g_solution_data.getBuffer()

	// Send the packet
	api.lorawan.send(g_solution_data.getSize(), g_solution_data.getBuffer());

	// Sleep for 60 seconds
	api.system.sleep.all(60000);
}
```
----

