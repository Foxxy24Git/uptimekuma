<template>
    <div class="noc-dashboard-container">
        <!-- TOP TOOLBAR & HEADER -->
        <div class="noc-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div class="d-flex align-items-center gap-3">
                <div class="noc-logo-badge">
                    <svg class="noc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                </div>
                <div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="noc-title">UPTIME KUMA</span>
                        <span class="noc-badge-tag">NOC Executive</span>
                    </div>
                    <p class="noc-subtitle mb-0">Monitoring Realtime Jaringan ATM & Kantor Cabang</p>
                </div>
            </div>

            <!-- Right Controls: Live Clock & Fullscreen -->
            <div class="d-flex align-items-center gap-2">
                <router-link to="/noc/graph" class="btn btn-sm noc-btn-secondary d-flex align-items-center gap-1.5" title="Topologi Jaringan Graph View (Obsidian Style)">
                    <font-awesome-icon icon="project-diagram" />
                    <span class="d-none d-md-inline small">Graph View</span>
                </router-link>

                <router-link to="/dashboard" class="btn btn-sm noc-btn-secondary d-flex align-items-center gap-1.5" title="Kembali ke Dashboard Utama">
                    <font-awesome-icon icon="tachometer-alt" />
                    <span class="d-none d-md-inline small">Dashboard Utama</span>
                </router-link>

                <div class="noc-clock-box d-none d-sm-flex align-items-center gap-2">
                    <span class="noc-dot-live"></span>
                    <span class="noc-mono-text font-bold">{{ currentTime }}</span>
                    <span class="text-secondary">|</span>
                    <span class="text-secondary small">{{ currentDate }}</span>
                </div>

                <button class="btn btn-sm noc-btn-secondary" title="Mode TV / Fullscreen" @click="toggleFullScreen">
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-7 11l-5 5m0 0h4m-4 0v-4m16 4l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- DYNAMIC SCOPE INDICATOR -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 px-1">
            <div class="d-flex align-items-center gap-2">
                <span class="text-secondary small">Lingkup Data:</span>
                <span class="noc-scope-pill">
                    <span v-if="selectedGroup !== 'ALL'" class="text-primary fw-bold">Grup: {{ selectedGroup }}</span>
                    <span v-else>Seluruh Wilayah ({{ uniqueGroups.length }} Grup)</span>
                    <span class="text-secondary mx-1">•</span>
                    <span v-if="selectedTag !== 'ALL'" class="text-white fw-bold">Jaringan: {{ selectedTag }}</span>
                    <span v-else>Semua Provider</span>
                    <span class="text-secondary ms-1">({{ scopedMonitors.length }} Monitor)</span>
                </span>
            </div>
            <div v-if="selectedGroup !== 'ALL' || selectedTag !== 'ALL'">
                <button class="btn btn-link btn-sm text-primary text-decoration-none p-0" @click="resetFilters">
                    &times; Kembali ke Seluruh Wilayah
                </button>
            </div>
        </div>

        <!-- ======================================================== -->
        <!-- [IMAGE 1] 4 KPI CARDS - DILETAKKAN PALING ATAS           -->
        <!-- ======================================================== -->
        <!-- ======================================================== -->
        <!-- [IMAGE 1] 5 KPI CARDS                                    -->
        <!-- ROW 1: ATM, KANTOR, BACKUP (3 CARDS)                     -->
        <!-- ROW 2: LINK ONLINE UP, LINK GANGGUAN DOWN (2 CARDS)      -->
        <!-- ======================================================== -->
        <div class="row g-3 mb-4">
            <!-- CARD 1: ATM -->
            <div class="col-12 col-md-4">
                <div
                    class="noc-kpi-card noc-kpi-card-clickable"
                    role="button"
                    tabindex="0"
                    title="Atur grup dan hostname Infrastruktur ATM"
                    @click="openAtmRule"
                    @keyup.enter="openAtmRule"
                >
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="noc-kpi-label">INFRASTRUKTUR ATM</span>
                        <div class="noc-kpi-icon-wrap text-info bg-info-subtle">
                            <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                        </div>
                    </div>
                    <div class="d-flex align-items-baseline gap-2 mt-2">
                        <span id="statTotalAtm" class="noc-kpi-num">{{ statsAtm.total }}</span>
                        <span class="text-secondary small">Unit Terdaftar</span>
                    </div>
                    <div class="noc-kpi-divider">
                        <div class="d-flex align-items-center gap-1 text-primary fw-semibold">
                            <span class="noc-dot-green"></span> {{ statsAtm.up }} Online
                        </div>
                        <div class="d-flex align-items-center gap-1 text-danger fw-semibold">
                            <span class="noc-dot-red"></span> {{ statsAtm.down }} Offline
                        </div>
                        <div class="text-secondary">{{ statsAtm.percent }}%</div>
                    </div>
                    <div class="noc-progress-track">
                        <div class="noc-progress-bar bg-primary" :style="{ width: statsAtm.percent + '%' }"></div>
                    </div>
                </div>
            </div>

            <!-- CARD 2: KANTOR -->
            <div class="col-12 col-md-4">
                <div
                    class="noc-kpi-card noc-kpi-card-clickable"
                    role="button"
                    tabindex="0"
                    title="Atur grup dan hostname Infrastruktur Kantor"
                    @click="openKantorRule"
                    @keyup.enter="openKantorRule"
                >
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="noc-kpi-label">JARINGAN KANTOR CABANG</span>
                        <div class="noc-kpi-icon-wrap text-purple bg-purple-subtle">
                            <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                    <div class="d-flex align-items-baseline gap-2 mt-2">
                        <span id="statTotalOffice" class="noc-kpi-num">{{ statsKantor.total }}</span>
                        <span class="text-secondary small">Kantor (KC/KCP/KK)</span>
                    </div>
                    <div class="noc-kpi-divider">
                        <div class="d-flex align-items-center gap-1 text-primary fw-semibold">
                            <span class="noc-dot-green"></span> {{ statsKantor.up }} Online
                        </div>
                        <div class="d-flex align-items-center gap-1 text-secondary fw-semibold">
                            <span class="noc-dot-gray"></span> {{ statsKantor.down }} Offline
                        </div>
                        <div class="text-secondary">{{ statsKantor.percent }}%</div>
                    </div>
                    <div class="noc-progress-track">
                        <div class="noc-progress-bar bg-primary" :style="{ width: statsKantor.percent + '%' }"></div>
                    </div>
                </div>
            </div>

            <!-- CARD 3: JARINGAN BACKUP -->
            <div class="col-12 col-md-4">
                <div
                    class="noc-kpi-card noc-kpi-card-clickable"
                    role="button"
                    tabindex="0"
                    title="Atur grup dan hostname Jaringan Backup"
                    @click="openBackupRule"
                    @keyup.enter="openBackupRule"
                >
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="noc-kpi-label">JARINGAN BACKUP</span>
                        <div class="noc-kpi-icon-wrap text-warning bg-warning-subtle">
                            <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                    </div>
                    <div class="d-flex align-items-baseline gap-2 mt-2">
                        <span class="noc-kpi-num text-warning">{{ statsBackup.total }}</span>
                        <span class="text-secondary small">Link Backup</span>
                    </div>
                    <div class="noc-kpi-divider">
                        <div class="d-flex align-items-center gap-1 text-primary fw-semibold"><span class="noc-dot-green"></span> {{ statsBackup.up }} Online</div>
                        <div class="d-flex align-items-center gap-1 text-danger fw-semibold"><span class="noc-dot-red"></span> {{ statsBackup.down }} Offline</div>
                        <div class="text-secondary">{{ statsBackup.percent }}%</div>
                    </div>
                    <div class="noc-progress-track"><div class="noc-progress-bar bg-warning" :style="{ width: statsBackup.percent + '%' }"></div></div>
                </div>
            </div>

            <!-- CARD 4: LINK UP -->
            <div class="col-12 col-md-6">
                <div class="noc-kpi-card">
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="noc-kpi-label">KONEKSI LINK ONLINE (UP)</span>
                        <div class="noc-kpi-icon-wrap text-primary bg-primary-subtle">
                            <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>
                    <div class="d-flex align-items-baseline gap-2 mt-2">
                        <span id="statTotalUp" class="noc-kpi-num text-primary">{{ statsGlobal.up }}</span>
                        <span class="text-secondary small">Link Normal</span>
                    </div>
                    <div class="noc-kpi-divider">
                        <span class="text-secondary small">SLA Availability:</span>
                        <span class="text-primary fw-bold font-mono">{{ statsGlobal.percent }}%</span>
                    </div>
                    <div class="noc-progress-track">
                        <div class="noc-progress-bar bg-primary" :style="{ width: statsGlobal.percent + '%' }"></div>
                    </div>
                </div>
            </div>

            <!-- CARD 5: LINK DOWN -->
            <div class="col-12 col-md-6">
                <div class="noc-kpi-card" :class="{ 'border-danger': statsGlobal.down > 0 }">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center gap-1.5">
                            <span class="noc-dot-red"></span>
                            <span class="noc-kpi-label text-danger">LINK GANGGUAN (DOWN)</span>
                        </div>
                        <div class="noc-kpi-icon-wrap text-danger bg-danger-subtle">
                            <svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <div class="d-flex align-items-baseline gap-2 mt-2">
                        <span id="statTotalDown" class="noc-kpi-num text-danger">{{ statsGlobal.down }}</span>
                        <span class="text-danger small">Titik Putus Segera Dicek!</span>
                    </div>
                    <div class="noc-kpi-divider">
                        <span class="text-secondary small">Prioritas Penanganan:</span>
                        <span v-if="statsGlobal.down > 0" class="badge bg-danger-subtle text-danger font-mono">TINGGI (URGENT)</span>
                        <span v-else class="badge bg-primary-subtle text-primary font-mono">NORMAL</span>
                    </div>
                    <div class="noc-progress-track">
                        <div class="noc-progress-bar bg-danger" :style="{ width: (statsGlobal.down > 0 ? (statsGlobal.down / scopedMonitors.length * 100) : 0) + '%' }"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ======================================================== -->
        <!-- 2. CRITICAL ALERT BOX (HUMAN RECOGNITION AT A GLANCE)    -->
        <!-- ======================================================== -->
        <div class="noc-alert-section mb-4">
            <!-- Normal status -->
            <div v-if="downMonitorsInScope.length === 0" class="noc-card p-3 border-success-subtle d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div class="d-flex align-items-center gap-2">
                    <span class="noc-dot-green"></span>
                    <span class="fw-bold text-primary small text-uppercase">
                        SEMUA SISTEM JARINGAN NORMAL {{ selectedGroup !== 'ALL' ? 'DI ' + selectedGroup : '' }}
                    </span>
                    <span class="text-secondary small d-none d-md-inline">— Seluruh link terpantau online.</span>
                </div>
                <div v-if="allDownMonitors.length > 0">
                    <button class="btn btn-sm btn-outline-danger font-mono" @click="resetFilters">
                        ⚠ {{ allDownMonitors.length }} Insiden di Wilayah Lain (Lihat Semua)
                    </button>
                </div>
                <div v-else>
                    <span class="badge bg-primary-subtle text-primary font-mono">100% HEALTHY</span>
                </div>
            </div>

            <!-- Outages in scope -->
            <div v-else class="noc-card noc-incident-container p-3.5 border-danger-subtle">
                <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-2.5 border-bottom border-secondary-subtle">
                    <div class="d-flex align-items-center gap-2.5">
                        <span class="noc-dot-red-pulse"></span>
                        <h6 class="mb-0 fw-bold text-danger text-uppercase font-mono small tracking-wider">
                            PERINGATAN LINK GANGGUAN
                        </h6>
                        <span class="noc-incident-count-badge font-mono">
                            {{ downMonitorsInScope.length }} PERANGKAT OFFLINE
                        </span>
                    </div>
                    <span class="text-secondary small">Segera koordinasi dengan ISP / Tim terkait</span>
                </div>

                <div class="noc-incident-grid" :class="{ 'noc-incident-scroll': downMonitorsInScope.length > 6 }">
                    <router-link
                        v-for="item in downMonitorsInScope"
                        :key="item.id"
                        :to="`/dashboard/${item.id}`"
                        class="noc-rto-card text-decoration-none"
                        :title="`${item.name} (${item.hostname || '-'}) - Klik untuk detail`"
                    >
                        <div class="noc-rto-card-inner">
                            <!-- Top row: hostname (left) & TAG (right) -->
                            <div class="d-flex align-items-center justify-content-between gap-2 mb-2">
                                <div class="d-flex align-items-center gap-1.5 min-w-0">
                                    <span class="noc-dot-red-pulse flex-shrink-0"></span>
                                    <span class="noc-rto-hostname text-truncate fw-bold" :title="item.name">
                                        {{ item.name }}
                                    </span>
                                </div>
                                <span class="noc-rto-tag font-mono flex-shrink-0">
                                    {{ item.tag || 'Non-Tag' }}
                                </span>
                            </div>

                            <!-- Bottom row: IP (left) & GRUP (right) -->
                            <div class="d-flex align-items-center justify-content-between gap-2 text-secondary small noc-rto-bottom">
                                <div class="d-flex align-items-center gap-1 min-w-0 font-mono noc-rto-ip">
                                    <span class="noc-rto-lbl">IP:</span>
                                    <span class="text-secondary text-truncate">{{ item.hostname || '-' }}</span>
                                </div>
                                <div class="d-flex align-items-center gap-1 flex-shrink-0 noc-rto-group">
                                    <span class="noc-rto-lbl">GRUP:</span>
                                    <span class="text-light fw-medium">{{ item.group }}</span>
                                </div>
                            </div>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import dayjs from "dayjs";
