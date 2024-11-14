/**
 * @reference https://github.com/myDevicesIoT/cayenne-docs/blob/master/docs/LORA.md
 * @reference http://openmobilealliance.org/wp/OMNA/LwM2M/LwM2MRegistry.html#extlabel
 *
 * Adapted for lora-app-server from https://gist.github.com/iPAS/e24970a91463a4a8177f9806d1ef14b8
 *
 * Type                   IPSO   LPP   RAK Data Type	  Data Size   Data Resolution per bit
 * Digital Input          3200   0     0                  1           (ON / OFF)
 * Digital Output         3201   1     1                  1           (ON / OFF)
 * Analog Input           3202   2     2                  2           0.01mA(V), Min: 0.0, MAX: 655.35
 * Nitrogen               3216   3     16                 2           1mg/Kg, Min: 0, MAX: 65535
 * Phosphorus             3217   10    17                 2           1mg/Kg, Min: 0, MAX: 65535
 * Potassium              3218   11    18                 2           1mg/Kg, Min: 0, MAX: 65535
 * Salinity               3219   12    19                 2           1mg/L, Min: 0, MAX: 65535
 * Dissolved Oxygen       3220   14    20                 2           0.01mg/L, Min: 0.0, MAX: 655.35
 * ORP                    3221   15    21                 2           0.1mv sign
 * COD                    3222   16    22                 2           1mg/L, Min: 0, MAX: 65535
 * Turbidity              3223   17    23                 2           1NTU, Min: 0, MAX: 65535
 * NO3                    3224   18    24                 2           0.1ppm, Min: 0.0, MAX: 6553.5
 * NH4+                   3225   19    25                 2           0.01ppm, Min: 0.0, MAX: 655.35
 * BOD                    3226   1A    26                 2           1mg/L, Min: 0, MAX: 65535
 * Illuminance            3301   65    101                4           1Lux, Min: 0, MAX: 4294967295
 * Presence               3302   66    102                1           (Yes/No)
 * Temperature            3303   67    103                2           0.1°C, Min: -3276.8, MAX: 3276.7
 * Humidity Sensor        3304   68    104                1           1%RH Unsigned
 * Air Quality Index      3305   69    105                2           1 Unsigned MSB, Min: 0, MAX: 65535
 * Humidity               3312   70    112                2           0.1%, Min: 0.0, MAX: 100.0
 * Accelerometer          3313   71    113                6           0.001 G Signed MSB per axis
 * Pressure               3315   73    115                2           0.1hPa, Min: 0.0, MAX: 6553.5
 * Battery Voltage        3316   74    116                2           0.01V, Min: 0.0, MAX: 655.35
 * Precipitation          3319   77    119                2           1mm/h, Min: 0, MAX: 65535
 * Percentage             3320   78    120                1           1%, Min: 0, Max: 100
 * CO2 Concentration      3325   7D    125                2           1ppm, Min: 0, MAX: 65535
 * EC                     3328   80    128                2           0.001mS/cm, Min: 0.0, Max: 65.535
 * High-Precision EC      3328   80    127                4           0.001uS/cm, Min: 0.0, Max: 4294967.295
 * Serial Number          3326   7E    126                3           3 bytes Serial number in MSB
 * Distance               3330   82    130                4           0.001 m
 * VOC                    3338   8A    138                2           1, Min: 0, MAX: 65535
 * Wind Speed             3344   92    144                2           0.01m/s, Min: 0.0, MAX: 655.35
 * Strikes                3345   93    145                2           1, Min: 0, MAX: 65535
 * Capacity               3352   B8    152                1           1%RH, Min: 0, MAX: 100
 * DC Current             3353   B9    153                2           0.01A, Min: -327.68, MAX: 327.67
 * DC Voltage             3354   BA    154                2           0.01V, Min: 0.0, MAX: 655.35
 * Moisture               3356   BC    156                2           0.1%, Min: 0.0, Max: 100.0
 * Wind Speed             3358   BE    158                2           0.01m/s, Min: 0.0, MAX: 655.35
 * Wind Direction         3359   BF    159                2           1°, in 0~359°
 * pH (High Precision)    3361   C1    161                2           0.01, Min: 0.0, MAX: 655.35
 * pH                     3362   C2    162                2           0.1 pH
 * Pyranometer            3363   C3    163                2           1 unsigned MSB (W/m2)
 * PM10                   3427   E3    227                2           1ug/m3, Min: 0, MAX: 65535
 * PM2.5                  3428   E4    228                2           1ug/m3, Min: 0, MAX: 65535
 * Noise                  3433   E9    233                2           0.1dB, Min: 0.0, MAX: 6553.5
 * Orientation            3429   E5    229                2           0.1°, Min: -90.0, MAX: 90.0
 * Raw Data Binary        3441   F1    241                /           TLV format binary raw data for Modbus, RS232, or other specific data format
 * Binary2byte            3443   F3    243                2           Modbus content, "Raw2byte" (Solar Battery Errors; BMS Firmware version)
 * Binary4byte            3444   F4    244                4           Modbus content, "Raw4byte"
 * Generic Float          3445   F5    245                4           IEEE754 float format
 * Generic Integer        3446   F6    246                4           Min: -2147483648, Max: 2147483647
 * Generic Unsigned Int   3447   F7    247                4           Min: 0, Max: 4294967295
 * Raw Binary Data        3448   F8    248                /           TLV format binary raw data
 */

