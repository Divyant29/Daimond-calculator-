
let currentReportStones = [];
// --- FULL APP I18N DICTIONARY --
const i18n = {
  en: {
   appTitle: "DIAMOND CALCULATOR",
   packetNo: "Packet Number",
   packetPlaceholder: "# Barcode / Packet no.",
   cut: "Cut",
   shape: "Shape",
   weight: "Weight (ct)",
   rate: "Rate / ct",
   date: "Date",
   saveStone: "✓ Save Stone",
   navEntry: "Entry",
   navPrices: "Prices",
   navReports: "Reports",
   priceRules: "Price Rules",
   addRate: "Add New Rate",
   dept: "Department",
   weightRange: "Weight Range (ct)",
   saveRateBtn: "+ Save Rate",
   addShape: "Add Shape",
   newShape: "New Custom Shape",
   shapeName: "Shape Name",
   addShapeBtn: "+ Add Shape",
   reports: "Reports",
   stones: "Stones",
   totalCt: "Total ct",
   value: "Value",
   settings: "Settings",
   toggleTheme: "🌓 Change Theme",
   about: "ℹ️ About",
   privacy: "🔒 Privacy Policy",
   terms: "📜 Terms & Conditions",
   help: "🆘 Help & Support",
   founder: "👤 Founder",
   checkUpdate: "🔄 Check for Update",
   logout: "🔴 Logout",
   updateNotice: "New Update Available!",
   updateBtn: "Update Now"
  },
  gu: {
   appTitle: "ડાયમંડ કેલ્ક્યુલેટર",
   packetNo: "પેકેટ નંબર",
   packetPlaceholder: "# બારકોડ / પેકેટ નં.",
   cut: "કટ",
   shape: "શેપ",
   weight: "વજન (ct)",
   rate: "રેટ / ct",
   date: "તારીખ",
   saveStone: "✓ સ્ટોન સેવ કરો",
   navEntry: "એન્ટ્રી",
   navPrices: "રેટ લિસ્ટ",
   navReports: "રિપોર્ટ્સ",
   priceRules: "પ્રાઇસ રૂલ્સ",
   addRate: "નવો રેટ ઉમેરો",
   dept: "ડિપાર્ટમેન્ટ",
   weightRange: "વજન રેન્જ (ct)",
   saveRateBtn: "+ રેટ સેવ કરો",
   addShape: "શેપ ઉમેરો",
   newShape: "નવો કસ્ટમ શેપ",
   shapeName: "શેપનું નામ",
   addShapeBtn: "+ શેપ ઉમેરો",
   reports: "રિપોર્ટ્સ",
   stones: "કુલ સ્ટોન",
   totalCt: "કુલ વજન",
   value: "કુલ કિંમત",
   settings: "સેટિંગ્સ",
   toggleTheme: "🌓 થીમ બદલો",
   about: "ℹ️ એપ વિષે",
   privacy: "🔒 પ્રાઈવસી પોલિસી",
   terms: "📜 નિયમો અને શરતો",
   help: "🆘 મદદ અને સપોર્ટ",
   founder: "👤 સ્થાપક",
   checkUpdate: "🔄 અપડેટ ચેક કરો",
   logout: "🔴 લોગ આઉટ",
   updateNotice: "નવું અપડેટ ઉપલબ્ધ છે!",
   updateBtn: "અત્યારે અપડેટ કરો"
  }
 };

  // --- INSTALL APP (PWA) ---
 let deferredInstallPrompt = null;

 function showInstallBanner() {
  if (sessionStorage.getItem('installBannerDismissed')) return; // hidden for this session only
  document.getElementById('install-banner').style.display = 'block';
 }

 function dismissInstallBanner() {
  document.getElementById('install-banner').style.display = 'none';
  sessionStorage.setItem('installBannerDismissed', 'true'); // reappears next time app is opened
 }

 window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallBanner();
 });

 async function installApp() {
  if (!deferredInstallPrompt) {
   alert("To install: tap the Share button in your browser, then 'Add to Home Screen'.");
   return;
  }
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  document.getElementById('install-banner').style.display = 'none';
 }

 window.addEventListener('appinstalled', () => {
  document.getElementById('install-banner').style.display = 'none';
  sessionStorage.removeItem('installBannerDismissed');
 });

 const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
 const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
 if (isIOS && !isStandalone) {
  showInstallBanner();
 }

 // --- SERVICE WORKER & AUTOMATIC UPDATE ENGINE ---
 let newWorker;
 if ('serviceWorker' in navigator) { 
  navigator.serviceWorker.register('sw.js').then(reg => {
   reg.addEventListener('updatefound', () => {
    newWorker = reg.installing;
    newWorker.addEventListener('statechange', () => {
     if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
      document.getElementById('update-banner').style.display = 'block';
     }
    });
   });
  }).catch(() => {}); 
 }