import { UP, DOWN } from "../util.ts";
import { useToast } from "vue-toastification";

const toast = useToast();

export default {
    name: "NocDashboard",
    data() {
        return {
            selectedGroup: "ALL",
            selectedTag: "ALL",
            statusFilter: "ALL",
            typeFilter: "ALL",
            searchQuery: "",
            viewMode: "cards",
            currentTime: "",
            currentDate: "",
            clockTimer: null,
            apiTimer: null,
            apiMonitors: null,
            apiLastHeartbeats: null,
            heartbeatVersion: 0,
            liveSyncTimer: null,
            unwatchHeartbeatList: null,
            unwatchApiHeartbeats: null,
        };
    },
    computed: {
        // Enriched list of all non-group monitors
        allMonitors() {
            const rawSource = (this.$root.monitorList && Object.keys(this.$root.monitorList).length > 0)
                ? this.$root.monitorList
                : (this.apiMonitors || {});

            const list = Object.values(rawSource).filter(m => m.type !== "group");

            return list.map(m => {
                const groupName = (m.parent && rawSource[m.parent])
                    ? rawSource[m.parent].name.trim()
                    : "Lainnya";

                const rawTags = (m.tags || []).map(t => t.name);

                // Type classification: ATM vs KANTOR
                let isKantor = rawTags.some(t => ["KANTOR CABANG", "CAPEM", "Kantor KAS"].includes(t)) ||
                               /^(CABANG|Cabang|KTR CABANG)\b/i.test(m.name);
                const type = isKantor ? "KANTOR" : "ATM";

                // Network Provider Tag
                let provider = rawTags.find(t => ["Telkom", "ICON+", "LA", "Lintasarta", "Indosat", "Biznet"].includes(t)) || "Non-Tag";

                return {
                    ...m,
                    group: groupName,
                    type: type,
                    tag: provider,
                    tags: rawTags,
                };
            });
        },

        // Unique groups list
        uniqueGroups() {
            const groups = new Set();
            this.allMonitors.forEach(m => groups.add(m.group));
            return Array.from(groups).sort();
        },

        // Available network tags
        availableNetworkTags() {
            const tags = new Set(["Telkom", "ICON+", "LA", "Non-Tag"]);
            this.allMonitors.forEach(m => {
                if (m.tag) {tags.add(m.tag);}
            });
            return Array.from(tags);
        },

        // Monitors selected by the active persisted rule, before dashboard filters.
        ruleScopedMonitors() {
            try {
                const raw = localStorage.getItem("noc_rule_atm");
                if (!raw) {return this.allMonitors;}
                const rule = JSON.parse(raw);
                const groups = new Set(rule.groups || []);
                const monitorIds = new Set(rule.monitorIds || []);
                if (groups.size === 0 && monitorIds.size === 0) {return this.allMonitors;}
                return this.allMonitors.filter(m => groups.has(m.group) || monitorIds.has(m.id));
            } catch (e) {
                return this.allMonitors;
            }
        },

        // Scoped monitors based on Selected Group & Tag
        scopedMonitors() {
            return this.ruleScopedMonitors.filter(m => {
                const matchGroup = (this.selectedGroup === "ALL") || (m.group === this.selectedGroup);
                const matchTag = (this.selectedTag === "ALL") || (m.tag === this.selectedTag);
                return matchGroup && matchTag;
            });
        },

        // Filtered monitors (for list display: search, status, type)
        filteredMonitors() {
            return this.scopedMonitors.filter(m => {
                const isDownItem = this.isDown(m);
                const matchStatus = (this.statusFilter === "ALL") ||
                    (this.statusFilter === "UP" && !isDownItem) ||
                    (this.statusFilter === "DOWN" && isDownItem);

                const matchType = (this.typeFilter === "ALL") || (m.type === this.typeFilter);

                const q = this.searchQuery.toLowerCase().trim();
                const matchSearch = q === "" ||
                    m.name.toLowerCase().includes(q) ||
                    m.group.toLowerCase().includes(q) ||
                    (m.hostname && m.hostname.toLowerCase().includes(q));

                return matchStatus && matchType && matchSearch;
            });
        },

        // Down monitors in active scope
        downMonitorsInScope() {
            return this.scopedMonitors.filter(m => this.isDown(m));
        },

        // All down monitors across entire system
        allDownMonitors() {
            return this.allMonitors.filter(m => this.isDown(m));
        },

        // Dynamic KPI Stats for ATM in scope
        statsAtm() {
            const atms = this.scopedMonitors.filter(m => m.type === "ATM");
            const down = atms.filter(m => this.isDown(m)).length;
            const up = atms.length - down;
            const pct = atms.length > 0 ? ((up / atms.length) * 100).toFixed(1) : "100.0";
            return { total: atms.length, up, down, percent: pct };
        },

        // Dynamic KPI Stats for Kantor in scope
        statsKantor() {
            const kantors = this.scopedMonitors.filter(m => m.type === "KANTOR");
            const down = kantors.filter(m => this.isDown(m)).length;
            const up = kantors.length - down;
            const pct = kantors.length > 0 ? ((up / kantors.length) * 100).toFixed(1) : "100.0";
            return { total: kantors.length, up, down, percent: pct };
        },

        // Dynamic KPI Stats for Jaringan Backup berdasarkan rule yang dipilih
        statsBackup() {
            let backupMonitors = this.scopedMonitors;
            try {
                const raw = localStorage.getItem("noc_rule_backup");
                if (raw) {
                    const rule = JSON.parse(raw);
                    const groups = new Set(rule.groups || []);
                    const monitorIds = new Set(rule.monitorIds || []);
                    backupMonitors = this.allMonitors.filter(m => groups.has(m.group) || monitorIds.has(m.id));
                } else {
                    backupMonitors = [];
                }
            } catch (e) {
                backupMonitors = [];
            }
            const down = backupMonitors.filter(m => this.isDown(m)).length;
            const up = backupMonitors.length - down;
            const percent = backupMonitors.length > 0 ? ((up / backupMonitors.length) * 100).toFixed(1) : "100.0";
            return { total: backupMonitors.length, up, down, percent };
        },

        // Dynamic KPI Stats for Global Links in scope
        statsGlobal() {
            const down = this.scopedMonitors.filter(m => this.isDown(m)).length;
            const up = this.scopedMonitors.length - down;
            const pct = this.scopedMonitors.length > 0 ? ((up / this.scopedMonitors.length) * 100).toFixed(2) : "100.00";
            return { total: this.scopedMonitors.length, up, down, percent: pct };
        },

        // Top groups by count
        topGroups() {
            const map = {};
            this.allMonitors.forEach(m => {
                if (!map[m.group]) {map[m.group] = { name: m.group, total: 0, up: 0, down: 0 };}
                map[m.group].total++;
                if (this.isDown(m)) {map[m.group].down++;}
                else {map[m.group].up++;}
            });

            return Object.values(map)
                .map(g => ({
                    ...g,
                    percent: ((g.up / g.total) * 100).toFixed(0)
                }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 10);
        },

        // Tag breakdown
        tagBreakdown() {
            const map = {};
            this.allMonitors.forEach(m => {
                if (!map[m.tag]) {map[m.tag] = { tag: m.tag, total: 0, up: 0, down: 0 };}
                map[m.tag].total++;
                if (this.isDown(m)) {map[m.tag].down++;}
                else {map[m.tag].up++;}
            });

            return Object.values(map).map(t => ({
                ...t,
                percent: ((t.up / t.total) * 100).toFixed(1)
            }));
        }
    },
    mounted() {
        this.updateClock();
        this.clockTimer = setInterval(this.updateClock, 1000);

        // Fetch data via REST API if WebSocket monitorList is not available (e.g. unauthenticated or direct wall TV mode)
        this.checkAndFetchData();
        this.apiTimer = setInterval(this.checkAndFetchData, 15000);

        // --- Prioritas 1: Live sync ---
        // React to global heartbeat updates even though computed KPI helpers
        // (isDown, getPing, etc.) only read $root last-heartbeat data inside
        // methods. Incrementing heartbeatVersion forces every NOC computed +
        // template to re-evaluate in one batch.
        this.unwatchHeartbeatList = this.$watch(() => this.$root.lastHeartbeatList, this.scheduleLiveSync);
        this.unwatchApiHeartbeats = this.$watch(() => this.apiLastHeartbeats, this.scheduleLiveSync);

        // Fast-path: when a monitor flips DOWN or back UP, the monitor
        // emits an important heartbeat. Coalesce to 200ms so the cards /
        // incident list update almost instantly on real incidents.
        this.handleImportantHeartbeat = this.onImportantHeartbeat.bind(this);
        if (this.$root.emitter) {
            this.$root.emitter.on("newImportantHeartbeat", this.handleImportantHeartbeat);
        }
    },
    beforeUnmount() {
        if (this.clockTimer) {clearInterval(this.clockTimer);}
        if (this.apiTimer) {clearInterval(this.apiTimer);}
        if (this.liveSyncTimer) {clearTimeout(this.liveSyncTimer); this.liveSyncTimer = null;}
        if (this.unwatchHeartbeatList) {this.unwatchHeartbeatList(); this.unwatchHeartbeatList = null;}
        if (this.unwatchApiHeartbeats) {this.unwatchApiHeartbeats(); this.unwatchApiHeartbeats = null;}
        if (this.$root.emitter && this.handleImportantHeartbeat) {
            this.$root.emitter.off("newImportantHeartbeat", this.handleImportantHeartbeat);
        }
    },
    methods: {
        async checkAndFetchData() {
            if (!this.$root.monitorList || Object.keys(this.$root.monitorList).length === 0) {
                try {
                    const res = await fetch("/api/noc/data");
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.ok) {
                            this.apiMonitors = data.monitorList;
                            this.apiLastHeartbeats = data.lastHeartbeatList;
                        }
                    }
                } catch (e) {
                    console.error("Failed to load /api/noc/data:", e);
                }
            }
        },

        updateClock() {
            const now = dayjs();
            this.currentTime = now.format("HH:mm:ss") + " WIB";
            this.currentDate = now.format("D MMM YYYY");
        },

        // Coalesce ordinary heartbeat updates so a busy installation does not
        // re-evaluate all KPI cards once per monitor heartbeat.
        scheduleLiveSync(delay = 1000) {
            const timeoutMs = (typeof delay === "number") ? delay : 1000;
            if (this.liveSyncTimer) {
                return;
            }

            this.liveSyncTimer = setTimeout(() => {
                this.liveSyncTimer = null;
                this.heartbeatVersion++;
            }, timeoutMs);
        },

        onImportantHeartbeat() {
            // Fast-path: clear normal throttle if any and trigger in 200ms
            if (this.liveSyncTimer) {
                clearTimeout(this.liveSyncTimer);
                this.liveSyncTimer = null;
            }
            this.scheduleLiveSync(200);
        },

        isDown(monitor) {
            // Explicit dependency for computed properties that call this helper.
            if (this.heartbeatVersion < 0) {
                return false;
            }
            const beat = (this.$root.lastHeartbeatList && this.$root.lastHeartbeatList[monitor.id])
                || (this.apiLastHeartbeats && this.apiLastHeartbeats[monitor.id]);
            if (!beat) {return false;}
            return beat.status === DOWN;
        },

        getPing(monitor) {
            if (this.heartbeatVersion < 0) {
                return "-";
            }
            if (this.isDown(monitor)) {return "TIMEOUT";}
            const beat = (this.$root.lastHeartbeatList && this.$root.lastHeartbeatList[monitor.id])
                || (this.apiLastHeartbeats && this.apiLastHeartbeats[monitor.id]);
            return beat && beat.ping ? beat.ping + "ms" : "-";
        },

        getUptime(monitor) {
            const key = monitor.id + "_24";
            if (this.$root.uptimeList && this.$root.uptimeList[key] !== undefined) {
                return (this.$root.uptimeList[key] * 100).toFixed(1);
            }
            return "99.8";
        },

        formatDuration(monitor) {
            if (this.heartbeatVersion < 0) {
                return "Baru Saja";
            }
            const beat = (this.$root.lastHeartbeatList && this.$root.lastHeartbeatList[monitor.id])
                || (this.apiLastHeartbeats && this.apiLastHeartbeats[monitor.id]);
            if (!beat || !beat.time) {return "Baru Saja";}
            return dayjs(beat.time).fromNow ? dayjs(beat.time).fromNow() : dayjs(beat.time).format("HH:mm WIB");
        },

        resetFilters() {
            this.selectedGroup = "ALL";
            this.selectedTag = "ALL";
            this.statusFilter = "ALL";
            this.typeFilter = "ALL";
            this.searchQuery = "";
        },

        openAtmRule() {
            this.$router.push("/noc/rules/atm");
        },

        openKantorRule() {
            this.$router.push("/noc/rules/kantor");
        },

        openBackupRule() {
            this.$router.push("/noc/rules/backup");
        },

        toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        },

        copyStatusReport() {
            const down = this.downMonitorsInScope;
            let report = `*LAPORAN STATUS JARINGAN NOC & ATM*\n`;
            report += `Waktu: ${new Date().toLocaleString("id-ID")}\n`;
            report += `Total Link: ${this.scopedMonitors.length} | UP: ${this.statsGlobal.up} | DOWN: ${this.statsGlobal.down}\n\n`;

            if (down.length > 0) {
                report += `*DAFTAR PERANGKAT GANGGUAN:*\n`;
                down.forEach((d, idx) => {
                    report += `${idx + 1}. [${d.type}] *${d.name}*\n   - Lokasi: ${d.group}\n   - Provider: ${d.tag}\n   - IP: ${d.hostname || "-"}\n\n`;
                });
            } else {
                report += `Semua link terpantau NORMAL.\n`;
            }

            navigator.clipboard.writeText(report).then(() => {
                toast.success("Laporan berhasil disalin ke clipboard!");
            }).catch(() => {
                toast.info("Laporan siap disalin.");
            });
        }
    }
};
</script>

