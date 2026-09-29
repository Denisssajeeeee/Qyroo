

/* MADE BY DENN AUTHOR?GAUSA NANYA LAGI DONG WKWK
                   THANKS TO
       - FRIBASE ( Penyedia DB )
       - Denn    ( Author)
       - Zyy     ( Partner )
       - ChatGPT ( Fix Issue ) */ 


// CONFIG FIREBASE GAUSA NGELUH
const firebaseConfig = {
  apiKey: "AIzaSyBIDeA8XcSXSwtBAsC8FlROOhTc9csTqnM",
  authDomain: "my-login-7b49d.firebaseapp.com",
  projectId: "my-login-7b49d",
  storageBucket: "my-login-7b49d.firebasestorage.app",
  messagingSenderId: "479614940061",
  appId: "1:479614940061:web:7ba2d5f549bac0393d3574"
};

const ADMIN_EMAIL = "admin@gmail.com";
const USER_REGISTRY_KEY = "qyroo-registered-users";
const USER_STATUS_KEY = "qyroo-user-status";
const USER_ROLE_KEY = "qyroo-user-roles";
const PRODUCT_STORAGE_KEY = "qyroo-products";
const ADMIN_ANNOUNCEMENT_KEY = "qyroo-admin-announcement";
const ADMIN_ANNOUNCEMENT_ENABLED_KEY = "qyroo-announcement-enabled";
const MAINTENANCE_MODE_KEY = "qyroo-maintenance-mode";
const AVAILABLE_ROLES = ["Free", "Premium", "VIP", "Pro", "Admin"];
const ROLE_DEFINITIONS = {
  Free: {
    price: "Gratis",
    title: "Free",
    benefit: "Akses dasar website, melihat produk, dan fitur umum tanpa biaya.",
    access: "Akses dasar"
  },
  Premium: {
    price: "Rp 39.000",
    title: "Premium",
    benefit: "Akses fitur lanjutan, promo member, dan support lebih cepat.",
    access: "Fitur tambahan + promo"
  },
  VIP: {
    price: "Rp 79.000",
    title: "VIP",
    benefit: "Prioritas layanan, akses eksklusif, dan dukungan premium khusus.",
    access: "Prioritas + akses eksklusif"
  },
  Pro: {
    price: "Rp 149.000",
    title: "Pro",
    benefit: "Akses penuh semua fitur, tools advanced, dan manfaat bisnis lebih lengkap.",
    access: "Akses penuh semua fitur"
  },
  Admin: {
    price: "Full Access",
    title: "Admin",
    benefit: "Mengatur user, role, produk, pengumuman, dan kontrol website secara penuh.",
    access: "Kontrol penuh sistem"
  }
};

const TOOL_ACCESS_MAP = {
  qrGenerator: ["Free", "Premium", "VIP", "Pro", "Admin"],
  tikTokDownloader: ["Free", "Premium", "VIP", "Pro", "Admin"],
  instagramDownloader: ["Free", "Premium", "VIP", "Pro", "Admin"],
  createBaseBot: ["Premium", "VIP", "Pro", "Admin"],
};

function isAdminEmail(email) {
  return (email || "").trim().toLowerCase() === ADMIN_EMAIL;
}

function getRegisteredUsers() {
  try {
    const data = JSON.parse(localStorage.getItem(USER_REGISTRY_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

function addRegisteredUser(email) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return;
  }

  const users = getRegisteredUsers();
  if (!users.includes(cleanEmail)) {
    users.push(cleanEmail);
    localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(users));
  }

  const statusMap = getUserStatusMap();
  if (!(cleanEmail in statusMap)) {
    statusMap[cleanEmail] = true;
    localStorage.setItem(USER_STATUS_KEY, JSON.stringify(statusMap));
  }

  const roleMap = getUserRoleMap();
  if (!(cleanEmail in roleMap)) {
    roleMap[cleanEmail] = isAdminEmail(cleanEmail) ? "Admin" : "Free";
    localStorage.setItem(USER_ROLE_KEY, JSON.stringify(roleMap));
  }
}

function getUserStatusMap() {
  try {
    const data = JSON.parse(localStorage.getItem(USER_STATUS_KEY) || "{}");
    return data && typeof data === "object" ? data : {};
  } catch (error) {
    return {};
  }
}

function getUserStatus(email) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return true;
  }

  const statusMap = getUserStatusMap();
  return statusMap[cleanEmail] !== false;
}

