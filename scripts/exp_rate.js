/** @param {NS} ns **/
export async function main(ns) {
    var player,
    time = ns.args[0] ? ns.args[0] : 2;

    ns.tprint('Beginning recording hacking exp, please wait ', time, ' minutes...');

    player = ns.getPlayer();
    const initial_hack_exp = player.hacking_exp;

    await ns.sleep(time * 60000);  // Wait for the specified amount of minutes

    player = ns.getPlayer();
    const new_hack_exp = player.hacking_exp;

    ns.tprint('Your hacking exp growth rate is: ', (new_hack_exp - initial_hack_exp) / time * 60, ' / s');
}