<style lang="scss" scoped>
@import "../assets/vars.scss";

.noc-dashboard-container {
    padding: 1.5rem 1rem;
    max-width: 1560px;
    margin: 0 auto;
    min-height: 100vh;
    background: #090c12;
    color: #e2e8f0;
}

.noc-logo-badge {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(92, 221, 139, 0.12);
    border: 1px solid rgba(92, 221, 139, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #5cdd8b;
}

.noc-icon {
    width: 20px;
    height: 20px;
}

.noc-title {
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #fff;
    font-size: 15px;
}

.noc-badge-tag {
    font-size: 10px;
    font-family: monospace;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #94a3b8;
}

.noc-subtitle {
    font-size: 11px;
    color: #828e9e;
}

.noc-clock-box {
    background: #111622;
    border: 1px solid #1e2638;
    padding: 6px 12px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
}

.noc-scope-pill {
    background: #111622;
    border: 1px solid #1e2638;
    padding: 3px 10px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 11px;
}

.noc-kpi-card {
    background: #111622;
    border: 1px solid #1e2638;
    border-radius: 10px;
    padding: 14px;
    transition: border-color 0.2s ease;

    &:hover {
        border-color: #2a354c;
    }
}

.noc-kpi-card-clickable {
    cursor: pointer;
}

.noc-kpi-card-clickable:hover {
    border-color: #38bdf8;
    box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.2);
}

