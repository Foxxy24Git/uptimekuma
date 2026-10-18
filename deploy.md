# Panduan Deploy Uptime Kuma Custom ke Production

Dokumen ini digunakan untuk deployment Uptime Kuma custom dari repository:

```text
https://github.com/Foxxy24Git/uptimekuma.git
```

## Konfigurasi Production

| Item | Nilai |
|---|---|
| Container | `uptime-kuma-custom` |
| Host port | `3003` |
| Container port | `3001` |
| Volume | `uptime_kuma_custom_data` |
| Restart policy | `unless-stopped` |
| Database default | SQLite |
| Folder production | `~/fx-kuma/uptimekuma` |

> Jangan menggunakan port `3001`, karena port tersebut digunakan oleh `fmon-app`. Jangan menghentikan container lain yang sedang berjalan.

## Prasyarat

Pastikan server memiliki:

- Docker Engine
- Docker Compose Plugin (`docker compose`)
- Git
- Akses ke GitHub dan Docker Hub
- Port host `3003` tersedia

Cek versi:

```bash
docker --version
docker compose version
git --version
```

## Deployment Pertama Kali

### 1. Clone repository

```bash
mkdir -p ~/fx-kuma
cd ~/fx-kuma
git clone https://github.com/Foxxy24Git/uptimekuma.git
cd uptimekuma
```

Jika repository sudah ada, gunakan bagian update di bawah.

### 2. Pastikan file Compose yang benar

Repository custom menggunakan:

```text
docker-compose.yml
```

File `compose.yaml.upstream.bak` hanya backup konfigurasi upstream. Selalu gunakan opsi `-f` agar tidak salah menjalankan konfigurasi lain:

```bash
docker compose -f docker-compose.yml config
```

Pastikan output menunjukkan:

```text
container_name: uptime-kuma-custom
3003:3001
uptime_kuma_custom_data
```

### 3. Cek port 3003

```bash
sudo ss -tulpn | grep ':3003'
```

Jika tidak ada output, port aman digunakan.

### 4. Build image

```bash
docker compose -f docker-compose.yml build
```

Build pertama dapat memerlukan beberapa menit karena mengunduh base image dan dependency production. Build berikutnya lebih cepat karena Docker menggunakan cache.

### 5. Jalankan container

```bash
docker compose -f docker-compose.yml up -d
```

### 6. Verifikasi

```bash
docker ps --filter "name=uptime-kuma-custom"
```

Cek healthcheck:

```bash
docker inspect --format='{{.State.Health.Status}}' uptime-kuma-custom
```

Status yang diharapkan:

```text
healthy
```

Tes dari server:

```bash
curl -I http://127.0.0.1:3003
```

Akses dari browser:

```text
http://IP_SERVER:3003
```

## Update Deployment Berikutnya

Gunakan prosedur ini setiap ada commit baru di GitHub.

### 1. Masuk ke folder aplikasi

```bash
cd ~/fx-kuma/uptimekuma
```

### 2. Cek kondisi sebelum update

```bash
git status
docker compose -f docker-compose.yml ps
```

Jika ada perubahan lokal yang penting, jangan lanjut sebelum diamankan.

### 3. Ambil commit terbaru

```bash
git pull --ff-only origin master
```

Jika muncul konflik, hentikan proses dan selesaikan konflik terlebih dahulu. Jangan menjalankan reset sembarangan.

### 4. Build image baru

```bash
docker compose -f docker-compose.yml build
```

Untuk build bersih hanya jika benar-benar diperlukan:

```bash
docker compose -f docker-compose.yml build --no-cache
```

> Hindari `--no-cache` pada deployment rutin karena prosesnya jauh lebih lama dan memakai lebih banyak CPU/RAM.

### 5. Recreate container dengan image baru

```bash
docker compose -f docker-compose.yml up -d
```

Perintah ini akan menjalankan container menggunakan image terbaru dan mempertahankan named volume database.

### 6. Pantau startup

```bash
docker compose -f docker-compose.yml logs -f uptime-kuma-custom
```

Tekan `Ctrl+C` untuk keluar dari tampilan log. `Ctrl+C` tidak menghentikan container.

## Perintah Operasional

