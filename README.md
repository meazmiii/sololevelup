# SoloLevelUp

Aplikasi latihan harian mandiri dengan tampilan dark-fantasy orisinal. Checklist quest dan XP disimpan di browser, tanpa akun atau server.

## Menjalankan

Sajikan folder proyek lewat server lokal, misalnya PHP bawaan:

```powershell
php -S localhost:8000 -t .
```

Buka `http://localhost:8000`, selesaikan latihan, lalu tekan **DONE** pada masing-masing daily quest. Quest adalah checklist mandiri; jumlah langkah dan repetisi tidak terukur otomatis.

## GitHub Pages

Repo ini dipublikasikan sebagai situs statis melalui workflow GitHub Actions. **Settings → Pages → Build and deployment → Source** harus memakai **GitHub Actions**. Setiap push ke branch `main` akan men-deploy aplikasi ke `https://<username>.github.io/sololevelup/`.

Di Android, buka URL itu di Chrome lalu pilih **Install app** atau **Add to Home screen**. Di iPhone, buka di Safari, pilih **Share → Add to Home Screen**. App shell di-cache untuk akses offline; progres quest tetap disimpan di `localStorage` browser yang memasang app.

Website dan source repo bersifat publik. Progres tidak disinkronkan antarperangkat dan tidak ada akun. Jangan menyimpan data sensitif di repo.

## Progression

- Empat daily quest—langkah, push-up, sit-up, dan squat—masing-masing memberi 1 XP setelah ditandai selesai. Maksimal 4 XP per hari.
- Target quest per rank: E (5.000 langkah, 15 push-up, 15 sit-up, 25 squat); D (7.000, 25, 25, 50); C (9.000, 45, 45, 75); B (11.000, 60, 60, 100); A (12.500, 80, 80, 125); S/S+ (15.000, 100, 100, 150).
- Setiap rank hanya memiliki satu progres XP: E ke D membutuhkan 100 XP, D ke C 120 XP, C ke B 140 XP, B ke A 160 XP, A ke S 180 XP, dan S ke S+ 220 XP. Empat quest lengkap per hari memberi 4 XP, sehingga E ke D membutuhkan 25 hari penuh.
- Setelah mencapai S+, setiap tambahan 220 XP membuka satu bintang berikutnya. Progres menuju bintang selanjutnya kembali dimulai dari 0 XP.
- Area sambutan "ARISE" menampilkan potret hunter fantasi orisinal yang berevolusi dari E sampai S+ dan mengikuti rank saat preview. Player Status tetap memakai emblem huruf rank. Potret berupa SVG inline buatan proyek ini, bukan gambar resmi karakter berlisensi.
- Progres harian, total XP, streak, dan riwayat quest ada di local storage perangkat ini. Data XP latihan versi sebelumnya tetap utuh di penyimpanan lama, tetapi tidak dicampur ke sistem quest baru.
