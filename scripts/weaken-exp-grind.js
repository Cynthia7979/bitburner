/** @param {NS} ns **/
export async function main(ns) {
    const desired_server = ns.args[0];

    while (true) {
        await ns.weaken(desired_server);
    }
}