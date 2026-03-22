/* ══════════════════════════════════════════════
   QuickCab — app.js
   All logic: login, booking, admin, rendering
   ══════════════════════════════════════════════ */


// ══════════════════════════════════════════════
// DATA — Users, Drivers, Bookings
// ══════════════════════════════════════════════

const ACCOUNTS = {
  admin: { pass: "admin123", role: "admin",  name: "Admin" },
  ravi:  { pass: "ravi123",  role: "user",   name: "Ravi Kumar",   phone: "98765 43210" },
  priya: { pass: "priya123", role: "user",   name: "Priya Sharma", phone: "91234 56789" },
};

const LOCATIONS = [
  "Chennai Central", "Airport", "Anna Nagar", "T. Nagar",
  "Velachery", "Adyar", "Tambaram", "Porur",
  "Nungambakkam", "Sholinganallur"
];

const DRIVERS = [
  { id: 1, name: "Suresh B.",  vehicle: "Swift Dzire",   plate: "TN01 AB 1234", rating: 4.8, status: "available", avatar: "🧑‍✈️" },
  { id: 2, name: "Karthik R.", vehicle: "Innova Crysta", plate: "TN02 CD 5678", rating: 4.7, status: "on-trip",   avatar: "👨‍✈️" },
  { id: 3, name: "Divya M.",   vehicle: "Hyundai i20",   plate: "TN03 EF 9012", rating: 4.9, status: "available", avatar: "👩‍✈️" },
  { id: 4, name: "Arun S.",    vehicle: "Toyota Etios",  plate: "TN04 GH 3456", rating: 4.5, status: "offline",   avatar: "🧑‍✈️" },
];

let BOOKINGS = [
  { id: "CB001", user: "Ravi Kumar",   pickup: "Chennai Central", drop: "Airport",       date: "2026-03-18", time: "08:00", cab: "Sedan", fare: 450, status: "completed", driver: "Suresh B."  },
  { id: "CB002", user: "Priya Sharma", pickup: "Anna Nagar",      drop: "T. Nagar",      date: "2026-03-20", time: "14:30", cab: "Mini",  fare: 180, status: "on-trip",   driver: "Karthik R." },
  { id: "CB003", user: "Ravi Kumar",   pickup: "Velachery",       drop: "Sholinganallur",date: "2026-03-21", time: "09:00", cab: "SUV",   fare: 320, status: "confirmed", driver: "Divya M."   },
];

// Fare per km for each cab type
const FARES = { Mini: 11, Sedan: 15, SUV: 22 };

// Cache distances so same route gives same estimate
const DISTANCES = {};


// ══════════════════════════════════════════════
// STATE — current session
// ══════════════════════════════════════════════

let currentUser  = null;   // logged-in user object
let currentRole  = null;   // "admin" or "user"
let activeTab    = "";     // which nav tab is open
let selectedCab  = "Sedan"; // which cab type is picked
let loginTabMode = "user"; // which login tab is active


// ══════════════════════════════════════════════
// LOGIN FUNCTIONS
// ══════════════════════════════════════════════

// Switch between User and Admin login tabs
function switchTab(mode) {
  loginTabMode = mode;

  // Update tab button styles
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active',
      (i === 0 && mode === 'user') || (i === 1 && mode === 'admin')
    );
  });

  // Update hint text
  document.getElementById('loginHint').innerHTML = mode === 'user'
    ? '<b>Demo — User:</b> ravi / ravi123 &nbsp;|&nbsp; priya / priya123'
    : '<b>Demo — Admin:</b> admin / admin123';

  document.getElementById('loginErr').style.display = 'none';
}

