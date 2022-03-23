/* 
This script manages ALL gang members. It updates once every minute
and covers tasks like task assignment, ascension, equipment purchasing, and member recruitment.

Usage: 
    run gangs_my.js [--for-rep] [--help]
--for-rep   Farms reputation instead of mone
--help      Displays this manual
*/

const avg = (...args) => args.reduce((a, b) => a + b) / args.length;
const isNoob = m => avg(m.agi, m.def, m.dex, m.str, m.hack) <= 75;

/** @param {NS} ns **/
export async function main(ns) {
    ns.tprint('gangs_my.js running!');
    ns.disableLog('ALL');
    ns.tail();

    const args = ns.flags([
        ['for-rep', false],
        ['help', false]
    ]);

    if (args['help']) {
        ns.tprint('\nUsage:\n\trun gangs_my.js [--for-rep] [--help]\n--for-rep\tFarms reputation instead of money\n--help\t\tDisplays this manual.');
        ns.exit();
    }

    const forReputation = args['for-rep'];

    // Load gang info
    var gangInfo = ns.gang.getGangInformation(),
        gangMembers = ns.gang.getMemberNames(),
        combatMembers = [],
        hackingMembers = [];

    if (!gangInfo.isHacking) {
        ns.tprint('ERROR: This script only works on hacking gangs, now exiting... Sorry!');
        ns.exit();
    } if (!ns.gang.inGang()) {
        ns.tprint('ERROR: You are not in a gang! Exiting...');
        ns.exit();
    }

    ns.print('Loading gang member information');
    gangMembers.forEach(m => {
        let memberInfo = ns.gang.getMemberInformation(m);
        if ((avg(memberInfo.agi, memberInfo.def, memberInfo.dex, memberInfo.str) > memberInfo.hack) ||
            (isNoob(memberInfo) && combatMembers.length < 2)) {
            combatMembers.push(m);
            ns.print(`${m}: Is a combat member`);
        } else {
            hackingMembers.push(m);
            ns.print(`${m}: Is a hacking member`);
        }
    })

    while (true) {
        ns.print('Starting new loop')

        gangMembers = ns.gang.getMemberNames();

        if (ns.gang.canRecruitMember()) {
            let newName = getName();
            while (gangMembers.includes(newName)) {
                newName = getName();
            }
            ns.gang.recruitMember(newName);
            ns.print(`Member recruited: ${newName}`);
            if (combatMembers.length < 2) {
                combatMembers.push(newName);
            }
        }

        gangMembers.forEach(m => {
            let ascended = false;
            let ascResult = ns.gang.getAscensionResult(m),
                currentMult = ns.gang.getMemberInformation(m),
                memberType = hackingMembers.includes(m) ? 'hack' : 'combat';
            if (ascResult != undefined) {  // Can ascend
                if (
                    (combatMembers.includes(m) &&
                        Math.min(currentMult.agi_asc_mult * 2, currentMult.agi_asc_mult + 15) <= currentMult.agi_asc_mult * ascResult.agi &&
                        Math.min(currentMult.def_asc_mult * 2, currentMult.def_asc_mult + 15) <= currentMult.def_asc_mult * ascResult.def &&
                        Math.min(currentMult.dex_asc_mult * 2, currentMult.dex_asc_mult + 15) <= currentMult.dex_asc_mult * ascResult.dex &&
                        Math.min(currentMult.str_asc_mult * 2, currentMult.str_asc_mult + 15) <= currentMult.str_asc_mult * ascResult.str) ||
                    (hackingMembers.includes(m) &&
                        Math.min(currentMult.hack_asc_mult * 2, currentMult.hack_asc_mult + 15) <= currentMult.hack_asc_mult * ascResult.hack)) {  // Good enough to ascend
                    ns.gang.ascendMember(m);
                    ascended = true;
                    ns.print(`Ascended gang member ${m}.`);
                }
            } if (!ascended) {
                assign(ns, m, memberType, forReputation);
            }
            buyEquipment(ns, m, memberType);
        });  // End of individual member assignment

        if (canFight(ns, combatMembers.length)) {
            if (ns.gang.getGangInformation().territoryWarfareEngaged) {
                ns.gang.setTerritoryWarfare(true);
                ns.print('Territory warfare enabled');
            }
        } else {
            ns.gang.setTerritoryWarfare(false);
        }

        await ns.sleep(60000);
    }
}

