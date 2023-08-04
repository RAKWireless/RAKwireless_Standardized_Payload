// Decode decodes an array of bytes into an object.
//  - fPort contains the LoRaWAN fPort number
//  - bytes is an array of bytes, e.g. [225, 230, 255, 0]
//  - variables contains the device variables e.g. {"calibration": "3.5"} (both the key / value are of type string)
// The function must return an object, e.g. {"temperature": 22.5}
function Decode(fPort, bytes, variables) {
	var decoded = {};
	// avoid sending Downlink ACK to integration (Cargo)
	if (fPort === 1) {
		var lonSign = (bytes[0] >> 7) & 0x01 ? -1 : 1;
		var latSign = (bytes[0] >> 6) & 0x01 ? -1 : 1;

		var encLat = ((bytes[0] & 0x3f) << 17) +
			(bytes[1] << 9) +
			(bytes[2] << 1) +
			(bytes[3] >> 7);

		var encLon = ((bytes[3] & 0x7f) << 16) +
			(bytes[4] << 8) +
			bytes[5];

		var hdop = bytes[8] / 10;
		var sats = bytes[9];

		var maxHdop = 2;
		var minSats = 5;

		if ((hdop < maxHdop) && (sats >= minSats)) {
			// Send only acceptable quality of position to mappers
			decoded.latitude = latSign * (encLat * 108 + 53) / 10000000;
			decoded.longitude = lonSign * (encLon * 215 + 107) / 10000000;
			decoded.altitude = ((bytes[6] << 8) + bytes[7]) - 1000;
			decoded.accuracy = (hdop * 5 + 5) / 10
			decoded.hdop = hdop;
			decoded.sats = sats;
		} else {
			decoded.error = "Need more GPS precision (hdop must be <" + maxHdop +
				" & sats must be >= " + minSats + ") current hdop: " + hdop + " & sats:" + sats;
			decoded.latitude = latSign * (encLat * 108 + 53) / 10000000;
			decoded.longitude = lonSign * (encLon * 215 + 107) / 10000000;
			decoded.altitude = ((bytes[6] << 8) + bytes[7]) - 1000;
			decoded.accuracy = (hdop * 5 + 5) / 10
			decoded.hdop = hdop;
			decoded.sats = sats;
		}
		return decoded;
	}
	return null;

}


// Chirpstack v3 to v4 compatibility wrapper
function decodeUplink(input) {
	return {
		data: Decode(input.fPort, input.bytes, input.variables)
	};
}