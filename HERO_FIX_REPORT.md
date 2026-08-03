# Hero Fix Report

Fixed the home hero regression without changing the rest of the website:

- Restored guaranteed visibility for the headline, description, and buttons on mobile and reduced-motion devices.
- Restored muted inline autoplay video on mobile and desktop.
- Kept the poster image as a fallback if video playback fails or data-saving/reduced-motion settings are active.
- Added a one-time playback retry after the first interaction for Safari/iOS autoplay edge cases.
- Confirmed the hero MP4 and poster assets are present.

Validation completed:

- Content data validation: passed with 0 errors and 0 warnings.
- Targeted hero source checks: passed.

A full Vite production build could not be executed in this sandbox because the configured internal npm registry returned a missing-package 404 during dependency installation. No dependency files or package versions were changed.