### Lihat status

```bash
docker compose -f docker-compose.yml ps
docker ps --filter "name=uptime-kuma-custom"
```

### Lihat log terbaru

```bash
docker compose -f docker-compose.yml logs --tail=200 uptime-kuma-custom
```

### Restart container

```bash
docker compose -f docker-compose.yml restart uptime-kuma-custom
```

### Lihat penggunaan resource

```bash
docker stats uptime-kuma-custom
```

### Masuk ke shell container

```bash
docker exec -it uptime-kuma-custom sh
```

### Melihat volume

```bash
docker volume ls | grep uptime_kuma_custom_data
docker volume inspect uptime_kuma_custom_data
```

## Prosedur Troubleshooting

### Container restart loop

```bash
docker compose -f docker-compose.yml ps
docker compose -f docker-compose.yml logs --tail=200 uptime-kuma-custom
docker inspect uptime-kuma-custom --format='{{.State.ExitCode}} {{.State.Error}}'
```

Jangan langsung menghapus volume. Database production berada di named volume:

```text
uptime_kuma_custom_data
```

### Error `db/kuma.db` tidak ditemukan

Pastikan commit terbaru sudah digunakan:

```bash
git pull --ff-only origin master
ls -lh db/kuma.db
docker compose -f docker-compose.yml build --no-cache
docker compose -f docker-compose.yml up -d
```

File `db/kuma.db` adalah template database, bukan database production utama. Database production berada di `/app/data` dalam named volume.

### Error port sudah digunakan

```bash
sudo ss -tulpn | grep ':3003'
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

Jangan menghentikan `fmon-app`, `mtr_app`, atau container lain tanpa memastikan dampaknya. Container custom harus menggunakan:

```text
0.0.0.0:3003->3001/tcp
```

### Error konfigurasi Compose salah

Jangan gunakan perintah tanpa `-f` jika terdapat lebih dari satu file Compose. Gunakan:

```bash
docker compose -f docker-compose.yml config
docker compose -f docker-compose.yml up -d --build
```

### Healthcheck belum healthy

Tunggu 30–60 detik setelah container start, lalu cek:

```bash
docker inspect --format='{{json .State.Health}}' uptime-kuma-custom
docker compose -f docker-compose.yml logs --tail=200 uptime-kuma-custom
curl -I http://127.0.0.1:3003
```

## Perhatian Database

### Jangan gunakan ini untuk update rutin

```bash
docker compose -f docker-compose.yml down -v
```

Opsi `-v` menghapus named volume dan dapat menghapus database production.

### Untuk menghentikan container tanpa menghapus data

```bash
docker compose -f docker-compose.yml down
```

Data tetap berada di volume:

```text
uptime_kuma_custom_data
```

### Backup database SQLite

Sebelum update besar atau perubahan database, buat backup volume dengan container sementara:

```bash
mkdir -p ~/fx-kuma/backups

docker run --rm \
  -v uptime_kuma_custom_data:/source:ro \
  -v ~/fx-kuma/backups:/backup \
  alpine:3.20 \
  tar czf /backup/uptime-kuma-custom-data-$(date +%Y%m%d-%H%M%S).tar.gz -C /source .
```

Cek backup:

```bash
ls -lh ~/fx-kuma/backups
```

## URL Aplikasi

Dashboard utama:

```text
http://IP_SERVER:3003
```

NOC Executive:

```text
http://IP_SERVER:3003/noc
```

Network Graph View:

```text
http://IP_SERVER:3003/noc/graph
```

## Checklist Setelah Deployment

- [ ] `git pull --ff-only origin master` berhasil
- [ ] `docker-compose.yml` memakai `uptime-kuma-custom`
- [ ] Mapping port `3003:3001` benar
- [ ] Container `uptime-kuma-custom` berstatus `Up`
- [ ] Healthcheck berstatus `healthy`
- [ ] Tidak ada restart loop
- [ ] `curl http://127.0.0.1:3003` berhasil
- [ ] Halaman web dapat dibuka
- [ ] Database SQLite berhasil dimuat
- [ ] Named volume `uptime_kuma_custom_data` tetap ada
- [ ] Container lain tetap berjalan normal
