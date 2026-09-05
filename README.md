# Heritage AR Guide

## Project Description

Heritage AR Guide is a browser-based Augmented Reality application developed to provide an interactive way of exploring cultural heritage artifacts.

The application demonstrates both Marker-Based AR and Markerless AR.

---

## Features

### Marker-Based AR

- Image target tracking using MindAR
- Moonstone image marker
- Interactive 3D Buddha artifact
- Automatic rotation animation
- Artifact information panel

### Markerless AR

- WebXR immersive AR
- Hit-testing for surface detection
- AR placement reticle
- Two selectable 3D artifacts
- Object placement
- Rotation controls
- Scale controls
- Artifact replacement
- Object removal

---

## Technologies

- HTML
- CSS
- JavaScript
- Three.js
- WebXR Device API
- A-Frame
- MindAR
- GLTF/GLB

---

## Project Structure

```text
Heritage AR Guide/
├── assets/
├── css/
├── images/
├── js/
├── models/
├── index.html
├── marker-ar.html
└── markerless-ar.html

## Testing Markerless AR

Markerless AR uses WebXR and must be opened from an HTTPS URL. Use GitHub Pages or another HTTPS host; do not test it from a phone using `http://localhost` or the computer's LAN IP.

Use Chrome on a compatible Android phone, allow camera permission, and tap **Start AR**. iPhone Safari does not support the immersive WebXR AR mode used by this project.