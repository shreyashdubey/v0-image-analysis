# Momentum - Personal Task & Time Orchestrator

*Reclaim your time with intelligent task scheduling*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/shreyashs-projects-ee8b7656/v0-image-analysis)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/xKMgQH5ULxR)

## 🚀 Overview

Momentum is a smart personal task and time management application that automatically schedules your tasks based on your availability. It helps you stay organized and productive by intelligently fitting tasks into your free time slots.

## ✨ Features

- **📅 Smart Scheduling**: Automatically schedules tasks based on your defined availability
- **⏰ Task Management**: Create, edit, and track tasks with priorities and durations
- **📊 Dashboard View**: Timeline and list views for your daily tasks
- **🔔 Task Reminders**: Get notified when tasks are due with snooze options
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **📥 JSON Import**: Bulk import tasks from JSON files
- **⚙️ Availability Settings**: Define your working hours for each day of the week
- **🎯 Priority System**: 5-level priority system for task organization

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Forms**: React Hook Form with Zod validation
- **Storage**: Local Storage (client-side)

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/shreyashdubey/v0-image-analysis.git
   cd v0-image-analysis
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Setting Up Your Availability

1. Go to **Settings** in the navigation
2. Define your available hours for each day of the week
3. Set your default snooze duration
4. Save your changes

### Adding Tasks

1. Click the **"Add Task"** button
2. Fill in task details:
   - Task name (required)
   - Description (optional)
   - Duration and unit (minutes/hours)
   - Priority level (1-5)
   - Specific date/time (optional - will auto-schedule if not set)
3. Submit to add the task

### Managing Tasks

- **Dashboard**: View tasks in timeline or list format
- **Calendar**: See tasks across different days
- **Complete Tasks**: Click the checkmark to mark tasks as done
- **Task Reminders**: Get notifications with options to snooze, reschedule, or complete

### Importing Tasks

1. Go to **Import Tasks** page
2. Upload a JSON file with the following format:
   \`\`\`json
   {
     "tasks": [
       {
         "datetime": "2025-06-01T14:00:00",
         "task_name": "Study for Exam",
         "task_details": "Revise chapters 4-6 from textbook",
         "priority": 2,
         "duration_minutes": 90
       }
     ]
   }
   \`\`\`

## 🏗️ Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── calendar/          # Calendar page
│   ├── dashboard/         # Main dashboard
│   ├── import/           # Task import functionality
│   ├── settings/         # Availability settings
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── dashboard-view.tsx
│   ├── calendar-view.tsx
│   ├── task-form-modal.tsx
│   └── ...
├── lib/                 # Utility functions and data management
│   ├── tasks.ts         # Task management logic
│   ├── availability.ts  # Availability management
│   └── utils.ts         # General utilities
└── README.md
\`\`\`

## 🔧 Configuration

The app uses local storage for data persistence. Key configuration includes:

- **Tasks**: Stored in `momentum_tasks` localStorage key
- **Availability**: Stored in `momentum_availability` localStorage key
- **Auto-scheduling**: Based on defined availability slots and existing task conflicts

## 🚀 Deployment

This project is automatically deployed on Vercel and synced with v0.dev:

- **Live URL**: [https://vercel.com/shreyashs-projects-ee8b7656/v0-image-analysis](https://vercel.com/shreyashs-projects-ee8b7656/v0-image-analysis)
- **v0.dev Project**: [https://v0.dev/chat/projects/xKMgQH5ULxR](https://v0.dev/chat/projects/xKMgQH5ULxR)

### Manual Deployment

To deploy manually:

1. **Vercel** (Recommended)
   \`\`\`bash
   npm install -g vercel
   vercel
   \`\`\`

2. **Other platforms**: The app is a standard Next.js application and can be deployed on any platform that supports Node.js.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [v0.dev](https://v0.dev) - AI-powered development platform
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/shreyashdubey/v0-image-analysis/issues) page
2. Create a new issue if your question isn't already answered
3. For urgent support, contact through [Vercel Help](https://vercel.com/help)

---

**Happy task managing! 🎯**
