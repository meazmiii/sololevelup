# SoloLevelUp

Aplikasi latihan harian mandiri dengan tampilan dark-fantasy orisinal. Checklist quest dan XP disimpan di browser, tanpa akun atau server.

## Menjalankan

Sajikan folder proyek lewat server lokal, misalnya PHP bawaan:

```powershell
php -S localhost:8000 -t .
```

Buka `http://localhost:8000`, lalu tekan **MULAI TRACKING** pada quest langkah dan bawa ponsel saat berjalan. Browser akan meminta izin sensor jika diperlukan. Jika lupa memulai tracking, quest langkah juga bisa ditandai selesai manual. Tracking berjalan selama halaman aplikasi terbuka; push-up, sit-up, squat, side plank, dan back extension tetap ditandai manual.

## GitHub Pages

Repo ini dipublikasikan sebagai situs statis melalui workflow GitHub Actions. **Settings → Pages → Build and deployment → Source** harus memakai **GitHub Actions**. Setiap push ke branch `main` akan men-deploy aplikasi ke `https://<username>.github.io/sololevelup/`.

Di Android, buka URL itu di Chrome lalu pilih **Install app** atau **Add to Home screen**. Di iPhone, buka di Safari, pilih **Share → Add to Home Screen**. App shell di-cache untuk akses offline; progres quest tetap disimpan di `localStorage` browser yang memasang app.

Website dan source repo bersifat publik. Progres tidak disinkronkan antarperangkat dan tidak ada akun. Jangan menyimpan data sensitif di repo.

## Progression

- Enam daily quest—langkah, push-up, sit-up, squat, side plank, dan back extension—masing-masing memberi 1 XP setelah target tercapai atau ditandai selesai manual. Quest langkah dihitung dari sensor gerak perangkat dan selesai otomatis saat mencapai target, dengan tombol manual sebagai cadangan; latihan lainnya tetap checklist manual. Side plank dihitung dalam detik untuk tiap sisi. Maksimal 6 XP per hari.
- Target quest per rank: E (10.000 langkah, 15 push-up, 15 sit-up, 25 squat, side plank 20 detik/sisi, 10 back extension); D (11.000, 25, 25, 50, 25 detik/sisi, 15); C (12.000, 45, 45, 75, 30 detik/sisi, 20); B (13.000, 60, 60, 100, 40 detik/sisi, 25); A (14.000, 80, 80, 125, 50 detik/sisi, 30); S/S+ (15.000, 100, 100, 150, 60 detik/sisi, 40). Nilai back extension adalah jumlah repetisi.
- Setiap rank hanya memiliki satu progres XP: E ke D membutuhkan 150 XP, D ke C 180 XP, C ke B 210 XP, B ke A 240 XP, A ke S 270 XP, dan S ke S+ 330 XP. Enam quest lengkap per hari memberi 6 XP, sehingga waktu untuk naik rank tetap sama seperti sebelumnya (25 hari penuh dari E ke D).
- Setelah mencapai S+, setiap tambahan 330 XP membuka satu bintang berikutnya. Progres menuju bintang selanjutnya kembali dimulai dari 0 XP.
- Area sambutan "ARISE" menampilkan potret hunter fantasi orisinal yang berevolusi dari E sampai S+ dan mengikuti rank saat preview. Player Status tetap memakai emblem huruf rank. Potret berupa SVG inline buatan proyek ini, bukan gambar resmi karakter berlisensi.
- Progres harian, hitungan langkah, total XP, streak, dan riwayat quest ada di local storage perangkat ini. Tracking langkah memerlukan browser yang mendukung sensor gerak dan halaman HTTPS (atau localhost); penghitung sensor dapat berbeda akurasinya menurut perangkat dan tidak berjalan saat halaman ditutup. Data XP latihan versi sebelumnya tetap utuh di penyimpanan lama, tetapi tidak dicampur ke sistem quest baru.
