// Add ignorable variables in this array.
const ignore_vars = ['rx_0_rf_chain', 'modulation', 'rx_0_channel', 'rx_0_fine_timestamp_type', 'rx_0_context', 'frequency', 'bandwidth', 'spreading_factor', 'code_rate', 'polarization_inversion', 'fCnt', 'deviceName', 'adr', 'dr', 'confirmedUplink', 'publishedAt', 'deviceProfileID', 'deviceProfileName', 'objectJSON', 'application_id', 'application_name', 'device_name', 'device_eui', 'dev_addr'];
const ignore_vars2 = ['payload', 'rx_0_location', 'fPort', 'rx_0_lorasnr', 'rx_0_rssi', 'rx_0_time', 'rx_0_gateway_id'];

// Remove unwanted variables.
payload = payload.filter(x => !ignore_vars.includes(x.variable));


// Convert a hex string to a byte array
function hexToBytes(hex) {
	let bytes = [];
	for (let c = 0; c < hex.length; c += 2)
		bytes.push(parseInt(hex.substr(c, 2), 16));
	return bytes;
}

function distance(lat1, lon1, lat2, lon2) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1 / 180;
		var radlat2 = Math.PI * lat2 / 180;
		var theta = lon1 - lon2;
		var radtheta = Math.PI * theta / 180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180 / Math.PI;
		dist = dist * 60 * 1.1515;
		dist = dist * 1.609344;
		return dist;
	}
}

// Get data from the gateway
function get_gw_data(index, gw_id, gw_rssi, gw_snr, gw_location) {
	var found_object = payload.find(x => x.variable === gw_id);
	if (found_object) {
		found_object = payload.find(x => x.variable === gw_rssi);
		if (found_object) {
			new_rssi = found_object.value;
		}
		else {
			return;
		}
		found_object = payload.find(x => x.variable === gw_snr);
		if (found_object) {
			new_snr = found_object.value;
		}
		else {
			return;
		}
		found_object = payload.find(x => x.variable === gw_location);
		if (found_object) {
			gw_lat[0] = found_object.location.lat;
			gw_long[0] = found_object.location.lng;
		}
		else {
			return;
		}
		decoded.num_gw += 1;

		if ((new_rssi < decoded.minRSSI) || (decoded.minRSSI == 0)) {
			decoded.minRSSI = new_rssi;
		}
		if ((new_rssi > decoded.maxRSSI) || (decoded.maxRSSI == 0)) {
			decoded.maxRSSI = new_rssi;
		}
		if ((new_snr < decoded.minSNR) || (decoded.minSNR == 0)) {
			decoded.minSNR = new_snr;
		}
		if ((new_snr > decoded.maxSNR) || (decoded.maxSNR == 0)) {
			decoded.maxSNR = new_snr;
		}

		// Calculate distance
		var new_distance = distance(gw_lat[index], gw_long[index], decoded.latitude, decoded.longitude);
		if ((new_distance * 1000 < decoded.minDistance) || (decoded.minDistance == 0)) {
			decoded.minDistance = new_distance * 1000;
		}
		if ((new_distance * 1000 > decoded.maxDistance) || (decoded.maxDistance == 0)) {
			decoded.maxDistance = new_distance * 1000;
		}

		payload.push({ "variable": "hotspot_" + index, "value": "hotspot_" + index, "location": { "lat": gw_lat[index], "lng": gw_long[index] } });
	}
}

const ttn_payload = raw_payload.find((data) => data.variable === "ttn_payload_v3");
// var obj = ttn_payload.rx_metadata;
// var obj2 = obj.gateway_ids;
// payload.push({ "variable": "raw_data", "value": obj2[0]("gateway_id") });
// payload.push({ "variable": "gateway_1", "value": gateway_list[1].gateway_ids.gateway_id });

