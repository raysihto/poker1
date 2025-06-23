# poker1 project

## (1) atomic-count app (source files: `atomic-count.*`)

This app serves primarily as a **learning and experimentation platform** for understanding and mastering **Google Firebase Realtime Database** and its integration within a **pure vanilla JavaScript Single-Page Application (SPA)** hosted on **GitHub Pages**.

-   It uses pure vanilla JavaScript and HTML.
-   The app utilizes Google Firebase Realtime Database to store and retrieve data.
-   The app uses Picnic CSS framework for lightweight styling.

### How to Use

The specific usage procedures for this application are currently under development and are not yet stable enough to be formally documented here. We aim to provide clear instructions in the future, but for now, this section will remain blank.

### Known Limitations / Security Considerations

Since this application is hosted entirely on GitHub Pages, the Firebase API key and configuration are publicly exposed in the client-side JavaScript. For any production use or sensitive data, it is **critical** to:
* **Implement strict Firebase Realtime Database Security Rules** to control read/write access.
* **Restrict your Firebase API Key** in the Google Cloud Console to only the necessary services (e.g., Realtime Database) and specific HTTP referrers (your GitHub Pages domain) to minimize potential misuse.
