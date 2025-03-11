// RAKwireless CayenneLPP decoder

// lppDecode decodes an array of bytes into an array of ojects, 
// each one with the channel, the data type and the value.

function lppDecode(bytes) {
	var sensor_types = {
		0: { 'size': 1, 'name': 'digital_in', 'signed': false, 'divisor': 1 },					// 00	Digital Input
		1: { 'size': 1, 'name': 'digital_out', 'signed': false, 'divisor': 1 },					// 01	Digital Output
		2: { 'size': 2, 'name': 'analog_in', 'signed': true, 'divisor': 100 },					// 02	Analog Input 
		3: { 'size': 2, 'name': 'analog_out', 'signed': true, 'divisor': 100 },					// 03	Analog Output
		16: { 'size': 2, 'name': 'nitrogen', 'signed': false, 'divisor': 1 },					// 10	Nitrogen 1mg/Kg
		17: { 'size': 2, 'name': 'phosphorus', 'signed': false, 'divisor': 1 },					// 11	Phosphorus 1mg/Kg
		18: { 'size': 2, 'name': 'potassium', 'signed': false, 'divisor': 1 },					// 12	Potassium 1mg/Kg
		19: { 'size': 2, 'name': 'salinity', 'signed': false, 'divisor': 1 },					// 13	Salinity 1mg/L
		20: { 'size': 2, 'name': 'dissolved_oxygen', 'signed': false, 'divisor': 100 },			// 14	Dissolved Oxygen 0.01mg/L
		21: { 'size': 2, 'name': 'orp', 'signed': false, 'divisor': 10 },						// 15	ORP 0.1mv sign
		22: { 'size': 2, 'name': 'cod', 'signed': false, 'divisor': 1 },						// 16	COD 1mg/L
		23: { 'size': 2, 'name': 'turbidity', 'signed': false, 'divisor': 1 },					// 17	Turbidity 1NTU
		24: { 'size': 2, 'name': 'no3', 'signed': false, 'divisor': 10 },						// 18	NO3 0.1ppm
		25: { 'size': 2, 'name': 'nh4+', 'signed': false, 'divisor': 100 },						// 19	NH4+ 0.01ppm
		26: { 'size': 2, 'name': 'bod', 'signed': false, 'divisor': 1 },						// 1A	BOD 1mg/L
		100: { 'size': 4, 'name': 'generic', 'signed': false, 'divisor': 1 },					// 64	Generic Value Min: 0
		101: { 'size': 2, 'name': 'illuminance', 'signed': false, 'divisor': 1 },				// 65	Illuminance	1Lux
		102: { 'size': 1, 'name': 'presence', 'signed': false, 'divisor': 1 },					// 66	Presence (Yes/No)
		103: { 'size': 2, 'name': 'temperature', 'signed': true, 'divisor': 10 },				// 67	Temperature 0.1°C
		104: { 'size': 1, 'name': 'humidity', 'signed': false, 'divisor': 2 },					// 68	Humidity Sensor 1%RH Unsigned
		105: { 'size': 2, 'name': 'air_quality_index', 'signed': false, 'divisor': 1 },			// 69	Air Quality Index 1 Unsigned MSB
		112: { 'size': 2, 'name': 'humidity_prec', 'signed': true, 'divisor': 10 },				// 70	Precise Humidity 0.1%
		113: { 'size': 6, 'name': 'accelerometer', 'signed': true, 'divisor': 1000 },			// 71	Accelerometer 0.001 G Signed MSB per axis
		115: { 'size': 2, 'name': 'barometer', 'signed': false, 'divisor': 10 },				// 73	Pressure 0.1hPa
		116: { 'size': 2, 'name': 'voltage', 'signed': false, 'divisor': 100 },					// 74	Battery Voltage 0.01V
		117: { 'size': 2, 'name': 'current', 'signed': false, 'divisor': 1000 },				// 75	Current 0.001 A Unsigned MSB
		118: { 'size': 4, 'name': 'frequency', 'signed': false, 'divisor': 1 },					// 76	Frequency 1 Hz Unsigned MSB
		119: { 'size': 4, 'name': 'precipitation', 'signed': false, 'divisor': 1 },				// 76	Precipitation 1mm/h
		120: { 'size': 1, 'name': 'percentage', 'signed': false, 'divisor': 1 },				// 78	Percentage 1%
		121: { 'size': 2, 'name': 'altitude', 'signed': true, 'divisor': 1 },					// 79	Altitude 1m Signed MSB
		125: { 'size': 2, 'name': 'concentration', 'signed': false, 'divisor': 1 },				// 7D	CO2 Concentration 1ppm
		126: { 'size': 3, 'name': 'rak_device_serial_number', 'signed': false, 'divisor': 1 },	// 7E	RAK Device Serial number
		127: { 'size': 4, 'name': 'high_precision_ec', 'signed': false, 'divisor': 1000 },		// 7F	EC 0.001mS/cm
		128: { 'size': 2, 'name': 'power', 'signed': false, 'divisor': 1 },						// 80	Power 1 Watt
		130: { 'size': 4, 'name': 'distance', 'signed': false, 'divisor': 1000 },				// 82	Distance 0.001 m
		131: { 'size': 4, 'name': 'energy', 'signed': false, 'divisor': 1000 },					// 83	Energy 0.001 Wh
		132: { 'size': 2, 'name': 'direction', 'signed': false, 'divisor': 1 },					// 84	Direction 1 degree
		133: { 'size': 4, 'name': 'time', 'signed': false, 'divisor': 1 },						// 85	Time (Unix)
		134: { 'size': 6, 'name': 'gyrometer', 'signed': true, 'divisor': 100 },				// 86	Gyrometer 0.01 °/s Signed
		135: { 'size': 3, 'name': 'colour', 'signed': false, 'divisor': 1 },					// 87	Color R: 255 G: 255 B: 255
		136: { 'size': 9, 'name': 'gps', 'signed': true, 'divisor': [10000, 10000, 100] },		// 88	Location Lat/Lng : 0.0001 ° Signed, Altitude : 0.01 meter Signed
		137: { 'size': 11, 'name': 'gps', 'signed': true, 'divisor': [1000000, 1000000, 100] },	// 89	High precision location Lat/Lng  : 0.000001 ° Signed, Altitude : 0.01 meter Signed
		138: { 'size': 2, 'name': 'voc', 'signed': false, 'divisor': 1 },						// 8A	VOC 1
		142: { 'size': 1, 'name': 'switch', 'signed': false, 'divisor': 1 },					// 90	Switch (Open/Closed)
		144: { 'size': 2, 'name': 'wind_speed', 'signed': false, 'divisor': 100 },				// 92	Wind Speed 0.01m/s
		145: { 'size': 2, 'name': 'strikes', 'signed': false, 'divisor': 1 },					// 93	Strikes 1
		152: { 'size': 1, 'name': 'capacity', 'signed': false, 'divisor': 1 },					// B8	Capacity 1
		153: { 'size': 2, 'name': 'dc_current', 'signed': false, 'divisor': 100 },				// B9	DC Current 0.01A
		154: { 'size': 2, 'name': 'dc_voltage', 'signed': false, 'divisor': 100 },				// BA	DC Voltage 0.01V
		156: { 'size': 2, 'name': 'moisture', 'signed': false, 'divisor': 10 },					// BC	Moisture 0.1%
		158: { 'size': 2, 'name': 'wind_speed', 'signed': false, 'divisor': 100 },				// BE	Wind Speed 0.01m/s
		159: { 'size': 2, 'name': 'wind_direction', 'signed': false, 'divisor': 1 },			// BF	Wind Direction 1°, in 0~359°
		161: { 'size': 2, 'name': 'high_precision_ph', 'signed': false, 'divisor': 100 },		// C1	pH (High Precision) 0.01 pH
		162: { 'size': 2, 'name': 'ph', 'signed': false, 'divisor': 10 },						// C2	pH 0.1 pH
		163: { 'size': 2, 'name': 'pyranometer', 'signed': false, 'divisor': 1 },				// C3	Pyranometer 1 W/m2
		184: { 'size': 1, 'name': 'capacity_batt', 'signed': false, 'divisor': 1 },				// B8	Battery Capacity %
		185: { 'size': 2, 'name': 'dc_current_batt', 'signed': false, 'divisor': 100 },			// B9	Battery Charging Current 0.01A
		186: { 'size': 2, 'name': 'dc_voltage_batt', 'signed': false, 'divisor': 100 },			// BA	Battery Voltage 0.01V
		188: { 'size': 2, 'name': 'soil_moist', 'signed': false, 'divisor': 10 },				// BC	Moisture 0.1%
		190: { 'size': 2, 'name': 'wind_speed', 'signed': false, 'divisor': 100 },				// BE	Wind Speed 0.01m/s
		191: { 'size': 2, 'name': 'wind_direction', 'signed': false, 'divisor': 1 },			// BF	Wind Direction 1°, in 0~359°
		192: { 'size': 2, 'name': 'soil_ec', 'signed': false, 'divisor': 1000 },				// C0	Soil EC 0.001
		193: { 'size': 2, 'name': 'soil_ph_h', 'signed': false, 'divisor': 100 },				// C1	Soil pH high precision 0.01
		194: { 'size': 2, 'name': 'soil_ph_l', 'signed': false, 'divisor': 10 },				// C2	Soil pH 0.1
		195: { 'size': 2, 'name': 'pyranometer', 'signed': false, 'divisor': 1 },				// C3	Pyranometer 
		203: { 'size': 1, 'name': 'light', 'signed': false, 'divisor': 1 },						// CB	1 W/m2
		227: { 'size': 2, 'name': 'pm10', 'signed': false, 'divisor': 1 },						// E3	PM10 1ug/m3
		228: { 'size': 2, 'name': 'pm2_5', 'signed': false, 'divisor': 1 },						// E4	PPM2.5 1ug/m3
		229: { 'size': 2, 'name': 'orientation', 'signed': true, 'divisor': 10 },				// E5	Orientation 0.1°
		233: { 'size': 2, 'name': 'noise', 'signed': false, 'divisor': 10 },					// E9	Noise 0.1dB
		241: { 'size': '/', 'name': 'binary_raw', 'signed': false, 'divisor': 1 },				// F1	TLV format binary raw data for Modbus, RS232, or other specific data format
		243: { 'size': 2, 'name': 'raw2byte', 'signed': false, 'divisor': 1 },					// F3	Modbus content, "Raw2byte" (Solar Battery Errors; BMS Firmware version)
		244: { 'size': 4, 'name': 'raw4byte', 'signed': false, 'divisor': 1 },					// F4	Modbus content, "Raw4byte"
		245: { 'size': 4, 'name': 'float', 'signed': false, 'divisor': 1 },						// F5	IEEE754 float format
		246: { 'size': 4, 'name': 'int32', 'signed': true, 'divisor': 1 },						// F6	Signed integer 32bit
		247: { 'size': 4, 'name': 'uint32', 'signed': false, 'divisor': 1 },					// F7	unisgned integer 32bit
		248: { 'size': '/', 'name': 'binary_tlv', 'signed': false, 'divisor': 1 }				// F8	TLV format binary raw data
	};

	function arrayToDecimal(stream, is_signed, divisor) {
		var value = 0;
		for (var i = 0; i < stream.length; i++) {
			if (stream[i] > 0xFF) throw 'Byte value overflow!';
			value = (value << 8) | stream[i];
		}
		if (is_signed) {
			var edge = 1 << (stream.length * 8);
			var max = (edge - 1) >> 1;
			value = (value > max) ? value - edge : value;
		}
		value /= divisor;
		return value;
	}

	var sensors = [];
	var i = 0;
	while (i < bytes.length) {
		var s_no = bytes[i++];
		var s_type = bytes[i++];
		if (typeof sensor_types[s_type] === 'undefined') {
			throw 'Sensor type error!: ' + s_type;
		}

		var s_value = 0;
		var type = sensor_types[s_type];
		switch (s_type) {
			case 113:   // Accelerometer
			case 134:   // Gyrometer
				s_value = {
					'x': arrayToDecimal(bytes.slice(i + 0, i + 2), type.signed, type.divisor),
					'y': arrayToDecimal(bytes.slice(i + 2, i + 4), type.signed, type.divisor),
					'z': arrayToDecimal(bytes.slice(i + 4, i + 6), type.signed, type.divisor)
				};
				break;
			case 136:   // GPS Location
				s_value = {
					'latitude': arrayToDecimal(bytes.slice(i + 0, i + 3), type.signed, type.divisor[0]),
					'longitude': arrayToDecimal(bytes.slice(i + 3, i + 6), type.signed, type.divisor[1]),
					'altitude': arrayToDecimal(bytes.slice(i + 6, i + 9), type.signed, type.divisor[2])
				};
				sensors.push({
					'channel': s_no,
					'type': s_type,
					'name': 'location',
					'value': "(" + s_value.latitude + "," + s_value.longitude + ")"
				});
				sensors.push({
					'channel': s_no,
					'type': s_type,
					'name': 'latitude',
					'value': s_value.latitude
				});
				sensors.push({
					'channel': s_no,
					'type': s_type,
					'name': 'longitude',
					'value': s_value.longitude
				});
				sensors.push({
					'channel': s_no,
					'type': s_type,
					'name': 'altitude',
					'value': s_value.altitude
				});
				break;
			case 137:   // Precise GPS Location
				s_value = {
					'latitude': arrayToDecimal(bytes.slice(i + 0, i + 4), type.signed, type.divisor[0]),
					'longitude': arrayToDecimal(bytes.slice(i + 4, i + 8), type.signed, type.divisor[1]),
					'altitude': arrayToDecimal(bytes.slice(i + 8, i + 11), type.signed, type.divisor[2])
				};
				sensors.push({
					'channel': s_no,
					'type': s_type,
					'name': 'location',
					'value': "(" + s_value.latitude + "," + s_value.longitude + ")"
				});
				sensors.push({
					'channel': s_no,
					'type': s_type,
					'name': 'latitude',
					'value': s_value.latitude
				});
				sensors.push({
					'channel': s_no,
					'type': s_type,
					'name': 'longitude',
					'value': s_value.longitude
				});
				sensors.push({
					'channel': s_no,
					'type': s_type,
					'name': 'altitude',
					'value': s_value.altitude
				});
				break;
			case 135:   // Colour
				s_value = {
					'r': arrayToDecimal(bytes.slice(i + 0, i + 1), type.signed, type.divisor),
					'g': arrayToDecimal(bytes.slice(i + 1, i + 2), type.signed, type.divisor),
					'b': arrayToDecimal(bytes.slice(i + 2, i + 3), type.signed, type.divisor)
				};
				break;
			default:   // All other sensor types
				s_value = arrayToDecimal(bytes.slice(i, i + type.size), type.signed, type.divisor);
				break;
		}

		sensors.push({
			'channel': s_no,
			'type': s_type,
			'name': type.name,
			'value': s_value
		});

		i += type.size;
	}

	return sensors; // Ensure this is inside lppDecode
}
// Actility LPP parser for RAKwireless payloads
function decodeUplink(input) {
	let result = {
		data: {},
		errors: [],
		warnings: []
	};
	lppDecode(input.bytes).forEach(function (field) {
		result.data[field['name'] + '_' + field['channel']] = field['value'];
	});
	return result;
}
