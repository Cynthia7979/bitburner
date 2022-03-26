import { transportFilesTo } from '/scripts/cynthia7979_util.js';

/** @param {NS} ns **/
export async function main(ns) {
    var current_min_ram, new_purchased_server,
        current_purchasing_ram = 16384,
        current_needed_money = ns.getPurchasedServerCost(current_purchasing_ram),
        existing_servers = ns.getPurchasedServers(),
        // server_limit = ns.getPurchasedServerLimit(),
        server_limit = 10,
        // ram_limit = ns.getPurchasedServerMaxRam(),
        ram_limit = 32768;
    const weaken_server = ns.args[0] ? ns.args[0] : 'phantasy';

    ns.tprint('buy_server.js running!');

    await update_grind_server_txt(ns, existing_servers);
    await transportFilesTo(ns, ...existing_servers);

    while (true) {
        await ns.sleep(60000);  // Sleep first to allow machine to boot

        ns.print('Current purchasing RAM: ', current_purchasing_ram)

        if (ns.getPlayer().money * 0.25 > current_needed_money) {
            if (existing_servers.length >= server_limit) {  // Too many servers
                current_min_ram = await delete_small_server(ns, existing_servers, current_purchasing_ram);
                if (current_min_ram == -1) {  // Minimum equals maximum
                    ns.tprint('buy_server.js has purchased all available servers. Now exiting...')
                    ns.exit()
                }
                existing_servers = ns.getPurchasedServers();
                await update_grind_server_txt(ns, existing_servers);
                if (current_min_ram == current_purchasing_ram) {
                    current_purchasing_ram *= 2;
                } if (current_purchasing_ram > ram_limit) {
                    current_purchasing_ram = ram_limit;
                }
            }
            new_purchased_server = ns.purchaseServer('grinding-server', current_purchasing_ram);
            current_needed_money = ns.getPurchasedServerCost(current_purchasing_ram);
            existing_servers = ns.getPurchasedServers();
            await update_grind_server_txt(ns, existing_servers);
            await transportFilesTo(ns, new_purchased_server);
            ns.toast(`Purchased new server ${new_purchased_server}.`);
            if (ns.hasRootAccess(weaken_server)) {
                ns.run('/scripts/grind_on_my_servers.script', 1, weaken_server);
            } else {
                ns.run('/scripts/grind_on_my_servers.script', 1, 'foodnstuff');
            }
        }
    }
}

async function delete_small_server(ns, servers, currentMaximum) {
    var min_ram = -1,
        min_index = -1;

    for (var i = 0; i < servers.length; i++) {
        if (ns.getServerMaxRam(servers[i]) < min_ram || min_ram == -1) {
            min_ram = ns.getServerMaxRam(servers[i]);
            min_index = i;
        }
    }

    if (min_index >= currentMaximum) {
        return -1;
    } else {
        await ns.killall(servers[min_index]);
        await ns.sleep(5000);
        await ns.deleteServer(servers[min_index]);
        await ns.toast('Deleted ' + servers[min_index]);
        return min_ram;
    }
}

async function update_grind_server_txt(ns, servers) {
    await ns.print('Received servers ', servers, ' to update');
    await ns.write('/grind_servers.txt', servers.join('\r\n'), 'w');
    await ns.sleep(1000);
}