function setUserStatus(email, isActive) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return;
  }

  const statusMap = getUserStatusMap();
  statusMap[cleanEmail] = Boolean(isActive);
  localStorage.setItem(USER_STATUS_KEY, JSON.stringify(statusMap));
}

function getUserRoleMap() {
  try {
    const data = JSON.parse(localStorage.getItem(USER_ROLE_KEY) || "{}");
    return data && typeof data === "object" ? data : {};
  } catch (error) {
    return {};
  }
}

function normalizeUserRole(role) {
  const value = (role || "").trim();
  if (!value) {
    return "Free";
  }

  const matchedRole = AVAILABLE_ROLES.find((option) => option.toLowerCase() === value.toLowerCase());
  return matchedRole || value;
}

function getRoleDefinition(role) {
  const normalizedRole = normalizeUserRole(role);
  return ROLE_DEFINITIONS[normalizedRole] || {
    price: "Custom",
    title: normalizedRole,
    benefit: "Akses sesuai pengaturan role user.",
    access: "Custom access"
  };
}

function canAccessTool(toolKey, userEmail) {
  const userRole = getUserRole(userEmail);
  const allowedRoles = TOOL_ACCESS_MAP[toolKey] || [];
  return allowedRoles.includes(userRole);
}

function getToolAccessInfo(toolKey) {
  const allowedRoles = TOOL_ACCESS_MAP[toolKey] || [];
  if (allowedRoles.length === 0) {
    return { isPublic: false, message: "Tool tidak tersedia", requiredRole: "Admin" };
  }

  const isPublic = allowedRoles.includes("Free");
  if (isPublic) {
    return { isPublic: true, message: "Gratis untuk semua", requiredRole: null };
  }

  const minimumRole = allowedRoles[0];
  return {
    isPublic: false,
    message: `Butuh ${minimumRole} atau lebih tinggi`,
    requiredRole: minimumRole
  };
}

function getUserRole(email) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return "Free";
  }

  if (isAdminEmail(cleanEmail)) {
    return "Admin";
  }

  const roleMap = getUserRoleMap();
  return normalizeUserRole(roleMap[cleanEmail] || "Free");
}

function checkAndShowToolAccess(toolKey, toolName, userEmail) {
  if (!userEmail) {
    return { canAccess: false, message: "Silakan login terlebih dahulu" };
  }

  if (canAccessTool(toolKey, userEmail)) {
    return { canAccess: true };
  }

  const info = getToolAccessInfo(toolKey);
  return {
    canAccess: false,
    message: `${toolName} butuh role ${info.requiredRole} ke atas. Silakan upgrade role Anda untuk mengakses.`
  };
}

function setUserRole(email, role) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return;
  }

  const nextRole = isAdminEmail(cleanEmail) ? "Admin" : normalizeUserRole(role || "Free");
  const roleMap = getUserRoleMap();
  roleMap[cleanEmail] = nextRole;
  localStorage.setItem(USER_ROLE_KEY, JSON.stringify(roleMap));
  return nextRole;
}

function removeRegisteredUser(email) {
  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    return false;
  }

  const users = getRegisteredUsers().filter((item) => item !== cleanEmail);
  localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(users));

  const statusMap = getUserStatusMap();
  delete statusMap[cleanEmail];
  localStorage.setItem(USER_STATUS_KEY, JSON.stringify(statusMap));

  const roleMap = getUserRoleMap();
  delete roleMap[cleanEmail];
  localStorage.setItem(USER_ROLE_KEY, JSON.stringify(roleMap));
  return true;
}

