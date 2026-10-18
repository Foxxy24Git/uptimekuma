<template>
    <div class="noc-rule-container">
        <!-- TOP NAVIGATION & HEADER -->
        <div class="noc-header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div class="d-flex align-items-center gap-3">
                <router-link to="/noc" class="btn btn-sm noc-btn-secondary d-flex align-items-center gap-2" title="Kembali ke NOC Dashboard">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Kembali ke NOC Dashboard</span>
                </router-link>
                <div class="vr bg-secondary opacity-50 d-none d-sm-block"></div>
                <div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="noc-title">KONFIGURASI RULE</span>
                        <span class="noc-badge-tag">{{ ruleTitle }}</span>
                    </div>
                    <p class="noc-subtitle mb-0">Atur grup wilayah & hostname perangkat yang dipantau dalam kategori ini</p>
                </div>
            </div>

            <!-- Action buttons -->
            <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary" @click="resetToDefault">
                    Reset ke Standar
                </button>
                <button class="btn btn-sm btn-primary d-flex align-items-center gap-1.5 px-3 font-semibold" @click="saveRule">
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Simpan Rule</span>
                </button>
            </div>
        </div>

        <!-- SUMMARY STATS PREVIEW -->
        <div class="row g-3 mb-4">
            <div class="col-12 col-md-3">
                <div class="noc-kpi-card h-100">
                    <span class="noc-kpi-label">TOTAL MONITOR TERCAKUP</span>
                    <div class="d-flex align-items-baseline gap-2 mt-2">
                        <span class="noc-kpi-num">{{ previewStats.total }}</span>
                        <span class="text-secondary small">Perangkat</span>
                    </div>
                    <div class="noc-kpi-divider">
                        <span class="text-secondary small">Dari Total Sistem:</span>
                        <span class="font-mono text-light fw-bold">{{ allMonitors.length }} Perangkat</span>
                    </div>
                </div>
            </div>

            <div class="col-12 col-md-3">
                <div class="noc-kpi-card h-100">
                    <span class="noc-kpi-label">STATUS KONEKSI</span>
                    <div class="d-flex align-items-baseline gap-2 mt-2">
                        <span class="noc-kpi-num text-primary">{{ previewStats.up }}</span>
                        <span class="text-secondary small">Up</span>
                        <span class="text-secondary">/</span>
                        <span class="noc-kpi-num text-danger">{{ previewStats.down }}</span>
                        <span class="text-secondary small">Down</span>
                    </div>
                    <div class="noc-kpi-divider">
                        <span class="text-secondary small">Estimasi Availability:</span>
                        <span class="font-mono text-primary fw-bold">{{ previewStats.percent }}%</span>
                    </div>
                </div>
            </div>

            <div class="col-12 col-md-3">
                <div class="noc-kpi-card h-100">
                    <span class="noc-kpi-label">GRUP TERPILIH</span>
                    <div class="d-flex align-items-baseline gap-2 mt-2">
                        <span class="noc-kpi-num text-info">{{ selectedGroups.length }}</span>
                        <span class="text-secondary small">Grup Wilayah</span>
                    </div>
                    <div class="noc-kpi-divider">
                        <span class="text-secondary small">Tersedia:</span>
                        <span class="font-mono text-light">{{ availableGroups.length }} Grup</span>
                    </div>
                </div>
            </div>

            <div class="col-12 col-md-3">
                <div class="noc-kpi-card h-100">
                    <span class="noc-kpi-label">HOSTNAME SPESIFIK</span>
                    <div class="d-flex align-items-baseline gap-2 mt-2">
                        <span class="noc-kpi-num text-purple">{{ selectedMonitorIds.length }}</span>
                        <span class="text-secondary small">Custom Hostname</span>
                    </div>
                    <div class="noc-kpi-divider">
                        <span class="text-secondary small">Mode Pilihan:</span>
                        <span class="badge bg-primary-subtle text-primary font-mono">Grup + Hostname</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- MAIN CONFIGURATION SECTIONS -->
        <div class="row g-4">
            <!-- LEFT COLUMN: GROUP SELECTION -->
            <div class="col-12 col-lg-5">
                <div class="noc-card p-3 h-100 d-flex flex-column">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <div class="d-flex align-items-center gap-2">
                            <span class="noc-dot-blue"></span>
                            <h6 class="mb-0 fw-bold text-light text-uppercase font-mono small">
                                1. Pilih Grup Wilayah / Parent
                            </h6>
                        </div>
                        <span class="badge bg-secondary font-mono">{{ selectedGroups.length }} Dipilih</span>
                    </div>
                    <p class="text-secondary small mb-3">
                        Semua monitor/hostname di dalam grup yang dicentang otomatis dimasukkan ke dalam kategori ini.
                    </p>

                    <!-- Group Search & Quick Actions -->
                    <div class="d-flex gap-2 mb-3">
                        <input
                            v-model="groupSearch"
                            type="text"
                            class="form-control form-control-sm bg-dark text-light border-secondary"
                            placeholder="Cari nama grup..."
                        />
                        <button class="btn btn-sm btn-outline-secondary text-nowrap" @click="selectAllGroups">
                            Pilih Semua
                        </button>
                        <button class="btn btn-sm btn-outline-secondary text-nowrap" @click="clearAllGroups">
                            Kosongkan
                        </button>
                    </div>

                    <!-- Group List Checkboxes -->
                    <div class="noc-list-scroll flex-grow-1 border border-secondary-subtle p-2">
                        <div v-if="filteredGroupList.length === 0" class="p-3 text-center text-secondary small">
                            Tidak ada grup yang sesuai pencarian.
                        </div>

                        <div
                            v-for="grp in filteredGroupList"
                            :key="grp.name"
                            class="noc-group-item d-flex align-items-center justify-content-between p-2 mb-1.5"
                            :class="{ 'noc-group-selected': selectedGroups.includes(grp.name) }"
                            @click="toggleGroup(grp.name)"
                        >
                            <div class="form-check d-flex align-items-center gap-2 mb-0" @click.stop>
                                <input
                                    :id="`grp-${grp.name}`"
                                    v-model="selectedGroups"
                                    class="form-check-input"
                                    type="checkbox"
                                    :value="grp.name"
                                />
                                <label :for="`grp-${grp.name}`" class="form-check-label text-light fw-medium cursor-pointer mb-0">
                                    {{ grp.name }}
                                </label>
                            </div>
                            <div class="d-flex align-items-center gap-2 font-mono small">
                                <span class="noc-count-badge">
                                    {{ grp.count }} Monitor
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN: SPECIFIC HOSTNAME / MONITOR SELECTION -->
            <div class="col-12 col-lg-7">
                <div class="noc-card p-3 h-100 d-flex flex-column">
                    <div class="d-flex align-items-center justify-content-between mb-2">
                        <div class="d-flex align-items-center gap-2">
                            <span class="noc-dot-green"></span>
                            <h6 class="mb-0 fw-bold text-light text-uppercase font-mono small">
                                2. Pilih Hostname / Monitor Spesifik
                            </h6>
                        </div>
                        <span class="badge bg-secondary font-mono">{{ selectedMonitorIds.length }} Monitor Custom</span>
                    </div>
                    <p class="text-secondary small mb-3">
                        Pilih perangkat satuan atau hostname yang ingin dimasukkan secara mandiri (terlepas dari grupnya).
                    </p>

                    <!-- Filter & Search Toolbar -->
                    <div class="row g-2 mb-3">
                        <div class="col-12 col-md-5">
                            <input
                                v-model="monitorSearch"
                                type="text"
                                class="form-control form-control-sm bg-dark text-light border-secondary"
                                placeholder="Cari nama, IP, atau hostname..."
                            />
                        </div>
                        <div class="col-7 col-md-4">
                            <select v-model="monitorFilterGroup" class="form-select form-select-sm bg-dark text-light border-secondary">
                                <option value="ALL">Semua Grup Asal</option>
                                <option v-for="g in availableGroups" :key="g" :value="g">{{ g }}</option>
                            </select>
                        </div>
                        <div class="col-5 col-md-3">
                            <button class="btn btn-sm btn-outline-secondary w-100 text-nowrap" @click="clearAllMonitors">
                                Kosongkan
                            </button>
                        </div>
                    </div>

                    <!-- Monitors Table / List -->
                    <div class="noc-list-scroll noc-monitor-list flex-grow-1 border border-secondary-subtle">
                        <table class="table table-dark table-hover table-sm align-middle mb-0 font-mono small">
                            <thead class="text-secondary border-bottom border-secondary sticky-top noc-thead-sticky">
                                <tr>
                                    <th style="width: 38px;" class="text-center">#</th>
                                    <th style="min-width: 170px;">Nama Monitor</th>
                                    <th style="min-width: 110px;">IP / Hostname</th>
                                    <th style="min-width: 110px;">Grup Asal</th>
                                    <th style="min-width: 130px;">Status Cakupan</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-if="filteredMonitorsList.length === 0">
                                    <td colspan="5" class="text-center py-4 text-secondary">
                                        Tidak ada monitor yang cocok.
                                    </td>
                                </tr>
                                <tr
                                    v-for="m in filteredMonitorsList"
                                    :key="m.id"
                                    :class="{ 'table-active': isMonitorDirectlySelected(m.id) || isMonitorInSelectedGroup(m) }"
                                    @click="toggleMonitor(m.id)"
                                >
                                    <td class="text-center" @click.stop>
                                        <input
                                            class="form-check-input"
                                            type="checkbox"
                                            :checked="isMonitorDirectlySelected(m.id)"
                                            :disabled="isMonitorInSelectedGroup(m)"
                                            @change="toggleMonitor(m.id)"
                                        />
                                    </td>
                                    <td>
                                        <div class="d-flex align-items-center gap-1.5">
                                            <span :class="isDown(m) ? 'noc-dot-red' : 'noc-dot-green'"></span>
                                            <span class="text-light fw-medium">{{ m.name }}</span>
                                        </div>
                                    </td>
                                    <td class="text-muted">
                                        {{ m.hostname || '-' }}
                                    </td>
                                    <td class="text-secondary">
                                        {{ m.group }}
                                    </td>
                                    <td>
                                        <span v-if="isMonitorInSelectedGroup(m)" class="badge bg-info-subtle text-info font-sans">
                                            ✓ Tercakup via Grup
                                        </span>
                                        <span v-else-if="isMonitorDirectlySelected(m.id)" class="badge bg-primary font-sans">
                                            Dipilih Manual
                                        </span>
                                        <span v-else class="text-secondary font-sans small">
                                            Belum Masuk
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- BOTTOM ACTIONS -->
        <div class="noc-card p-3 mt-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div class="d-flex align-items-center gap-2">
                <span class="noc-dot-green"></span>
                <span class="text-secondary small">
                    Hasil konfigurasi ini akan diterapkan pada kalkulasi KPI kartu <b>{{ ruleTitle }}</b> di NOC Dashboard.
                </span>
            </div>
            <div class="d-flex align-items-center gap-2">
                <router-link to="/noc" class="btn btn-sm btn-outline-secondary px-3">
                    Batal
                </router-link>
                <button class="btn btn-sm btn-primary px-4 fw-semibold" @click="saveRule">
                    Simpan dan Terapkan Rule
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { DOWN } from "../util.ts";
import { useToast } from "vue-toastification";