.noc-kpi-label {
    font-size: 11px;
    font-weight: 600;
    color: #828e9e;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.noc-kpi-icon-wrap {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.noc-kpi-num {
    font-size: 28px;
    font-weight: 800;
    font-family: "JetBrains Mono", monospace;
    line-height: 1;
    color: #fff;
}

.noc-kpi-divider {
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px solid #1a2130;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: monospace;
    font-size: 11px;
}

.noc-progress-track {
    width: 100%;
    background: #0a0d14;
    height: 5px;
    border-radius: 10px;
    margin-top: 8px;
    overflow: hidden;
    display: flex;
}

.noc-progress-bar {
    height: 100%;
    transition: width 0.3s ease;
}

.noc-card {
    background: #111622;
    border: 1px solid #1e2638;
    border-radius: 10px;
}

.noc-incident-container {
    border-left: 2px solid rgba(220, 53, 69, 0.75);
}

.noc-incident-clickable {
    cursor: pointer;
}

.noc-incident-list {
    min-height: 0;
}

.noc-incident-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
}

.noc-incident-scroll {
    max-height: 390px;
    overflow-y: auto;
    padding: 2px 4px 2px 2px;
}

.noc-incident-scroll::-webkit-scrollbar {
    width: 5px;
}

.noc-incident-scroll::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
}


