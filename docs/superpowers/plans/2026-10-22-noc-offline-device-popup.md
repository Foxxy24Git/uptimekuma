# Rencana Implementasi Popup Perangkat Offline NOC

> **Untuk pelaksana:** Keterampilan sub-skill yang digunakan adalah superpowers:executing-plans. Setiap langkah menggunakan format kotak centang (`- [ ]`).

**Tujuan:** Menampilkan popup modal berisi grid perangkat offline (3 kolom per baris) saat area PERINGATAN LINK GANGGUAN pada NOC Dashboard diklik, lengkap dengan Hostname, TAG, Grup, dan IP/hostname.

**Arsitektur:** Mengintegrasikan state modal, event handler klik dan Escape, serta struktur grid CSS di `src/pages/NocDashboard.vue` tanpa mengubah logika filter data offline `downMonitorsInScope`.

**Teknologi:** Vue 3 SFC (Options API), SCSS scoped, Vue Router (`router-link`), FontAwesome / SVG ikon.

**Dokumen Desain:** `docs/superpowers/specs/2026-10-22-noc-offline-device-popup-design.md`

## Batasan Umum

- Memakai data `downMonitorsInScope` yang reaktif terhadap pilihan grup/tag.
- Kartu grid disusun dalam 3 kolom pada layar desktop (urutan kiri-tengah-kanan lalu ke bawah).
- Setiap kartu wajib memuat status, Hostname, Tag, Grup, dan IP.
- Menutup modal melalui tombol X, klik overlay di luar modal, atau tombol Escape.

---

### Task 1: State & Kontrol Modal di NocDashboard.vue

**Files:**
- Modify: `src/pages/NocDashboard.vue`

- [ ] **Langkah 1: Tambahkan data state `showOfflineModal: false`**
- [ ] **Langkah 2: Tambahkan methods `openOfflineModal`, `closeOfflineModal`, dan handler tombol Escape di `mounted` / `beforeUnmount`**
- [ ] **Langkah 3: Tambahkan pemicu klik (`@click="openOfflineModal"`) pada kartu dan badge PERINGATAN LINK GANGGUAN**

### Task 2: Template Modal Popup Grid 3 Kolom

**Files:**
- Modify: `src/pages/NocDashboard.vue`

- [ ] **Langkah 1: Buat markup overlay modal dengan latar belakang semi-transparan (`noc-modal-backdrop`)**
- [ ] **Langkah 2: Buat dialog modal (`noc-modal-dialog`) dengan header judul, badge jumlah offline, dan tombol close**
- [ ] **Langkah 3: Buat kontainer grid 3 kolom (`noc-offline-grid`) yang melakukan `v-for="item in downMonitorsInScope"`**
- [ ] **Langkah 4: Buat kartu monitor (`noc-offline-card`) yang menampilkan Hostname (`item.name`), Tag (`item.tag`), Grup (`item.group`), IP (`item.hostname || '-'`), durasi offline, dan tombol Detail**

### Task 3: Styling & Responsivitas SCSS

**Files:**
- Modify: `src/pages/NocDashboard.vue`

- [ ] **Langkah 1: Tambahkan style CSS untuk `noc-modal-backdrop` (fixed position, z-index tinggi, flex center)**
- [ ] **Langkah 2: Tambahkan style untuk `noc-modal-dialog` (max-width, dark theme NOC, border merah lembut, shadow)**
- [ ] **Langkah 3: Tambahkan style grid (`grid-template-columns: repeat(3, minmax(0, 1fr))` untuk desktop, 2 kolom tablet, 1 kolom mobile)**
- [ ] **Langkah 4: Tambahkan style kartu (`noc-offline-card`) dengan styling senada dengan dashboard eksekutif (border hover, typography mono, badge)**

### Task 4: Verifikasi & Build

**Files:**
- Verify: `src/pages/NocDashboard.vue`
- Run: `npm run build` atau `vite build` untuk memastikan tidak ada error sintaksis/template/SCSS

- [ ] **Langkah 1: Jalankan verifikasi sintaksis dan build frontend**
- [ ] **Langkah 2: Periksa hasil tampilan dan pastikan responsivitas bekerja normal**
