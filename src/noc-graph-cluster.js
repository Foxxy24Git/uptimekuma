/**
 * NOC Graph Cluster Helper
 * Pure functions for grouping leaf nodes, calculating physics weights,
 * and isolated two-tier force simulations (Hub & Intra-Cluster).
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

/**
 * Apply pairwise Coulomb repulsion between hub nodes (core and kantor).
 * The core node repels kantor nodes, but core's own velocity is not modified (pinned).
 * Tag nodes do not interact and are ignored.
 * Modifies vx and vy of movable hub nodes in-place.
 * @param {Array<object>} hubNodes Array of hub nodes (core + kantor)
 * @param {object} params Optional physics configuration
 * @returns {void}
 */
export function applyHubRepulsion(hubNodes, params = {}) {
    if (!Array.isArray(hubNodes) || hubNodes.length < 2) {
        return;
    }

    const kRepel = params.kRepel ?? 2400;
    const maxRepelDistSq = params.maxRepelDistSq ?? 90000;
    const softening = params.softening ?? 150;

    const count = hubNodes.length;
    for (let i = 0; i < count; i++) {
        const n1 = hubNodes[i];
        if (!n1 || n1.type === "tag") {
            continue;
        }

        for (let j = i + 1; j < count; j++) {
            const n2 = hubNodes[j];
            if (!n2 || n2.type === "tag") {
                continue;
            }

            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = (dx * dx) + (dy * dy) + softening;

            if (distSq < maxRepelDistSq) {
                const dist = Math.sqrt(distSq) || 1;
                const force = kRepel / distSq;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                if (n1.type !== "core" && n1.type !== "tag") {
                    n1.vx = (n1.vx || 0) - fx;
                    n1.vy = (n1.vy || 0) - fy;
                }
                if (n2.type !== "core" && n2.type !== "tag") {
                    n2.vx = (n2.vx || 0) + fx;
                    n2.vy = (n2.vy || 0) + fy;
                }
            }
        }
    }
}

/**
 * Apply pairwise Coulomb repulsion between member nodes within the same cluster.
 * Nodes with 'down' status exert/receive stronger repulsion based on their repelWeight.
 * Tag and core nodes do not participate and are ignored.
 * Modifies vx and vy of member nodes in-place.
 * @param {Array<object>} members Array of member nodes in a cluster
 * @param {object} params Optional physics configuration
 * @returns {void}
 */
export function applyClusterRepulsion(members, params = {}) {
    if (!Array.isArray(members) || members.length < 2) {
        return;
    }

    const kRepel = params.kRepel ?? 2400;
    const maxRepelDistSq = params.maxRepelDistSq ?? 90000;
    const softening = params.softening ?? 150;

    const count = members.length;
    for (let i = 0; i < count; i++) {
        const n1 = members[i];
        if (!n1 || n1.type === "tag" || n1.type === "core") {
            continue;
        }

        for (let j = i + 1; j < count; j++) {
            const n2 = members[j];
            if (!n2 || n2.type === "tag" || n2.type === "core") {
                continue;
            }

            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = (dx * dx) + (dy * dy) + softening;

            if (distSq < maxRepelDistSq) {
                const dist = Math.sqrt(distSq) || 1;
                const w1 = typeof n1.repelWeight === "number" ? n1.repelWeight : getRepelWeight(n1);
                const w2 = typeof n2.repelWeight === "number" ? n2.repelWeight : getRepelWeight(n2);
                const force = (kRepel * (w1 * w2)) / distSq;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;

                n1.vx = (n1.vx || 0) - fx;
                n1.vy = (n1.vy || 0) - fy;
                n2.vx = (n2.vx || 0) + fx;
                n2.vy = (n2.vy || 0) + fy;
            }
        }
    }
}

/**
 * Apply radial outward boost to an offline ('down') node away from its parent hub.
 * Pushes the node outward by 15-25% of linkDistance so offline nodes are prominent
 * and do not overlap with healthy sibling nodes.
 * Modifies node.vx and node.vy in-place.
 * @param {object} node Graph node
 * @param {object} parent Parent hub node (kantor)
 * @param {object} params Optional boost configuration
 * @returns {void}
 */
export function applyOfflineOutwardForce(node, parent, params = {}) {
    if (!node || node.status !== "down" || !parent) {
        return;
    }
    if (node.type === "tag" || node.type === "core") {
        return;
    }

    const dx = node.x - parent.x;
    const dy = node.y - parent.y;
    const dist = Math.hypot(dx, dy);

    let ux = 1;
    let uy = 0;
    if (dist > 0.0001) {
        ux = dx / dist;
        uy = dy / dist;
    }

    let magnitude = params.force;
    if (typeof magnitude !== "number") {
        const linkDistance = params.linkDistance ?? 80;
        const boostRatio = params.boostRatio ?? 0.20;
        const kSpring = params.kSpring ?? 0.035;
        magnitude = linkDistance * boostRatio * kSpring;
    }

    node.vx = (node.vx || 0) + (ux * magnitude);
    node.vy = (node.vy || 0) + (uy * magnitude);
}

/**
 * Apply Hooke's spring attraction/repulsion along a link.
 * Tag links and tag-core links are ignored (zero-force).
 * Modifies vx and vy of movable source and target nodes in-place.
 * @param {object} link Graph link with source and target node objects
 * @param {object} params Optional spring configuration
 * @returns {void}
 */
export function applySpringForce(link, params = {}) {
    if (!link || link.isTagLink || link.isTagCoreLink) {
        return;
    }
    const src = link.source;
    const tgt = link.target;
    if (!src || !tgt) {
        return;
    }

    const dx = tgt.x - src.x;
    const dy = tgt.y - src.y;
    const dist = Math.sqrt((dx * dx) + (dy * dy)) || 1;
    const targetDist = link.targetDist ?? params.targetDist ?? 80;
    const kSpring = params.kSpring ?? 0.035;
    const force = (dist - targetDist) * kSpring;
    const fx = (dx / dist) * force;
    const fy = (dy / dist) * force;

    if (src.type !== "core" && src.type !== "tag") {
        src.vx = (src.vx || 0) + fx;
        src.vy = (src.vy || 0) + fy;
    }
    if (tgt.type !== "core" && tgt.type !== "tag") {
        tgt.vx = (tgt.vx || 0) - fx;
        tgt.vy = (tgt.vy || 0) - fy;
    }
}

/**
 * Apply center gravity pulling nodes towards the origin (0, 0).
 * Core and tag nodes are unaffected.
 * Modifies vx and vy in-place.
 * @param {Array<object>} nodes Array of graph nodes
 * @param {number|object} params Gravity constant or options object
 * @returns {void}
 */
export function applyCenterGravity(nodes, params = 0.003) {
    if (!Array.isArray(nodes)) {
        return;
    }
    const kGravity = typeof params === "number" ? params : (params.kGravity ?? 0.003);

    const count = nodes.length;
    for (let i = 0; i < count; i++) {
        const n = nodes[i];
        if (!n || n.type === "core" || n.type === "tag") {
            continue;
        }
        n.vx = (n.vx || 0) - (n.x * kGravity);
        n.vy = (n.vy || 0) - (n.y * kGravity);
    }
}