function getName() {  // StackOverflow yehh
    const nameLength = 15;
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 -=_+,./<>?';
    var charactersLength = characters.length;
    for (var i = 0; i < nameLength; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

function assign(ns, member, type, forRep = false) {
    /* Type: "hack" or "combat" */
    const repJobs = [
        'DDoS Attacks',
        'Plant Virus',
        'Cyberterrorism'
    ], moneyJobs = [
        'Ransomware',
        'Phishing',
        'Identity Theft',
        'Fraud & Counterfeiting',
        'Money Laundering'
    ];
    const hackHelper = 'Ethical Hacking',
        combatHelper = 'Vigilante Justice',
        hackTrain = 'Train Hacking',
        combatTrain = 'Train Combat',
        territoryWarfare = 'Territory Warfare',
        memberInfo = ns.gang.getMemberInformation(member),
        currentTask = memberInfo.task,
        hackingMember = (type == 'hack');
    var decidedTask = 'Unassigned';

    if (isNoob(memberInfo)) {
        decidedTask = hackingMember ? hackTrain : combatTrain;
    } else {
        if (!hackingMember) {
            if (wantedLevelHelpNeeded(ns)) {
                decidedTask = combatHelper;
            } else {  // Wanted level doesn't need help
                decidedTask = territoryWarfare;
            }
        } else {  // Is a hacking member
            if (wantedLevelHelpNeeded(ns)) {
                decidedTask = hackHelper;
            } else {  // Wanted level says they're fine
                let jobsToTryOut = forRep ? repJobs : moneyJobs;
                for (let i = jobsToTryOut.length - 1; i > -1; i--) {  // Find the hardest possible task to assign
                    if (!tooDifficult(ns, jobsToTryOut[i], member)) {
                        decidedTask = jobsToTryOut[i];
                        break;
                    }
                }
            }
        }
    }

    if (currentTask == 'Unassigned' || (decidedTask != currentTask && decidedTask != 'Unassigned')) {
        ns.gang.setMemberTask(member, decidedTask);
        ns.print(`Assigned task ${decidedTask} to ${member}`);
    }

    return decidedTask;
}

function buyEquipment(ns, member, type) {
    if (ns.gang.getMemberInformation(member).upgrades.length == 0) {
        if (type == 'hack') {
            ns.gang.purchaseEquipment(member, 'NUKE Rootkit');
        } else {
            ns.gang.purchaseEquipment(member, 'Baseball Bat');
        }
    }
}

function tooDifficult(ns, taskName, member) {
    const taskInfo = ns.gang.getTaskStats(taskName),
        memberInfo = ns.gang.getMemberInformation(member);
    let statWeight =
        (taskInfo.hackWeight / 100) * memberInfo.hack +
        (taskInfo.strWeight / 100) * memberInfo.str +
        (taskInfo.defWeight / 100) * memberInfo.def +
        (taskInfo.dexWeight / 100) * memberInfo.dex +
        (taskInfo.agiWeight / 100) * memberInfo.agi +
        (taskInfo.chaWeight / 100) * memberInfo.cha;  // From source code
    return statWeight - 4 * taskInfo.difficulty <= 0 ? true : false;
}

function wantedLevelHelpNeeded(ns) {
    const gangInfo = ns.gang.getGangInformation();
    return (gangInfo.wantedLevelGainRate > 1 && 100 * (1 - gangInfo.wantedPenalty) > 2) ||
        (gangInfo.wantedLevelGainRate > 5) ||
        (100 * (1 - gangInfo.wantedPenalty) > 5);
}

function canFight(ns, numOfFighters) {
    const otherGangs = [
        'Slum Snakes',
        'Speakers for the Dead',
        'The Black Hand',
        'The Dark Army',
        'The Syndicate',
        'NiteSec',
        'Tetrads'
    ].filter(g => g != ns.gang.getGangInformation.faction);
    const winChance = avg(...otherGangs.map(
        g => ns.gang.getChanceToWinClash(g)
    ));
    return (winChance > 0.5) && (numOfFighters > 1);
}