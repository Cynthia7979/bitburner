const GANGSTER_NAMES =
	[
		'Ronnie',
		'Tony',
		'Angelo',
		'Guiseppe',
		'Bert',
		'Ernie',
		'Reggie',
		'Mario',
		'Joey',
		'Tommy',
		'Giovani',
		'Lenny'
	];

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');

	if (!ns.gang.inGang()) {
		ns.tprint('ERROR: Not in a gang, exiting (todo: create or join a gang?');
		ns.print('ERROR: Not in a gang, exiting (todo: create or join a gang?');
		return;
	}

	ns.tail();


	let otherGangsInfoPrevCycle = undefined;
	let nextTick = undefined;
	let tasks = new Array();
	let lastAscension = Date.now() - 60 * 60 * 1000;

	let gangInfo = ns.gang.getGangInformation();
	let members = ns.gang.getMemberNames();

	AssignTasks(ns, members, gangInfo);

	while (true) {
		// *** Get current gang member names and gangInfo ***
		members = ns.gang.getMemberNames();
		gangInfo = ns.gang.getGangInformation();
		//GangReport(ns, gangInfo);

		// *** Recruitment ***
		await RecruitMembers(ns);
		//ns.print('');

		// *** Automatic ascension ***
		//let as = GetAscensionInfo(ns);
		//if (Date.now() - lastAscension > 60 * 1000) {
		for (let member of members) {
			//if (entry.gain > 0.25) {
			AscendGangMember(ns, member);
			//lastAscension = Date.now();
			//break;
			//}
		}
		//}
		//ns.print('');

		// *** Equipement stuff ***
		//if (ns.getServerMoneyAvailable('home') > 1_000_000_000) {
			//UpgradeEquipement(ns);
			//ns.print('');
		//}

		// *** Territory warfaire ***

		// Detect new tick
		let otherGangsInfo = ns.gang.getOtherGangInformation();
		let newTick = false;
		for (let i = 0; i < Object.keys(otherGangsInfo).length; i++) {
			const gangName = Object.keys(otherGangsInfo)[i];
			if (gangName == gangInfo.faction) continue;

			let gi = Object.values(otherGangsInfo)[i];
			let ogi = otherGangsInfoPrevCycle ? Object.values(otherGangsInfoPrevCycle)[i] : gi;

			let powerChanged = gi.power != ogi.power;
			let territoryChanged = gi.territory != ogi.territory;
			let changed = powerChanged || territoryChanged;

			if (changed) {
				newTick = true;
			}
			//ns.print(gangName + ' power: ' + gi.power + ' territory: ' + gi.territory + ' changed?: ' + changed);
		}

		// If we're in a new tick, take note of when next one is going to happen
		if (newTick) {
			ns.print('WARN: -- NEW TICK DETECTED --');
			if (nextTick != undefined) {
				AssignTasks(ns, members, gangInfo);
			}
			nextTick = Date.now() + 19000;
		}

		// Update our cache of otherGangsInfo
		otherGangsInfoPrevCycle = otherGangsInfo;

		// Assign members to territory warfare
		if (nextTick != undefined && Date.now() + 500 > nextTick) {
			ns.print('WARN: Assigning all members to territory warfare');

			tasks = [];
			for (let member of members) {
				let task = ns.gang.getMemberInformation(member).task;
				let entry = new Object();
				entry.member = member;
				entry.task = task;
				tasks.push(entry);
				ns.gang.setMemberTask(member, 'Territory Warfare');
			}
		}

		ns.print('');
		ns.print('LOOP END');
		ns.print('');
		await ns.sleep(1000);
	}
}

function AssignTasks(ns, members, gangInfo) {
	ns.print('WARN: Assigning best tasks');
	let rendu = 0;
	let half = Math.ceil(members.length / 2);
	for (let member of members) {
		let forMoney = rendu++ < half;
		//if (members.length < 12) forMoney = false;
		forMoney= false;

		let newTask = FindBestTask(ns, gangInfo, member, forMoney);

		//if (newTask == 'Mug People')
		//	newTask = 'Train Combat';

		if (gangInfo.wantedPenalty < 0.90 && forMoney == false && gangInfo.wantedLevel > 20 && gangInfo.respect > 1000)
			newTask = 'Vigilante Justice';

		ns.gang.setMemberTask(member, newTask);
		ns.print('WARN: Assigning task ' + newTask + ' to ' + member + ' forMoney: ' + forMoney);
	}
}


