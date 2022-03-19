/** @param {NS} ns **/
export async function main(ns) {
    const host = ns.args[0];
    await ns.scp('/scripts/hack.script', host);
    await ns.scp('/scripts/weaken-exp-grind.script', host);
    await ns.scp('/scripts/simple_hack.script', host);
    await ns.scp('/scripts/simple_share.js', host);
    await ns.scp('/scripts/weaken_and_grow_only.script', host);
    ns.print('Tranported files to ', host);
}