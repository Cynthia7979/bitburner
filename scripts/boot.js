import { manual, verify, transportFilesTo } from '/scripts/cynthia7979_util.js';

/** @param {NS} ns **/
export async function main(ns) {
    const args = ns.flags([
        ['fast', false],
        ['grind-hack', false],
        ['no-buy-servers', false],
        ['weaken-server', 'joesguns'],
        ['single-hack-server', 'joesguns'],
        ['no-home', false],
        ['grind-share', false],
        ['share-all', false],
        ['no-hack', false],
        ['for-rep', false],
        ['init', false],
        ['no-buy-hacknet', false],
        ['help', false]
    ])

    const fast_mode = args['fast'],
        grind_hack = args['grind-hack'],
        auto_buy_server = !args['no-buy-servers'],
        weaken_victim = args['weaken-server'],
        server_to_target_specifically = args['single-hack-server'],
        grind_share = args['grind-share'],
        share_mode = args['share-all'],
        no_hack = args['no-hack'],
        for_reputation = args['for-rep'],
        init = args['init'],
        auto_buy_hacknet = !args['no-buy-hacknet'],
        help = args['help'],
        servers_to_hack = args['_'].length ? args['_'] : ns.read('/all_servers_names.txt').split('\r\n');
    var servers_to_autorun = ns.read('/all_servers_names.txt').split('\r\n').concat(ns.read('/grind_servers.txt').split('\r\n')).concat(args['no-home'] ? [] : ['home']),

    if (help) {
        ns.tprint(manual('boot.js', {
            'fast': 'Enables fast mode and prevents script from growing/weakening servers that are currently not hackable. Switch this on if game freezes on boot.',
            'grind-hack': 'Instead of grinding with weaken(), grinds with hack.js against server specified in --single-hack-server. Weaken-grinding function will still be called to exploit the most RAM.',
            'no-buy-servers': 'Prevents the script from running buy_server.js. Saves you money.',
            'weaken-server joesguns': 'The hostname to pass to grind_on_all_servers.js.',
            'single-hack-server joesguns': 'The hostname to enable multiple threads on hacking.',
            'no-home': 'Disables grinding and hacking on \'home\'.',
            'grind-share': 'Instead of weaken(), grinds with simple_share.js on all servers. Weaken-grinding function will still be called to exploit the most RAM.',
            'share-all': 'Disables all hacking and shares on all servers.',
            'no-hack': 'Disables hacking and only does the grinding.',
            'for-rep': 'Grinds the Gang (if any) for reputation.',
            'init': 'Resets /grind_servers.txt - recommended to have this on after installing augmentation.',
            'no-buy-hacknet': 'Disables auto-buying hacknet nodes.',
            'help': 'Displays this manual.'
        }));
        ns.exit();
    }

    ns.tprint('Preparing to boot...');

    ns.print(servers_to_autorun);
    ns.print(servers_to_hack);

    if (init) {
        await ns.write('/grind_servers.txt', '', 'w');
        ns.tprint('/grind_servers.txt cleared.');
        servers_to_autorun = ns.read('/all_servers_names.txt').split('\r\n').concat(args['no-home'] ? [] : ['home']);
        await transportFilesTo(ns, ...servers_to_autorun);
    }

    if (auto_buy_hacknet) {
        ns.tprint('Starting auto-hacknet-buy.js...');
        ns.run('/scripts/auto-hacknet-buy.js');
        await ns.sleep(100);
    }

    ns.tprint('TIP: Remember to update your distributive network regularly!');
    await ns.sleep(100);

    if (!share_mode && !no_hack) {
        ns.tprint('Starting up hacking/growing/weakening scripts on all servers...');
        if (fast_mode) { ns.tprint('WARNING: Fast mode is enabled. Servers below hacking level will not be weakened.') }
        for (let s of servers_to_autorun) {
            if (s != ' ' && s) {  // If it is not a blank line
                ns.print(s);
                hack_the_list(ns, s, servers_to_hack, fast_mode, grind_hack && server_to_target_specifically);
            }
            await ns.sleep(25);  // To make sure that it doesn't freeze the app
        }
    }


    ns.tprint('TIP: Use acqure_the_internet.js to begin after Augmentation!');
    await ns.sleep(100);

    if (auto_buy_server) {
        ns.tprint('Starting buy_server.js...');
        ns.run('/scripts/buy_server.js', 1, weaken_victim);
        await ns.sleep(100);
    }

    if (ns.gang.inGang()) {
        ns.tprint('Starting gangs script...');
        ns.run('/scripts/gangs_my.js', 1, for_reputation ? '--for-rep' : '');
    }

    ns.tprint('Beginning the grinding process...');
    if (grind_share || share_mode) {
        grind_the_list(ns, '', servers_to_autorun, 'share');
    } else {
        if (grind_hack) {
            grind_the_list(ns, server_to_target_specifically, servers_to_autorun, 'hack');
        }
    }
    await ns.sleep(100);
    // grind_the_list(ns, weaken_victim, servers_to_autorun, 'weakengrow');
    grind_the_list(ns, weaken_victim, servers_to_autorun, 'weaken')
    await ns.sleep(100);

    ns.tprint('Done!');
}

