const { describe, test } = require("node:test");
const assert = require("node:assert");

const { buildNodesByGroup, getRepelWeight } = require("../../src/noc-graph-cluster");

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
});