function clearAllRegisteredUsers() {
  localStorage.removeItem(USER_REGISTRY_KEY);
  localStorage.removeItem(USER_STATUS_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
}

function getProducts() {
  try {
    const data = JSON.parse(localStorage.getItem(PRODUCT_STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

function saveProducts(products) {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
}

function addProductEntry(productName, productPrice, productDesc, productPromo, productDiscount) {
  const name = (productName || "").trim();
  if (!name) {
    return false;
  }

  const products = getProducts();
  products.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name,
    price: (productPrice || "").trim() || "Rp 0",
    description: (productDesc || "").trim() || "Produk baru",
    promo: (productPromo || "").trim() || "Promo",
    discount: (productDiscount || "").trim() || "Diskon 10%",
    buttonText: "Beli Sekarang",
    buttonLink: "#"
  });
  saveProducts(products);
  return true;
}

function removeProductEntry(productId) {
  const products = getProducts().filter((item) => item.id !== productId);
  saveProducts(products);
}

function saveAdminAnnouncement(message) {
  localStorage.setItem(ADMIN_ANNOUNCEMENT_KEY, message || "");
}

function isAnnouncementEnabled() {
  return localStorage.getItem(ADMIN_ANNOUNCEMENT_ENABLED_KEY) !== "0";
}

function setAnnouncementEnabled(enabled) {
  localStorage.setItem(ADMIN_ANNOUNCEMENT_ENABLED_KEY, enabled ? "1" : "0");
}

function isMaintenanceModeEnabled() {
  return localStorage.getItem(MAINTENANCE_MODE_KEY) === "1";
}

function setMaintenanceMode(enabled) {
  localStorage.setItem(MAINTENANCE_MODE_KEY, enabled ? "1" : "0");
}

function getAdminAnnouncement() {
  return localStorage.getItem(ADMIN_ANNOUNCEMENT_KEY) || "Selamat datang di panel admin Qyroo.";
}

function getHomeAnnouncementText() {
  return isAnnouncementEnabled()
    ? getAdminAnnouncement()
    : "Pengumuman dinonaktifkan oleh admin.";
}

function getAdminStats() {
  return {
    totalUsers: getRegisteredUsers().length,
    announcement: getAdminAnnouncement(),
    adminEmail: ADMIN_EMAIL
  };
}

function resetAllUserData() {
  localStorage.removeItem(USER_REGISTRY_KEY);
  localStorage.removeItem(USER_STATUS_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(PROFILE_STORAGE_KEY);
  localStorage.removeItem(QUICK_NOTE_KEY);
  localStorage.removeItem(ADMIN_ANNOUNCEMENT_KEY);
  localStorage.removeItem(ADMIN_ANNOUNCEMENT_ENABLED_KEY);
  localStorage.removeItem(MAINTENANCE_MODE_KEY);
  localStorage.setItem(ADMIN_ANNOUNCEMENT_KEY, "Selamat datang di panel admin Qyroo.");
  localStorage.setItem(ADMIN_ANNOUNCEMENT_ENABLED_KEY, "1");
}

function handleAdminRedirect() {
  const user = firebase.auth().currentUser;
  if (!user) {
    return;
  }

  const currentPage = window.location.pathname.split("/").pop() || "home.html";

  if (isAdminEmail(user.email)) {
    if (currentPage !== "admin.html" && currentPage !== "index.html") {
      if (currentPage === "login.html" || currentPage === "register.html") {
        window.location.href = "admin.html";
      }
    }
    return;
  }

  if (currentPage === "admin.html") {
    window.location.href = "home.html";
  }
}

firebase.initializeApp(firebaseConfig);

// REGISTER
function register(){
  const email = document.getElementById("regUser").value;
  const password = document.getElementById("regPass").value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Register berhasil!");
      window.location.href = "login.html";
    })
    .catch(err => alert(err.message));
}

// LOGIN
function login(){
  const email = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "home.html";
    })
    .catch(err => alert(err.message));
}

// FORGOT PASSWORD
function forgotPassword(){
  const email = document.getElementById("loginUser").value;

  if(!email){
    alert("Masukkan email dulu!");
    return;
  }

  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert("Link reset password sudah dikirim ke email!");
    })
    .catch(err => alert(err.message));
}
// LOGOUT
function logout(){
  firebase.auth().signOut()
    .then(() => {
      window.location.href = "login.html";
    });
}

