# 🚖 QuickCab — Cab Booking System

A simple, clean cab booking web app built with pure **HTML, CSS, and JavaScript**.  
No frameworks. No installation needed. Just open `index.html` in your browser!

---

## 🌐 Live Demo
> Host on GitHub Pages — see setup steps below

---

## 📁 Project Structure

```
quickcab/
│
├── index.html   → Page structure (login, nav, layout)
├── style.css    → All visual styles and colors
├── app.js       → All logic (login, booking, admin)
└── README.md    → This file
```

---

## ✨ Features

### 👤 User Side
- Login with username & password
- Book a ride (pickup, drop, date, time, cab type)
- Live fare estimate before booking
- View all your bookings with status
- Profile page with ride history

### 🛡️ Admin Side
- Separate admin login
- Overview dashboard with stats
- View & cancel all bookings
- Manage drivers (activate/deactivate)
- Analytics with charts (booking status, cab demand, weekly revenue)

---

## 🔐 Demo Credentials

| Role  | Username | Password  |
|-------|----------|-----------|
| User  | ravi     | ravi123   |
| User  | priya    | priya123  |
| Admin | admin    | admin123  |

---

## 🚀 How to Run Locally

1. Download or clone this repo
2. Open `index.html` in any browser
3. That's it! ✅

```bash
git clone https://github.com/YOUR_USERNAME/quickcab.git
cd quickcab
open index.html
```

---

## 🌍 How to Host on GitHub Pages (Free)

1. Go to [github.com](https://github.com) and create a new repository named `quickcab`
2. Upload all 3 files: `index.html`, `style.css`, `app.js`
3. Go to **Settings → Pages**
4. Under **Source**, select `main` branch → `/ (root)` → Click **Save**
5. Your site will be live at: `https://YOUR_USERNAME.github.io/quickcab`

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5      | Page structure and layout |
| CSS3       | Styling, animations, responsive design |
| JavaScript | Logic, DOM manipulation, data handling |
| Google Fonts | Plus Jakarta Sans font |

---

## 📌 Key Concepts Used

- CSS Variables (`:root`) for easy theming
- CSS Grid & Flexbox for layout
- JavaScript DOM manipulation
- Array methods: `filter`, `map`, `find`, `reduce`
- Template literals for dynamic HTML
- `setTimeout` for async actions
- Object-based data storage

---

## 🔮 Future Improvements (Ideas)

- [ ] User registration page
- [ ] LocalStorage to save data on refresh
- [ ] Cancel booking (user side)
- [ ] Search & filter bookings
- [ ] Live trip status timer
- [ ] Print receipt button
- [ ] Admin: add/remove drivers
- [ ] Backend with Node.js + MongoDB

---

## 👨‍💻 Author

Built as a freelance portfolio project.  
Feel free to fork, modify, and use!

---

## 📄 License

MIT License — free to use for personal and commercial projects.