// lppDecode decodes an array of bytes into an array of ojects, 
// each one with the channel, the data type and the value.

function lppDecode(bytes) {
    var sensor_types = {
        0:   {'size': 1, 'name': 'digital_in', 'signed': false, 'divisor': 1},
        1:   {'size': 1, 'name': 'digital_out', 'signed': false, 'divisor': 1},
        2:   {'size': 2, 'name': 'analog_in', 'signed': true, 'divisor': 100},
        3:   {'size': 2, 'name': 'analog_out', 'signed': true, 'divisor': 100},
        16:  {'size': 2, 'name': 'nitrogen', 'signed': false, 'divisor': 1},
        17:  {'size': 2, 'name': 'phosphorus', 'signed': false, 'divisor': 1},
        18:  {'size': 2, 'name': 'potassium', 'signed': false, 'divisor': 1},
        19:  {'size': 2, 'name': 'salinity', 'signed': false, 'divisor': 1},
        20:  {'size': 2, 'name': 'dissolved_oxygen', 'signed': false, 'divisor': 100},
        21:  {'size': 2, 'name': 'orp', 'signed': false, 'divisor': 10},
        22:  {'size': 2, 'name': 'cod', 'signed': false, 'divisor': 1},
        23:  {'size': 2, 'name': 'turbidity', 'signed': false, 'divisor': 1},
        24:  {'size': 2, 'name': 'no3', 'signed': false, 'divisor': 10},
        25:  {'size': 2, 'name': 'nh4+', 'signed': false, 'divisor': 100},
        26:  {'size': 2, 'name': 'bod', 'signed': false, 'divisor': 1},
        100: {'size': 4, 'name': 'generic', 'signed': false, 'divisor': 1},
        101: {'size': 2, 'name': 'illuminance', 'signed': false, 'divisor': 1},
        102: {'size': 1, 'name': 'presence', 'signed': false, 'divisor': 1},
        103: {'size': 2, 'name': 'temperature', 'signed': true, 'divisor': 10},
        104: {'size': 1, 'name': 'humidity', 'signed': false, 'divisor': 2},
        105: {'size': 2, 'name': 'air_quality_index', 'signed': false, 'divisor': 1},
        112: {'size': 2, 'name': 'humidity_prec', 'signed': true, 'divisor': 10},
        113: {'size': 6, 'name': 'accelerometer', 'signed': true, 'divisor': 1000},
        115: {'size': 2, 'name': 'barometer', 'signed': false, 'divisor': 10},
        116: {'size': 2, 'name': 'voltage', 'signed': false, 'divisor': 100},
        117: {'size': 2, 'name': 'current', 'signed': false, 'divisor': 1000},
        118: {'size': 4, 'name': 'frequency', 'signed': false, 'divisor': 1},
        120: {'size': 1, 'name': 'percentage', 'signed': false, 'divisor': 1},
        121: {'size': 2, 'name': 'altitude', 'signed': true, 'divisor': 1},
        125: {'size': 2, 'name': 'concentration', 'signed': false, 'divisor': 1},
        126: {'size': 3, 'name': 'rak_device_serial_number', 'signed': false, 'divisor': 1},
        127: {'size': 4, 'name': 'high_precision_ec', 'signed': false, 'divisor': 1000},
        128: {'size': 2, 'name': 'power', 'signed': false, 'divisor': 1},
        130: {'size': 4, 'name': 'distance', 'signed': false, 'divisor': 1000},
        131: {'size': 4, 'name': 'energy', 'signed': false, 'divisor': 1000},
        132: {'size': 2, 'name': 'direction', 'signed': false, 'divisor': 1},
        133: {'size': 4, 'name': 'time', 'signed': false, 'divisor': 1},
        134: {'size': 6, 'name': 'gyrometer', 'signed': true, 'divisor': 100},
        135: {'size': 3, 'name': 'colour', 'signed': false, 'divisor': 1},
        136: {'size': 9, 'name': 'gps', 'signed': true, 'divisor': [10000, 10000, 100]},
        137: {'size': 11, 'name': 'gps', 'signed': true, 'divisor': [1000000, 1000000, 100]},
        138: {'size': 2, 'name': 'voc', 'signed': false, 'divisor': 1},
        142: {'size': 1, 'name': 'switch', 'signed': false, 'divisor': 1},
        144: {'size': 2, 'name': 'wind_speed', 'signed': false, 'divisor': 100},
        145: {'size': 2, 'name': 'strikes', 'signed': false, 'divisor': 1},
        152: {'size': 1, 'name': 'capacity', 'signed': false, 'divisor': 1},
        153: {'size': 2, 'name': 'dc_current', 'signed': false, 'divisor': 100},
        154: {'size': 2, 'name': 'dc_voltage', 'signed': false, 'divisor': 100},
        156: {'size': 2, 'name': 'moisture', 'signed': false, 'divisor': 10},
        158: {'size': 2, 'name': 'wind_speed', 'signed': false, 'divisor': 100},
        159: {'size': 2, 'name': 'wind_direction', 'signed': false, 'divisor': 1},
        161: {'size': 2, 'name': 'high_precision_ph', 'signed': false, 'divisor': 100},
        162: {'size': 2, 'name': 'ph', 'signed': false, 'divisor': 10},
        163: {'size': 2, 'name': 'pyranometer', 'signed': false, 'divisor': 1},
		184: {'size': 1, 'name': 'capacity_batt', 'signed': false, 'divisor': 1},
		185: {'size': 2, 'name': 'dc_current_batt', 'signed': false, 'divisor': 100},
		186: {'size': 2, 'name': 'dc_voltage_batt', 'signed': false, 'divisor': 100},
        188: {'size': 2, 'name': 'soil_moist', 'signed': false, 'divisor': 10},
        190: {'size': 2, 'name': 'wind_speed', 'signed': false, 'divisor': 100},
        191: {'size': 2, 'name': 'wind_direction', 'signed': false, 'divisor': 1},
        192: {'size': 2, 'name': 'soil_ec', 'signed': false, 'divisor': 1000},
        193: {'size': 2, 'name': 'soil_ph_h', 'signed': false, 'divisor': 100},
        194: {'size': 2, 'name': 'soil_ph_l', 'signed': false, 'divisor': 10},
        195: {'size': 2, 'name': 'pyranometer', 'signed': false, 'divisor': 1},
        203: {'size': 1, 'name': 'light', 'signed': false, 'divisor': 1},
        227: {'size': 2, 'name': 'pm10', 'signed': false, 'divisor': 1},
        228: {'size': 2, 'name': 'pm2_5', 'signed': false, 'divisor': 1},
        229: {'size': 2, 'name': 'orientation', 'signed': true, 'divisor': 10},
        233: {'size': 2, 'name': 'noise', 'signed': false, 'divisor': 10},
        241: {'size': '/', 'name': 'binary_raw', 'signed': false, 'divisor': 1},
        243: {'size': 2, 'name': 'raw2byte', 'signed': false, 'divisor': 1},
        244: {'size': 4, 'name': 'raw4byte', 'signed': false, 'divisor': 1},
        245: {'size': 4, 'name': 'float', 'signed': false, 'divisor': 1},
        246: {'size': 4, 'name': 'int32', 'signed': true, 'divisor': 1},
        247: {'size': 4, 'name': 'uint32', 'signed': false, 'divisor': 1},
        248: {'size': '/', 'name': 'binary_tlv', 'signed': false, 'divisor': 1}
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
            case 113: // Accelerometer
                s_value = {
                    'x': arrayToDecimal(bytes.slice(i + 0, i + 2), type.signed, type.divisor),
                    'y': arrayToDecimal(bytes.slice(i + 2, i + 4), type.signed, type.divisor),
                    'z': arrayToDecimal(bytes.slice(i + 4, i + 6), type.signed, type.divisor)
                };
                break;

            default: // All other sensor types
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
// For TTN, Helium and Datacake
function Decoder(bytes, fport) {

	// bytes = input.bytes;
	// fPort = input.fPort;

	// flat output (like original decoder):
	var response = {};
	lppDecode(bytes, 1).forEach(function (field) {
		response[field['name'] + '_' + field['channel']] = field['value'];
	});

	// Enable only for Datacake
	// response['LORA_RSSI'] = (!!normalizedPayload.gateways && !!normalizedPayload.gateways[0] && normalizedPayload.gateways[0].rssi) || 0;
	// response['LORA_SNR'] = (!!normalizedPayload.gateways && !!normalizedPayload.gateways[0] && normalizedPayload.gateways[0].snr) || 0;
	// response['LORA_DATARATE'] = normalizedPayload.data_rate;

	return response;
}

// For Chirpstack V3
function Decode(fPort, bytes, variables) {

	// bytes = input.bytes;
	// fPort = input.fPort;

	// flat output (like original decoder):
	var response = {};
	lppDecode(bytes, 1).forEach(function (field) {
		response[field['name'] + '_' + field['channel']] = field['value'];
	});
	return response;
}

// Chirpstack v3 to v4 compatibility wrapper
function decodeUplink(input) {
	return {
		data: Decode(input.fPort, input.bytes, input.variables)
	};
}
