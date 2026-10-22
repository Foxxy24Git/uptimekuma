# Desain Popup Perangkat Offline NOC

## Tujuan

Memudahkan operator NOC melihat identitas seluruh perangkat yang sedang offline dari bagian **PERINGATAN LINK GANGGUAN**, tanpa memenuhi tampilan utama dashboard dengan daftar vertikal yang panjang.

## Ruang Lingkup

- Panel/header **PERINGATAN LINK GANGGUAN** dapat diklik untuk membuka popup.
- Badge jumlah perangkat offline juga menjadi pemicu popup.
- Popup menggunakan data reaktif `downMonitorsInScope`, sehingga isinya mengikuti rule serta filter grup/tag dashboard yang sedang aktif.
- Perangkat disusun dalam grid berurutan dari kiri ke kanan, lalu ke baris berikutnya.
- Tata letak responsif: 3 kolom pada desktop, 2 kolom pada tablet, dan 1 kolom pada perangkat kecil.
- Setiap kartu perangkat menampilkan status OFFLINE, hostname/nama monitor, Tag, Grup, dan IP/hostname.
- Nilai Tag, Grup, atau IP yang kosong ditampilkan sebagai `-`.
- Nama perangkat dapat digunakan untuk membuka halaman detail monitor.
- Popup dapat ditutup melalui tombol tutup, klik backdrop, atau tombol Escape.
- Scroll diterapkan pada isi popup bila jumlah perangkat melebihi tinggi layar.

## Bukan Ruang Lingkup

- Tidak mengubah rule penentuan monitor offline.
- Tidak mengubah API NOC atau struktur database.
- Tidak mengubah klasifikasi ATM/Kantor maupun perhitungan KPI.
- Tidak menambahkan dependency UI baru.

## Pendekatan yang Dipertimbangkan

1. **Modal grid 3 kolom — dipilih.** Dashboard tetap ringkas dan seluruh identitas perangkat dapat dilihat sekaligus.
2. **Panel expandable.** Lebih langsung, tetapi membuat tinggi dashboard berubah dan kurang cocok untuk mode layar NOC.
3. **Popover per perangkat.** Hemat tempat, tetapi operator harus membuka detail satu per satu.

## Detail Implementasi

Perubahan difokuskan pada `src/pages/NocDashboard.vue`:

- Menambahkan state untuk visibilitas popup.
- Menambahkan pemicu popup pada panel/header gangguan.
- Menambahkan markup dialog yang aksesibel (`role="dialog"`, judul, tombol tutup).
- Menggunakan `v-for` terhadap `downMonitorsInScope` agar urutan data menentukan urutan grid.
- Menambahkan handler Escape dan pembersihan event listener saat komponen dilepas.
- Menambahkan style scoped untuk backdrop, dialog, grid, kartu perangkat, responsivitas, hover/focus, dan area scroll.
- Mempertahankan daftar gangguan yang sudah ada di halaman utama kecuali diperlukan penyesuaian kecil pada pemicu popup.

## Kriteria Keberhasilan

- Saat terdapat perangkat offline, klik panel/header peringatan membuka popup.
- Lima perangkat ditampilkan sebagai tiga kartu pada baris pertama dan dua kartu pada baris kedua di desktop.
- Setiap kartu menampilkan Hostname, Tag, Grup, dan IP/hostname yang sesuai.
- Popup tetap dapat digunakan pada tablet dan mobile.
- Popup tertutup dengan tombol tutup, backdrop, dan Escape.
- Tidak ada perubahan pada hasil kalkulasi KPI maupun data offline.