//for update
  window.addEventListener('offline', () => {
  document.getElementById('update-text').innerText = "📴 Offline — changes will sync when reconnected";
  document.getElementById('update-banner').style.display = 'block';
 });
 window.addEventListener('online', () => {
  document.getElementById('update-banner').style.display = 'none';
 });

 async function applyUpdate() {
  if ('serviceWorker' in navigator) {
   const registrations = await navigator.serviceWorker.getRegistrations();
   for (let registration of registrations) {
    await registration.unregister();
   }
  }
  if ('caches' in window) {
   const names = await caches.keys();
   for (let name of names) {
    await caches.delete(name);
   }
  }
  const savedLang = localStorage.getItem('appLang');
  const savedTheme = localStorage.getItem('theme');
  localStorage.clear();
  if (savedLang) localStorage.setItem('appLang', savedLang);
  if (savedTheme) localStorage.setItem('theme', savedTheme);

  if (newWorker) newWorker.postMessage({ action: 'skipWaiting' });
  window.location.reload(true);
 }

 function checkUpdateManual() {
  toggleMenu();
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
   navigator.serviceWorker.getRegistration().then(reg => {
    if (reg) {
     reg.update().then(() => {
      alert("Checked for updates. If a new version is available, the update banner will appear.");
     });
    }
   });
  } else {
   applyUpdate();
  }
 }

 // --- DYNAMIC USER GREETING & FULL LANGUAGE SYSTEM ---
 function getUserFirstName() {
  if (auth.currentUser && auth.currentUser.displayName) {
   return auth.currentUser.displayName.split(' ')[0];
  }
  return "User";
 }

 function changeLanguage(langKey) {
  if (langKey === 'add') {
   const newLang = prompt("Enter new language name (e.g., Marathi, French):");
   if (newLang) {
    const select = document.getElementById('langSelect');
    const opt = document.createElement('option');
    opt.value = newLang.toLowerCase();
    opt.innerHTML = `🌐 ${newLang}`;
    select.insertBefore(opt, select.lastElementChild);
    select.value = newLang.toLowerCase();
    localStorage.setItem('appLang', newLang.toLowerCase());
    applyFullLanguage(newLang.toLowerCase());
   } else {
    document.getElementById('langSelect').value = localStorage.getItem('appLang') || 'en';
   }
   return;
  }
  localStorage.setItem('appLang', langKey);
  applyFullLanguage(langKey);
 }

 function applyFullLanguage(langKey) {
  const userName = getUserFirstName();
  const greetings = {
   en: `Hello, ${userName} 👋`,
   gu: `નમસ્તે, ${userName} 👋`
  };
  document.getElementById('greeting-text').innerText = greetings[langKey] || `Hello, ${userName} 👋`;

  const langData = i18n[langKey] || i18n['en'];

  document.querySelectorAll('[data-i18n]').forEach(el => {
   const key = el.getAttribute('data-i18n');
   if (langData[key]) el.innerText = langData[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
   const key = el.getAttribute('data-i18n-placeholder');
   if (langData[key]) el.placeholder = langData[key];
  });
 }

 // --- FIREBASE INITIALIZATION ---
 const firebaseConfig = { 
  apiKey: "AIzaSyDz2EoEj_Q-P1cNvr0t_IBOA5xqmC1Wmzo", 
  authDomain: "daimond-calculator.firebaseapp.com", 
  projectId: "daimond-calculator", 
  storageBucket: "daimond-calculator.firebasestorage.app", 
  messagingSenderId: "1076337600089", 
  appId: "1:1076337600089:web:dce0e8433eb4551c563348" 
 };
 firebase.initializeApp(firebaseConfig);
 const auth = firebase.auth(), db = firebase.firestore();
 db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open — persistence only works in one at a time
    console.warn('Offline persistence unavailable: multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Offline persistence not supported by this browser');
  }
});

 // --- DEFAULT & USER STATE ---
 const DEFAULT_SHAPES = [
  // Fancy Department
  { name: 'Oval', grp: 'Fancy' },
  { name: 'Marquise', grp: 'Fancy' },
  { name: 'Pear', grp: 'Fancy' },
  { name: 'Heart', grp: 'Fancy' },

  // Step Cut Department
  { name: 'Radiant', grp: 'Step Cut' },
  { name: 'Emerald', grp: 'Step Cut' },
  { name: 'Princess', grp: 'Step Cut' },
  { name: 'Hexa', grp: 'Step Cut' },
  { name: 'Cushion', grp: 'Step Cut' },
  { name: 'Asscher', grp: 'Step Cut' },

  // Step Cut Fancy Department
  { name: 'Step Oval', grp: 'Step Cut Fancy' },
  { name: 'Step Pear', grp: 'Step Cut Fancy' },
  { name: 'Step Marquise', grp: 'Step Cut Fancy' },
  { name: 'Flame', grp: 'Step Cut Fancy' },

  // Round Department
  { name: 'Round', grp: 'Round' }
 ];

 let userShapes = [...DEFAULT_SHAPES];
 let selectedValues = { shape: 'Oval', cut: 'Ex', grp: 'Fancy', pcut: 'Ex', cshape_grp: 'Fancy' };
 let userPrices = [];
 let html5QrcodeScanner = null;

 function escapeHTML(str) {
  return String(str || '').replace(/[&<>"']/g, function(m) {
   return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
  });
 }

 document.getElementById('entryDate').valueAsDate = new Date();
