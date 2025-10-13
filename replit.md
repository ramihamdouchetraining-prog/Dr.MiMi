# Dr.MiMi - Plateforme d'Éducation Médicale

## Overview
Dr.MiMi is a comprehensive medical education platform for French-speaking medical students, residents, and pre-med students. It offers structured educational content including courses, summaries, quizzes, and clinical cases, alongside interactive learning tools. The platform features a modern CMS, a professional RBAC system with 5 roles, full internationalization (FR/EN/AR), and a unique medical-themed magical feminine design with 15+ animated avatars. Dr.MiMi aims to be an essential educational toolkit, blending structured learning with advanced content management and role-based access, supporting a hybrid free/paid content monetization model.

## User Preferences
- **Language**: French (primary), English, Arabic with RTL
- **Design**: Medical-themed magical feminine interface
- **Content**: Educational focus with structured medical modules
- **Audience**: Medical students, residents, and pre-med students
- **Monetization**: Hybrid free/paid content with DZD/EUR support

## System Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express + TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Drizzle ORM
- **Editor**: TipTap v2 with 22 extensions
- **i18n**: i18next + react-i18next (FR/EN/AR)
- **Deployment**: Replit

### UI/UX Decisions
- **Design Theme**: Medical-themed magical feminine interface with 15+ animated Dr. Mimi avatars.
- **Color Scheme**: Primary Teal, Secondary Blue, Accent Amber, Neutral Dark Blue.
- **Typography**: Inter (display/text), JetBrains Mono (code).
- **Theming**: 10 available themes including "Jardin Rose" and "Ramadan Lunaire".
- **Animations**: Fluid animations with cubic-bezier transitions, daily carousel, interactive MimiAnimated.

### System Design Choices
- **RBAC System**: 5 hierarchical roles (Owner, Admin, Editor, Viewer, Consultant) with granular permissions for content and user management.
- **CMS**: Block-based TipTap editor with custom extensions (ImageGallery, Callout, PaywallBlock), medical templates, slash commands, SEO panel, versioning, and i18n support.
- **PWA**: Offline-first service worker, installable for Android/iOS, and complete manifest for PWA functionality.
- **Owner Dashboard**: Dedicated login, centralized authentication, with tabs for Overview, Financial Analytics (real-time, multi-currency, revenue sharing), Contracts (e-signatures, PDF export), Approvals, Users (role management, blacklist, badges), and Settings. Includes advanced user management features.
- **"La Bib de mimi" (مكتبة ميمي) - Digital Library System**: A 3-section collaborative digital library for Islamic, Diverse, and Palestine-focused content. Features advanced search, community ratings, collaborative submission with moderation, and multi-themed UI/UX.
- **User Tracking & Statistics System**: Tracks course enrollments, quiz attempts, case completions, summary downloads, and user badges. Provides real-time performance metrics on user profiles, including progress tracking and an achievement system.

## External Dependencies
- **PostgreSQL**: Primary database.
- **Stripe**: For EUR payments (planned).
- **Google Gemini API**: For Dr.MiMi AI chatbot (gemini-2.0-flash model - stable, FREE tier with 1M tokens/min), including advanced system prompts with specific character traits and multi-language support.