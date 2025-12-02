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
      'Hai — Iam Reyhan Alif Ramadhan',
      'Halo — saya Seorang software engineer '
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

  // -- Blok kode baru ditambahkan di sini --
  /* -------------------------
     4. PARALLAX EFFECT (BARU)
     Berdasarkan gerakan mouse di hero section (#home)
     ------------------------- */
  (function initParallax() {
    const heroSection = document.getElementById("home");
    const parallaxItems = document.querySelectorAll(".parallax");

    // Hentikan jika elemen penting tidak ditemukan
    if (!heroSection || parallaxItems.length === 0) {
      // console.warn("Elemen parallax atau hero section 'home' tidak ditemukan.");
      return;
    }

    if (window.innerWidth > 900) {
      heroSection.addEventListener("mousemove", (e) => {
        const x = (window.innerWidth - e.pageX * 2) / 100;
        const y = (window.innerHeight - e.pageY * 2) / 100;
        
        parallaxItems.forEach((item) => {
          // Pastikan ada data-speed, jika tidak, anggap 0
          const speed = item.getAttribute("data-speed") || 0;
          const xPos = x * speed;
          const yPos = y * speed;
          item.style.transform = `translateX(${xPos}px) translateY(${yPos}px)`;
        });
      });
    }
  })();
  // -- Akhir dari blok kode baru --

});

/* =========================
   Data Sheet - localStorage
   ========================= */
(function(){
  const STORAGE_KEY = 'portfolio_datasheet_v1';

  // elements
  const form = document.getElementById('ds-form');
  const inputTitle = document.getElementById('ds-field-title');
  const inputYear = document.getElementById('ds-field-year');
  const inputCat = document.getElementById('ds-field-cat');
  const inputNote = document.getElementById('ds-field-note');
  const tbody = document.getElementById('ds-tbody');

  const btnImport = document.getElementById('ds-import');
  const btnExport = document.getElementById('ds-export');
  const fileInput = document.getElementById('ds-csv-file');
  const btnClearAll = document.getElementById('ds-clear-all');
  const btnClearForm = document.getElementById('ds-clear-form');

  let editingId = null; // null => adding, otherwise index

  // load data
  function loadData(){
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  function saveData(arr){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function renderTable(){
    const data = loadData();
    tbody.innerHTML = '';
    data.forEach((item, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i+1}</td>
        <td>${escapeHtml(item.title)}</td>
        <td>${escapeHtml(item.year)}</td>
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(item.note)}</td>
        <td>
          <button class="ds-action-btn" data-action="edit" data-i="${i}">Edit</button>
          <button class="ds-action-btn" data-action="del" data-i="${i}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // escape to avoid html injection
  function escapeHtml(text){
    if(!text) return '';
    return text
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,"&#039;");
  }

  // add or save
  form.addEventListener('submit', function(e){
    e.preventDefault();
    const title = inputTitle.value.trim();
    if(!title) return alert('Title required');
    const year = inputYear.value.trim();
    const cat = inputCat.value.trim();
    const note = inputNote.value.trim();

    const data = loadData();
    if(editingId === null){
      // add
      data.push({ title, year, category: cat, note });
    } else {
      // update
      data[editingId] = { title, year, category: cat, note };
      editingId = null;
      document.getElementById('ds-add').textContent = 'Add / Save';
    }

    saveData(data);
    renderTable();
    form.reset();
  });

  // clear form
  btnClearForm.addEventListener('click', function(){
    form.reset();
    editingId = null;
    document.getElementById('ds-add').textContent = 'Add / Save';
  });

  // actions (edit/delete)
  tbody.addEventListener('click', function(e){
    const btn = e.target.closest('button');
    if(!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.i);
    const data = loadData();
    if(action === 'edit'){
      const item = data[idx];
      inputTitle.value = item.title;
      inputYear.value = item.year || '';
      inputCat.value = item.category || '';
      inputNote.value = item.note || '';
      editingId = idx;
      document.getElementById('ds-add').textContent = 'Save Changes';
      window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 40, behavior:'smooth' });
    } else if(action === 'del'){
      if(!confirm('Delete this entry?')) return;
      data.splice(idx,1);
      saveData(data);
      renderTable();
    }
  });

  // export CSV
  btnExport.addEventListener('click', function(){
    const data = loadData();
    if(!data.length) return alert('No data to export');
    const header = ['Title','Year','Category','Note'];
    const rows = data.map(d => [d.title, d.year, d.category, d.note]);
    const csv = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\n');
    downloadFile('datasheet.csv', csv, 'text/csv');
  });

  function csvEscape(val){
    if(val == null) return '';
    const s = String(val).replace(/"/g, '""');
    if(s.includes(',') || s.includes('\n') || s.includes('"')) return `"${s}"`;
    return s;
  }
  function downloadFile(name, content, type){
    const blob = new Blob([content], { type: type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 3000);
  }

  // import CSV
  btnImport.addEventListener('click', function(){ fileInput.click(); });
  fileInput.addEventListener('change', function(e){
    const f = e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = function(evt){
      const text = evt.target.result;
      const parsed = parseCSV(text);
      // parsed is array of arrays; assume first row header
      const dataRows = parsed.slice(1).map(r => ({
        title: r[0] || '',
        year: r[1] || '',
        category: r[2] || '',
        note: r[3] || ''
      }));
      const cur = loadData();
      const merged = cur.concat(dataRows);
      saveData(merged);
      renderTable();
      fileInput.value = '';
      alert('Import successful: ' + dataRows.length + ' rows added');
    };
    reader.readAsText(f, 'UTF-8');
  });

  // CSV parse (simple)
  function parseCSV(text){
    const rows = [];
    const lines = text.split(/\r\n|\n/);
    for(const line of lines){
      if(line.trim()==='') continue;
      const row = [];
      let cur = '', inQuotes=false;
      for(let i=0;i<line.length;i++){
        const ch = line[i];
        if(inQuotes){
          if(ch === '"'){
            if(line[i+1] === '"'){ cur += '"'; i++; } else { inQuotes=false; }
          } else cur += ch;
        } else {
          if(ch === '"'){ inQuotes=true; }
          else if(ch === ','){ row.push(cur); cur=''; }
          else cur += ch;
        }
      }
      row.push(cur);
      rows.push(row);
    }
    return rows;
  }

  // clear all
  btnClearAll.addEventListener('click', function(){
    if(!confirm('Delete ALL data? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY);
    renderTable();
  });

  // initial render
  renderTable();

})();
const scriptURL = "https://script.google.com/macros/s/AKfycby7tREH3-R5uiPVCocxsTxUuxM2ixHlS0ShSMBvyX6YboqE4uOqUet8pd5O7rCISSw/exec";

document.getElementById("contact-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const formData = {
        nama: document.getElementById("nama").value,
        email: document.getElementById("email").value,
        pesan: document.getElementById("pesan").value
    };

    fetch(scriptURL, {
        method: "POST",
        body: JSON.stringify(formData)
    })
    .then(response => {
        alert("Pesan berhasil dikirim!");
        document.getElementById("contact-form").reset();
    })
    .catch(error => {
        alert("Terjadi kesalahan, coba lagi!");
        console.error("Error:", error);
    });
});

