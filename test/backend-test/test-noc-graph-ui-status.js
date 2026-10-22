const { describe, test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

describe("NOC Graph UI Status & Live Heartbeat Contract", () => {
    const vueFilePath = path.resolve(__dirname, "../../src/pages/NocGraphView.vue");
    const vueSource = fs.readFileSync(vueFilePath, "utf8");

    test("Source file NocGraphView.vue exists and is readable", () => {
        assert.ok(vueSource.length > 0, "NocGraphView.vue should not be empty");
    });

    test("Template memuat text LIVE HEARTBEAT dan aria-label exact", () => {
        assert.ok(
            vueSource.includes("LIVE HEARTBEAT"),
            "Template harus memuat label text 'LIVE HEARTBEAT'"
        );
        assert.ok(
            vueSource.includes('aria-label="Monitoring heartbeat realtime aktif"'),
            'Template harus memuat aria-label="Monitoring heartbeat realtime aktif"'
        );
    });

    test("Computed physicsModeLabel memuat label exact CLUSTER CERDAS, STABIL, FULL", () => {
        assert.ok(
            vueSource.includes('"CLUSTER CERDAS"'),
            'physicsModeLabel harus menggunakan label "CLUSTER CERDAS"'
        );
        assert.ok(
            vueSource.includes('"STABIL"'),
            'physicsModeLabel harus menggunakan label "STABIL"'
        );
        assert.ok(
            vueSource.includes('"FULL"'),
            'physicsModeLabel harus menggunakan label "FULL"'
        );
    });

    test("Computed physicsStatusDetail memuat detail exact untuk mode stabil dan cluster cerdas", () => {
        assert.ok(
            vueSource.includes("Layout stabil; monitoring heartbeat tetap realtime."),
            'Detail status stabil harus exact: "Layout stabil; monitoring heartbeat tetap realtime."'
        );
        assert.ok(
            vueSource.includes("repulsi lokal per cluster aktif."),
            'Detail status cluster harus exact memuat: "repulsi lokal per cluster aktif."'
        );
        assert.ok(
            vueSource.includes("force simulation aktif."),
            'Detail status full harus exact memuat: "force simulation aktif."'
        );
    });

    test("Scoped CSS memuat class .noc-live-heartbeat-dot dan @keyframes pulse GPU-friendly (transform/opacity)", () => {
        assert.ok(
            vueSource.includes(".noc-live-heartbeat-dot"),
            "CSS harus mendefinisikan class .noc-live-heartbeat-dot"
        );

        // Cari keyframes untuk heartbeat pulse
        const keyframeMatch = vueSource.match(/@keyframes\s+([a-zA-Z0-9_-]+)\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/);
        assert.ok(keyframeMatch, "CSS harus mendefinisikan @keyframes untuk animasi heartbeat");

        const keyframeBody = keyframeMatch[0];
        assert.ok(
            keyframeBody.includes("opacity") && keyframeBody.includes("transform"),
            "Keyframes animasi pulse harus menggunakan opacity dan transform (GPU-friendly)"
        );

        // Pastikan tidak menggunakan properti pemicu layout/paint mahal seperti width/height/top/margin dalam keyframe
        assert.ok(
            !keyframeBody.includes("width:") && !keyframeBody.includes("margin:"),
            "Keyframes pulse tidak boleh menganimasi layout properties (width/margin)"
        );
    });

    test("Scoped CSS memuat prefers-reduced-motion untuk mematikan animasi", () => {
        assert.ok(
            vueSource.includes("prefers-reduced-motion: reduce"),
            "CSS harus memuat media query @media (prefers-reduced-motion: reduce)"
        );
        assert.ok(
            vueSource.includes("animation: none"),
            "Media query prefers-reduced-motion harus mengatur animation: none"
        );
    });

    test("Tidak ada penambahan timer JS baru (setInterval/setTimeout) untuk indikator UI", () => {
        // Heartbeat visual sepenuhnya ditenagai CSS keyframes
        const scriptMatch = vueSource.match(/<script>([\s\S]*?)<\/script>/);
        assert.ok(scriptMatch, "Script tag harus ditemukan");
        const scriptContent = scriptMatch[1];
        assert.ok(
            !scriptContent.includes("setInterval") || !scriptContent.includes("heartbeatInterval"),
            "Tidak boleh menambahkan timer JS baru untuk indikator visual heartbeat"
        );
    });
});