const my_payload = payload.find(x => x.variable === "frm_payload");
const fPort = payload.find(x => x.variable === "fport");
var used_fPort = fPort.value;
if (my_payload) {
	var bytes = hexToBytes(my_payload.value);

	var decoded = {};
	// avoid sending Downlink ACK to integration (Cargo)
	if (used_fPort === 1) {
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
			decoded.location = "(" + decoded.latitude + "," + decoded.longitude + ")";
		} else {
			decoded.error = "Need more GPS precision (hdop must be <" + maxHdop +
				" & sats must be >= " + minSats + ") current hdop: " + hdop + " & sats:" + sats;
			decoded.latitude = latSign * (encLat * 108 + 53) / 10000000;
			decoded.longitude = lonSign * (encLon * 215 + 107) / 10000000;
			decoded.altitude = ((bytes[6] << 8) + bytes[7]) - 1000;
			decoded.accuracy = (hdop * 5 + 5) / 10
			decoded.hdop = hdop;
			decoded.sats = sats;
			decoded.location = "(" + decoded.latitude + "," + decoded.longitude + ")";
		}

		decoded.num_gw = 0;
		decoded.minRSSI = 0;
		decoded.maxRSSI = 0;
		decoded.minSNR = 0;
		decoded.maxSNR = 0;
		decoded.minDistance = 0;
		decoded.maxDistance = 0;

		var server_type = 3;
		// Payload should be the same for all LNS ??? to be tested
		server_type = 3;
		decoded.is_chirpstack = 1;

		var gw_lat = {};
		var gw_long = {};
		var new_rssi;
		var new_snr;

		// Get gateway data
		get_gw_data(0, "gateway_eui", "rssi", "snr", "gateway_location");
		// get_gw_data(1, "rx_1_gateway_id", "rx_1_rssi", "rx_1_lorasnr", "rx_1_location");
		// get_gw_data(2, "rx_2_gateway_id", "rx_2_rssi", "rx_2_lorasnr", "rx_2_location");
		// get_gw_data(3, "rx_3_gateway_id", "rx_3_rssi", "rx_3_lorasnr", "rx_3_location");
		// get_gw_data(4, "rx_4_gateway_id", "rx_4_rssi", "rx_4_lorasnr", "rx_4_location");
		// get_gw_data(5, "rx_5_gateway_id", "rx_5_rssi", "rx_5_lorasnr", "rx_5_location");
		// get_gw_data(6, "rx_6_gateway_id", "rx_6_rssi", "rx_6_lorasnr", "rx_6_location");
		// get_gw_data(7, "rx_7_gateway_id", "rx_7_rssi", "rx_7_lorasnr", "rx_7_location");
		// get_gw_data(8, "rx_8_gateway_id", "rx_8_rssi", "rx_8_lorasnr", "rx_8_location");
		// get_gw_data(9, "rx_9_gateway_id", "rx_9_rssi", "rx_9_lorasnr", "rx_9_location");
		// get_gw_data(10, "rx_10_gateway_id", "rx_10_rssi", "rx_10_lorasnr", "rx_10_location");
		// get_gw_data(11, "rx_11_gateway_id", "rx_11_rssi", "rx_11_lorasnr", "rx_11_location");
		// get_gw_data(12, "rx_12_gateway_id", "rx_12_rssi", "rx_12_lorasnr", "rx_12_location");
		// get_gw_data(13, "rx_13_gateway_id", "rx_13_rssi", "rx_13_lorasnr", "rx_13_location");
		// get_gw_data(14, "rx_14_gateway_id", "rx_14_rssi", "rx_14_lorasnr", "rx_14_location");

		decoded.maxMod = parseInt((decoded.maxDistance / 250), 10);
		decoded.minMod = parseInt((decoded.minDistance / 250), 10);
		decoded.maxDistance = parseInt((decoded.maxMod * 250), 10);
		decoded.minDistance = parseInt((decoded.minMod * 250), 10);
		if (decoded.maxDistance <= 1) {
			decoded.maxDistance = parseInt(250, 10);
		}
		if (decoded.minDistance <= 1) {
			decoded.minDistance = parseInt(250, 10);
		}
		payload.push({ "variable": "accuracy", "value": decoded.accuracy });
		payload.push({ "variable": "altitude", "value": decoded.altitude });
		payload.push({ "variable": "hdop", "value": decoded.hdop });
		payload.push({ "variable": "is_chirpstack", "value": decoded.is_chirpstack });
		payload.push({ "variable": "latitude", "value": decoded.latitude });
		payload.push({ "variable": "location", "value": "FieldTester", "location": { "lat": decoded.latitude, "lng": decoded.longitude } });
		payload.push({ "variable": "maxDistance", "value": decoded.maxDistance });
		payload.push({ "variable": "maxMod", "value": decoded.maxMod });
		payload.push({ "variable": "maxRSSI", "value": decoded.maxRSSI });
		payload.push({ "variable": "maxSNR", "value": decoded.maxSNR });
		payload.push({ "variable": "minDistance", "value": decoded.minDistance });
		payload.push({ "variable": "minMod", "value": decoded.minMod });
		payload.push({ "variable": "minRSSI", "value": decoded.minRSSI });
		payload.push({ "variable": "minSNR", "value": decoded.minSNR });
		payload.push({ "variable": "num_gw", "value": decoded.num_gw });
		payload.push({ "variable": "sats", "value": decoded.sats });
	}
	else {
		payload.push({ "variable": 'Error', "value": 'not fPort 1' });
	}
	payload = payload.filter(x => !ignore_vars2.includes(x.variable));
}
else {
	payload.push({ "variable": 'Error', "value": 'could not get payload' });
}
