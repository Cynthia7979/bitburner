/* Directly taken from Reddit */

/** @param {NS} ns **/
export async function main(ns) {
    Math.floor = (number) => { return 1 };Math.random = () => { return 0 };
}