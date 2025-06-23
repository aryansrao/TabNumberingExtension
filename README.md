# Tab Number Shortcut

A Chrome extension that provides quick tab navigation using keyboard shortcuts. Hold the Command key (⌘) to see tab numbers appear in the tab bar, then press Command+[1-9] to instantly switch to any tab.

## Features

- **Visual Tab Numbers**: Hold Command to see numbers appear in all tab titles
- **Quick Navigation**: Press Command+1-9 to switch to tabs instantly
- **Clean Interface**: Numbers appear directly in the browser's tab bar
- **Automatic Updates**: Tab numbers update automatically when tabs are added, removed, or reordered
- **Cross-Platform**: Works on macOS (Command key) and Windows/Linux (Ctrl key)

## Demo

When you hold the Command key, you'll see tab numbers appear like this:

![Tab Numbers Demo](/screenshot.png)

- `[1] YouTube`
- `[2] Discord`
- `[3] Netlify`
- `[4] GitHub`
- `[5] Luvelan`

Then simply press Command+[number] to switch to any tab instantly!

- **Visual Tab Numbers**: Hold Command to see numbers appear in all tab titles
- **Quick Navigation**: Press Command+1-9 to switch to tabs instantly
- **Clean Interface**: Numbers appear directly in the browser's tab bar
- **Automatic Updates**: Tab numbers update automatically when tabs are added, removed, or reordered
- **Cross-Platform**: Works on macOS (Command key) and Windows/Linux (Ctrl key)

## Installation

### From Source
1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The extension will be installed and ready to use

### Permissions
The extension requires the following permissions:
- **Tabs**: To access tab information and switch between tabs
- **ActiveTab**: To inject content scripts into active tabs
- **Scripting**: To programmatically inject content scripts
- **Host permissions**: To work on all websites

## Usage

1. **View Tab Numbers**: Hold the Command key (⌘ on Mac, Ctrl on Windows/Linux)
2. **Switch Tabs**: While holding Command, press numbers 1-9 to switch to the corresponding tab
3. **Release**: Let go of Command to hide the tab numbers

### Example
- Hold ⌘ → See `[1] Gmail`, `[2] GitHub`, `[3] YouTube` in tab titles
- Press ⌘+2 → Switch to GitHub tab
- Release ⌘ → Numbers disappear, clean tab titles return

## How It Works

The extension consists of two main components:

### Background Script (`background.js`)
- Manages tab switching and coordination between tabs
- Handles keyboard shortcuts (Command+1-9)
- Injects content scripts into new tabs
- Coordinates showing/hiding numbers across all tabs

### Content Script (`content.js`)
- Detects Command key press/release in each tab
- Modifies tab titles to show/hide numbers
- Communicates with background script for coordination

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Content Script Injection**: Automatic on page load + manual injection for existing tabs
- **Tab Number Display**: Modifies `document.title` to show numbers in browser tab bar
- **Error Handling**: Robust handling of extension context invalidation and tab navigation

## File Structure

```
TabNumberingExtension/
├── manifest.json          # Extension configuration
├── background.js           # Service worker for tab management
├── content.js             # Content script for displaying numbers
└── README.md              # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

