# Changelog

All notable changes to this project will be documented in this file.

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