function enough_for_hack(ns, server) {
    return ns.getServerRequiredHackingLevel(server) <= ns.getPlayer().hacking;
}

function hack_the_list(ns, host, list_of_servers, fast_mode, special_server = null) {
    /* Uses the host to hack the list of servers provided. */
    if (ns.hasRootAccess(host)) {
        var server,
            has_enough_ram = 1;
        for (var j = 0; j < list_of_servers.length; j++) {
            server = list_of_servers[j];  // Target server
            if (verify(server, true)) {
                if (ns.getServerMaxMoney(server) != 0) {
                    if (ns.hasRootAccess(server)) {
                        if (server != special_server) {
                            if (enough_for_hack(ns, server)) {
                                has_enough_ram = ns.exec('/scripts/hack.js', host, 1, server);  // Do the hacking
                            } else {
                                if (!fast_mode) {
                                    has_enough_ram = ns.exec('/scripts/weaken_and_grow_only.js', host, 1, server);  // Only weaken and grow
                                }
                            }
                        } else {
                            ns.print('Saving ', server, 'till the end.');
                        }
                    } else {
                        ns.tprint('WARNING: Skipping ', server, ' from ', host, ' because you don\'t have root access to it');
                    }
                } else {
                    ns.print('Skipping ', server, ' from ', host, ' because the server has $0 maximum money.')
                }
            }
            if (!has_enough_ram) {  // exec returns 0 when the script wasn't successfully ran
                ns.print('Terminating hacking for host ', host, ' because of limited RAM.')
                return;
            }
        }
    }
}

function grind_the_list(ns, victim, list_of_hosts, mode) {
    /* Weakens, hacks, or shares on the victim from the list of hosts using all the RAM available. */
    const script_to_run = { 'weakengrow': '/scripts/weaken_and_grow_only.js', 'weaken': '/scripts/weaken-exp-grind.js', 'hack': '/scripts/hack.js', 'share': '/scripts/simple_share.js' }[mode],
        ram_per_thread = ns.getScriptRam(script_to_run);

    for (let host of list_of_hosts) {
        if (verify(host)) {
            var available_ram = ns.getServerMaxRam(host) - ns.getServerUsedRam(host),
                num_of_threads = Math.floor(available_ram / ram_per_thread) - 1;
            if (num_of_threads > 0) {
                (mode == 'share') ? ns.exec(script_to_run, host, num_of_threads) : ns.exec(script_to_run, host, num_of_threads, victim);
            } else {
                ns.print('Skipped ', host, ' when grinding ', mode, ' because of inefficient RAM.')
            }
        }
    }

    ns.tprint('Finished running grind_the_list on servers with mode ', mode);
}