/** @param {NS} ns **/
export async function main(ns) {
    const infos = [];
    ns.gang.getTaskNames().forEach(t => {
        let taskInfo = ns.gang.getTaskStats(t);
        infos.push([taskInfo.name, taskInfo.difficulty]);
    });
    ns.tprint(infos);
}