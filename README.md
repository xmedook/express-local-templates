# Express Local Templates

**Version:** 1.4.0
**Author:** nexo | koode.mx
**Requires:** WordPress 5.0+, Elementor 3.0+

A high-performance WordPress plugin that adds custom local JSON templates to the Elementor editor via a custom button and modal interface.

## Features

- **3,500+ Pre-built Templates** - Extensive library of professionally designed Elementor templates
- **Category Organization** - Templates organized by category (navbar, footer, hero, blog, etc.)
- **Fast Search** - Instant search with exact ID matching and fuzzy search capabilities
- **Optimized Performance** - WebP image format, metadata caching, and AJAX pagination
- **Zero Database** - All templates stored as JSON files for easy version control
- **Modern UI** - Clean, responsive modal interface with preview images
- **One-Click Import** - Seamlessly import templates into your Elementor pages
- **Auto Publish Detection** - Automatically enables Elementor's Publish/Update button after import

## Installation

1. Download the latest release zip file
2. Upload to WordPress via Plugins > Add New > Upload Plugin
3. Activate the plugin
4. Open any page with Elementor editor
5. Look for the "Express Templates" button in the editor toolbar

## Plugin Size & Optimization

**Compressed (ZIP):** 38MB
**Uncompressed:** 91MB

This plugin has been heavily optimized for distribution:
- Preview images converted to WebP format (50% size reduction)
- Images resized from 1484px to 800px width
- Total size reduced by 80% from original (193MB → 38MB compressed)

## Branches

This repository maintains multiple branches for different purposes:

| Branch | Version | Description | Status |
|--------|---------|-------------|--------|
| **main** | 1.4.0 | Production-ready stable release | ✅ Current |
| **dev** | 1.4.0 | Stable development branch | ✅ Stable |
| **dev-more** | 1.4.0 | Active development work | 🚧 In Development |
| **backup-v1.3.0** | 1.3.0 | Historical backup | 📦 Archive |

### Branch Workflow

- **main**: Production releases only, fully tested
- **dev**: Staging branch for feature integration
- **dev-more**: Active development, experimental features
- **backup-v1.3.0**: Preserved for reference

## Changelog

### [1.4.0] - 2026-01-06

#### Major Optimization
- **Plugin Size Reduction**: Reduced total plugin size from 193MB to 91MB (53% reduction), making it faster to install, update, and distribute.
- **Image Optimization**: Converted all 3,510 preview images from PNG to WebP format with intelligent resizing from 1484px to 800px width, reducing previews folder from 76MB to 38MB (50% reduction).
- **Modern Image Format**: WebP provides superior compression while maintaining excellent visual quality at 85% quality setting.

#### Improved
- **Image Loading Priority**: Updated preview image detection to prioritize WebP format first, falling back to PNG/JPG/JPEG for maximum compatibility.
- **File Organization**: Added comprehensive .gitignore entries for backup folders and temporary files created during optimization process.
- **Metadata Cache**: Cache automatically rebuilds to reference new WebP preview images on first load after update.

#### Technical Details
- Preview images: 76MB → 38MB (3,510 files)
- Image format: PNG @ 1484px → WebP @ 800px
- Compression quality: 85% (excellent quality/size balance)
- JSON templates: Already optimized (single-line format)
- Total distributable size: ~91MB (under 100MB target)

### [1.3.0] - 2026-01-05

#### Major Fix
- **Complete Publish Button Fix**: Completely rewrote template insertion method to use Elementor's modern `$e.run('document/elements/import')` command system, which properly registers changes in Elementor's history and automatically triggers the dirty state.
- **Automatic Fallback**: If the modern `$e` command system is unavailable, the plugin automatically falls back to the legacy `addChildModel` method with enhanced dirty state triggers.

#### Added
- **Elementor Version Detection**: Added automatic detection and logging of the Elementor version on plugin initialization for better debugging and compatibility.
- **$e Command System Check**: Added detection of `$e.run` availability to use the most appropriate insertion method.
- **Enhanced Logging**: Comprehensive console logging with checkmarks showing which dirty state methods were successfully executed.

#### Improved
- **Dirty State Triggers**: Completely overhauled `triggerDirtyState` function with 11 different methods including the modern `$e.run('document/save/set-is-modified')` command, container model updates, and forced UI updates.
- **Reduced Delay**: Reduced dirty state trigger delay from 1500ms to 500ms for faster response (only used in fallback mode).
- **Better Error Handling**: Added try-catch blocks with detailed error messages for each insertion method.

#### Technical Details
- Uses `$e.run('document/elements/import')` for Elementor 3.0+ (primary method)
- Automatically detects and uses correct container/model structure
- Falls back gracefully to legacy methods for older Elementor versions
- Multiple redundant dirty state triggers ensure maximum compatibility

### [1.2.3] - 2026-01-05

#### Fixed
- **Code Polish**: Cleaned up diagnostic logs and removed redundant/failing triggers in `editor.js` for a cleaner console and better performance.
- **Improved Stability**: Refined the `triggerDirtyState` function to be more concise and focused on the methods that are proven to work across Elementor versions.

[View full changelog](CHANGELOG.md)

## File Structure

```
express-local-templates/
├── assets/
│   ├── css/
│   │   └── editor.css
│   └── js/
│       └── editor.js
├── includes/
│   └── source-express-local.php
├── previews/                     # 3,510 WebP preview images
├── templates/                    # 3,500 JSON template files
│   ├── navbar/
│   ├── footer/
│   ├── hero/
│   ├── blog-carousel/
│   └── ... (20+ categories)
├── express-local-templates.php   # Main plugin file
├── CHANGELOG.md
└── README.md
```

## Technical Specifications

**Technology Stack:**
- PHP 7.4+
- JavaScript (ES6+)
- Elementor Page Builder API
- WordPress AJAX API

**Performance Features:**
- Metadata caching system (auto-rebuilding)
- AJAX pagination (80 templates per load)
- WebP image format with lazy loading
- Case-insensitive file lookups
- Optimized for 3,000+ templates

**Security:**
- Nonce verification on all AJAX requests
- Capability checks (`edit_posts`)
- Read-only template source
- Sanitized user inputs

## Development

### Requirements
- Node.js (for development tools)
- PHP 7.4+
- WordPress 5.0+
- Elementor 3.0+

### Local Development Setup

1. Clone the repository
2. Symlink or copy to WordPress plugins directory
3. Activate plugin in WordPress
4. Make changes to code
5. Test in Elementor editor

### Building for Production

```bash
# Create distributable zip
zip -r express-local-templates-v1.4.0.zip express-local-templates-dev \
  -x "*.git*" "*backup*" "*metadata-cache.json" "*debug.log"
```

## Support

For issues, feature requests, or contributions:
- **Issues**: [GitHub Issues](https://github.com/xmedook/express-local-templates/issues)
- **Pull Requests**: Use the `dev` branch as base

## License

Copyright © 2026 nexo | koode.mx

## Credits

- **Development**: nexo | koode.mx
- **AI Assistance**: Claude Code (Anthropic)
- **Template Designs**: koode.mx team
