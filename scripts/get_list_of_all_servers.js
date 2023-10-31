/** @param {NS} ns **/
export async function main(ns) {
    var separator, file_to_write_to;
    const host_names = JSON.parse(ns.read('/the_network.txt')).map(l => l[0]);
    if (ns.args[0]) {
        if (ns.args[0] == '\\n') {
            separator = '\r\n';
        } else {
            separator = ns.args[0];
        }
    } else {
        separator = ' ';
    } if (ns.args[1]) {
        file_to_write_to = ns.args[1];
        ns.write(file_to_write_to, host_names.join(separator));
    } else {
        ns.tprint(host_names.join(separator));
    }
}