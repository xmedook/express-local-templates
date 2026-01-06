# Changelog

All notable changes to this project will be documented in this file.

## [1.4.0] - 2026-01-06

### Major Optimization
- **Plugin Size Reduction**: Reduced total plugin size from 193MB to 91MB (53% reduction), making it faster to install, update, and distribute.
- **Image Optimization**: Converted all 3,510 preview images from PNG to WebP format with intelligent resizing from 1484px to 800px width, reducing previews folder from 76MB to 38MB (50% reduction).
- **Modern Image Format**: WebP provides superior compression while maintaining excellent visual quality at 85% quality setting.

### Improved
- **Image Loading Priority**: Updated preview image detection to prioritize WebP format first, falling back to PNG/JPG/JPEG for maximum compatibility.
- **File Organization**: Added comprehensive .gitignore entries for backup folders and temporary files created during optimization process.
- **Metadata Cache**: Cache automatically rebuilds to reference new WebP preview images on first load after update.

### Technical Details
- Preview images: 76MB → 38MB (3,510 files)
- Image format: PNG @ 1484px → WebP @ 800px
- Compression quality: 85% (excellent quality/size balance)
- JSON templates: Already optimized (single-line format)
- Total distributable size: ~91MB (under 100MB target)

### Files Modified
- `/includes/source-express-local.php`: Updated `$possible_extensions` to prioritize WebP
- `.gitignore`: Added backup folders and temporary files
- All preview images converted to WebP format

## [1.3.0] - 2026-01-05

### Major Fix
- **Complete Publish Button Fix**: Completely rewrote template insertion method to use Elementor's modern `$e.run('document/elements/import')` command system, which properly registers changes in Elementor's history and automatically triggers the dirty state.
- **Automatic Fallback**: If the modern `$e` command system is unavailable, the plugin automatically falls back to the legacy `addChildModel` method with enhanced dirty state triggers.

### Added
- **Elementor Version Detection**: Added automatic detection and logging of the Elementor version on plugin initialization for better debugging and compatibility.
- **$e Command System Check**: Added detection of `$e.run` availability to use the most appropriate insertion method.
- **Enhanced Logging**: Comprehensive console logging with checkmarks (✓) showing which dirty state methods were successfully executed, making it much easier to troubleshoot if issues persist.

### Improved
- **Dirty State Triggers**: Completely overhauled `triggerDirtyState` function with 9 different methods including the modern `$e.run('document/save/set-is-modified')` command, container model updates, and forced UI updates.
- **Reduced Delay**: Reduced dirty state trigger delay from 1500ms to 500ms for faster response (only used in fallback mode).
- **Better Error Handling**: Added try-catch blocks with detailed error messages for each insertion method.

### Technical Details
- Uses `$e.run('document/elements/import')` for Elementor 3.0+ (primary method)
- Automatically detects and uses correct container/model structure
- Falls back gracefully to legacy methods for older Elementor versions
- Multiple redundant dirty state triggers ensure maximum compatibility

## [1.2.3] - 2026-01-05

### Fixed
- **Code Polish**: Cleaned up diagnostic logs and removed redundant/failing triggers in `editor.js` for a cleaner console and better performance.
- **Improved Stability**: Refined the `triggerDirtyState` function to be more concise and focused on the methods that are proven to work across Elementor versions.

## [1.2.2] - 2026-01-05

### Added
- **Premium Addons Inspired Fix**: Implemented manual removal of the `elementor-disabled` class from the Publish/Update button. This technique, used by popular plugins like Premium Addons, ensures the button is clickable even if Elementor's internal state hasn't fully updated.
- **Refined $e.run Commands**: Added `$e.run('document/elements/import', ...)` with the imported content to better signal the import action to Elementor.

### Fixed
- **Improved Dirty State Trigger**: Refactored `triggerDirtyState` to accept the imported content, allowing for more precise `$e.run` commands.
- **Version Bump**: Updated all assets and plugin header to v1.2.2.

## [1.2.1] - 2026-01-05

### Added
- **Force Dirty Fallback Button**: Added a manual "Force Dirty" button to the template modal. If the automatic trigger fails to activate the Publish button in certain Elementor environments, this button provides a manual workaround.
- **Deep Diagnostics**: Added extensive logging of editor object keys and value types (`elementor.saver`, `footerSaver`, `currentDoc`) to the console to help troubleshoot state management in modern Elementor versions.

### Fixed
- **Ultra-Robust PHP Filters**: Broadened the PHP filters for `wp_get_attachment_image_src` and `wp_get_attachment_metadata` to catch ALL non-numeric IDs and return dummy values. This finally squashes the "offset on bool" warnings in Elementor's Image Manager.
- **Modern $e Command Integration**: Added `$e.run('document/save/set-dirty')` as a primary trigger method for modern Elementor (3.x+).
- **Refactored Trigger Logic**: Moved dirty state triggers into a reusable `triggerDirtyState` function for consistency between automatic and manual triggers.

## [1.2.0] - 2026-01-05