.noc-dot-red-pulse {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ef5968;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.12);
}

.noc-incident-count-badge,
.noc-badge-offline,
.noc-badge-type,
.noc-tag-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 4px;
    line-height: 1;
}

.noc-incident-count-badge {
    padding: 4px 8px;
    color: #ef8992;
    background: rgba(220, 53, 69, 0.10);
    font-size: 10.5px;
}

.noc-badge-offline {
    padding: 3px 6px;
    color: #ffb2b8;
    background: rgba(220, 53, 69, 0.18);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .04em;
}

.noc-badge-type {
    padding: 3px 6px;
    font-size: 10px;
    font-weight: 600;
}

.noc-badge-atm {
    color: #7dd3fc;
    background: rgba(14, 165, 233, 0.10);
}

.noc-badge-kantor {
    color: #c4b5fd;
    background: rgba(139, 92, 246, 0.10);
}

.noc-tag-pill {
    padding: 1.5px 6px;
    color: #cbd5e1;
    background: #0b101a;
    border: 1px solid #263247;
    font-size: 10px;
}

.noc-item-box {
    background: #090c12;
    border: 1px solid #1e2638;
    border-radius: 6px !important;
    transition: all 0.2s;

    &:hover {
        border-color: #2a354c;
    }
}

.noc-item-selected {
    background: #151c2b !important;
    border-color: rgba(92, 221, 139, 0.5) !important;
}