async function RecruitMembers(ns) {
	let members = ns.gang.getMemberNames();

	while (ns.gang.canRecruitMember()) {
		ns.print('INFO: We can currently recruit a new member!');

		let newMember = undefined;
		for (const candidate of GANGSTER_NAMES) {
			let alreadyExists = false;
			for (const member of members) {
				if (candidate == member) {
					alreadyExists = true;
					break;
				}
			}
			if (alreadyExists) {
				await ns.sleep(0);
				continue;
			}
			newMember = candidate;
			break;
		}

		if (newMember == undefined) {
			ns.print('ERROR: Could not find a new member name?! Should NOT happen.');
		}
		else {
			ns.gang.recruitMember(newMember);
			ns.print('SUCCESS: Recruited a new gang member called ' + newMember);
			members.push(newMember);
		}

		await ns.sleep(10);
	}
}


function GetAscensionInfo(ns) {
	// *** Get current gang member names ***
	const members = ns.gang.getMemberNames();
	const ret = [];

	for (let member of members) {
		let gain = 0;

		const as = ns.gang.getAscensionResult(member);
		if (as != undefined) {
			gain = (as.str + as.def + as.dex + as.agi - 4) / 4;
		}

		ns.print((member + ' ascension gain ').padEnd(25) + ' =>   ' + Math.round((gain * 10000)) / 100 + '%');
		ret.push({ member: member, gain: gain });
	}

	return ret.sort((a, b) => b - a);
}


function AscendGangMember(ns, member) {
	Derp(ns, member);

	// const as = ns.gang.getAscensionResult(member);
	// if (as == undefined) {
	// 	//ns.print((member + ' ascension gain ').padEnd(25) + ' =>   0%');
	// 	return;
	// }
	// const gain = (as.str + as.def + as.dex + as.agi - 4) / 4;
	// //ns.print((member + ' ascension gain ').padEnd(25) + ' =>   ' + Math.round((gain * 10000)) / 100 + '%');
	// if (gain > 0.25) {
	// 	ns.print('INFO: Ascending ' + member);
	// 	ns.gang.ascendMember(member);
	// }
}


function Derp(ns, member) {
	const isHacking = false;
	const ascensionResult = ns.gang.getAscensionResult(member);
	if (ascensionResult == undefined) return;

	const info = ns.gang.getMemberInformation(member);

	let threshold = 1.1;
	if (isHacking) {
		threshold = Math.max(info.hack_asc_mult) < 4 ? 1.6 : 1.1;
	} else {
		//threshold = CalculateAscendTreshold(ns, member); 
		threshold = Math.max(info.agi_asc_mult, info.str_asc_mult, info.dex_asc_mult, info.def_asc_mult) < 4 ? 1.6 : 1.1;
		ns.print(member + ' treshold: ' + threshold + ' asc: ' + ascensionResult.str + ' ' + ascensionResult.def + ' ' + ascensionResult.dex + ' ' + ascensionResult.agi);
	}

	if (isHacking && ascensionResult.hack >= threshold || !isHacking && (ascensionResult.agi >= threshold || ascensionResult.str >= threshold || ascensionResult.def >= threshold || ascensionResult.dex >= threshold)) {
		ns.gang.ascendMember(member);
		if (isHacking) {
			ns.gang.setMemberTask(member, HackingTasks.TRAIN_HACKING);
		}
		ns.print(`Ascending ${member}!`);
	}
}

function CalculateAscendTreshold(ns, member) {
	let ascendMulti = 1.0591
	if (ns.gang.getMemberInformation(member)['str_asc_mult'] < 8.153) {
		let mult = ns.gang.getMemberInformation(member)['str_asc_mult'];
		switch (mult) {
			case (mult < 1.632):
				ascendMulti = 1.6326;
				break;
			case (mult < 2.336):
				ascendMulti = 1.4315;
				break;
			case (mult < 2.999):
				ascendMulti = 1.284;
				break;
			case (mult < 3.363):
				ascendMulti = 1.2125;
				break;
			case (mult < 4.253):
				ascendMulti = 1.1698;
				break;
			case (mult < 4.86):
				ascendMulti = 1.1428;
				break;
			case (mult < 5.455):
				ascendMulti = 1.1225;
				break;
			case (mult < 5.977):
				ascendMulti = 1.0957;
				break;
			case (mult < 6.496):
				ascendMulti = 1.0869;
				break;
			case (mult < 7.008):
				ascendMulti = 1.0789;
				break;
			case (mult < 7.519):
				ascendMulti = 1.073;
				break;
			case (mult < 8.025):
				ascendMulti = 1.0673;
				break;
			case (mult < 8.513):
				ascendMulti = 1.0631;
				break;
		}

		return ascendMulti;
	}
}