### Fixed
- **Robust PHP Filters**: Refined the PHP filters for `wp_get_attachment_image_src` and `wp_get_attachment_metadata` to catch all non-numeric IDs, preventing "offset on bool" warnings in Elementor's Image Manager even for missing or custom IDs.
- **JS TypeError Fix**: Fixed a `TypeError` in `editor.js` where `elementor.history.getHistoryManager` was called without checking if it exists.
- **Enhanced Diagnostics**: Added even more detailed logging of the `currentDoc` and `elementor.history` objects to troubleshoot specific Elementor environments.
- **History Manager Integration**: Added a proper check for the History Manager before attempting to add a dummy record.

## [1.1.9] - 2026-01-05

### Fixed
- **Deep Editor State Trigger**: Implemented the most aggressive dirty state triggers yet. This includes direct Backbone model manipulation (`currentDoc.model.set('dirty', true)`), triggering multiple Backbone events (`change`, `change:dirty`, `status:change`), and adding a dummy history record to force the editor into a modified state.
- **History Manager Integration**: Integrated with Elementor's History Manager to ensure the template import is recognized as a reversible action, which naturally activates the Publish button.
- **Increased Delay & Diagnostics**: Increased the trigger delay to 1500ms and added even more detailed logging of the `currentDoc` object to troubleshoot specific Elementor environments.

## [1.1.8] - 2026-01-05

### Fixed
- **Aggressive Editor State Trigger**: Implemented a much more robust multi-method approach to force the Elementor **Publish/Update** button to activate. This includes direct model manipulation (`currentDoc.model.set('dirty', true)`), checking for `footerSaver`, and multiple event triggers.
- **Enhanced Diagnostics**: Added even more detailed console logging, including the keys of `elementor.saver.footerSaver`, to help identify the correct dirty state trigger for any Elementor environment.
- **Increased Delay**: Increased the trigger delay to 1000ms to ensure Elementor has fully processed the imported content before signaling a change.

## [1.1.7] - 2026-01-05

### Fixed
- **Comprehensive Editor State Trigger**: Implemented a multi-method approach to force the Elementor **Publish/Update** button to activate, including the modern `elementor.documents` API and multiple event triggers.
- **Diagnostic Logging**: Added detailed console logging to help identify the most effective dirty state trigger for different Elementor environments.

## [1.1.6] - 2026-01-05

### Fixed
- **PHP Warnings**: Added filters to `wp_get_attachment_image_src` and `wp_get_attachment_metadata` to prevent Elementor's Image Manager from crashing or generating warnings when processing local template IDs.
- **Editor State Robustness**: Refined the "dirty state" trigger in the editor to be safer and added a 500ms delay to ensure Elementor has finished processing the new content before the trigger fires.

## [1.1.5] - 2026-01-05

### Fixed
- **Enhanced Editor State Trigger**: Implemented a comprehensive multi-method approach to activate the Elementor **Publish/Update** button. This includes support for the modern Command API (`$e`), legacy `saver` methods, and page settings model triggers, ensuring compatibility across all Elementor versions.

## [1.1.4] - 2026-01-05

### Fixed
- **Editor State Compatibility**: Replaced the fragile `setFlagEditorDirty` call with a robust multi-method approach (including `setDirty` and event triggers) to ensure compatibility across different Elementor versions and prevent JavaScript errors.

## [1.1.3] - 2026-01-05

### Fixed
- **Editor State**: Added a trigger to notify the Elementor editor of changes after a template is imported. This ensures the **Publish/Update** button activates correctly.

## [1.1.2] - 2026-01-04

### Fixed
- **File Permissions**: Added automatic permission fixing (755 for directories, 644 for files) during cache rebuilds to resolve 403 Forbidden errors on production servers.
- **Packaging**: Fixed restrictive local permissions that were being carried over into the zip archive.

## [1.1.1] - 2026-01-04

### Fixed
- **Production Case Sensitivity**: Implemented a robust case-insensitive lookup for preview images and template JSON files to ensure compatibility with Linux servers.
- **Cache Schema Validation**: Added automatic cache rebuilding when the metadata structure changes, ensuring data consistency after updates.

## [1.1.0] - 2026-01-04

### Added
- **Search Logic Refinement**: Prioritized exact ID matches and added an "Exact ID" toggle for more precise searching.
- **Category Support**: Implemented recursive subdirectory scanning to automatically categorize templates based on folder structure.
- **Redesigned Modal UI**: Added a category sidebar, improved grid density, and modernized the overall look and feel.
- **Performance Boost**: Increased the template load limit from 20 to 80 per page for a smoother browsing experience.
- **Visual Enhancements**: Added hover animations, backdrop blurs, and improved typography.

### Fixed
- **Debug Warnings**: Resolved PHP warnings in `debug.log` related to Elementor's image manager by fixing data structures and adding missing `id` fields.
- **Source File Naming**: Renamed source files to align with the new brand identity.

## [1.0.0] - 2026-01-04

### Added
- **Rebranding**: Complete rebranding from "Koodem" to **Express Local Templates**.
- **Scaling Optimizations**: Initial implementation of metadata caching and AJAX pagination to handle 3000+ templates.
- **Manual Sync**: Added a refresh icon to manually rebuild the metadata cache.

### Changed
- **Author**: Updated author to "nexo | koode.mx".
- **File Structure**: Renamed main plugin file and folder to `express-local-templates`.