.noc-monitor-card {
    background: #090c12;
    border: 1px solid #1e2638;
    border-radius: 8px !important;
    transition: border-color 0.2s;

    &:hover {
        border-color: #2a354c;
    }
}

.noc-card-title {
    font-weight: 600;
    color: #fff;
    font-size: 13px;
    text-decoration: none;

    &:hover {
        color: #5cdd8b;
    }
}

.noc-dot-live,
.noc-dot-green {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #5cdd8b;
    display: inline-block;
}

.noc-dot-red {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #dc3545;
    display: inline-block;
}

.noc-dot-gray {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #64748b;
    display: inline-block;
}

.noc-btn-secondary {
    background: #111622;
    border: 1px solid #1e2638;
    color: #94a3b8;

    &:hover {
        border-color: #64748b;
        color: #fff;
    }
}

.bg-purple-subtle {
    background-color: rgba(168, 85, 247, 0.15);
}

.text-purple {
    color: #c084fc;
}

.cursor-pointer {
    cursor: pointer;
}

.btn-xs {
    font-size: 11px;
}

/* RTO cards — 3 perangkat per baris, kiri ke kanan */
.noc-rto-card {
    display: block;
    min-width: 0;
    color: inherit;
    background: linear-gradient(145deg, #141721, #10131b);
    border: 1px solid rgba(239, 89, 104, 0.28);
    border-radius: 8px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
    transition: border-color 0.16s ease, background-color 0.16s ease, box-shadow 0.16s ease;
}

.noc-rto-card:hover,
.noc-rto-card:focus-visible {
    color: inherit;
    border-color: rgba(239, 89, 104, 0.72);
    background: #181923;
    box-shadow: 0 0 0 1px rgba(239, 89, 104, 0.08), 0 8px 22px rgba(0, 0, 0, 0.24);
    outline: none;
}

.noc-rto-card-inner {
    padding: 13px 14px 12px;
}

.noc-rto-hostname {
    min-width: 0;
    color: #edf2f8;
    font-size: 13px;
    line-height: 1.25;
    letter-spacing: 0.01em;
}

.noc-rto-card:hover .noc-rto-hostname,
.noc-rto-card:focus-visible .noc-rto-hostname {
    color: #fff;
}

.noc-rto-tag {
    max-width: 42%;
    padding: 4px 7px;
    overflow: hidden;
    color: #a7d8ff;
    background: rgba(14, 165, 233, 0.10);
    border: 1px solid rgba(14, 165, 233, 0.20);
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.noc-rto-bottom {
    min-width: 0;
    padding-top: 8px;
    border-top: 1px solid rgba(148, 163, 184, 0.08);
    font-size: 11px !important;
}

.noc-rto-ip {
    flex: 1 1 auto;
}

.noc-rto-group {
    max-width: 52%;
    overflow: hidden;
}

.noc-rto-group .text-light {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.noc-rto-lbl {
    color: #64748b;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.06em;
}

@media (max-width: 1100px) {
    .noc-incident-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (max-width: 700px) {
    .noc-incident-grid {
        grid-template-columns: minmax(0, 1fr);
    }

    .noc-rto-card-inner {
        padding: 12px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .noc-rto-card {
        transition: none;
    }
}
</style>
