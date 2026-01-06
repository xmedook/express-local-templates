# Express Local Templates

**Version:** 1.3.0 (ARCHIVED)
**Author:** nexo | koode.mx
**Status:** 📦 Historical Backup

> **⚠️ NOTICE**: This branch is archived and maintained for historical reference only.
>
> **Current Version**: Please use the [main branch](../../tree/main) for the latest stable release (v1.4.0)

## About This Branch

This branch preserves version 1.3.0 of the Express Local Templates plugin, which was the production version before the major size optimization update (v1.4.0).

### Version 1.3.0 Features

- ✅ Complete Elementor Publish button fix
- ✅ Modern `$e.run()` command system integration
- ✅ Automatic fallback to legacy methods
- ✅ Enhanced dirty state triggers (11 methods)
- ✅ 3,500+ pre-built templates
- ✅ Category organization and search

## Why This Branch Exists

This backup was created on **2026-01-06** to preserve the working v1.3.0 codebase before merging the v1.4.0 optimization changes to main.

### Key Differences from v1.4.0

| Feature | v1.3.0 (This Branch) | v1.4.0 (Current) |
|---------|---------------------|------------------|
| Plugin Size | 193MB | 91MB |
| Preview Format | PNG @ 1484px | WebP @ 800px |
| Compressed Size | ~80MB | 38MB |
| Image Quality | Original | 85% WebP |

## Migration to v1.4.0

If you're using this version, we recommend upgrading to v1.4.0:

**Benefits of upgrading:**
- 53% smaller plugin size (faster updates)
- Modern WebP image format
- Improved performance
- Same template quality

**How to upgrade:**
1. Deactivate v1.3.0
2. Delete old plugin files
3. Install v1.4.0 from [main branch](../../tree/main)
4. Reactivate plugin

## Branch Structure

| Branch | Version | Description |
|--------|---------|-------------|
| [main](../../tree/main) | 1.4.0 | **Current production release** ✅ |
| [dev](../../tree/dev) | 1.4.0 | Stable development |
| [dev-more](../../tree/dev-more) | 1.4.0 | Active development |
| backup-v1.3.0 | 1.3.0 | **This branch** (archived) 📦 |

## Changelog - Version 1.3.0

### Major Fix
- **Complete Publish Button Fix**: Completely rewrote template insertion method to use Elementor's modern `$e.run('document/elements/import')` command system, which properly registers changes in Elementor's history and automatically triggers the dirty state.
- **Automatic Fallback**: If the modern `$e` command system is unavailable, the plugin automatically falls back to the legacy `addChildModel` method with enhanced dirty state triggers.

### Added
- **Elementor Version Detection**: Added automatic detection and logging of the Elementor version on plugin initialization for better debugging and compatibility.
- **$e Command System Check**: Added detection of `$e.run` availability to use the most appropriate insertion method.
- **Enhanced Logging**: Comprehensive console logging with checkmarks showing which dirty state methods were successfully executed.

### Improved
- **Dirty State Triggers**: Completely overhauled `triggerDirtyState` function with 11 different methods including the modern `$e.run('document/save/set-is-modified')` command, container model updates, and forced UI updates.
- **Reduced Delay**: Reduced dirty state trigger delay from 1500ms to 500ms for faster response (only used in fallback mode).
- **Better Error Handling**: Added try-catch blocks with detailed error messages for each insertion method.

## Support

For current support and updates:
- **Latest Version**: [main branch](../../tree/main)
- **Issues**: [GitHub Issues](https://github.com/xmedook/express-local-templates/issues)
- **Documentation**: See main branch README

## License

Copyright © 2026 nexo | koode.mx

---

**Last Updated:** 2026-01-05
**Archived On:** 2026-01-06
**Superseded By:** [v1.4.0](../../tree/main)
