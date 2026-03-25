# VELO — USP Product Requirements Document

## 1. Ringkasan

VELO adalah AI ranking web yang mengkurasi tool dari GitHub Trending Weekly, lalu mengubah data mentah menjadi ranking yang lebih relevan, transparan, dan mudah dipindai.

Fokus produk:

- ranking berbasis sinyal, bukan popularitas mentah
- visualisasi data untuk trust dan discovery
- pemisahan jelas antara organic dan sponsored

## 2. Masalah

User yang mencari AI tools sering menghadapi:

- terlalu banyak noise
- ranking yang tidak transparan
- list tools yang hanya populer, bukan layak dipakai
- sulit membedakan organic tools dan sponsored placement

## 3. Target User

### Primary

- Indie hackers
- Founders
- Builders yang ingin cepat menemukan AI tools relevan

### Secondary

- General audience yang tertarik eksplorasi AI tools
- Early adopters yang suka melihat trending dan statistik

## 4. Unique Selling Point

### USP utama

Signal-based AI ranking with transparency charts.

### USP fitur

VELO bukan cuma daftar tools, tetapi dashboard kurasi yang menampilkan:

- total tools
- sponsored vs organic
- score distribution
- momentum atau growth
- category dan language breakdown

## 5. Prinsip Produk

- Signal over noise
- Transparency first
- Fast scanning
- Minimal but informative

## 6. Scope MVP

### 6.1 In Scope

- ranking list
- 3 sampai 5 chart utama
- sponsored labeling
- scoring pipeline
- static JSON data source

### 6.2 Out of Scope

- login
- detail page per tool
- user review
- personal recommendation
- history atau trend jangka panjang
- filter kompleks

## 7. Fitur Inti

### 7.1 Ranking List

Daftar AI tools diurutkan berdasarkan score komposit.

Data yang tampil:

- nama tool
- skor
- deskripsi singkat
- kategori
- bahasa
- sponsor badge jika ada

### 7.2 Transparency Charts

Chart yang menjelaskan isi dataset dan hasil kurasi.

Chart prioritas MVP:

1. Total tools
2. Sponsored vs organic
3. Top momentum
4. Score distribution
5. Language atau category breakdown

### 7.3 Sponsored Handling

Semua konten sponsored harus:

- diberi label jelas
- dipisahkan secara visual
- tidak disamarkan sebagai organic ranking

Tujuan:

- transparansi
- trust
- menghindari bias persepsi

## 8. Data & Scoring

Score dihitung dari gabungan:

- stars growth
- forks
- desc quality
- contributors
- topic relevance
- language performance bias

Catatan:

- ranking harus konsisten
- formula boleh di-tweak tanpa mengubah UX inti
- komponen score harus cukup transparan untuk dijelaskan

## 9. User Experience

VELO harus terasa seperti dashboard kurasi, bukan katalog mentah.

Prinsip UX:

- cepat dipindai
- visual, tetapi tidak ramai
- transparan
- fokus pada signal, bukan dekorasi

Urutan fokus visual:

1. konteks dataset
2. chart trust
3. ranking list
4. sponsor visibility

## 10. Success Metrics

- user bisa memahami ranking dalam kurang dari 10 detik
- chart sponsored vs organic meningkatkan trust
- engagement pada ranking list meningkat
- bounce rate turun karena ada konteks visual
- user kembali karena ranking terasa kredibel

## 11. Risks & Mitigations

### Risk: chart terlalu banyak membuat UI ramai

Mitigation: batasi chart ke yang benar-benar memberi sinyal cepat.

### Risk: sponsored menurunkan trust

Mitigation: label sponsor harus eksplisit dan dipisahkan secara visual.

### Risk: scoring terlalu kompleks

Mitigation: tampilkan hasil, bukan rumus penuh, dan jaga agar ranking tetap mudah dipahami.

### Risk: data source tunggal membatasi variasi

Mitigation: mulai dari GitHub Trending Weekly, lalu evaluasi perluasan sumber di iterasi berikutnya.

## 12. Implementation Notes

- gunakan pipeline static JSON
- halaman utama tetap single page
- chart harus ringan dan informatif
- komponen harus minimal
- prioritas: ranking list dulu, chart kedua, detail lain belakangan

## 13. Open Questions

- chart mana yang benar-benar tampil di MVP
- definisi sponsored
- apakah perlu filter
- apakah perlu sort alternatif
- apakah momentum chart ditampilkan sebagai angka, bar, atau sparkline
