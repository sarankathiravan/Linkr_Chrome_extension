# URL Organizer Chrome Extension

A modern Chrome extension for saving and categorizing URLs with a sleek dark theme and textured gradient interface.

## Features

- 🔖 **Save URLs**: Quickly save the current page or any URL
- 📂 **Categorize**: Organize URLs into customizable categories
- 🔍 **Search & Filter**: Find saved URLs easily
- 📊 **Statistics**: Track your saved URLs and categories
- 📤 **Export**: Export your URLs as JSON for backup
- 🎨 **Modern Dark Theme**: Sleek black interface with textured gradients
- ⚡ **Lightweight**: Minimal resource usage with smooth animations

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension folder
5. The URL Organizer icon will appear in your toolbar

## Usage

### Saving URLs

1. **Current Page**: Click the extension icon and use "Get current page URL" button
2. **Manual Entry**: Type or paste any URL in the input field
3. **Context Menu**: Right-click on any page or link and select "Save to URL Organizer"

### Categories

- Choose from predefined categories: Work, Personal, Research, Entertainment, News, Shopping, Social, Education, Other
- Add custom categories using the "+" button
- Filter saved URLs by category

### Managing URLs

- **Search**: Type in the search box to find URLs by title, URL, or category
- **Open**: Click on any saved URL to open it in a new tab
- **Copy**: Use the copy button to copy URLs to clipboard
- **Delete**: Remove individual URLs with the delete button
- **Export**: Export all URLs as JSON for backup
- **Clear All**: Remove all saved URLs (with confirmation)

## File Structure

```
url-organizer-extension/
├── manifest.json       # Extension configuration
├── popup.html         # Main popup interface
├── popup.css          # Material Design styling
├── popup.js           # Main functionality
├── background.js      # Background service worker
├── icons/             # Extension icons (SVG)
└── README.md          # This file
```

## Technical Details

- **Storage**: Uses Chrome's `chrome.storage.local` API for data persistence
- **Permissions**: Requires `storage`, `activeTab`, and `contextMenus` permissions
- **Manifest**: Uses Manifest V3 for modern Chrome extension standards
- **No External Dependencies**: All code is self-contained

## Data Storage

All data is stored locally using Chrome's storage API:
- `savedUrls`: Array of saved URL objects
- `categories`: Array of category names

### URL Object Structure

```javascript
{
  id: Number,           // Unique timestamp ID
  url: String,          // The saved URL
  title: String,        // Page title or custom name
  category: String,     // Selected category
  dateAdded: String,    // ISO date string
  dateAccessed: String, // Last access date
  accessCount: Number   // How many times opened
}
```

## Browser Compatibility

- Chrome 88+ (Manifest V3 support)
- Chromium-based browsers (Edge, Brave, etc.)

## Privacy

- No data is sent to external servers
- All URLs are stored locally on your device
- No tracking or analytics

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the extension.

## License

This project is open source and available under the MIT License.