function UpgradeEquipement(ns) {
	let budget = ns.getPlayer().money / 2;

	let allGear = ns.gang.getEquipmentNames();
	allGear = allGear.sort((a, b) => ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b));

	// *** Get current gang member names ***
	const members = ns.gang.getMemberNames();

	for (let gear of allGear) {
		// Get info on the upgrade
		let type = ns.gang.getEquipmentType(gear);
		if (type != 'Weapon' && type != 'Armor' && type != 'Vehicle')
			continue; // not supported for now

		// Find which member(s) do not have that upgrade installed
		const missing = new Array();
		for (let member of members) {
			const memberInfo = ns.gang.getMemberInformation(member); // Get information about a specific gang member.
			if (!memberInfo.upgrades.includes(gear)) {
				missing.push(member);
			}
		}

		let cost = ns.gang.getEquipmentCost(gear);

		for (let member of missing) {
			if (cost < budget) {
				ns.print('Buying ' + gear + ' for ' + member);
				ns.gang.purchaseEquipment(member, gear);
				budget -= cost;
			}
		}

		// Report
		//ns.print(gear.padEnd(25) + ' : ' + type.toString().padEnd(25) + ' ' + ns.nFormat(cost, "$0.000a").padStart(25) + '   MISSING: ' + missing);
	}
}


function GangReport(ns, memberInfo) {
	ns.print('');
	ns.print('Faction                :  ' + memberInfo.faction);
	//ns.print('Gang type              :  ' + (memberInfo.isHacking ? 'Hacking' : 'Combat'));
	//ns.print('Money gain rate        :  ' + memberInfo.moneyGainRate);
	ns.print('Power                  :  ' + memberInfo.power);
	ns.print('Respect                :  ' + memberInfo.respect);
	//ns.print('Respect gain rate      :  ' + memberInfo.respectGainRate);
	ns.print('Territory              :  ' + memberInfo.territory);
	//ns.print('Territory clash chance :  ' + memberInfo.territoryClashChance);
	//ns.print('Territory war engaged  :  ' + memberInfo.territoryWarfareEngaged);
	ns.print('Wanted level           :  ' + memberInfo.wantedLevel);
	ns.print('Wanted level gain rate :  ' + memberInfo.wantedLevelGainRate);
	ns.print('Wanted penalty         :  ' + memberInfo.wantedPenalty);
	ns.print('');
}



/** @param {NS} ns **/
function FindBestTask(ns, gangInfo, member, prioritizeMoney) {
	let mi = ns.gang.getMemberInformation(member);
	let deets = new Array();

	const ALLOWED_TASKS = [
		'Mug People',
		'Strongarm Civilians',
		'Traffick Illegal Arms',
		'Human Trafficking',
		'Terrorism'
	];

	let canGainRespect = false;
	let canGainMoney = false;

	for (let task of ALLOWED_TASKS) {
		let stats = ns.gang.getTaskStats(task);
		let money = ns.formulas.gang.moneyGain(gangInfo, mi, stats);
		let wanted = ns.formulas.gang.wantedLevelGain(gangInfo, mi, stats);
		let respect = ns.formulas.gang.respectGain(gangInfo, mi, stats);

		let entry = new Object();
		entry.task = task;
		entry.money = money;
		entry.wanted = wanted;
		entry.respect = respect;
		entry.stats = stats;
		deets.push(entry);

		if (respect > 0) canGainRespect = true;
		if (money > 0) canGainMoney = true;
	}

	if (prioritizeMoney)
		deets = deets.sort((a, b) => b.money - a.money);
	else
		deets = deets.sort((a, b) => b.respect - a.respect);


	// If our wanted is too high, go vigilente
	// if (gangInfo.wantedPenalty < 0.95 && gangInfo.respect > 1000) {
	// 	return 'Vigilante Justice';
	// }
	// else 
	if (mi.str < 200) {
		return 'Train Combat';
	}
	// Prioritize money
	else if (canGainMoney && prioritizeMoney) {
		return deets[0].task;
	}
	// Prioritize respect
	else if (canGainRespect && !prioritizeMoney) {
		return deets[0].task;
	}
	else {
		return 'Train Combat';
	}
}