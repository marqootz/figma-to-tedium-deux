# Video Directory

This directory contains video files that will be served by your web server.

## Usage

1. Place your video files (MP4, WebM, OGG, etc.) in this directory
2. In Figma, create frames with names like `[VIDEO] filename.mp4`
3. The exporter will automatically generate video HTML elements that reference these files

## Example

If you have a video file named `demo-video.mp4` in this directory:

1. Create a frame in Figma named `[VIDEO] demo-video.mp4`
2. The exporter will generate:
   ```html
   <div data-figma-name="[VIDEO] demo-video.mp4" data-video-frame="true" data-video-filename="demo-video.mp4">
     <video controls preload="metadata">
       <source src="video/demo-video.mp4" type="video/mp4">
       Your browser does not support the video tag.
     </video>
   </div>
   ```

## Supported Formats

- MP4 (recommended for web)
- WebM
- OGG
- Any other format supported by the HTML5 video element

## File Structure

```
shared-htmls/
├── video/
│   ├── demo-video.mp4
│   ├── myvideo.mp4
│   └── test-video.mp4
├── exported-refactored.html
└── video-test-demo.html
```

## Web Server Requirements

Make sure your web server is configured to serve video files with the correct MIME types:

- `video/mp4` for MP4 files
- `video/webm` for WebM files
- `video/ogg` for OGG files

For local development, you can use:
- Python: `python -m http.server 8000`
- Node.js: `npx serve .`
- PHP: `php -S localhost:8000`
