/** @param {NS} ns **/
export async function main(ns) {
    const host_names = ns.read('/all_servers_names.txt').split('\r\n');
    const ports_available = ns.args[0];
    const port_openers = [ns.brutessh, ns.ftpcrack, ns.relaysmtp, ns.httpworm, ns.sqlinject].slice(0, ports_available);

    for (let i = 0; i < host_names.length; i++) {
        // let port_opened = true;
        let server = host_names[i];
        if (!['', ' '].includes(server)) {
            if (!ns.hasRootAccess(server)) {
                ns.print('Attempting to take over server ', server, '...');
                let ports_required = ns.getServerNumPortsRequired(server);
                if (ports_required > ports_available) {
                    ns.print('ERROR: More than ', ports_available, ' open ports needed for ', server, '.');
                    // port_opened = false;
                } else {
                    port_openers.forEach(f => f(server));
                    ns.nuke(server);
                    // installBackdoor(server);
                    ns.tprint('Server ', server, ' rooted. Install backdoor manually please.');
                }
            } else {
                ns.tprint('WARNING: Already rooted ', server, ', skipping progress...')
            }

            ns.print('Transporting hack files to ', server);
            await ns.scp('/scripts/hack.script', server);
            await ns.scp('/scripts/weaken-exp-grind.script', server);
            await ns.scp('/scripts/simple_hack.script', server);
            await ns.scp('/scripts/weaken_and_grow_only.script', server);
        }
    }
}