// Handle login form submission
function doLogin() {
  const username = document.getElementById('loginUser').value.trim().toLowerCase();
  const password = document.getElementById('loginPass').value;
  const errEl    = document.getElementById('loginErr');
  const account  = ACCOUNTS[username];

  // Check credentials
  if (!account || account.pass !== password) {
    errEl.textContent = '❌ Invalid credentials. Please try again.';
    errEl.style.display = 'block';
    return;
  }

  // Check role matches the selected tab
  if (loginTabMode === 'admin' && account.role !== 'admin') {
    errEl.textContent = '❌ Not an admin account.';
    errEl.style.display = 'block';
    return;
  }
  if (loginTabMode === 'user' && account.role !== 'user') {
    errEl.textContent = '❌ Use Admin Login for admin accounts.';
    errEl.style.display = 'block';
    return;
  }

  // Login success — save user and show app
  currentUser = { username, ...account };
  currentRole = account.role;
  errEl.style.display = 'none';

  document.getElementById('loginPage').classList.remove('active');
  document.getElementById('appShell').classList.add('active');
  document.getElementById('navUser').textContent = account.name;

  buildNav();
}

// Logout — clear session and go back to login
function logout() {
  currentUser = null;
  document.getElementById('appShell').classList.remove('active');
  document.getElementById('loginPage').classList.add('active');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}


// ══════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════

// Build nav links based on role
function buildNav() {
  const tabs = currentRole === 'admin'
    ? ['Overview', 'Bookings', 'Drivers', 'Analytics']
    : ['Book a Ride', 'My Bookings', 'Profile'];

  const navEl = document.getElementById('navLinks');
  navEl.innerHTML = tabs
    .map(t => `<button class="nav-link" onclick="showSection('${t}')">${t}</button>`)
    .join('');

  showSection(tabs[0]); // show first tab by default
}

// Show the clicked section
function showSection(name) {
  activeTab = name;

  // Highlight active nav link
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === name);
  });

  // Render content
  const container = document.getElementById('appContent');
  container.innerHTML = '';

  if (currentRole === 'admin') renderAdmin(name, container);
  else                         renderUser(name, container);
}


// ══════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════

// Return a colored status badge HTML
function badge(status) {
  const colorMap = {
    completed: 'green',
    'on-trip':  'yellow',
    confirmed:  'blue',
    cancelled:  'red',
    available:  'green',
    offline:    'gray',
  };
  return `<span class="badge badge-${colorMap[status] || 'gray'}">${status}</span>`;
}

// Return a stat card HTML block
function statCard(icon, value, label) {
  return `
    <div class="stat-card">
      <div class="stat-icon">${icon}</div>
      <div class="stat-val">${value}</div>
      <div class="stat-label">${label}</div>
    </div>`;
}

// Get only the current user's bookings
function myBookings() {
  return BOOKINGS.filter(b => b.user === currentUser.name);
}

// Estimate ride fare based on distance and cab type
function estimateFare(pickup, drop, cabType) {
  const key = pickup + drop;
  if (!DISTANCES[key]) {
    DISTANCES[key] = Math.floor(Math.random() * 18 + 4); // random 4–22 km
  }
  return DISTANCES[key] * FARES[cabType] + 30; // base fare ₹30
}


// ══════════════════════════════════════════════
// USER — RENDER SECTIONS
// ══════════════════════════════════════════════

function renderUser(tab, container) {
  if (tab === 'Book a Ride') container.innerHTML = bookRideHTML();
  if (tab === 'My Bookings') container.innerHTML = myBookingsHTML();
  if (tab === 'Profile')     container.innerHTML = profileHTML();
}

