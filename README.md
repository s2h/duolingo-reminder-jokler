# Duolingo Reminder for GNOME Shell

A GNOME Shell extension that reminds you to complete your daily Duolingo lessons.

## Features

- 🦉 Displays an owl icon in the GNOME status bar
- ⏰ Appears after 12:00 PM if the lesson hasn't been completed
- ⚠️ Turns red and starts blinking after 8:00 PM
- ✅ Ability to mark the lesson as completed through the context menu
- 🔄 Automatically hides after completing the lesson

## Installation
### Manual Installation

1. Clone this repository
2. Copy the extension to folder:
```~/.local/share/gnome-shell/extensions/duolingo-reminder@jokler
```

3. Restart GNOME Shell (Alt+F2, type 'r' and press Enter)

4. Enable the extension through GNOME Extensions or GNOME Settings

## Usage

After installation, an owl icon will appear in the status bar:

- 🟢 Green icon: reminder to complete the lesson
- 🔴 Red icon: urgent reminder (after 8:00 PM)
- ❗ Blinking exclamation mark: call to action

To mark a lesson as completed:
1. Click on the owl icon
2. Select "Mark as completed" from the dropdown menu

## Requirements

- GNOME Shell 42 or newer
- Linux

## License

MIT License