const toast = useToast();

export default {
    name: "NocRuleEditor",
    data() {
        return {
            ruleId: this.$route.params.id || "atm",
            selectedGroups: [],
            selectedMonitorIds: [],
            groupSearch: "",
            monitorSearch: "",
            monitorFilterGroup: "ALL",
            apiMonitors: null,
            apiLastHeartbeats: null,
        };
    },
    computed: {
        ruleTitle() {
            if (this.ruleId === "kantor") {
                return "INFRASTRUKTUR KANTOR CABANG";
            }
            if (this.ruleId === "backup") {
                return "JARINGAN BACKUP";
            }
            return "INFRASTRUKTUR ATM";
        },

        storageKey() {
            return `noc_rule_${this.ruleId}`;
        },

        // Enriched list of all monitors (excluding type 'group')
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

                let isKantor = rawTags.some(t => ["KANTOR CABANG", "CAPEM", "Kantor KAS"].includes(t)) ||
                               /^(CABANG|Cabang|KTR CABANG)\b/i.test(m.name);
                const type = isKantor ? "KANTOR" : "ATM";

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

        // Available unique groups with count
        availableGroups() {
            const groups = new Set();
            this.allMonitors.forEach(m => groups.add(m.group));
            return Array.from(groups).sort();
        },

        groupStatsList() {
            const counts = {};
            this.allMonitors.forEach(m => {
                counts[m.group] = (counts[m.group] || 0) + 1;
            });
            return this.availableGroups.map(name => ({
                name,
                count: counts[name] || 0,
            }));
        },

        filteredGroupList() {
            const q = this.groupSearch.toLowerCase().trim();
            if (!q) {return this.groupStatsList;}
            return this.groupStatsList.filter(g => g.name.toLowerCase().includes(q));
        },

        filteredMonitorsList() {
            const q = this.monitorSearch.toLowerCase().trim();
            const groupFilter = this.monitorFilterGroup;

            return this.allMonitors.filter(m => {
                const matchGroup = groupFilter === "ALL" || m.group === groupFilter;
                const matchSearch = !q ||
                    m.name.toLowerCase().includes(q) ||
                    m.group.toLowerCase().includes(q) ||
                    (m.hostname && m.hostname.toLowerCase().includes(q));

                return matchGroup && matchSearch;
            });
        },

        // Monitors that match active rule (via selectedGroups OR selectedMonitorIds)
        effectiveScopedMonitors() {
            const groupSet = new Set(this.selectedGroups);
            const monitorSet = new Set(this.selectedMonitorIds);

            // Empty selection means the rule is intentionally empty. The reset action
            // explicitly populates the default groups for ATM/Kantor.
            return this.allMonitors.filter(m => {
                return groupSet.has(m.group) || monitorSet.has(m.id);
            });
        },

        previewStats() {
            const total = this.effectiveScopedMonitors.length;
            const down = this.effectiveScopedMonitors.filter(m => this.isDown(m)).length;
            const up = total - down;
            const pct = total > 0 ? ((up / total) * 100).toFixed(1) : "100.0";

            return {
                total,
                up,
                down,
                percent: pct,
            };
        },
    },
    async mounted() {
        await this.checkAndFetchData();
        this.loadSavedRule();
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

        loadSavedRule() {
            try {
                const raw = localStorage.getItem(this.storageKey);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    this.selectedGroups = Array.isArray(parsed.groups) ? parsed.groups : [];
                    this.selectedMonitorIds = Array.isArray(parsed.monitorIds) ? parsed.monitorIds : [];
                    return;
                }
            } catch (e) {
                console.error("Error reading saved rule:", e);
            }

            // Default initial rule if not yet saved:
            // For ATM: find all groups containing ATM monitors
            this.resetToDefault();
        },

        resetToDefault() {
            const autoGroups = new Set();
            const autoMonitors = [];

            if (this.ruleId === "backup") {
                this.allMonitors.forEach(m => {
                    const isBackupGroup = /backup|cadangan|secondary|failover/i.test(m.group);
                    const isBackupName = /backup|cadangan|secondary|failover|4g|lte/i.test(m.name);
                    const isBackupTag = (m.tags || []).some(t => /backup|cadangan|secondary|failover/i.test(t));

                    if (isBackupGroup) {
                        autoGroups.add(m.group);
                    } else if (isBackupName || isBackupTag) {
                        autoMonitors.push(m.id);
                    }
                });
            } else {
                const defaultType = this.ruleId === "kantor" ? "KANTOR" : "ATM";
                this.allMonitors.forEach(m => {
                    if (m.type === defaultType) {
                        autoGroups.add(m.group);
                    }
                });
            }

            this.selectedGroups = Array.from(autoGroups);
            this.selectedMonitorIds = autoMonitors;
            toast.info("Rule dikembalikan ke deteksi standar.");
        },

        isDown(monitor) {
            const beat = (this.$root.lastHeartbeatList && this.$root.lastHeartbeatList[monitor.id])
                || (this.apiLastHeartbeats && this.apiLastHeartbeats[monitor.id]);
            if (!beat) {return false;}
            return beat.status === DOWN;
        },

        isMonitorInSelectedGroup(monitor) {
            return this.selectedGroups.includes(monitor.group);
        },

        isMonitorDirectlySelected(monitorId) {
            return this.selectedMonitorIds.includes(monitorId);
        },

        toggleGroup(groupName) {
            const idx = this.selectedGroups.indexOf(groupName);
            if (idx > -1) {
                this.selectedGroups.splice(idx, 1);
            } else {
                this.selectedGroups.push(groupName);
            }
        },

        selectAllGroups() {
            this.selectedGroups = [...this.availableGroups];
        },

        clearAllGroups() {
            this.selectedGroups = [];
        },

        toggleMonitor(monitorId) {
            // If already included via group, don't need manual selection
            const monitor = this.allMonitors.find(m => m.id === monitorId);
            if (monitor && this.isMonitorInSelectedGroup(monitor)) {
                return;
            }

            const idx = this.selectedMonitorIds.indexOf(monitorId);
            if (idx > -1) {
                this.selectedMonitorIds.splice(idx, 1);
            } else {
                this.selectedMonitorIds.push(monitorId);
            }
        },

        clearAllMonitors() {
            this.selectedMonitorIds = [];
        },

        saveRule() {
            const config = {
                id: this.ruleId,
                name: this.ruleTitle,
                groups: this.selectedGroups,
                monitorIds: this.selectedMonitorIds,
                updatedAt: new Date().toISOString(),
            };

            try {
                localStorage.setItem(this.storageKey, JSON.stringify(config));
                toast.success(`Rule ${this.ruleTitle} berhasil disimpan!`);
                this.$router.push("/noc");
            } catch (e) {
                console.error("Failed to save rule to localStorage:", e);
                toast.error("Gagal menyimpan konfigurasi rule.");
            }
        },
    },
};
</script>