// THEME TOGGLE
function applyTheme(theme) {
  const selectedTheme = theme === "light" ? "light" : "dark";
  document.body.classList.toggle("light-mode", selectedTheme === "light");
  localStorage.setItem("qyroo-theme", selectedTheme);

  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  if (themeIcon) {
    themeIcon.textContent = selectedTheme === "light" ? "☾" : "☀";
  }

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      selectedTheme === "light"
        ? "Aktifkan mode gelap"
        : "Aktifkan mode terang"
    );
  }
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("qyroo-theme") || "dark";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  applyTheme(nextTheme);
  showToast(nextTheme === "dark" ? "Mode gelap aktif" : "Mode terang aktif");
}

// TOAST
function showToast(message, type = "info") {
  const toast = document.getElementById("globalToast");

  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.className = "toast";
  }, 2400);
}

// COPY EMAIL
async function copyUserEmail() {
  const emailText = document.getElementById("userEmail")?.innerText?.trim();

  if (!emailText || emailText === "Loading...") {
    showToast("Email belum tersedia", "error");
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(emailText);
      showToast("Email berhasil disalin");
      return;
    }

    const tempInput = document.createElement("input");
    tempInput.value = emailText;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    showToast("Email berhasil disalin");
  } catch (error) {
    showToast("Gagal menyalin email", "error");
  }
}

// HOME DASHBOARD
function updateDashboardClock() {
  const dateEl = document.getElementById("todayDate");
  const timeEl = document.getElementById("currentTime");

  if (!dateEl || !timeEl) {
    return;
  }

  const now = new Date();
  const dateText = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const timeText = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });

  dateEl.textContent = dateText;
  timeEl.textContent = timeText;
}

function initDashboardFeatures() {
  const savedTheme = localStorage.getItem("qyroo-theme") || "dark";
  applyTheme(savedTheme);

  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  updateDashboardClock();
  setInterval(updateDashboardClock, 1000 * 30);
}

document.addEventListener("DOMContentLoaded", initDashboardFeatures);

const PROFILE_STORAGE_KEY = "qyroo-profile-data";
const QUICK_NOTE_KEY = "qyroo-quick-note";

function getProfileData() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY) || "{}");
    return {
      displayName: saved.displayName || "Qyroo User",
      bio: saved.bio || "Pengguna Qyroo Gratis",
      role: saved.role || "Free"
    };
  } catch (error) {
    return {
      displayName: "Qyroo User",
      bio: "Pengguna Qyroo Gratis",
      role: "Free"
    };
  }
}

