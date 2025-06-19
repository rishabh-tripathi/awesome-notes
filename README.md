# Research Hub - Productivity Dashboard

A beautiful, modern productivity application built with Next.js, featuring secure authentication, smart task management, and advanced note-taking capabilities.

## 🔐 Authentication

The application is protected by a login system with static credentials:

- **Username:** `rishabh`
- **Password:** `R3s3@rch#Hub2024!`

> **Note:** This is a demo application using static credentials stored in the code. In production, implement proper authentication with a backend service.

## ✨ Features

### 🏠 Beautiful Homepage
- Modern, glassmorphism design with animated backgrounds
- Real-time statistics dashboard showing your productivity metrics
- Interactive feature cards with hover effects
- Productivity tips and keyboard shortcuts guide
- Responsive design that works on all devices

### 📋 Smart Task Management
- Create and organize multiple to-do lists
- Add, edit, complete, and delete tasks
- Real-time progress tracking and completion statistics
- Responsive 4-column layout
- Local storage persistence

### 📝 Advanced Note Taking
- Create and manage multiple note collections
- Rich text editing with Markdown support
- Live preview mode for formatted text
- Auto-save functionality (saves 1 second after typing stops)
- Full-text search across all notes
- Word count and character count metrics
- Recent notes panel for quick access
- Note duplication feature
- Keyboard shortcuts for power users

### 🔄 Data Management
- Export all data or specific sections (todos/notes only)
- Import data from JSON files
- Automatic backup with timestamped filenames
- Data validation and error handling
- Non-destructive imports

### ⌨️ Keyboard Shortcuts
- `⌘/Ctrl + N`: Create new item
- `⌘/Ctrl + S`: Save current note
- `⌘/Ctrl + F`: Focus search
- `⌘/Ctrl + P`: Toggle preview mode
- `Esc`: Cancel current action

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Sign in:**
   Use the credentials provided above to access the application

## 🛠️ Technology Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Storage:** Browser localStorage
- **Authentication:** Client-side with localStorage persistence
- **Icons:** Heroicons (via Tailwind)

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Touch interfaces

## 🔒 Security Features

- Protected routes with authentication wrapper
- Session persistence across browser sessions
- Secure logout functionality
- Data stored locally in browser (no external servers)

## 📊 Data Storage

All data is stored locally in your browser using localStorage:
- `research-app-authenticated`: Authentication status
- `todoLists`: All to-do lists and tasks
- `noteLists`: All note collections and notes

## 🎨 Design Features

- **Glassmorphism UI:** Modern glass-like effects with backdrop blur
- **Animated Backgrounds:** Floating orbs and gradient animations
- **Dark Theme:** Sophisticated dark color scheme
- **Smooth Transitions:** Hover effects and state changes
- **Professional Typography:** Carefully chosen fonts and spacing

## 🚧 Future Enhancements

Potential improvements for future versions:
- Real backend authentication
- Cloud synchronization
- Collaborative features
- Mobile app versions
- Advanced text formatting
- File attachments
- Reminder notifications

## 📄 License

This project is open source and available under the MIT License.

---

**Research Hub** - Organize your digital life with style and efficiency. 🚀
