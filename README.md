# Schedule Generator

A web application for generating optimized academic schedules. Input your courses, set time constraints, and get multiple schedule options that work with your preferences.

## Features

### Course Management
- Add multiple courses with custom names
- Support for different event types:
  - **Lectures** - Main class sessions
  - **Sections** - Tutorial or lab sessions  
  - **Optional Events** - Lower priority sessions you can watch online instead of attending in-person
- Mark events as "required" or "optional" based on priority
- Add multiple time slot options for each event

### Schedule Generation
- Intelligent algorithm that handles time conflicts
- **Generates unlimited valid schedule combinations** - No restrictions on the number of options shown
- **Each generation produces different results** - Randomized algorithm ensures variety in schedule outputs
- Prioritizes "required" events over "optional" events
- **Minimizes gaps between sessions** - Schedules with fewer empty periods are prioritized
- Places optional events in remaining slots to fill gaps and complete your schedule
- Visual grid display with color-coded events
- Performance-optimized with smooth browser operation

### Constraints & Preferences
- Exclude specific days from your schedule
- Block certain time periods
- **Exclude specific lectures/sections** - Skip individual events you don't want to attend
- **No Empty Periods** - Generate only schedules without gaps between sessions
- **Reset Constraints** - Instantly restore all constraints to default values with one click
- Ramadan mode for special scheduling considerations
- Flexible optional event placement (lower priority courses)

### Data Persistence & Management
- Automatically saves your courses and settings
- Resume where you left off using browser local storage
- Export courses to JSON file for backup
- Import courses from JSON file to restore or share

## Getting Started

### Simple Setup
1. Download or clone this project
2. Open `index.html` in any modern web browser
3. Start adding your courses!

No installation or server setup required - it runs entirely in your browser.

### For Developers
If you're using VS Code, you can use the Live Server extension for a better development experience.

## How to Use

### 1. Add Your Courses
- Click the "+" button to add a new course
- Enter the course name (e.g., "Mathematics 101")
- Add events for the course (lectures, sections, etc.)

### 2. Set Time Slots
For each event:
- Add time appointments by selecting day and period
- Specify room/location if needed
- Add multiple options for flexible scheduling

### 3. Configure Constraints
- **Excluded Days**: Select days you're not available
- **Excluded Periods**: Block specific time slots (1-6)  
- **Excluded Events**: Skip specific lectures or sections you don't want to attend
- **Sessions / Day**: Set minimum and maximum number of sessions per day
- **No Empty Periods**: Enable to generate only schedules without gaps between sessions
- **Reset Constraints**: Click the red button to instantly restore all constraints to default values
- **Special Modes**: Enable Ramadan mode if applicable

### 4. Generate Schedules
- Click "Generate"
- The system will find ALL possible valid schedule combinations with no artificial limits
- **Each generation produces different outputs** - The algorithm randomizes the order of processing to show varied schedule options every time you click generate
- Browse through different schedule options using navigation buttons
- Each shows your courses arranged optimally

### 5. Handle Conflicts
- If no valid schedules are found, the system provides **intelligent error analysis**
- Smart suggestions analyze your actual course data to recommend only relevant changes
- Won't suggest unblocking days/periods that have no course sessions
- Clear guidance shows exactly which constraints are blocking your specific courses
- **Consistent visual design** - All error messages and empty states are beautifully styled and centered
- Visual indicators help you quickly resolve scheduling conflicts

### 6. Data Management
- Export/import functionality for backing up or sharing course data
- All changes are automatically saved to your browser
- Use **"Reset Constraints"** button in the constraints panel to instantly restore default settings

## Project Structure

```
schedule-generator/
├── index.html              # Main HTML page
├── styles.css              # Custom styling
├── README.md               # This file
└── js/
    ├── app.js              # Main application entry
    ├── constants.js        # Days and periods configuration
    ├── constraints.js      # Constraint handling
    ├── course-management.js # Course CRUD operations  
    ├── icons.js            # UI icons
    ├── schedule-generator.js # Core scheduling algorithm
    ├── state.js            # Application state management
    ├── storage.js          # Local storage operations
    ├── ui-renderer.js      # UI rendering logic
    └── utils.js            # Helper functions
```

## Technical Details

### Built With
- **JavaScript** - Vanilla ES6+ for all functionality
- **HTML5 & CSS3** - Modern web standards
- **Tailwind CSS** - Utility-first styling framework
- **Google Fonts** - Inter font family for clean typography

### Browser Support
Works on all modern browsers including Chrome, Firefox, Safari, and Edge.

### Algorithm
Uses a backtracking algorithm with constraint satisfaction to generate all possible conflict-free schedules. **The algorithm includes randomization** to ensure that each time you click "Generate", you get different schedule outputs even with the same course data and constraints. Required events are scheduled first with a preference for minimizing gaps between sessions. Optional events (lower priority) are then placed to fill gaps where possible, creating compact daily schedules. The system finds and displays valid schedule combinations with **no artificial limits**, ensuring you see all your scheduling options.

**Smart Error Analysis:** When no valid schedules are found, the system intelligently analyzes your specific course data and constraints to provide only relevant suggestions. It won't recommend changes that wouldn't actually help with your particular scheduling situation.

## Customization

The app uses a 7-day week (Saturday to Friday) with 6 time periods per day. You can modify these in `js/constants.js`:

```javascript
const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIOD_COUNT = 6;
```

Event types are color-coded:
- **Lectures**: Red theme
- **Sections**: Blue theme  
- **Optional Events**: Green theme with dashed border (lower priority courses)

---

Perfect for students, teachers, or anyone who needs to organize multiple schedules with various constraints!
