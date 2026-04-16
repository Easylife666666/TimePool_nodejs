# 🕒 TIME POOL - Dynamic Time Management System
## Vibe coding by antigravity with gemini-3-flash. Bug maybe exists.
A high-efficiency time management tool built with **React + Vite**. It features a rolling "8-day window" and "dynamic occupancy" logic to help you visualize and control every minute of your life.

---

## 🌟 Key Features

- **📅 8-Day Rolling Viewport**: Displays "Today + Next 7 Days" with support for dragging blocks between dates.
- **🌑 Anti-Gravity Reset Rule**: Automatically resets at **1:00 AM** daily. Expired days phase out, and upcoming days are auto-populated with your templates.
- **⚖️ Dynamic Occupancy Logic**: Block Occupancy = `Total Duration - Completed Time`. A task stays in the pool until it is actually finished!
- **🎨 Custom Categories (New)**: Create infinite categories (Work, Sleep, Reading, Gaming) and customize their accent colors.
- **⚡ Batch Action Engine**:
  - **Quick Templates**: Apply standard routines to a single day or the entire week.
  - **Smart Selection**: Multi-select individual tasks, select all on a day, or select the entire week in one click.
  - **Bulk Delete**: Remove selected planning blocks instantly.
- **🖱️ Intuitive Interactions**:
  - **Drag-and-Drop**: Move tasks across the timeline like physical sticky notes.
  - **Micro-Adjustments**: Quick-toggle buttons for `+0.5h`, `-0.5h`, `Full`, and `Clear`.
  - **Premium Aesthetics**: Dark glassmorphism design with vibrant glowing accents for focus.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed.
I use nvm to install node 24 and etc.

### 2. Initialization & Execution
Run the following in your terminal:

```bash
cd src
npm install  #if you have not install it.
npm run dev
```

### 3. Open Application
Visit: `http://localhost:5173/`

---

## 📂 Data Storage

- **Storage Engine**: This app uses Browser **LocalStorage**.
- **Privacy Focus**: Your data is stored locally in your browser and is never uploaded to any server.
- **Backup Note**: Data is tied to your browser profile. Exporting data functionality is currently in the works!
- **Data Inspection**: View the raw JSON data in Browser DevTools (F12) -> Application -> Local Storage -> `time-pools`.

---

## 🛠️ Operating Instructions

1. **Dashboard**:
   - Use the `CheckSquare` icon in the sidebar to select all tasks for the week.
   - Use the `LayoutGrid` icon to apply your daily template to all days in the current sliding window.
2. **Template Management (Settings)**:
   - Define recurring "must-do" tasks (e.g., Sleep, Meals). New days will auto-populate with these blocks.
3. **Category Management (Types)**:
   - Customize category names and colors. Changes reflect instantly across all existing and future blocks on the dashboard.

---

## 🧪 Tech Stack

- **Framework**: React 18 (Vite + SWC)
- **State Engine**: Custom React Hook (`usePoolManager`)
- **Animation**: Framer Motion
- **Iconography**: Lucide React
- **Date Utility**: date-fns

---

Master your time, reclaim your life! 🚀
