/* UNFINISHED! 

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
const isNoob = m => avg(m.agi, m.def, m.dex, m.str) > m.hack;

/** @param {NS} ns **/
export async function main(ns) {
    ns.tail();
    
    // Load gang info
    var gangInfo = ns.gang.getGangInformation(),
        gangMembers = ns.gang.getMemberNames(),
        combatMembers = [],
        hackingMembers = [],
        trainingMembers = [];
    
    if (!gangInfo.isHacking) {
        ns.tprint('ERROR: This script only works on hacking gangs, now exiting... Sorry!');
        return;
    }

    gangMembers.forEach((member, _, _) => {
        let memberInfo = ns.gang.getMemberInformation(member);
        if (avg(memberInfo.agi, memberInfo.def, memberInfo.dex, memberInfo.str) > memberInfo.hack) {
            combatMembers.push(member);
        } else {
            hackingMembers.push(member);
        }
        if (isNoob(memberInfo)) {
            trainingMembers.push(member);
        }
    })

    while (true) {
        if (ns.gang.canRecruitMember()) {
            let newName = getName();
            ns.gang.recruitMember(newName);
            ns.tprint(`Member recruited: ${newName}`);
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