# Schedule Generator

A modern, web-based application for generating optimized academic schedules. Input your courses, set time constraints, and get multiple conflict-free schedule options that work with your preferences.

## ✨ Features

### 📚 Course Management
- Add unlimited courses with custom names
- Support for different event types:
  - **Lectures** - Main class sessions
  - **Sections** - Tutorial or lab sessions  
  - **Optional Events** - Flexible sessions you can choose to attend or skip
- Mark events as **"Required"** (must attend) or **"Optional"** (flexible attendance)
- Add multiple time slot options for each event
- Smart fallbacks for unnamed courses and missing data

### 🎯 Advanced Schedule Generation
- **Intelligent algorithm** with constraint satisfaction
- **Generates unlimited valid schedule combinations** - No restrictions on the number of options
- **Randomized outputs** - Each generation produces different results for variety
- **Smart optional event placement** - Respects min/max sessions per day constraints
- **Gap minimization** - Prioritizes schedules with fewer empty periods
- **Visual grid display** with intuitive color-coding
- **Performance-optimized** for smooth browser operation

### ⚙️ Comprehensive Constraints & Preferences
- **Exclude Days**: Block specific days from your schedule
- **Exclude Periods**: Block specific time slots across all days
- **Exclude Events**: Skip individual lectures/sections you don't want
- **Sessions per Day**: Set minimum and maximum events per day (Min: 1-5, Max: 2-6)
- **No Empty Periods**: Generate only gap-free schedules
- **Ramadan Mode**: Special timing adjustments (75-min periods, 9 AM start)
- **Smart validation**: Auto-corrects invalid min/max combinations
- **One-click reset**: Restore all constraints to defaults instantly

### 💾 Data Persistence & Management
- **Auto-save**: Automatically saves courses and settings to browser storage
- **Session recovery**: Resume exactly where you left off
- **Export/Import**: Save courses to JSON files for backup or sharing
- **Enhanced data validation**: Robust loading with proper defaults and error handling
- **Smart cleanup**: Automatically removes invalid excluded events

## 🚀 Getting Started

### Quick Setup
1. **Download** or clone this project
2. **Open** `index.html` in any modern web browser
3. **Start** adding your courses immediately!

**No installation or server setup required** - runs entirely in your browser.

### For Developers
Use VS Code with the Live Server extension for enhanced development experience.

## 📖 How to Use

### 1. 📝 Add Your Courses
- Click the **"+"** button to add a new course
- Enter a descriptive course name (e.g., "Advanced Mathematics")
- Add events for each course (lectures, sections, etc.)

### 2. ⏰ Configure Time Slots
For each event:
- **Select day and time period** for each possible appointment
- **Specify room/location** if needed (optional)
- **Add multiple alternatives** for flexible scheduling options

### 3. 🎛️ Set Your Constraints
- **Excluded Days**: Select days when you're unavailable
- **Excluded Periods**: Block specific time slots (Periods 1-6)  
- **Excluded Events**: Skip individual lectures/sections
- **Sessions per Day**: Set min/max required events per day (Min: 1-5, Max: 2-6)
- **No Empty Periods**: Enable for gap-free schedules only
- **Special Modes**: Ramadan mode for adjusted timings
- **Reset**: One-click restoration of all constraints to defaults

### 4. 🎲 Generate Schedules
- Click **"Generate"** to create schedules
- System finds **ALL possible valid combinations** with no artificial limits
- **Fresh results every time** - Randomized algorithm shows different options
- **Browse multiple schedules** using navigation arrows
- **Visual color-coding** makes events easy to identify

### 5. 🔧 Handle Conflicts
- **Intelligent error analysis** when no valid schedules exist
- **Enhanced constraint suggestions** with specific, actionable recommendations
- **Conflict detection** - identifies schedule conflicts and suggests solutions
- **Contextual guidance** - explains exactly why constraints prevent scheduling
- **Clear visual hierarchy** - red dots for critical issues, orange for preferences
- **Detailed explanations** - shows current limits and suggested values
- **Multiple solution paths** - provides several ways to resolve each conflict

### 6. 📊 Data Management
- **Automatic saving** of all changes to browser storage
- **Export functionality** for backing up course configurations
- **Import capability** for restoring or sharing course data
- **Reset options** for constraints and complete data cleanup

