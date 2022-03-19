/* 
General idea before I forget: 
- Hardest tasks for best hackers
- Always keep wanted level low
- Split members into hacking and combat
- Only let combat members reduce wanted level
- Buy baseball bats for combat, NUKE rootkit for hack
- Train until newbie's stat increase speed is lower than 0.5/tick
- Ascend when multiplier of respective stat exceeds 2x current
 */

const avg = (...args) => args.reduce((a, b) => a + b) / args.length;
const isNoob = m => avg(m.agi, m.def, m.dex, m.str, m.hack) <= 75;

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('ALL');
    ns.tail();

    const args = ns.flags([
        ['for-rep', false],
        ['help', false]
    ]);

    if (args['help']) {
        ns.tprint('\nUsage:\n\trun gangs_my.js [--for-rep] [--help]\n\t--for-rep\tFarms reputation instead of money\n\t--help\tDisplays this manual.');
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
        if (avg(memberInfo.agi, memberInfo.def, memberInfo.dex, memberInfo.str) > memberInfo.hack) {
            combatMembers.push(m);
        } else {
            hackingMembers.push(m);
        }
    })

    while (true) {
        if (ns.gang.canRecruitMember()) {
            let newName = getName();
            ns.gang.recruitMember(newName);
            ns.print(`Member recruited: ${newName}`)
        }

        gangMembers.forEach(m => {
            let ascended = false;
            let ascResult = ns.gang.getAscensionResult(m),
                currentMult = ns.gang.getMemberInformation(m);
            if (ascResult != undefined) {  // Can ascend
                if (
                    (combatMembers.includes(m) &&
                        currentMult.agi_asc_mult * 2 <=  ascResult.agi &&
                        currentMult.def_asc_mult * 2 <= ascResult.def &&
                        currentMult.dex_asc_mult * 2 <=  ascResult.dex &&
                        currentMult.str_asc_mult * 2 <=  ascResult.str) ||
                    (hackingMembers.includes(m) &&
                        currentMult.hack_asc_mult <= 2 * ascResult.hack)) {
                    ns.gang.ascendMember(m);
                    ascended = true;
                    ns.print(`Ascended gang member ${m}.`);
                }
            } if (!ascended) {
                assign(ns, m, hackingMembers.includes(m) ? 'hack' : 'combat', forReputation);
            }
        });

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
    var decidedTask = 'Idle';

    if (isNoob(member)) {
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

    if (decidedTask != currentTask) {
        ns.gang.setMemberTask(member, decidedTask);
        ns.print(`Assigned task ${decidedTask} to ${member}`);
    }

    return decidedTask;
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
        (taskInfo.chaWeight / 100) * memberInfo.cha;
    return statWeight - 4 * taskInfo.difficulty <= 0 ? true : false;
}

function wantedLevelHelpNeeded(ns) {
    const gangInfo = ns.gang.getGangInformation();
    return (gangInfo.wantedLevelGainRate > 1 && 100 * (1 - gangInfo.wantedPenalty) > 2) ||
        (gangInfo.wantedLevelGainRate > 5);
}