function saveProfileData(profileData) {
  const updated = { ...getProfileData(), ...profileData };
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

function applyUserProfile() {
  const profile = getProfileData();
  const currentUser = firebase && firebase.auth ? firebase.auth().currentUser : null;
  const currentRole = getUserRole(currentUser ? currentUser.email : profile.role);

  const usernameEl = document.getElementById("username");
  if (usernameEl) {
    usernameEl.textContent = profile.displayName;
  }

  const profileNameEl = document.getElementById("profileName");
  if (profileNameEl) {
    profileNameEl.textContent = profile.displayName;
  }

  const profileBioEl = document.getElementById("profileBio");
  if (profileBioEl) {
    profileBioEl.textContent = profile.bio;
  }

  const profileRoleEl = document.getElementById("profileRole");
  if (profileRoleEl) {
    profileRoleEl.textContent = currentRole;
  }

  const userRoleEl = document.getElementById("userRole");
  if (userRoleEl) {
    userRoleEl.textContent = currentRole;
  }

  const welcomeText = document.getElementById("welcomeText");
  if (welcomeText) {
    welcomeText.textContent = "Welcome back, " + profile.displayName;
  }
}

function loadQuickNote() {
  const noteField = document.getElementById("quickNote");
  if (!noteField) {
    return;
  }

  const savedNote = localStorage.getItem(QUICK_NOTE_KEY) || "";
  noteField.value = savedNote;
}

function saveQuickNote() {
  const noteField = document.getElementById("quickNote");
  const noteStatus = document.getElementById("noteStatus");

  if (!noteField) {
    return;
  }

  const noteValue = noteField.value.trim();
  localStorage.setItem(QUICK_NOTE_KEY, noteValue);

  if (noteStatus) {
    noteStatus.textContent = noteValue
      ? "Catatan berhasil disimpan."
      : "Catatan kosong, data sudah dibersihkan.";
  }

  showToast(noteValue ? "Catatan disimpan" : "Catatan dihapus");
}

function clearQuickNote() {
  const noteField = document.getElementById("quickNote");
  const noteStatus = document.getElementById("noteStatus");

  if (noteField) {
    noteField.value = "";
  }

  localStorage.removeItem(QUICK_NOTE_KEY);

  if (noteStatus) {
    noteStatus.textContent = "Catatan telah dihapus.";
  }

  showToast("Catatan dihapus");
}

document.addEventListener("DOMContentLoaded", function () {
  applyUserProfile();
  loadQuickNote();

  const saveButton = document.getElementById("saveNoteBtn");
  const clearButton = document.getElementById("clearNoteBtn");

  if (saveButton) {
    saveButton.addEventListener("click", saveQuickNote);
  }

  if (clearButton) {
    clearButton.addEventListener("click", clearQuickNote);
  }

  if (firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        addRegisteredUser(user.email);
        setUserRole(user.email, getUserRole(user.email));

        const adminAction = document.getElementById("adminQuickAction");
        if (adminAction) {
          adminAction.style.display = isAdminEmail(user.email) ? "inline-flex" : "none";
        }
      }

      handleAdminRedirect();
    });
  }
});

/* =========================================================
   QYROO BACKEND V2 BRIDGE
   Server is the source of truth for users, roles, products,
   favorites, settings and top-up. LocalStorage remains only
   as a small offline fallback for the old UI.
========================================================= */
(function(){
  const configured=(window.QYROO_API_BASE||localStorage.getItem('qyroo_api_base')||'').trim().replace(/\/$/,'');
  window.QYROO_API_BASE=configured || (location.protocol==='file:' ? 'http://127.0.0.1:3000/api' : '/api');
  async function api(path,options={}){
    const u=window.firebase?.auth?.().currentUser;
    const headers={Accept:'application/json',...(options.headers||{})};
    if(u) headers.Authorization='Bearer '+await u.getIdToken();
    let body=options.body;
    if(body && !(body instanceof FormData) && typeof body==='object'){
      headers['Content-Type']='application/json'; body=JSON.stringify(body);
    }
    const r=await fetch(window.QYROO_API_BASE+path,{...options,headers,body});
    const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={ok:false,error:text||`HTTP ${r.status}`}};
    if(!r.ok) throw new Error(data.error||data.message||`HTTP ${r.status}`);
    return data;
  }
  window.QyrooAPI={api};
  window.qyrooSyncUser=async()=>{try{if(window.firebase?.auth?.().currentUser){const d=await api('/users/sync',{method:'POST',body:{}});const email=window.firebase.auth().currentUser.email;const map=JSON.parse(localStorage.getItem(USER_ROLE_KEY)||'{}');map[String(email||'').toLowerCase()]=d.user?.role||'Free';localStorage.setItem(USER_ROLE_KEY,JSON.stringify(map));return d}}catch(e){console.warn('Qyroo sync:',e.message)}return null};
  if(window.firebase?.auth){window.firebase.auth().onAuthStateChanged(u=>{if(u)window.qyrooSyncUser()})}
})();

async function qyrooGetRole(email){
  try{const d=await QyrooAPI.api('/users/me');return d.user?.role||'Free'}catch{return getUserRole(email)}
}
function getUserRole(email){
  const clean=(email||'').trim().toLowerCase();
  if(clean===ADMIN_EMAIL.toLowerCase())return 'Admin';
  try{const m=JSON.parse(localStorage.getItem(USER_ROLE_KEY)||'{}');return normalizeUserRole(m[clean]||'Free')}catch{return 'Free'}
}
