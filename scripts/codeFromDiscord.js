/** @param {NS} ns **/
export async function main(ns) {
	var servers = [];

	function recursiveScan(hostName) {
		var scannedServers = ns.scan(hostName);
		var serversToScan = [];

		for (var i = 0; i < scannedServers.length; i++) {
			if (servers.indexOf(scannedServers[i]) == -1) {
				servers.push(scannedServers[i]);
				serversToScan.push(scannedServers[i]);
			}
		}

		for (var i = 0; i < serversToScan.length; i++) {
			recursiveScan(serversToScan[i]);
		}
	}

	function gainAccess(hostName) {
		if (ns.fileExists('BruteSSH.exe', 'home')) {
			ns.brutessh(hostName);
		}
		if (ns.fileExists('FTPCrack.exe', 'home')) {
			ns.ftpcrack(hostName);
		}
		if (ns.fileExists('relaySMTP.exe', 'home')) {
			ns.relaysmtp(hostName);
		}
		if (ns.fileExists('HTTPWorm.exe', 'home')) {
			ns.httpworm(hostName);
		}
		if (ns.fileExists('SQLInject.exe', 'home')) {
			ns.sqlinject(hostName);
		}

		return ns.nuke(hostName);
	}

	recursiveScan('home');

	ns.tprint(servers);

	for (var i = 0; i < servers.length; i++) {
		if (gainAccess(servers[i])) {
			await ns.scp('hackme-V2.js', servers[i]);
			ns.exec('hackme-V2.js', servers[i]);
		}
	}
}