## 🏗️ Project Structure

```
schedule-generator/
├── index.html              # Main application entry point
├── styles.css              # Custom styling and event themes
├── README.md               # Comprehensive documentation
├── .gitignore              # Git ignore patterns
└── js/
    ├── app.js              # Application initialization
    ├── constants.js        # Configuration (days, periods)
    ├── constraints.js      # Constraint validation & handling
    ├── course-management.js # Course CRUD operations  
    ├── icons.js            # SVG icon components & visual elements
    ├── schedule-generator.js # Core scheduling algorithm
    ├── state.js            # Application state management
    ├── storage.js          # Local storage & import/export
    ├── ui-renderer.js      # UI rendering & event handling
    └── utils.js            # Helper functions & utilities
```

## ⚡ Technical Details

### Built With
- **JavaScript ES6+** - Modern vanilla JavaScript for all functionality
- **HTML5 & CSS3** - Semantic markup and modern styling
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Google Fonts** - Inter font family for clean, professional typography
- **SVG Icons** - Scalable vector graphics for crisp interface elements

### Browser Compatibility
**Universal support** across all modern browsers:
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari  
- ✅ Edge
- ✅ Mobile browsers

### Algorithm Overview
**Advanced backtracking algorithm** with constraint satisfaction:

1. **Required Events First**: Schedules mandatory events with conflict detection
2. **Gap Minimization**: Prioritizes schedules with fewer empty periods
3. **Optional Event Placement**: Smartly places optional events while respecting min/max sessions per day
4. **Randomization**: Ensures variety in outputs across multiple generations
5. **Constraint Validation**: Real-time checking against all user-defined limitations
6. **Intelligent Analysis**: Provides contextual error messages and actionable suggestions

**Key Improvements**:
- ✅ **Respects sessions/day limits** for optional events
- ✅ **Prevents optional events** from violating min/max constraints  
- ✅ **Smart error analysis** with course-specific recommendations
- ✅ **Enhanced validation** with auto-correction of invalid inputs

## 🎨 Visual Design

### Color-Coded Event Types
- 🔴 **Required Lectures**: Red theme with solid borders
- 🔵 **Required Sections**: Blue theme with solid borders
- 🔴 **Optional Lectures**: Red theme with **dashed borders**
- 🔵 **Optional Sections**: Blue theme with **dashed borders**

### UI Features
- **Responsive design** that works on desktop and mobile
- **Intuitive tooltips** with helpful explanations
- **Smooth animations** for better user experience
- **Accessible controls** with proper contrast and focus states
- **Clean typography** using Inter font family

## ⚙️ Customization

### Time Configuration
The app uses a **7-day week** (Saturday to Friday) with **6 periods per day**. 
You can modify these in `js/constants.js`:

```javascript
const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIOD_COUNT = 6;
```

### Schedule Timing
- **Normal Mode**: 2-hour periods starting at 8:30 AM
- **Ramadan Mode**: 75-minute periods starting at 9:00 AM

### Event Styling
Events are visually distinguished by type and attendance:

```css
/* Required Events (Solid Borders) */
.lecture-event { /* Red theme */ }
.section-event { /* Blue theme */ }

/* Optional Events (Dashed Borders) */  
.optional-lecture-event { /* Red theme, dashed */ }
.optional-section-event { /* Blue theme, dashed */ }
```

### Constraint Defaults
Default constraint values (modifiable in `js/state.js`):
- **Min sessions per day**: 2
- **Max sessions per day**: 3  
- **No gaps**: Enabled
- **Ramadan mode**: Disabled

## 🆕 Recent Updates

### Version 2.2 Features  
- ✅ **Enhanced Constraint Error Messages**: All constraint suggestions now provide specific, actionable guidance
  - 🔴 **Critical Issues**: Bold titles with clear explanations of what's blocking scheduling
  - 🟠 **Optimization Suggestions**: Helpful tips for improving schedule quality
  - 📊 **Detailed Context**: Shows current values vs. recommended values with explanations
  - 🎯 **Conflict Detection**: Identifies specific time slot conflicts between courses
  - 🔍 **Gap Analysis**: Pinpoints which days have unavoidable gaps between classes
  - 📈 **Smart Calculations**: Suggests optimal min/max sessions based on your actual course load
  - 💡 **Multiple Solutions**: Provides several different ways to resolve each constraint issue