//theme logic
 const savedTheme = localStorage.getItem('theme')||'dark';
 document.documentElement.setAttribute('data-theme',savedTheme);

 // --- NAVIGATION & MODALS ---
 function toggleMenu() { 
  document.getElementById('side-menu').classList.toggle('open'); 
  document.getElementById('overlay').classList.toggle('active'); 
 }

 function toggleTheme() { 
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
 }

 function openModal(id) {
  if(document.getElementById('side-menu').classList.contains('open')) toggleMenu();
  document.getElementById(id).classList.add('active');
 }

 function openHelpModal() { openModal('helpModal'); }
 function openFounderModal() { openModal('founderModal'); }
 function closeModal(modalId) { document.getElementById(modalId).classList.remove('active'); }

 function showTab(id) {
  document.querySelectorAll('.container').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const index = id === 'entry' ? 0 : (id === 'prices' ? 1 : 2);
  document.querySelectorAll('.nav-item')[index].classList.add('active');
 }

 // --- AUTHENTICATION ---
   async function signInWithGoogle() {
   const provider = new firebase.auth.GoogleAuthProvider();
   try { await auth.signInWithPopup(provider); } catch(e) { alert(e.message); }
}

  auth.onAuthStateChanged(async u => {
  document.getElementById('app-loading').style.display = 'none';
  document.getElementById('auth-screen').style.display = u ? 'none' : 'flex';
  document.getElementById('main-app').style.display = u ? 'block' : 'none';
  if(u) { 
   const savedLang = localStorage.getItem('appLang') || 'en';
   document.getElementById('langSelect').value = savedLang;
  applyFullLanguage(savedLang);

   document.getElementById('filterMonth').value = new Date().toISOString().slice(0,7); 
   await loadShapes();
   await loadPrices(); 
   loadReports(); 
  }
  })
  
 // --- BARCODE SCANNER LOGIC ---
 function startScanner() {
  if (!window.isSecureContext && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
   alert("Camera access requires a secure HTTPS connection.");
   return;
  }

  document.getElementById('scannerModal').classList.add('active');
  if (!html5QrcodeScanner) { html5QrcodeScanner = new Html5Qrcode("scanner-reader"); }

  const config = { fps: 10, qrbox: { width: 250, height: 150 } };

  html5QrcodeScanner.start(
   { facingMode: "environment" }, 
   config, 
   (decodedText) => {
    document.getElementById('barcode').value = decodedText;
    stopScanner();
   },
   () => {}
  ).catch(err => {
   alert("Camera permission is required to scan a barcode or camera is unavailable.");
   stopScanner();
  });
 }

 function stopScanner() {
  if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
   html5QrcodeScanner.stop().then(() => {
    document.getElementById('scannerModal').classList.remove('active');
   }).catch(() => {
    document.getElementById('scannerModal').classList.remove('active');
   });
  } else {
   document.getElementById('scannerModal').classList.remove('active');
  }
 }

 // --- SEGMENT CONTROLS & LOOKUP ---
 function setSegment(key, val) {
  selectedValues[key] = val;
  let containerId = '';
  if (key === 'grp') containerId = 'grp-segments';
  else if (key === 'pcut') containerId = 'pcut-segments';
  else if (key === 'cut') containerId = 'cut-segments';
  else if (key === 'cshape_grp') containerId = 'cshape-grp-segments';

  if (containerId) {
   document.querySelectorAll(`#${containerId} .segment-btn`).forEach(btn => { 
    btn.classList.toggle('active', btn.innerText.trim() === val); 
   });
  }

  if (key === 'cut') lookupPrice();
 }

 function handleDepartmentChange(deptName) {
  localStorage.setItem('lastDept', deptName);   // ← remember it
  renderShapeDropdown(deptName);
  lookupPrice();
 }

 function handleShapeChange(shapeName) {
  if (shapeName === 'add') {
   const currentDept = document.getElementById('department-select').value;
   setSegment('cshape_grp', currentDept);   // ← pre-selects the matching department segment
   openModal('addShapeModal');
   document.getElementById('shape-select').value = selectedValues.shape || '';
   return;
  }
  selectedValues.shape = shapeName;
  lookupPrice();
 }

 function getDepartmentForShape(shapeName) {
  const found = userShapes.find(s => s.name.toLowerCase() === shapeName.toLowerCase());
  return found ? found.grp : 'Step Cut';
 }

 function lookupPrice() {
  const shp = selectedValues.shape;
  const cut = selectedValues.cut;
  const wt = parseFloat(document.getElementById('weight').value) || 0;
  if (wt <= 0) return;

  const grp = getDepartmentForShape(shp);
  const match = userPrices.find(r => r.grp === grp && r.cut === cut && wt >= r.min && wt <= r.max);
  if (match) document.getElementById('price').value = match.amt;
 }

 // --- SHAPES MANAGEMENT ---
 async function loadShapes() {
  if (!auth.currentUser) return;
  const docRef = db.collection("users").doc(auth.currentUser.uid);
  const snap = await docRef.get();
  
  userShapes = [...DEFAULT_SHAPES];
  if (snap.exists && snap.data().customShapes) {
   const customList = snap.data().customShapes || [];
   customList.forEach(cs => {
    if (!userShapes.some(s => s.name.toLowerCase() === cs.name.toLowerCase())) {
     userShapes.push(cs);
    }
   });
  }

  const deptSelect = document.getElementById('department-select');
  const savedDept = localStorage.getItem('lastDept');
  if (savedDept) deptSelect.value = savedDept;   // ← restore last-used department

  renderShapeDropdown(deptSelect.value || 'Fancy');
  renderCustomShapeList();
 }

 function renderShapeDropdown(deptName) {
  const filteredShapes = userShapes.filter(s => s.grp.toLowerCase() === deptName.toLowerCase());
  const shapeSelect = document.getElementById('shape-select');
  
  let html = '';
  filteredShapes.forEach(s => {
   html += `<option value="${escapeHTML(s.name)}">${escapeHTML(s.name)}</option>`;
  });
  html += `<option value="add">+ Add New Shape</option>`;
  
  shapeSelect.innerHTML = html;

  if (filteredShapes.length > 0) {
   shapeSelect.value = filteredShapes[0].name;
   selectedValues.shape = filteredShapes[0].name;
  } else {
   selectedValues.shape = '';
  }
 }

 function renderCustomShapeList() {
  const customOnly = userShapes.filter(s => !DEFAULT_SHAPES.some(d => d.name.toLowerCase() === s.name.toLowerCase()));
  let html = '';
  if (customOnly.length > 0) {
   html += '<span class="section-label" style="margin-top:10px;">Custom Shapes</span>';
   customOnly.forEach(s => {
    html += `<div class="shape-list-item">
     <span><b>${escapeHTML(s.name)}</b> (${escapeHTML(s.grp)})</span>
     <button class="delete-shape-btn" onclick="deleteCustomShape('${escapeHTML(s.name)}')">✕ Delete</button>
    </div>`;
   });
  }
  document.getElementById('customShapeList').innerHTML = html;
 }

 async function saveCustomShape() {
  const nameInput = document.getElementById('custom_shape_name');
  const name = nameInput.value.trim();
  const grp = selectedValues.cshape_grp || 'Fancy';

  if (!name) return alert("Please enter a shape name.");
  if (userShapes.some(s => s.name.toLowerCase() === name.toLowerCase())) return alert("Shape already exists.");

  userShapes.push({ name, grp });
  const customOnly = userShapes.filter(s => !DEFAULT_SHAPES.some(d => d.name.toLowerCase() === s.name.toLowerCase()));
  await db.collection("users").doc(auth.currentUser.uid).set({ customShapes: customOnly }, { merge: true });

  nameInput.value = '';

  document.getElementById('department-select').value = grp;
  renderShapeDropdown(grp);
  document.getElementById('shape-select').value = name;
  selectedValues.shape = name;

  renderCustomShapeList();
  closeModal('addShapeModal');
  alert("Shape added successfully!");
 }

 async function deleteCustomShape(shapeName) {
  if (!confirm(`Delete custom shape "${shapeName}"?`)) return;

  userShapes = userShapes.filter(s => s.name.toLowerCase() !== shapeName.toLowerCase());
  const customOnly = userShapes.filter(s => !DEFAULT_SHAPES.some(d => d.name.toLowerCase() === s.name.toLowerCase()));

  await db.collection("users").doc(auth.currentUser.uid).set({ customShapes: customOnly }, { merge: true });

  const deptSelect = document.getElementById('department-select');
  renderShapeDropdown(deptSelect.value);
  renderCustomShapeList();
  lookupPrice();
 }

 // --- STONES ENTRY MANAGEMENT ---
