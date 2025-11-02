# 🔥 Facebook OAuth Token Generator

<div align="center">

<img src="https://raw.githubusercontent.com/MR-X-junior/Facebook-OAuth/refs/heads/main/static/icon/logo.webp" alt="Facebook OAuth Logo" width="200">

> *"Dapatkan token Facebook dengan mudah dan cepat!"* 🚀

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Python](https://img.shields.io/badge/Python-3.8%2B-brightgreen.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0%2B-lightgrey.svg)](https://flask.palletsprojects.com/)
[![Version](https://img.shields.io/badge/Version-1.0.0--beta-orange.svg)](https://github.com/MR-X-junior/Facebook-OAuth)

**[Demo Langsung](https://rahmat72.pythonanywhere.com)** • **[Dokumentasi](#-dokumentasi)** • **[Kontribusi](#-kontribusi)** • **[Lisensi](#-lisensi)**

</div>

---

## ⚠️ Catatan Versi Beta

**Versi 1.0.0-beta** | Dirilis: **1 November 2025**

Ini adalah rilis pertama dari aplikasi. Mohon maklum jika ada bug atau masalah. Laporan bug dan saran sangat dihargai melalui [GitHub Issues](https://github.com/MR-X-junior/Facebook-OAuth/issues).

---

## 📖 Tentang Aplikasi

**Facebook OAuth Token Generator** adalah aplikasi web yang mempermudah proses mendapatkan Access Token Facebook melalui OAuth 2.0. Aplikasi ini dirancang khusus untuk developer yang membutuhkan token untuk testing, automasi, atau pengembangan aplikasi yang terintegrasi dengan Facebook Graph API.

### 🎯 Untuk Apa Aplikasi Ini?

- **Testing Graph API** - Uji endpoint Facebook API dengan mudah
- **Automasi Social Media** - Otomatisasi posting dan manajemen konten
- **Manajemen Multi Pages** - Kelola banyak Facebook Pages dalam satu tempat
- **Development Tools** - Kembangkan bot, tools, atau aplikasi berbasis Facebook API
- **Token Management** - Kelola token dari multiple accounts dengan aman

### ✨ Fitur Utama

#### 🔐 Autentikasi & Keamanan
- **OAuth 2.0 Integration** - Proses login yang aman mengikuti standar Facebook
- **CSRF Protection** - Proteksi dari serangan Cross-Site Request Forgery
- **State Token Validation** - Validasi token dengan expiry 1 jam
- **Session Security** - HTTPOnly, Secure, dan SameSite cookies
- **Input Validation** - Semua input divalidasi dan disanitasi

#### 📱 Manajemen Akun
- **Multiple Accounts** - Simpan dan kelola banyak akun Facebook
- **Auto Token Refresh** - Token otomatis diperbarui menjadi long-lived (60 hari)
- **Token Countdown** - Monitor waktu kadaluarsa token secara real-time
- **Account Validation** - Validasi otomatis setiap kali membuka detail akun
- **Profile Picture** - Tampilkan foto profil untuk identifikasi mudah

#### 🛠️ Graph API Explorer
- **Live API Testing** - Test endpoint Graph API langsung dari browser
- **Multiple HTTP Methods** - Support GET, POST, dan DELETE requests
- **Token Selector** - Pilih token user atau page untuk request
- **Custom Parameters** - Tambah query parameters sesuai kebutuhan
- **Response Viewer** - Lihat response dalam format JSON yang rapi
- **Copy Response** - Salin response dengan satu klik

#### 📄 Manajemen Pages
- **Pages List** - Lihat semua Facebook Pages yang Anda kelola
- **Page Tokens** - Akses token untuk setiap page
- **Page Permissions** - Lihat permissions yang dimiliki setiap page
- **Pagination** - Tampilkan pages dengan sistem pagination (default: 2 per halaman)
- **Settings Panel** - Atur jumlah pages yang ditampilkan per halaman

#### 💾 Export & Backup
- **Multiple Formats** - Export data ke JSON, CSV, atau TXT
- **Selective Export** - Pilih akun mana yang ingin di-export
- **Complete Data** - Include token, permissions, pages, dan metadata

#### 🎨 User Interface
- **Modern Design** - Tampilan modern dengan gradient dan animasi smooth
- **Responsive Layout** - Optimal di desktop, tablet, dan mobile
- **Dark Theme Ready** - UI yang nyaman untuk mata
- **Toast Notifications** - Notifikasi elegant untuk setiap aksi
- **Loading States** - Indicator loading untuk setiap proses

---

## 🚀 Instalasi Cepat

### Persyaratan

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Facebook App** - [Buat App di Facebook Developers](https://developers.facebook.com/apps/)
- **Git** - [Download Git](https://git-scm.com/downloads)

### Langkah Instalasi

1. **Clone Repository**
```bash
   git clone https://github.com/MR-X-junior/Facebook-OAuth.git
   cd Facebook-OAuth
```

2. **Install Dependencies**
```bash
   pip install -r requirements.txt
```

3. **Konfigurasi Environment**
   
   Buat file `.env` di root folder:
```env
   FB_APP_ID=your_facebook_app_id
   FB_APP_SECRET=your_facebook_app_secret
   REDIRECT_URI=http://localhost:5000/callback
   SECRET_KEY=your_random_secret_key_here
```

4. **Jalankan Aplikasi**
```bash
   python app.py
```

5. **Akses Aplikasi**
   
   Buka browser dan akses: `http://localhost:5000`

---

## 📚 Cara Penggunaan

### 1️⃣ Login & Dapatkan Token

1. Klik tombol **"Tambah Akun"** di halaman utama
2. Login menggunakan akun Facebook Anda
3. Approve semua permissions yang diminta
4. Token akan otomatis disimpan dan di-refresh

### 2️⃣ Kelola Multiple Accounts

- Semua akun tersimpan di localStorage browser
- Klik akun untuk melihat detail lengkap
- Token otomatis divalidasi setiap kali dibuka
- Hapus akun yang tidak diperlukan dengan mudah

### 3️⃣ Test Graph API

1. Buka detail akun
2. Klik **"Buka API Explorer"**
3. Pilih token (user atau page)
4. Pilih HTTP method (GET/POST/DELETE)
5. Masukkan path endpoint (contoh: `/me`)
6. Tambah parameters jika diperlukan
7. Klik **"Kirim Request"** untuk melihat hasil

### 4️⃣ Export Data

1. Klik tombol **"Export"** di halaman utama
2. Pilih akun yang ingin di-export
3. Pilih format (JSON/CSV/TXT)
4. File akan otomatis ter-download

---

## 🔐 Permissions & Scope

Aplikasi ini menggunakan **35 permissions** untuk akses penuh ke Facebook & Instagram:

### Kategori Permissions

| Kategori | Jumlah | Permissions |
|----------|--------|-------------|
| **User Info** | 9 | `public_profile`, `email`, `user_birthday`, `user_hometown`, `user_location`, `user_friends`, `user_age_range`, `user_gender`, `user_link` |
| **User Content** | 3 | `user_posts`, `user_photos`, `user_videos` |
| **Publishing** | 2 | `publish_to_groups`, `publish_video` |
| **Pages Management** | 9 | `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `pages_manage_engagement`, `pages_read_user_content`, `pages_manage_metadata`, `pages_manage_ads`, `pages_manage_cta`, `pages_messaging` |
| **Instagram** | 4 | `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_insights` |
| **Business & Ads** | 8 | `business_management`, `catalog_management`, `leads_retrieval`, `read_insights`, `ads_management` |

> **📝 Catatan:** Beberapa permissions memerlukan App Review dari Facebook untuk penggunaan production. Untuk development, tambahkan user sebagai App Tester.

---

## 🛡️ Keamanan

Aplikasi ini menerapkan keamanan:

- ✅ **CSRF Protection** - State token cryptographically secure
- ✅ **Session Security** - HTTPOnly & Secure cookies
- ✅ **Input Validation** - Semua input divalidasi
- ✅ **Error Sanitization** - Error messages tidak expose data sensitif

> Akan terus ditingkatkan untuk keamanan diversi yang akan datang
---

## 🔧 Teknologi

### Backend
- **Flask 3.0+** - Python web framework
- **Flask-Compress** - Response compression (Brotli/Gzip)
- **Requests** - HTTP client library
- **python-dotenv** - Environment variable management

### Frontend
- **HTML5 & CSS3** - Modern markup & styling
- **JavaScript ES6+** - Interactive features
- **Font Awesome 6.6** - Icon library
- **SweetAlert2** - Beautiful modals & notifications
- **localStorage API** - Client-side data storage

### APIs
- **Facebook Graph API v18.0** - Facebook data access
- **Facebook OAuth 2.0** - Secure authentication

---

## 🐛 Troubleshooting

### Token Expired atau Invalid?
**Solusi:** Hapus akun dan login ulang untuk mendapatkan token baru.

### Permission Denied?
**Solusi:** Pastikan approve semua permissions saat login. Untuk production, submit App Review.

### State Token Expired?
**Solusi:** Jangan tunggu lebih dari 1 jam antara generate link dan login. Kembali ke home untuk generate link baru.

### CORS Error?
**Solusi:** Gunakan Graph API Explorer yang sudah disediakan. Aplikasi menggunakan backend proxy untuk menghindari CORS.

### Data Hilang?
**Solusi:** Data tersimpan di localStorage browser. Export data secara berkala untuk backup.

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Berikut cara berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin feature/fitur-baru`)
5. Buat Pull Request

### Panduan Kontribusi
- Tulis kode yang bersih dan mudah dibaca
- Ikuti style code yang ada
- Test secara menyeluruh sebelum PR
- Update dokumentasi jika perlu

---

## 📜 Lisensi

Aplikasi ini dilisensikan di bawah **Apache License 2.0**

### Ringkasan Lisensi

✅ **Diperbolehkan:**
- Penggunaan komersial
- Modifikasi
- Distribusi
- Penggunaan pribadi
- Penggunaan paten

⚠️ **Syarat:**
- Sertakan lisensi dan copyright notice
- Dokumentasikan perubahan yang dibuat
- Sertakan source code saat distribusi

❌ **Batasan:**
- Tidak ada garansi
- Tidak ada tanggung jawab dari pembuat
- Tidak boleh gunakan trademark tanpa izin
```
Copyright 2025 Rahmat Adha

Licensed under the Apache License, Version 2.0
http://www.apache.org/licenses/LICENSE-2.0
```

Lihat file [LICENSE](LICENSE) untuk teks lengkap lisensi.

---

## 👨‍💻 Pembuat

**Rahmat Adha**

Developer yang passionate dalam membuat tools berguna untuk komunitas.

### Kontak

- 🌐 **Website:** [rahmat72.pythonanywhere.com](https://rahmat72.pythonanywhere.com)
- 📧 **Email:** [termux.indonesia01@gmail.com](mailto:termux.indonesia01@gmail.com)
- 💬 **WhatsApp:** [+62 857-5462-9509](https://wa.me/6285754629509)
- 🐙 **GitHub:** [@MR-X-junior](https://github.com/MR-X-junior)

---

## 📞 Dukungan

### 🐛 Laporkan Bug
Temukan bug? [Buat issue di GitHub](https://github.com/MR-X-junior/Facebook-OAuth/issues)

### 💡 Request Fitur
Punya ide? [Diskusikan di GitHub Discussions](https://github.com/MR-X-junior/Facebook-OAuth/discussions)

### 📧 Kontak Langsung
- Email: [termux.indonesia01@gmail.com](mailto:termux.indonesia01@gmail.com)
- WhatsApp: [+62 857-5462-9509](https://wa.me/6285754629509)

---

## 📊 Statistik

<div align="center">

![GitHub Stars](https://img.shields.io/github/stars/MR-X-junior/Facebook-OAuth?style=social)
![GitHub Forks](https://img.shields.io/github/forks/MR-X-junior/Facebook-OAuth?style=social)
![GitHub Issues](https://img.shields.io/github/issues/MR-X-junior/Facebook-OAuth)

</div>

---

## ⭐ Beri Bintang!

Jika aplikasi ini bermanfaat, berikan bintang di GitHub! Setiap bintang adalah motivasi untuk terus mengembangkan aplikasi ini.

---

## 🙏 Ucapan Terima Kasih

Terima kasih kepada:
- ☕ Kopi yang menemani coding
- 📚 Stack Overflow untuk solusi
- 👥 Open source community
- 💻 Anda yang menggunakan aplikasi ini

---

<div align="center">

**Dibuat dengan ❤️ oleh [Rahmat Adha](https://github.com/MR-X-junior)**

*Dirilis: 1 November 2025*

[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?style=for-the-badge&logo=github)](https://github.com/MR-X-junior)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Message-green?style=for-the-badge&logo=whatsapp)](https://wa.me/6285754629509)
[![Email](https://img.shields.io/badge/Email-Contact-red?style=for-the-badge&logo=gmail)](mailto:termux.indonesia01@gmail.com)

**Copyright © 2025 Rahmat Adha - Licensed under Apache 2.0**

</div>
