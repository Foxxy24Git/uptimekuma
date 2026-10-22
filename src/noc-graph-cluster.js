/**
 * NOC Graph Cluster Helper
 * Pure functions for grouping leaf nodes and calculating physics weights.
 */

/**
 * Group leaf nodes by clusterKey (excluding core, kantor, and tag nodes).
 * Nodes without clusterKey are ignored.
 * @param {Array<object>} nodes Array of graph nodes
 * @returns {Map<string, Array<object>>} Map of clusterKey to array of member nodes
 */
export function buildNodesByGroup(nodes) {
    const map = new Map();
    if (!Array.isArray(nodes)) {
        return map;
    }

    for (const node of nodes) {
        if (!node || !node.clusterKey) {
            continue;
        }
        if (node.type === "core" || node.type === "kantor" || node.type === "tag") {
            continue;
        }

        const group = map.get(node.clusterKey);
        if (group) {
            group.push(node);
        } else {
            map.set(node.clusterKey, [node]);
        }
    }

    return map;
}

/**
 * Get repulsion weight for a node based on its operational status.
 * Offline ('down') nodes receive a 50% stronger repulsion weight (1.5),
 * while healthy ('up') or latency-degraded ('slow') nodes receive standard weight (1).
 * @param {object} node Graph node
 * @returns {number} Repel weight (1.5 for 'down', 1 for others)
 */
export function getRepelWeight(node) {
    if (node && node.status === "down") {
        return 1.5;
    }
    return 1;
}