- ✅ **Smart Scrolling**: Intelligent scroll behavior after generating schedules
  - 🎯 **Context Preservation**: Only scrolls when results area isn't visible
  - 📱 **Perfect Positioning**: Shows navigation controls and schedule together
  - ✨ **Smooth Animation**: Gentle scroll animation with optimal offset positioning
- ✅ **Improved User Experience**: More helpful, less technical language in all error messages
- ✅ **Visual Hierarchy**: Color-coded dots (red/orange/gray) clearly indicate priority levels
- ✅ **Contextual Awareness**: Messages adapt based on your specific course and constraint setup

### Version 2.1 Features  
- ✅ **Enhanced Visual Feedback**: Unique, expressive icons for each application state
  - 📖 Book icon for "No Courses Added" 
  - 📋 Clipboard icon for "No Events Added"
  - 📅 Calendar with dots for "No Time Slots Added"
  - 🎯 Target icon for "No Required Events"
  - ▶️ Play icon for "Ready to Generate"
- ✅ **Consistent Error Messages**: All constraint and non-constraint errors use matching visual design
- ✅ **Improved Constraint Suggestions**: Better alignment and actionable recommendations
- ✅ **Smart State Management**: Error states clear automatically when requirements change
- ✅ **Auto-Clear Generated Schedules**: Old schedules automatically clear when course data changes
- ✅ **Constraint-Aware State Management**: Schedule clearing extends to all constraint modifications
- ✅ **Intelligent Message Logic**: Differentiates between constraint and non-constraint error states
- ✅ **Refined UX Flow**: Generate button only works when all requirements are met
- ✅ **Code Quality**: Removed all comments for cleaner, production-ready code

### Version 2.0 Features
- ✅ **New Optional Event Styling**: Dashed borders replace green theme
- ✅ **Removed "(Online)" Labels**: Cleaner event display
- ✅ **Enhanced Constraint Validation**: Min/max sessions properly enforced for optional events
- ✅ **Improved Error Handling**: Better validation and user feedback
- ✅ **Smart Input Validation**: Auto-correction of invalid min/max combinations
- ✅ **Enhanced Data Loading**: Robust import with proper defaults
- ✅ **Course Name Fallbacks**: Graceful handling of missing names
- ✅ **Performance Optimizations**: Faster rendering and schedule generation

### Bug Fixes
- ✅ **Smart Scrolling Implementation**: Generate button now uses intelligent scroll positioning
- ✅ **Enhanced Constraint Messages**: All error messages now use bold titles and provide specific, actionable guidance
- ✅ **Conflict Detection**: Added detection for time slot conflicts between required courses
- ✅ **Improved Gap Analysis**: Shows which specific days have gap issues when "No Empty Periods" is enabled
- ✅ **Better Context**: Error messages now explain current values vs. recommended values
- ✅ **Smarter Suggestions**: Constraint recommendations adapt to your specific course load and available time slots
- ✅ **Perfect Results Positioning**: Schedule navigation controls and results always visible after generation
- ✅ **Visual Consistency**: All error and empty states now use unique, meaningful icons
- ✅ **Message Alignment**: Fixed dot alignment in constraint suggestion lists
- ✅ **State Synchronization**: Non-constraint errors update automatically after constraint errors
- ✅ **Icon Integration**: Centralized icon management for maintainable UI components
- ✅ **Schedule State Management**: Generated schedules clear when course data is modified
- ✅ **Logic Consistency**: Both constraint and non-constraint error logic perfectly synchronized
- ✅ **Optional Event Constraints**: Now properly respects sessions/day limits
- ✅ **Empty Day Prevention**: Optional events won't create single-session days
- ✅ **Input Validation**: Min/max values are properly sanitized
- ✅ **Room Display**: Consistent handling of empty room values
- ✅ **Memory Management**: Improved event listener handling

---

## 🎓 Perfect For

- **Students** organizing class schedules
- **Teachers** planning course timetables  
- **Academic administrators** managing department schedules
- **Anyone** needing flexible, constraint-based scheduling

**Start creating your perfect schedule today!** 🚀
