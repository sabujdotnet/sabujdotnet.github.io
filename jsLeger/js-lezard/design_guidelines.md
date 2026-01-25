# Construction Ledger App - Design Guidelines

## Brand Identity

**Purpose**: A reliable financial tracker for construction business owners to monitor cash flow, labor costs, and project expenses in real-time.

**Aesthetic Direction**: **Brutally minimal** with industrial accents - emphasizing clarity and trust through clean data presentation, generous whitespace, and confident typography. Construction is about precision; the interface should reflect that with sharp edges, clear hierarchy, and zero visual clutter.

**Memorable Element**: Bold numeric displays with currency formatting and distinctive category color coding (materials=amber, labor=blue, equipment=gray).

## Navigation Architecture

**Root Navigation**: Bottom Tab Bar (4 tabs)
- **Dashboard** (Home icon) - Overview, charts, quick stats
- **Transactions** (List icon) - All income/expense entries
- **Labor** (Users icon) - Weekly payroll tracking
- **More** (Menu icon) - Settings, plugins, reports

**Screen List**:
1. Dashboard - Financial overview with period summaries
2. Transaction List - Searchable history of all entries
3. Add Transaction (Modal) - Quick expense/income entry
4. Transaction Detail - Edit/delete existing entries
5. Labor Tracker - Weekly staff payment management
6. Add Payment (Modal) - Log labor payment
7. Payment Detail - Edit salary entry
8. Reports - Export data, charts by category
9. Plugins - Browse/manage extensions
10. Settings - App preferences, backup

## Screen-by-Screen Specifications

### 1. Dashboard
- **Header**: Transparent, title "Dashboard", right button (Filter icon)
- **Layout**: ScrollView, top inset = headerHeight + Spacing.xl, bottom inset = tabBarHeight + Spacing.xl
- **Components**:
  - Period selector (This Week/Month/Year)
  - Large summary cards: Total Income, Total Expenses, Net Profit (green/red indicator)
  - Bar chart showing weekly trends
  - Quick action FAB (+ icon) for Add Transaction modal
- **Empty State**: "empty-dashboard.png" with text "Start tracking transactions"

### 2. Transaction List
- **Header**: Default with search bar, right button (Filter icon)
- **Layout**: FlatList with pull-to-refresh, bottom inset = tabBarHeight + Spacing.xl
- **Components**:
  - Grouped by date sections
  - Transaction cards: category icon, description, amount (green/red)
  - Category filter chips (All, Materials, Labor, Equipment, Other)
- **Empty State**: "empty-transactions.png" with "No transactions yet"

### 3. Add Transaction (Modal)
- **Header**: Custom, title "New Entry", left "Cancel", right "Save"
- **Layout**: ScrollView form, bottom inset = insets.bottom + Spacing.xl
- **Components**:
  - Type toggle (Income/Expense)
  - Amount input (large, currency symbol)
  - Category dropdown (predefined + custom)
  - Description text field
  - Date picker
  - Photo attachment button (receipts)
  - Submit buttons in header

### 4. Labor Tracker
- **Header**: Transparent, title "Weekly Payroll", right button (+ Add Payment)
- **Layout**: ScrollView, top inset = headerHeight + Spacing.xl, bottom inset = tabBarHeight + Spacing.xl
- **Components**:
  - Week selector with total weekly cost
  - Staff list cards: name, hours, rate, total amount, "Paid" toggle
  - Summary footer: unpaid vs paid amounts
- **Empty State**: "empty-labor.png" with "Add your first worker"

### 5. Add Payment (Modal)
- **Header**: Custom, title "Log Payment", left "Cancel", right "Save"
- **Layout**: ScrollView form, bottom inset = insets.bottom + Spacing.xl
- **Components**:
  - Worker name dropdown (with quick-add option)
  - Hours worked input
  - Hourly rate input
  - Total amount (auto-calculated, editable)
  - Week selector
  - Payment status toggle
  - Notes field

### 6. Plugins
- **Header**: Default, title "Extensions"
- **Layout**: FlatList, bottom inset = tabBarHeight + Spacing.xl
- **Components**:
  - Available plugins list (cards with icon, name, description, "Install" button)
  - Installed plugins section (toggle enabled/disabled, "Configure" button)
  - "Browse More" footer
- **Empty State**: "empty-plugins.png" with "No plugins installed"

### 7. Settings
- **Header**: Default, title "Settings"
- **Layout**: ScrollView, bottom inset = tabBarHeight + Spacing.xl
- **Components**:
  - Profile section (avatar, business name)
  - Currency selection
  - Backup & Sync toggle
  - Export Data button
  - Theme toggle (Light/Dark)
  - About section

## Color Palette

- **Primary**: #FF6B35 (Construction Orange - action buttons, FAB)
- **Secondary**: #004E89 (Steel Blue - labor, headers)
- **Background**: #FAFAFA (Light Gray)
- **Surface**: #FFFFFF (Cards, modals)
- **Success**: #2D6A4F (Income, positive indicators)
- **Error**: #D32F2F (Expenses, negative indicators)
- **Text Primary**: #1A1A1A
- **Text Secondary**: #757575
- **Border**: #E0E0E0

**Category Colors**: Materials=#FFA726, Labor=#42A5F5, Equipment=#78909C, Other=#9E9E9E

## Typography

**Font**: Roboto (Material Design standard)

**Scale**:
- Display: Roboto Bold, 32px (Dashboard totals)
- Title: Roboto Medium, 24px (Screen headers)
- Headline: Roboto Medium, 20px (Card headers)
- Body: Roboto Regular, 16px (Content)
- Caption: Roboto Regular, 14px (Metadata, hints)

## Visual Design

- **Icons**: Material Icons (@expo/vector-icons/MaterialIcons)
- **Touchable Feedback**: Ripple effect (Android native)
- **Elevation**: Cards use elevation={2}, FAB uses elevation={6}
- **FAB Shadow**: shadowOffset {width: 0, height: 4}, shadowOpacity: 0.30, shadowRadius: 4
- **Spacing**: xl=24, lg=16, md=12, sm=8, xs=4

## Assets to Generate

1. **icon.png** - Orange hardhat icon on white - App launcher
2. **splash-icon.png** - Same hardhat, centered - Launch screen
3. **empty-dashboard.png** - Simple ledger book illustration with pencil - Dashboard empty state
4. **empty-transactions.png** - Empty receipt/document stack - Transaction list empty state
5. **empty-labor.png** - Construction worker silhouette with toolbelt - Labor tracker empty state
6. **empty-plugins.png** - Puzzle piece with plus icon - Plugins screen empty state
7. **avatar-default.png** - Simple user icon in orange circle - Profile placeholder