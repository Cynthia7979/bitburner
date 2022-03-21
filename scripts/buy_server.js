/** @param {NS} ns **/
export async function main(ns) {
    var current_min_ram, new_purchased_server,
        current_purchasing_ram = 16384,
        current_needed_money = ns.getPurchasedServerCost(current_purchasing_ram),
        existing_servers = ns.getPurchasedServers(),
        // server_limit = ns.getPurchasedServerLimit(),
        server_limit = 10,
        ram_limit = ns.getPurchasedServerMaxRam();

    ns.tprint('buy_server.js running!');

    await update_grind_server_txt(ns, existing_servers);

    while (true) {
        await ns.sleep(60000);  // Sleep first to allow machine to boot

        ns.print('Current purchasing RAM: ', current_purchasing_ram)

        if (ns.getPlayer().money * 0.25 > current_needed_money) {
            if (existing_servers.length >= server_limit) {
                current_min_ram = await delete_small_server(ns, existing_servers);
                existing_servers = ns.getPurchasedServers();
                await update_grind_server_txt(ns, existing_servers);
                if (current_min_ram == current_purchasing_ram) {
                    current_purchasing_ram *= 2;
                } if (current_purchasing_ram > ram_limit) {
                    current_purchasing_ram = ram_limit;
                } if (current_min_ram == ram_limit) {
                    ns.toast('buy_server.js has purchased all available servers. Now exiting...')
                    ns.exit()
                }
            }
            new_purchased_server = ns.purchaseServer('grinding-server', current_purchasing_ram);
            current_needed_money = ns.getPurchasedServerCost(current_purchasing_ram);
            existing_servers = ns.getPurchasedServers();
            await update_grind_server_txt(ns, existing_servers);
            ns.run('/scripts/transport_files.js', 1, new_purchased_server);
            ns.toast('Purchased new server ' + new_purchased_server);
            await ns.sleep(5000);  // Make sure that files were transported
            if (ns.hasRootAccess('phantasy')) {
                ns.run('/scripts/grind_on_my_servers.script', 1, 'phantasy');
            } else {
                ns.run('/scripts/grind_on_my_servers.script', 1, 'joesguns');
            }
        }
    }
}

async function delete_small_server(ns, servers) {
    var min_ram = -1,
        min_index = -1;

    for (var i = 0; i < servers.length; i++) {
        if (ns.getServerMaxRam(servers[i]) < min_ram || min_ram == -1) {
            min_ram = ns.getServerMaxRam(servers[i]);
            min_index = i;
        }
    }

    await ns.killall(servers[min_index]);
    await ns.deleteServer(servers[min_index]);
    await ns.toast('Deleted ' + servers[min_index]);
    return min_ram;
}

async function update_grind_server_txt(ns, servers) {
    await ns.print('Received servers ', servers, ' to update');
    await ns.write('/grind_servers.txt', servers.join('\r\n'), 'w');
}