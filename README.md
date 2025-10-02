# yt-dl-node

## Overview
yt-dl-node is a Node.js application that allows you to download videos from various platforms (supported by `yt-dlp.exe` but this tool aims for YouTube itself) using a simple web interface. The application utilizes the `youtube-dl-exec` library to handle video downloads and provides real-time progress updates through Server-Sent Events (SSE).

## Features
- Download videos from supported platforms and save it to local, predefined download directory.
- Downloads are saved to folders named after the channel
- Manage a download queue.
- Real-time progress updates for ongoing downloads.
- Simple and intuitive web interface.

## Preview

![Preview Screenshot of the tool](/main.png)

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/Th3C0D3R/yt-dl-node
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
   COOKIES_FILE=<path_to_cookies_file>
   PORT=<port_number>
   ```

## Usage
1. Start the application:
   ```
   npm start
   ```

2. Open your web browser and navigate to `http://localhost:<port_number>`.

3. Use the interface to enter video URLs and manage downloads.

## FFMPG

Put `ffmpeg.exe` and `ffprobe.exe` in the same directory (example `C:\\bin\\`)
Put the directory path into the `.env` at `FFMPEG_DIRECTORY`

## Cookies-File

To get a valid cookies.txt file (recommended for the tool to work with full speed):
- use this extension from chrome: [Get cookies.txt LOCALLY](https://chromewebstore.google.com/detail/get-cookiestxt-locally/cclelndahbckbenkjhflpdbgdldlbecc)
- save/export the cookies from youtube to a accessible directory
- put the cookies.txt filepath into the `.env` at `COOKIES_FILE`


## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.