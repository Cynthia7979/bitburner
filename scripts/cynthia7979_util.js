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