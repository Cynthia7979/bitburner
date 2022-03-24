/** @param {NS} ns **/
export async function main(ns) {
    var player,
    time = ns.args[0] ? ns.args[0] : 2;

    ns.tprint('Beginning recording hacking exp, please wait ', time, ' minutes...');

    player = ns.getPlayer();
    const initial_hack_exp = player.hacking_exp;
    const start_time = Date.now();

    await ns.sleep(time * 60000);  // Wait for the specified amount of minutes

    player = ns.getPlayer();
    const new_hack_exp = player.hacking_exp;
    const end_time = Date.now();

    ns.tprint(`Time Elapsed: ${end_time - start_time} ms`)
    ns.tprint('Your hacking exp growth rate is: ', (new_hack_exp - initial_hack_exp) / ((end_time - start_time) / 1000), ' / s');
}