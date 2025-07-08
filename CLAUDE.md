# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chrome extension (Manifest V3) that converts note.com articles to Markdown format and copies them to clipboard. The extension adds a context menu item that appears only on note.com article pages.

## Architecture

### Core Components

1. **manifest.json** - Manifest V3 configuration
   - Defines permissions: contextMenus, activeTab, clipboardWrite
   - Host permissions restricted to https://note.com/*
   - Uses service worker for background script

2. **background.js** - Service worker that manages context menu
   - Creates context menu on installation
   - Listens for menu clicks and sends messages to content script
   - Menu only appears on note.com article URLs matching pattern: `https://note.com/*/n/*`

3. **content.js** - Content script injected into note.com pages
   - Receives messages from background script
   - Extracts article content using DOM selectors (article tag or [role="article"])
   - Converts HTML to Markdown using recursive DOM traversal
   - Copies result to clipboard using textarea workaround
   - Shows visual notification of success/failure

### Message Flow

1. User right-clicks on note.com article page
2. Context menu "記事をマークダウンでコピー" appears
3. User clicks menu item
4. background.js sends message with action: "convertToMarkdown" to content.js
5. content.js processes the article and copies to clipboard
6. User sees notification overlay

## Development Commands

### Loading the Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

### Creating Icons
If icons need to be regenerated:
- Option 1: Open `create_icons.html` in browser and manually save each icon
- Option 2: Run the Python script in `icons/create_icons.py` (requires PIL/Pillow)

## Key Implementation Details

- The extension uses `document.execCommand('copy')` for clipboard operations (deprecated but still functional)
- Article extraction looks for `<article>` or `[role="article"]` elements
- Unwanted elements (social buttons, subscription prompts) are removed before conversion
- Markdown conversion handles nested lists and preserves formatting
- Notification appears as a fixed-position div that auto-dismisses after 3 seconds