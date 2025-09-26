# yt-dl-node

## Overview
yt-dl-node is a Node.js application that allows users to download videos from various platforms using a simple web interface. The application utilizes the `youtube-dl-exec` library to handle video downloads and provides real-time progress updates through Server-Sent Events (SSE).

## Features
- Download videos from supported platforms.
- Manage a download queue.
- Real-time progress updates for ongoing downloads.
- Simple and intuitive web interface.

## Project Structure
```
yt-dl-node
├── src
│   ├── app.js                   # Entry point of the application
│   ├── routes                   # Contains route definitions
│   │   ├── index.js             # Main application routes
│   │   └── download.js          # Routes related to downloading
│   ├── services                 # Contains business logic
│   │   ├── downloadService.js   # Functions for downloading videos
│   │   └── queueService.js      # Functions for managing the download queue
│   ├── utils                    # Utility functions
│   │   ├── notifications.js     # Notifications for users
│   │   ├── logger.js            # winston logger 
│   │   └── validateEnv.js       # Validates environment variables
│   └── views                    # View templates
│       └── index.ejs            # Main view template
├── public                       # Static files (CSS, JS, etc.)
├── .env                         # Environment variables
├── .queue                       # Stores download queue data
├── package.json                 # npm configuration file
└── package-lock.json            # Locks dependency versions
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd yt-dl-node
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and set the required environment variables:
   ```
   OUTPUT_DIRECTORY=<your_output_directory>
   FFMPEG_DIRECTORY=<path_to_ffmpeg>
   PORT=<port_number>
   ```

## Usage
1. Start the application:
   ```
   npm start
   ```

2. Open your web browser and navigate to `http://localhost:<port_number>`.

3. Use the interface to enter video URLs and manage downloads.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.