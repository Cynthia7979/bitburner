/** @param {NS} ns **/
export async function main(ns) {
    const list_of_servers = ns.read('/grind_servers.txt').split('\r\n').concat(ns.read('/all_servers_names.txt').split('\r\n'));

    for (let i = 0; i < list_of_servers.length; i++) {
        let s = list_of_servers[i];
        if (s == '' || s == ' ' || s == '!!!' || !s) {
            ns.tprint(s, ' is skipped because it is not a server');
            continue;
        } else {
            await ns.scp('/scripts/hack.js', s);
            await ns.scp('/scripts/weaken-exp-grind.js', s);
            await ns.scp('/scripts/simple_share.js', s);
            await ns.scp('/scripts/weaken_and_grow_only.js', s);
            ns.print('Tranported files to ', s);
        }
    }

    ns.tprint('Done.')
}