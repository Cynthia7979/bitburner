/** @param {NS} ns **/
export async function main(ns) {}

export function manual(scriptName, scriptArgs) {
    const usageString = `\nUsage:\n\trun ${scriptName} ${Object.keys(scriptArgs).map(s => `[--${s}]`).join(' ')}`;
    const argsString = `${Object.entries(scriptArgs).map(e => {
        let [k, v] = e;
        let numOfTabs = 5 - Math.ceil(k.length / 6);
        numOfTabs = numOfTabs > 0 ? numOfTabs : 1;
        let tabSplitter = '\t'.repeat(numOfTabs);
        let stringCut = v.match(/.{1,102}/g);
        return `--${k}${tabSplitter}${stringCut.join('\n' + tabSplitter + '\t')}`;
    }).join('\n')}`
    return `${usageString}\n\n${argsString}`;
}

export function verify(server, for_hack = false) {
    if (!for_hack) {
        return !['', ' '].includes(server);
    } else {
        return !['CSEC', 'I.I.I.I', '.', 'avmnite-02h', 'run4theh111z', '', ' ', 'darkweb'].includes(server);
    }
}

export async function transportFilesTo(ns, ...servers) {
    for (let i = 0; i < servers.length; i++) {
        let s = servers[i];
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