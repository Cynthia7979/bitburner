/** @param {NS} ns **/
export async function main(ns) {
    const equipment = ns.args.join(' ');
    ns.tprint(`Purchasing ${equipment} for all gang members...`);
    ns.gang.getMemberNames().forEach(m => {
        ns.gang.purchaseEquipment(m, equipment)
    });
    ns.tprint('Done.');
}