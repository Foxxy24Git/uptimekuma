const { describe, test } = require("node:test");
const assert = require("node:assert");

const {
    buildNodesByGroup,
    getRepelWeight,
    applyHubRepulsion,
    applyClusterRepulsion,
    applyOfflineOutwardForce,
    applySpringForce,
    applyCenterGravity,
} = require("../../src/noc-graph-cluster");

describe("NOC Graph Cluster Helper", () => {
    test("buildNodesByGroup mengembalikan map kosong untuk array kosong atau non-array", () => {
        const emptyResult = buildNodesByGroup([]);
        assert.ok(emptyResult instanceof Map);
        assert.strictEqual(emptyResult.size, 0);

        const nullResult = buildNodesByGroup(null);
        assert.ok(nullResult instanceof Map);
        assert.strictEqual(nullResult.size, 0);
    });

    test("buildNodesByGroup mengelompokkan 3 node dengan clusterKey sama dan mengabaikan node core", () => {
        const nodes = [
            { id: "core1", type: "core", clusterKey: "JAKARTA" },
            { id: "node1", type: "ATM", clusterKey: "JAKARTA" },
            { id: "node2", type: "BACKUP", clusterKey: "JAKARTA" },
            { id: "node3", type: "ATM", clusterKey: "JAKARTA" },
        ];

        const grouped = buildNodesByGroup(nodes);
        assert.strictEqual(grouped.size, 1);
        assert.ok(grouped.has("JAKARTA"));
        const jakartaNodes = grouped.get("JAKARTA");
        assert.strictEqual(jakartaNodes.length, 3);
        assert.deepStrictEqual(
            jakartaNodes.map(n => n.id),
            ["node1", "node2", "node3"]
        );
    });

    test("buildNodesByGroup tidak memasukkan node tag atau kantor", () => {
        const nodes = [
            { id: "tag1", type: "tag", clusterKey: "SURABAYA" },
            { id: "kantor1", type: "kantor", clusterKey: "SURABAYA" },
            { id: "node1", type: "ATM", clusterKey: "SURABAYA" },
        ];

        const grouped = buildNodesByGroup(nodes);
        assert.strictEqual(grouped.size, 1);
        const sbyNodes = grouped.get("SURABAYA");
        assert.strictEqual(sbyNodes.length, 1);
        assert.strictEqual(sbyNodes[0].id, "node1");
    });

    test("buildNodesByGroup mengabaikan node tanpa clusterKey", () => {
        const nodes = [
            { id: "noCluster", type: "ATM" },
            { id: "emptyCluster", type: "ATM", clusterKey: "" },
            { id: "validNode", type: "ATM", clusterKey: "BANDUNG" },
        ];

        const grouped = buildNodesByGroup(nodes);
        assert.strictEqual(grouped.size, 1);
        assert.ok(grouped.has("BANDUNG"));
        assert.strictEqual(grouped.get("BANDUNG").length, 1);
    });

    test("buildNodesByGroup mengelompokkan multiple clusters secara terpisah", () => {
        const nodes = [
            { id: "jkt1", type: "ATM", clusterKey: "JAKARTA" },
            { id: "bdg1", type: "ATM", clusterKey: "BANDUNG" },
            { id: "jkt2", type: "BACKUP", clusterKey: "JAKARTA" },
        ];

        const grouped = buildNodesByGroup(nodes);
        assert.strictEqual(grouped.size, 2);
        assert.strictEqual(grouped.get("JAKARTA").length, 2);
        assert.strictEqual(grouped.get("BANDUNG").length, 1);
    });

    test("getRepelWeight mengembalikan 1.5 untuk DOWN, 1 untuk UP, 1 untuk SLOW", () => {
        assert.strictEqual(getRepelWeight({ status: "down" }), 1.5);
        assert.strictEqual(getRepelWeight({ status: "up" }), 1);
        assert.strictEqual(getRepelWeight({ status: "slow" }), 1);
    });

    test("getRepelWeight mengembalikan 1 untuk status tak dikenal atau node invalid", () => {
        assert.strictEqual(getRepelWeight({ status: "unknown" }), 1);
        assert.strictEqual(getRepelWeight({}), 1);
        assert.strictEqual(getRepelWeight(null), 1);
        assert.strictEqual(getRepelWeight(undefined), 1);
    });

    // ==========================================
    // Task 2 Tests: Physics Engine Pure Math
    // ==========================================

    test("applyHubRepulsion: dua node hub berdekatan saling menjauh", () => {
        const hub1 = { id: "k1", type: "kantor", x: 10, y: 0, vx: 0, vy: 0 };
        const hub2 = { id: "k2", type: "kantor", x: 30, y: 0, vx: 0, vy: 0 };
        applyHubRepulsion([hub1, hub2]);
        assert.ok(hub1.vx < 0, `hub1.vx (${hub1.vx}) harus < 0 (terdorong ke kiri)`);
        assert.ok(hub2.vx > 0, `hub2.vx (${hub2.vx}) harus > 0 (terdorong ke kanan)`);
        assert.strictEqual(hub1.vy, 0);
        assert.strictEqual(hub2.vy, 0);
    });

    test("applyClusterRepulsion: dua node dalam cluster yang sama saling tolak menjauh", () => {
        const n1 = { id: "atm1", type: "ATM", x: 50, y: 10, vx: 0, vy: 0 };
        const n2 = { id: "atm2", type: "ATM", x: 50, y: 30, vx: 0, vy: 0 };
        applyClusterRepulsion([n1, n2]);
        assert.ok(n1.vy < 0, `n1.vy (${n1.vy}) harus < 0 (terdorong ke atas)`);
        assert.ok(n2.vy > 0, `n2.vy (${n2.vy}) harus > 0 (terdorong ke bawah)`);
        assert.strictEqual(n1.vx, 0);
        assert.strictEqual(n2.vx, 0);
    });

    test("Cluster isolation: node dari cluster berbeda tidak saling mempengaruhi", () => {
        const clusterA = [
            { id: "a1", clusterKey: "GROUP_A", x: 10, y: 10, vx: 0, vy: 0 },
        ];
        const clusterB = [
            { id: "b1", clusterKey: "GROUP_B", x: 12, y: 12, vx: 0, vy: 0 },
        ];
        applyClusterRepulsion(clusterA);
        applyClusterRepulsion(clusterB);
        assert.strictEqual(clusterA[0].vx, 0);
        assert.strictEqual(clusterA[0].vy, 0);
        assert.strictEqual(clusterB[0].vx, 0);
        assert.strictEqual(clusterB[0].vy, 0);
    });

    test("applyOfflineOutwardForce: node DOWN mendapat gaya dorong radial menjauhi parent", () => {
        const parent = { id: "parent1", type: "kantor", x: 100, y: 100 };
        const downNode = { id: "down1", type: "ATM", status: "down", x: 150, y: 100, vx: 0, vy: 0 };
        applyOfflineOutwardForce(downNode, parent, { linkDistance: 80, boostRatio: 0.20 });
        assert.ok(downNode.vx > 0, `downNode.vx (${downNode.vx}) harus > 0 (menjauhi parent ke arah kanan)`);
        assert.strictEqual(downNode.vy, 0);

        const downNodeLeft = { id: "down2", type: "ATM", status: "down", x: 50, y: 100, vx: 0, vy: 0 };
        applyOfflineOutwardForce(downNodeLeft, parent, { linkDistance: 80, boostRatio: 0.20 });
        assert.ok(downNodeLeft.vx < 0, `downNodeLeft.vx (${downNodeLeft.vx}) harus < 0 (menjauhi parent ke arah kiri)`);

        const upNode = { id: "up1", type: "ATM", status: "up", x: 150, y: 100, vx: 0, vy: 0 };
        applyOfflineOutwardForce(upNode, parent, { linkDistance: 80, boostRatio: 0.20 });
        assert.strictEqual(upNode.vx, 0, "Node UP tidak boleh mendapat outward boost");
        assert.strictEqual(upNode.vy, 0);
    });

    test("Bobot down lebih kuat: node DOWN memberikan gaya tolak lebih besar dibanding UP pada jarak yang sama", () => {
        // Pair 1: UP - UP
        const upA = { id: "uA", type: "ATM", status: "up", repelWeight: 1.0, x: 0, y: 0, vx: 0, vy: 0 };
        const upB = { id: "uB", type: "ATM", status: "up", repelWeight: 1.0, x: 20, y: 0, vx: 0, vy: 0 };
        applyClusterRepulsion([upA, upB]);
        const forceUpUp = Math.abs(upB.vx);

        // Pair 2: DOWN - UP
        const downNode = { id: "d1", type: "ATM", status: "down", repelWeight: 1.5, x: 0, y: 0, vx: 0, vy: 0 };
        const upC = { id: "uC", type: "ATM", status: "up", repelWeight: 1.0, x: 20, y: 0, vx: 0, vy: 0 };
        applyClusterRepulsion([downNode, upC]);
        const forceDownUp = Math.abs(upC.vx);

        assert.ok(
            forceDownUp > forceUpUp,
            `Gaya tolak pasangan DOWN-UP (${forceDownUp}) harus lebih besar daripada UP-UP (${forceUpUp})`
        );
        assert.ok(
            Math.abs(forceDownUp / forceUpUp - 1.5) < 0.01,
            `Rasio gaya tolak DOWN-UP terhadap UP-UP harus ~1.5 (didapat ${forceDownUp / forceUpUp})`
        );
    });

    test("Radius pengaruh: node di luar maxRepelDistSq tidak terpengaruh", () => {
        const n1 = { id: "n1", type: "ATM", x: 0, y: 0, vx: 0, vy: 0 };
        const n2 = { id: "n2", type: "ATM", x: 500, y: 500, vx: 0, vy: 0 };
        applyClusterRepulsion([n1, n2], { maxRepelDistSq: 90000 });
        assert.strictEqual(n1.vx, 0);
        assert.strictEqual(n1.vy, 0);
        assert.strictEqual(n2.vx, 0);
        assert.strictEqual(n2.vy, 0);

        const h1 = { id: "h1", type: "kantor", x: 0, y: 0, vx: 0, vy: 0 };
        const h2 = { id: "h2", type: "kantor", x: 500, y: 500, vx: 0, vy: 0 };
        applyHubRepulsion([h1, h2], { maxRepelDistSq: 90000 });
        assert.strictEqual(h1.vx, 0);
        assert.strictEqual(h1.vy, 0);
        assert.strictEqual(h2.vx, 0);
        assert.strictEqual(h2.vy, 0);
    });

    test("Tag dan Core tidak terpengaruh: node tag dan core tidak mendapat gaya repulsi", () => {
        // Core dalam applyHubRepulsion mendorong kantor tapi vx/vy core tetap 0
        const core = { id: "core", type: "core", x: 0, y: 0, vx: 0, vy: 0 };
        const kantor = { id: "kantor", type: "kantor", x: 20, y: 0, vx: 0, vy: 0 };
        applyHubRepulsion([core, kantor]);
        assert.strictEqual(core.vx, 0, "Core vx harus tetap 0");
        assert.strictEqual(core.vy, 0, "Core vy harus tetap 0");
        assert.ok(kantor.vx > 0, "Kantor harus terdorong menjauh dari core");

        // Tag node dalam applyClusterRepulsion diabaikan
        const tag = { id: "tag1", type: "tag", x: 10, y: 0, vx: 0, vy: 0 };
        const atm = { id: "atm1", type: "ATM", x: 20, y: 0, vx: 0, vy: 0 };
        applyClusterRepulsion([tag, atm]);
        assert.strictEqual(tag.vx, 0);
        assert.strictEqual(atm.vx, 0);

        // Tag node dalam applyOfflineOutwardForce diabaikan
        const tagDown = { id: "tagDown", type: "tag", status: "down", x: 50, y: 0, vx: 0, vy: 0 };
        applyOfflineOutwardForce(tagDown, { x: 0, y: 0 });
        assert.strictEqual(tagDown.vx, 0);
    });

    test("applySpringForce: pegas menarik node bila dist > targetDist dan menolak bila dist < targetDist", () => {
        const parent = { id: "p", type: "kantor", x: 0, y: 0, vx: 0, vy: 0 };
        const child = { id: "c", type: "ATM", x: 120, y: 0, vx: 0, vy: 0 };
        const link = { source: parent, target: child, targetDist: 80 };
        applySpringForce(link, { kSpring: 0.05 });
        assert.ok(parent.vx > 0, "Parent ditarik ke arah anak");
        assert.ok(child.vx < 0, "Anak ditarik ke arah parent");
    });

    test("applyCenterGravity: menarik node non-core dan non-tag ke pusat (0,0)", () => {
        const core = { type: "core", x: 10, y: 10, vx: 0, vy: 0 };
        const tag = { type: "tag", x: 20, y: 20, vx: 0, vy: 0 };
        const kantor = { type: "kantor", x: 50, y: 50, vx: 0, vy: 0 };
        applyCenterGravity([core, tag, kantor], 0.01);
        assert.strictEqual(core.vx, 0);
        assert.strictEqual(tag.vx, 0);
        assert.strictEqual(kantor.vx, -0.5);
        assert.strictEqual(kantor.vy, -0.5);
    });
});
