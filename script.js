// script.js - versi perbaikan

// Jalankan semua inisialisasi setelah DOM siap
document.addEventListener('DOMContentLoaded', function () {

  /* -------------------------
     Floating animation (gambar)
     hanya untuk image tertentu: foto profil (.photo img)
     dan gambar di project (.project img)
     Respect prefers-reduced-motion
     ------------------------- */
  (function animateImages(){
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // jika user memilih reduced motion, jangan animasi
      return;
    }

    const images = document.querySelectorAll('.photo img, .project img');
    const amplitude = 4; // px
    const speed = 0.05; // kecepatan

    images.forEach((img, index) => {
      let t = Math.random() * 1000; // offset acak supaya tidak sinkron
      function step() {
        t += speed;
        const y = Math.sin(t + index) * amplitude;
        // gunakan transform untuk performa
        img.style.transform = `translateY(${y}px)`;
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  })();

  /* -------------------------
     Typing + Fade Effect
     Target prioritas: span di dalam .hero .greeting
     Fallback: element dengan id typed jika ada
     ------------------------- */
  (function typingFade(){
    // prioritas ke typed di dalam hero agar tidak mengisi elemen lain di header
    const el = document.querySelector('.hero .greeting #typed') || document.getElementById('typed');
    if (!el) return;

    const texts = [
      'Halo — saya Reyhan Alif Ramadhan',
      'Halo — saya Seorang Web development'
    ];

    const typeSpeed = 70;      // ms per karakter
    const pauseAfter = 800;    // ms sebelum fade out
    const fadeDuration = 500;  // ms, harus sama dengan CSS transition

    let idxText = 0;
    let idxChar = 0;

    function type(){
      const currentText = texts[idxText];

      // start fade-in class -> CSS akan mengatur opacity
      el.classList.add('show');

      if (idxChar < currentText.length) {
        el.textContent += currentText.charAt(idxChar);
        idxChar++;
        setTimeout(type, typeSpeed);
      } else {
        // sudah selesai mengetik, tunggu lalu fade-out
        setTimeout(() => {
          el.classList.remove('show'); // fade out
          setTimeout(() => {
            idxText = (idxText + 1) % texts.length; // next text
            idxChar = 0;
            el.textContent = "";
            // beri jeda kecil sebelum fade in lagi
            setTimeout(type, 200);
          }, fadeDuration);
        }, pauseAfter);
      }
    }

    // mulai dengan delay ringan
    setTimeout(type, 500);
  })();

});
