/** @param {NS} ns **/
export async function main(ns) {
    var server = ns.args[0];

    while (true) {
        if (ns.getServerMoneyAvailable(server) < 0.125 * ns.getServerMaxMoney(server)) {
            await ns.grow(server);
        } if (ns.getServerMoneyAvailable(server) < 0.25 * ns.getServerMaxMoney(server)) {
            await ns.grow(server);
        } if (ns.getServerMoneyAvailable(server) == 0) {
            ns.tprint('WARNING: ', server, '\'s available money dropped to $0. Grow more before hacking!');
            await ns.grow(server);
        }

        await ns.hack(server);

        while (ns.hackAnalyzeChance(server) < 0.3) {
            await ns.weaken(server);
        }
    }
}