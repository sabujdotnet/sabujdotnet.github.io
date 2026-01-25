# BuildLedger - Construction Financial Tracker

## Overview
BuildLedger is a mobile ledger app designed for construction business owners to track all income and expenses in one place. It features weekly labor payment tracking that automatically syncs to the main transaction tracker, and a plugin system for future extensibility.

## Current State
- **Version**: 1.0.0
- **Status**: MVP Complete
- **Last Updated**: January 2026

## Project Architecture

### Tech Stack
- **Frontend**: React Native (Expo) with TypeScript
- **Backend**: Express.js with TypeScript
- **Storage**: AsyncStorage for local persistence
- **Navigation**: React Navigation v7 with bottom tabs

### Directory Structure
```
client/
├── App.tsx                    # Root app component
├── components/                # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── CategoryFilter.tsx
│   ├── EmptyState.tsx
│   ├── FAB.tsx
│   ├── HeaderTitle.tsx
│   ├── InputField.tsx
│   ├── LaborPaymentCard.tsx
│   ├── PeriodSelector.tsx
│   ├── PluginCard.tsx
│   ├── SegmentedControl.tsx
│   ├── SummaryCard.tsx
│   ├── TransactionCard.tsx
│   └── WeekSelector.tsx
├── constants/
│   └── theme.ts               # Colors, typography, spacing
├── hooks/
│   ├── useColorScheme.ts
│   ├── useScreenOptions.ts
│   └── useTheme.ts
├── lib/
│   ├── query-client.ts        # API client setup
│   └── storage.ts             # AsyncStorage utilities
├── navigation/
│   ├── DashboardStackNavigator.tsx
│   ├── LaborStackNavigator.tsx
│   ├── MainTabNavigator.tsx
│   ├── MoreStackNavigator.tsx
│   ├── RootStackNavigator.tsx
│   └── TransactionsStackNavigator.tsx
├── screens/
│   ├── AddPaymentScreen.tsx
│   ├── AddTransactionScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── LaborScreen.tsx
│   ├── MoreScreen.tsx
│   ├── PaymentDetailScreen.tsx
│   ├── PluginsScreen.tsx
│   ├── ReportsScreen.tsx
│   ├── SettingsScreen.tsx
│   ├── TransactionDetailScreen.tsx
│   └── TransactionsScreen.tsx
└── types/
    └── index.ts               # TypeScript interfaces
```

### Key Features
1. **Dashboard**: Overview with income, expenses, and net profit summaries
2. **Transaction Tracking**: Add/view/delete income and expenses by category
3. **Labor Management**: Weekly payroll tracking with worker management
4. **Auto-Sync**: Labor payments automatically create expense transactions
5. **Reports**: Financial breakdown by category with visual charts
6. **Plugin System**: Extensible architecture for future features

### Categories
- Income (Green)
- Materials (Amber/Orange)
- Labor (Blue)
- Equipment (Gray)
- Other (Light Gray)

### Plugin Architecture
The app includes a plugin system for future extensibility:
- Plugins are stored in AsyncStorage
- Each plugin has: id, name, description, version, icon, isInstalled, isEnabled
- Available plugins: Invoice Generator, Project Tracker, Tax Calculator, Receipt Scanner, Budget Planner, Export Reports

## User Preferences
- Currency: Indian Rupee (INR)
- Design: Brutally minimal with industrial accents
- Primary Color: #FF6B35 (Construction Orange)
- Secondary Color: #004E89 (Steel Blue)

## Recent Changes
- Initial MVP build with all core features
- Dashboard with period filtering (week/month/year)
- Transaction CRUD with category filtering
- Weekly labor payment tracking
- Auto-sync of paid labor to transactions
- Plugin management interface
- Reports with expense breakdown
- Settings with data management

## Development Notes
- Frontend runs on port 8081 (Expo)
- Backend runs on port 5000 (Express)
- All data persisted locally via AsyncStorage
- Haptic feedback enabled for interactions
- Dark mode supported
