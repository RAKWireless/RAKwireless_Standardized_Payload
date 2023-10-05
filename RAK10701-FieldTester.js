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

function Decoder(bytes, fPort) {
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
		// 		decoded.raw = rawPayload.uplink_message.rx_metadata[0].location;
		decoded.num_gw = normalizedPayload.gateways.length;
		decoded.minRSSI = 0;
		decoded.maxRSSI = 0;
		decoded.minSNR = 0;
		decoded.maxSNR = 0;
		decoded.minDistance = 0;
		decoded.maxDistance = 0;

		var server_type = 0;
		// Check if payload comes from TTN
		if (typeof (rawPayload.uplink_message) != "undefined") {
			console.log("Found TTN format");
			server_type = 1;
			decoded.is_chirpstack = 1;
		}
		// Check if payload comes from Helium
		else if (typeof (rawPayload.hotspots) != "undefined") {
			console.log("Found Helium format");
			server_type = 2;
		}
		// Check if payload comes from Chirpstack
		else if (typeof (rawPayload.rxInfo) != "undefined") {
			console.log("Found Chirpstack format");
			server_type = 3;
			decoded.is_chirpstack = 1;
		}
		//Check if the payload comes from LORIOT
		else if (typeof (rawPayload.cmd) != "undefined") {
			console.log("Found LORIOT format");
			server_type = 4;
			decoded.is_chirpstack = 1;
		}	
		else {
			console.log("Unknown raw format");
		}

		var gw_lat = {};
		var gw_long = {};

		decoded.num_gw = 0;
		for (idx_tst = 0; idx_tst < 10; idx_tst++)
		{
			if (typeof (normalizedPayload.gateways[idx_tst]) != "undefined")
			{
				console.log("Found gateway with IDX " + idx_tst);
				decoded.num_gw += 1;
			}
		}

		for (idx = 0; idx < decoded.num_gw; idx++) {
			var new_rssi = (!!normalizedPayload.gateways && !!normalizedPayload.gateways[idx] && normalizedPayload.gateways[idx].rssi) || 0;
			var new_snr = (!!normalizedPayload.gateways && !!normalizedPayload.gateways[idx] && normalizedPayload.gateways[idx].snr) || 0;
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

			switch (server_type) {
				//TTN
				case 1:
					gw_lat[idx] = rawPayload.uplink_message.rx_metadata[idx].location.latitude;
					gw_long[idx] = rawPayload.uplink_message.rx_metadata[idx].location.longitude;
					break;
				// Helium
				case 2:
					gw_lat[idx] = rawPayload.hotspots[idx].lat;
					gw_long[idx] = rawPayload.hotspots[idx].long;
					break;
				// Chirpstack
				case 3:
					gw_lat[idx] = rawPayload.rxInfo[idx].location.latitude;
					gw_long[idx] = rawPayload.rxInfo[idx].location.longitude;
					break;

				// LORIOT
				case 4:
					gw_lat[idx] = rawPayload.gws[0].lat;
					gw_long[idx] = rawPayload.gws[0].lon;
					break;
				default:
					console.log("Unknown LNS");
					break;
			}

			console.log("IDX " + idx + " lat " + gw_lat[idx] + " long " + gw_long[idx]);

			// Calculate distance
			var new_distance = distance(gw_lat[idx], gw_long[idx], decoded.latitude, decoded.longitude);
			if ((new_distance * 1000 < decoded.minDistance) || (decoded.minDistance == 0)) {
				decoded.minDistance = new_distance * 1000;
			}
			if ((new_distance * 1000 > decoded.maxDistance) || (decoded.maxDistance == 0)) {
				decoded.maxDistance = new_distance * 1000;
			}
		}

		var hotspot_name = ""
		for (idx = 0; idx < decoded.num_gw; idx++) {
			var index = idx + 1;
			if (index < 9) {
				hotspot_name = "hotspot_0" + index.toString();
			} else {
				hotspot_name = "hotspot_" + index.toString();
			}
			console.log(hotspot_name);
			decoded[hotspot_name] = "(" + gw_lat[idx] + "," + gw_long[idx] + ")";
		}

		decoded.maxMod = 1 + parseInt((Math.round(decoded.maxDistance / 250.0)), 10);
		decoded.minMod = 1 + parseInt((Math.round(decoded.minDistance / 250.0)), 10);
		
		return decoded;
	}
	return null;

}