async function saveStone() {
  const btn = document.querySelector('#entry .btn-green');
  if (btn.disabled) return; // guard against double-tap
  btn.disabled = true;
  const originalText = btn.innerText;
  btn.innerText = "Saving...";

  try {
    const s = {
      date: document.getElementById('entryDate').value,
      barcode: document.getElementById('barcode').value.trim() || "No ID",
      shape: selectedValues.shape,
      cut: selectedValues.cut,
      weight: parseFloat(document.getElementById('weight').value),
      price: parseFloat(document.getElementById('price').value),
      month: document.getElementById('entryDate').value.slice(0,7)
    };

    if (isNaN(s.weight) || s.weight <= 0) { alert("Please enter a valid weight."); return; }
    if (isNaN(s.price) || s.price < 0) { alert("Please enter a valid rate."); return; }

    await db.collection("users").doc(auth.currentUser.uid).collection("stones").add(s);
    document.getElementById('barcode').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('price').value = '';
    loadReports();
    alert(navigator.onLine?"Saved!" : "Saved offline! / ઇન્ટરનેટ આવશે એટલે આપોઆપ અપડેટ થઈ જશે");
  } finally {
    btn.disabled = false;
    btn.innerText = originalText;
  }
}

 // --- PRICE RULES MANAGEMENT ---
 async function savePriceRule() {
  const min = parseFloat(document.getElementById('p_min').value);
  const max = parseFloat(document.getElementById('p_max').value);
  const amt = parseFloat(document.getElementById('p_amt').value);
  
  if (isNaN(min) || isNaN(max) || isNaN(amt) || min > max) return alert("Please enter valid weight range and price amount.");

  const overlap = userPrices.some(r => r.grp === selectedValues.grp && r.cut === selectedValues.pcut && ((min >= r.min && min < r.max) || (max > r.min && max <= r.max)));
  if (overlap && !confirm("Warning: Range overlaps with an existing rule. Save anyway?")) return;

  const r = { grp: selectedValues.grp, cut: selectedValues.pcut, min, max, amt };
  await db.collection("users").doc(auth.currentUser.uid).collection("prices").add(r);
  
  document.getElementById('p_min').value = '';
  document.getElementById('p_max').value = '';
  document.getElementById('p_amt').value = '';
  loadPrices();
 }

 async function loadPrices() {
  if (!auth.currentUser) return;
  const snap = await db.collection("users").doc(auth.currentUser.uid).collection("prices").get();
  userPrices = []; 

  snap.forEach(doc => { 
   let r = doc.data(); 
   r.id = doc.id;
   userPrices.push(r); 
  });
  

  const departments = ['Fancy', 'Step Cut', 'Round', 'Step Cut Fancy'];
  let h = '';

  departments.forEach(dept => {
   const rules = userPrices.filter(r => r.grp === dept);
   h += `<div class="dept-card"><h3>${escapeHTML(dept)}</h3>`;
   
   if (rules.length === 0) {
    h += `<p style="font-size:12px; color:var(--label)">No rate rules set for this department.</p>`;
   } else {
    rules.forEach(r => {
     h += `<div class="report-item">
      <div class="report-info">
       <b>Cut: ${escapeHTML(r.cut)}</b>
       <small>${r.min} - ${r.max} ct</small>
      </div>
      <div style="display:flex; align-items:center; gap:15px">
       <b class="val-text">₹${r.amt}</b>
       <span onclick="del('prices','${r.id}',loadPrices)" style="color:var(--danger); cursor:pointer">✕</span>
      </div>
     </div>`;
    });
   }
   h += `</div>`;
  });

  document.getElementById('priceList').innerHTML = h;
 }

 // --- REPORTS MANAGEMENT ---
 async function loadReports() {
  if (!auth.currentUser) return;
  const m = document.getElementById('filterMonth').value;
  const sortVal = document.getElementById('sortOption').value;
  const searchVal = document.getElementById('packetSearch').value.trim().toLowerCase();
  const snap = await db.collection("users").doc(auth.currentUser.uid).collection("stones").where("month", "==", m).get();
  
  let stones = [];
  snap.forEach(doc => { 
   let s = doc.data(); 
   s.id = doc.id; 
   s.totalVal = s.weight * s.price;
   stones.push(s); 
  });
  // Filter by packet number / barcode
  if (searchVal) {
  stones = stones.filter(s =>
    String(s.barcode || '').toLowerCase().includes(searchVal)
  );
  }

  stones.sort((a, b) => {
   if (sortVal === 'date') return new Date(b.date) - new Date(a.date);
   if (sortVal === 'weight') return b.weight - a.weight;
   if (sortVal === 'val') return b.totalVal - a.totalVal;
   return 0;
  });
  currentReportStones = stones;
  let h = '', tC = 0, tW = 0, tV = 0;
  stones.forEach(s => { 
   tC++; tW += s.weight; tV += s.totalVal; 
   h += `<div class="report-item">
    <div class="report-info">
     <b>#${escapeHTML(s.barcode)}</b>
     <small>${escapeHTML(s.date)} • ${escapeHTML(s.shape)} • ${escapeHTML(s.cut)} • ${s.weight}ct @ ₹${s.price}</small>
    </div>
    <div style="text-align:right">
     <div class="val-text" style="color:var(--success)">₹${s.totalVal.toLocaleString(undefined, {minimumFractionDigits: 1})}</div>
     <span onclick="openEditModal('${s.id}','${escapeHTML(s.date)}','${escapeHTML(s.barcode)}',${s.weight},${s.price})" style="color:var(--accent); font-size:11px; cursor:pointer">EDIT</span>
     <span onclick="del('stones','${s.id}',loadReports)" style="color:var(--danger); margin-left:10px; font-size:11px; cursor:pointer">DELETE</span>
    </div>
   </div>`; 
  });

  document.getElementById('totCount').innerText = tC; 
  document.getElementById('totWt').innerText = tW.toFixed(2); 
  document.getElementById('totVal').innerText = "₹" + tV.toLocaleString(undefined, {minimumFractionDigits: 1});
  document.getElementById('historyList').innerHTML = h;
 }

 function openEditModal(id, date, barcode, weight, price) { 
  document.getElementById('edit-id').value = id; 
  document.getElementById('edit-date').value = date; 
  document.getElementById('edit-barcode').value = barcode; 
  document.getElementById('edit-weight').value = weight; 
  document.getElementById('edit-price').value = price; 
  document.getElementById('editModal').classList.add('active'); 
 }

 async function updateStone() { 
  const id = document.getElementById('edit-id').value; 
  const data = { 
   date: document.getElementById('edit-date').value, 
   barcode: document.getElementById('edit-barcode').value.trim() || "No ID", 
   weight: parseFloat(document.getElementById('edit-weight').value), 
   price: parseFloat(document.getElementById('edit-price').value), 
   month: document.getElementById('edit-date').value.slice(0,7) 
  }; 
  if (isNaN(data.weight) || data.weight <= 0 || isNaN(data.price) || data.price < 0) {
   return alert("Please enter valid weight and price values.");
  }
  await db.collection("users").doc(auth.currentUser.uid).collection("stones").doc(id).update(data); 
  closeModal('editModal'); 
  loadReports(); 
 }

 async function del(c, id, cb) { 
  if(confirm("Delete record?")) { 
   await db.collection("users").doc(auth.currentUser.uid).collection(c).doc(id).delete(); 
   cb(); 
  } 
 }

 // shere button
 document.getElementById("shareAppBtn").addEventListener("click", async () => {
  const shareData = {
    title: "Diamond Calculator",
    text: "💎 3x ના કારીગર ભાઈઓ માટે હીરાનો હિસાબ કરવાની FREE એપ!\n\nડાયરીમાં હિસાબ લખવાની ઝંઝટ ખતમ 📱\n\n👇🏻 એપ અહીંથી મેળવો:",
    url: "https://github.com/divyant29/Daimond-calculator-/releases/download/v1.0.0/DiamondCalc-unsigned.apk"
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {}
  } else {
    await navigator.clipboard.writeText(
      shareData.text + "\n" + shareData.url
    );
    alert("Share link copy થઈ ગઈ છે ✅");
  }
});
// --- PDF REPORT EXPORT ---
 function generatePDFReport() {
  const btn = document.getElementById('pdfDownloadBtn');

  if (!currentReportStones || currentReportStones.length === 0) {
   alert("No data to export. Pick a month with saved stones first.");
   return;
  }
  if (typeof window.jspdf === 'undefined') {
   alert("PDF library failed to load. Check your internet connection and try again.");
   return;
  }

  if (btn) { btn.disabled = true; }

  try {
   const { jsPDF } = window.jspdf;
   const doc = new jsPDF();

   const monthVal = document.getElementById('filterMonth').value;
   const monthLabel = monthVal
    ? new Date(monthVal + "-01").toLocaleString('default', { month: 'long', year: 'numeric' })
    : "All Records";

   const tC = document.getElementById('totCount').innerText;
   const tW = document.getElementById('totWt').innerText;
   const tV = document.getElementById('totVal').innerText.replace('₹', 'Rs. ');

   // Header
   doc.setFontSize(18);
   doc.setTextColor(30, 41, 59);
   doc.text("Diamond Calculator - Report", 14, 18);

   doc.setFontSize(11);
   doc.setTextColor(100, 116, 139);
   doc.text(`Period: ${monthLabel}`, 14, 26);
   doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

   // Summary line
   doc.setFontSize(11);
   doc.setTextColor(15, 23, 42);
   doc.text(`Stones: ${tC}     Total ct: ${tW}     Total Value: ${tV}`, 14, 39);

   // Full data table
   const rows = currentReportStones.map((s, i) => [
    i + 1,
    s.barcode || "No ID",
    s.date || "",
    s.shape || "",
    s.cut || "",
    s.weight != null ? s.weight.toFixed(2) : "",
    s.price != null ? s.price.toLocaleString() : "",
    s.totalVal != null ? s.totalVal.toLocaleString(undefined, { minimumFractionDigits: 1 }) : ""
   ]);

   doc.autoTable({
    startY: 45,
    head: [["#", "Packet / Barcode", "Date", "Shape", "Cut", "Weight (ct)", "Rate", "Value"]],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 0: { cellWidth: 12, halign:'center' } }
   });

   const fileMonth = monthVal || "all";
   doc.save(`diamond-report-${fileMonth}.pdf`);
  } catch (err) {
   console.error("PDF generation failed:", err);
   alert("Something went wrong while creating the PDF. Please try again.");
  } finally {
   if (btn) { btn.disabled = false; }
  }
 }