<style scoped>
.noc-rule-container {
    background-color: #0b0f19;
    color: #e2e8f0;
    min-height: 100vh;
    padding: 1.5rem 2rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.noc-title {
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #ffffff;
}

.noc-subtitle {
    font-size: 0.8rem;
    color: #94a3b8;
}

.noc-badge-tag {
    background: #1e293b;
    color: #38bdf8;
    border: 1px solid #334155;
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    text-transform: uppercase;
}

.noc-btn-secondary {
    background-color: #1e293b;
    border: 1px solid #334155;
    color: #cbd5e1;
    transition: all 0.15s ease;
}

.noc-btn-secondary:hover {
    background-color: #334155;
    color: #ffffff;
}

.noc-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

.noc-kpi-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 8px;
    padding: 1rem 1.25rem;
}

.noc-kpi-label {
    font-size: 0.7rem;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.noc-kpi-num {
    font-size: 1.75rem;
    font-weight: 800;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    line-height: 1;
    color: #ffffff;
}

.noc-kpi-divider {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    padding-top: 0.5rem;
    margin-top: 0.5rem;
    border-top: 1px solid #1f2937;
}

.noc-list-scroll {
    max-height: 480px;
    overflow: auto;
    background-color: #0d131f;
    border-radius: 6px;
}

.noc-monitor-list {
    min-width: 0;
}

.noc-thead-sticky {
    background: #101827;
    z-index: 2;
}

.noc-group-item {
    background-color: #131d2e;
    border: 1px solid #1f2e46;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.noc-count-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 6px;
    border: 1px solid #334155;
    border-radius: 4px;
    color: #94a3b8;
    background: #0d131f;
    font-size: 10px;
}

.noc-rule-container .table {
    --bs-table-bg: #0d131f;
    --bs-table-striped-bg: #111a28;
    --bs-table-hover-bg: #182438;
    --bs-table-color: #cbd5e1;
    min-width: 690px;
}

.noc-rule-container .table td,
.noc-rule-container .table th {
    padding: 0.55rem 0.65rem;
    white-space: nowrap;
}

.noc-rule-container .table td:nth-child(2) {
    white-space: normal;
}

.noc-rule-container .table-active {
    --bs-table-active-bg: #13243d;
    --bs-table-active-color: #f8fafc;
}

.noc-group-item:hover {
    background-color: #1a273e;
    border-color: #2563eb;
}

.noc-group-selected {
    background-color: #13243d;
    border-color: #38bdf8;
}

.cursor-pointer {
    cursor: pointer;
}

.noc-dot-green {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #10b981;
    display: inline-block;
}

.noc-dot-red {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #ef4444;
    display: inline-block;
}

.noc-dot-blue {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #38bdf8;
    display: inline-block;
}

.font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