// ── Book a Ride Page ──
function bookRideHTML() {
  const cabTypes = [
    ['Mini',  '🚗', 'Hatchback · ₹11/km'],
    ['Sedan', '🚕', 'Comfortable · ₹15/km'],
    ['SUV',   '🚙', 'Spacious · ₹22/km'],
  ];

  return `
    <div class="card">
      <h2>🗺️ Book Your Ride</h2>

      <div id="successMsg" class="success-msg">
        ✅ Ride booked! Driver is on the way.
      </div>

      <div class="form-grid">
        <div class="field">
          <label>PICKUP LOCATION</label>
          <select id="fPickup" onchange="updateFare()">
            <option value="">-- Select Pickup --</option>
            ${LOCATIONS.map(l => `<option>${l}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>DROP LOCATION</label>
          <select id="fDrop" onchange="updateFare()">
            <option value="">-- Select Drop --</option>
            ${LOCATIONS.map(l => `<option>${l}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>DATE</label>
          <input type="date" id="fDate" value="2026-03-22" />
        </div>
        <div class="field">
          <label>TIME</label>
          <input type="time" id="fTime" value="10:00" />
        </div>
      </div>

      <label style="margin-top:8px;display:block">CAB TYPE</label>
      <div class="cab-options">
        ${cabTypes.map(([type, icon, desc]) => `
          <div class="cab-opt ${type === 'Sedan' ? 'selected' : ''}"
               onclick="selectCab('${type}', this)">
            <div class="ico">${icon}</div>
            <div class="name">${type}</div>
            <div class="price">${desc}</div>
          </div>`).join('')}
      </div>

      <div class="fare-box" id="fareBox" style="display:none">
        <span class="fare-label">Estimated Fare</span>
        <span class="fare-val" id="fareVal">₹0</span>
      </div>

      <button class="btn btn-yellow" onclick="bookRide()" style="margin-top:8px">
        Book Now 🚖
      </button>
    </div>`;
}

// Called when cab type is clicked
function selectCab(type, el) {
  selectedCab = type;
  document.querySelectorAll('.cab-opt').forEach(e => e.classList.remove('selected'));
  el.classList.add('selected');
  updateFare();
}

// Update fare estimate live
function updateFare() {
  const pickup  = document.getElementById('fPickup').value;
  const drop    = document.getElementById('fDrop').value;
  const fareBox = document.getElementById('fareBox');

  if (pickup && drop && pickup !== drop) {
    fareBox.style.display = 'flex';
    document.getElementById('fareVal').textContent = '₹' + estimateFare(pickup, drop, selectedCab);
  } else {
    fareBox.style.display = 'none';
  }
}

// Create a new booking
function bookRide() {
  const pickup = document.getElementById('fPickup').value;
  const drop   = document.getElementById('fDrop').value;
  const date   = document.getElementById('fDate').value;
  const time   = document.getElementById('fTime').value;

  // Validation
  if (!pickup || !drop || pickup === drop) {
    alert('Please select valid pickup and drop locations.');
    return;
  }

  // Find an available driver
  const driver = DRIVERS.find(d => d.status === 'available');
  const fare   = estimateFare(pickup, drop, selectedCab);

  // Add booking to the list
  BOOKINGS.unshift({
    id:     'CB' + String(Date.now()).slice(-3),
    user:   currentUser.name,
    pickup, drop, date, time,
    cab:    selectedCab,
    fare,
    status: 'confirmed',
    driver: driver ? driver.name : 'Assigning...',
  });

  // Show success message
  const msg = document.getElementById('successMsg');
  msg.style.display = 'block';

  // Reset form
  document.getElementById('fPickup').value = '';
  document.getElementById('fDrop').value   = '';
  document.getElementById('fareBox').style.display = 'none';

  // Hide message after 4 seconds
  setTimeout(() => { msg.style.display = 'none'; }, 4000);
}

// ── My Bookings Page ──
function myBookingsHTML() {
  const bookings = myBookings();

  if (!bookings.length) {
    return `<div class="card"><h2>📋 My Bookings</h2><p style="color:var(--muted)">No bookings yet.</p></div>`;
  }

  return `
    <div class="card">
      <h2>📋 My Bookings</h2>
      <div class="tbl-wrap">
        <table>
          <tr>
            <th>ID</th><th>Pickup</th><th>Drop</th><th>Date</th>
            <th>Cab</th><th>Driver</th><th>Fare</th><th>Status</th>
          </tr>
          ${bookings.map(b => `
            <tr>
              <td style="color:var(--yellow);font-weight:700">${b.id}</td>
              <td>${b.pickup}</td>
              <td>${b.drop}</td>
              <td style="color:var(--muted)">${b.date} ${b.time}</td>
              <td>${b.cab}</td>
              <td>${b.driver}</td>
              <td style="font-weight:700">₹${b.fare}</td>
              <td>${badge(b.status)}</td>
            </tr>`).join('')}
        </table>
      </div>
    </div>`;
}

// ── Profile Page ──
function profileHTML() {
  const u   = currentUser;
  const acc = ACCOUNTS[u.username];

  return `
    <div class="profile-card">
      <div class="profile-avatar">👤</div>
      <div class="profile-name">${u.name}</div>
      <div class="profile-sub">@${u.username}</div>
      <div class="profile-row"><span class="profile-key">📞 Phone</span><span>${acc.phone || '–'}</span></div>
      <div class="profile-row"><span class="profile-key">📧 Email</span><span>${u.username}@quickcab.com</span></div>
      <div class="profile-row"><span class="profile-key">🚖 Total Rides</span><span>${myBookings().length + 3}</span></div>
      <div class="profile-row"><span class="profile-key">💰 Total Spent</span><span>₹${myBookings().reduce((a, b) => a + b.fare, 0) + 650}</span></div>
      <div class="profile-row"><span class="profile-key">🏆 Loyalty Points</span><span style="color:var(--yellow)">340 pts</span></div>
    </div>`;
}


// ══════════════════════════════════════════════
// ADMIN — RENDER SECTIONS
// ══════════════════════════════════════════════

function renderAdmin(tab, container) {
  if (tab === 'Overview')  container.innerHTML = adminOverviewHTML();
  if (tab === 'Bookings')  container.innerHTML = adminBookingsHTML();
  if (tab === 'Drivers')   container.innerHTML = adminDriversHTML();
  if (tab === 'Analytics') container.innerHTML = adminAnalyticsHTML();
}

// ── Admin Overview Page ──
function adminOverviewHTML() {
  const total    = BOOKINGS.length;
  const active   = BOOKINGS.filter(b => b.status === 'on-trip').length;
  const revenue  = BOOKINGS.reduce((a, b) => a + b.fare, 0) + 2400;
  const avail    = DRIVERS.filter(d => d.status === 'available').length;

  return `
    <div class="stats">
      ${statCard('📋', total,                    'Total Bookings')}
      ${statCard('🟢', active,                   'Active Trips')}
      ${statCard('👨‍✈️', avail + '/' + DRIVERS.length, 'Drivers Available')}
      ${statCard('💰', '₹' + revenue,            'Total Revenue')}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">

      <!-- Driver Status List -->
      <div class="card">
        <h2>🚕 Driver Status</h2>
        ${DRIVERS.map(d => `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:32px">${d.avatar}</span>
            <div style="flex:1">
              <div style="font-weight:700;font-size:14px">${d.name}</div>
              <div style="font-size:12px;color:var(--muted)">${d.vehicle} · ⭐${d.rating}</div>
            </div>
            ${badge(d.status)}
          </div>`).join('')}
      </div>

      <!-- Recent Bookings -->
      <div class="card">
        <h2>📋 Recent Bookings</h2>
        ${BOOKINGS.slice(0, 4).map(b => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
            <div>
              <div style="font-weight:700;color:var(--yellow);font-size:13px">${b.id}</div>
              <div style="font-size:12px;color:var(--muted)">${b.pickup} → ${b.drop}</div>
              <div style="font-size:12px;color:var(--muted)">${b.user}</div>
            </div>
            <div style="text-align:right">
              <div style="font-weight:700">₹${b.fare}</div>
              ${badge(b.status)}
            </div>
          </div>`).join('')}
      </div>

    </div>`;
}

// ── Admin All Bookings Page ──
function adminBookingsHTML() {
  return `
    <div class="card">
      <h2>📋 All Bookings</h2>
      <div class="tbl-wrap">
        <table>
          <tr>
            <th>ID</th><th>User</th><th>Pickup</th><th>Drop</th>
            <th>Date</th><th>Driver</th><th>Cab</th><th>Fare</th>
            <th>Status</th><th>Action</th>
          </tr>
          ${BOOKINGS.map(b => `
            <tr>
              <td style="color:var(--yellow);font-weight:700">${b.id}</td>
              <td>${b.user}</td>
              <td>${b.pickup}</td>
              <td>${b.drop}</td>
              <td style="color:var(--muted);font-size:12px">${b.date}<br/>${b.time}</td>
              <td>${b.driver}</td>
              <td>${b.cab}</td>
              <td style="font-weight:700">₹${b.fare}</td>
              <td>${badge(b.status)}</td>
              <td>
                ${b.status !== 'cancelled' && b.status !== 'completed'
                  ? `<button class="btn-red" onclick="cancelBooking('${b.id}')">Cancel</button>`
                  : '–'}
              </td>
            </tr>`).join('')}
        </table>
      </div>
    </div>`;
}

// Cancel a booking (admin only)
function cancelBooking(id) {
  BOOKINGS = BOOKINGS.map(b =>
    b.id === id ? { ...b, status: 'cancelled' } : b
  );
  showSection('Bookings'); // refresh table
}

// ── Admin Drivers Page ──
function adminDriversHTML() {
  return `
    <div class="driver-grid">
      ${DRIVERS.map(d => `
        <div class="driver-card">
          <div class="driver-avatar">${d.avatar}</div>
          <div style="flex:1">
            <div class="driver-name">${d.name}</div>
            <div class="driver-info">
              🚘 ${d.vehicle}<br/>
              🔖 ${d.plate}<br/>
              ⭐ ${d.rating} rating
            </div>
            <div class="driver-actions">
              ${badge(d.status)}
              <button class="btn-outline" style="font-size:12px;padding:5px 12px"
                      onclick="toggleDriver(${d.id})">
                ${d.status === 'offline' ? 'Activate' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

// Toggle driver online / offline
function toggleDriver(id) {
  const driver = DRIVERS.find(d => d.id === id);
  if (driver) {
    driver.status = driver.status === 'offline' ? 'available' : 'offline';
  }
  showSection('Drivers'); // refresh
}

// ── Admin Analytics Page ──
function adminAnalyticsHTML() {
  const statusData = [
    ['Completed', 12, 'var(--green)'],
    ['On-Trip',    2, 'var(--yellow)'],
    ['Confirmed',  3, 'var(--blue)'],
    ['Cancelled',  1, 'var(--red)'],
  ];
  const cabData = [
    ['Sedan', 9, 'var(--blue)'],
    ['Mini',  5, 'var(--yellow)'],
    ['SUV',   4, '#a855f7'],
  ];
  const weekData = [
    ['Mon', 820], ['Tue', 1100], ['Wed', 650],
    ['Thu', 940], ['Fri', 1380], ['Sat', 1650], ['Sun', 890],
  ];

  const statusTotal = statusData.reduce((a, i) => a + i[1], 0);
  const cabTotal    = cabData.reduce((a, i) => a + i[1], 0);
  const maxWeek     = Math.max(...weekData.map(w => w[1]));

  // Build bar rows
  function barRows(data, total) {
    return data.map(([label, val, color]) => {
      const pct = Math.round((val / total) * 100);
      return `
        <div class="bar-row">
          <div class="bar-label">
            <span>${label}</span>
            <span style="color:${color};font-weight:700">${val} (${pct}%)</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%;background:${color}"></div>
          </div>
        </div>`;
    }).join('');
  }

  return `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:18px">

      <div class="card">
        <h2>📊 Booking Status</h2>
        ${barRows(statusData, statusTotal)}
      </div>

      <div class="card">
        <h2>🚗 Cab Type Demand</h2>
        ${barRows(cabData, cabTotal)}
      </div>

    </div>

    <div class="card">
      <h2>💰 Revenue This Week</h2>
      <div class="week-chart">
        ${weekData.map(([day, val]) => `
          <div class="week-bar">
            <div class="week-amt">₹${val}</div>
            <div class="week-bar-inner" style="height:${Math.round(val / maxWeek * 80)}px"></div>
            <div class="week-day">${day}</div>
          </div>`).join('')}
      </div>
    </div>`;
}
