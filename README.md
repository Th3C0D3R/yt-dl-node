# 🎥 yt-dl-node  
*A powerful Node.js YouTube downloader using `youtube-dl-exec` (yt-dlp) & FFmpeg*  

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![yt-dlp](https://img.shields.io/badge/yt--dlp-latest-blue)
![License](https://img.shields.io/badge/license-MIT-yellow)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen)

---

## 📜 Description  
**yt-dl-node** is a **Node.js web app** that allows you to download YouTube **videos or playlists** in high quality.  
It uses:  
✅ [`youtube-dl-exec`](https://github.com/microlinkhq/youtube-dl-exec) (a Node wrapper for **yt-dlp**)  
✅ **FFmpeg** (for audio/video processing)  

Features:  
- 🛠 Downloads videos to a **custom output directory** (by channel name)  
- 📂 **Categorized storage** per YouTube channel  
- 🎚 **Quality selection** (best, 720p, 480p)  
- ✅ Playlist & single video support  
- 🖥 Simple **web interface** with progress bar  

---

## ⚙️ Installation  

```bash
# 1. Clone the repository
git clone https://github.com/Th3C0D3R/yt-dl-node.git
cd yt-dl-node

# 2. Install dependencies
npm install

# 3. Make sure you have FFmpeg installed
#    Download: https://ffmpeg.org/download.html
```

---

## 🔧 Configuration  

Create a `.env` file in the root directory:  

```env
FFMPEG_DIRECTORY="C:\\Path\\To\\FFmpeg\\bin"
OUTPUT_DIRECTORY="F:\\Path\\To\\Somewhere"
PORT=3000
```

- **FFMPEG_DIRECTORY** → Path where your `ffmpeg.exe` is located  
- **OUTPUT_DIRECTORY** → Base folder for downloaded videos (they will be stored by channel name)  
- **PORT** → Port of the Server

---

## ✅ Instructions  

1. **Start the server:**  
   ```bash
   npm start
   ```
2. Open in your browser:  
   ```
   http://localhost:3000
   ```
3. Enter a **YouTube URL** (video or playlist)  
4. Choose the **quality** and click **Download**  
5. Progress will be shown in real-time ✅  

---

## 🗒️ To-Do  
- [ WIP ] Add **multi-download queue** 
- [ ] Support **audio-only (MP3)** 
- [ ] Download **channel thumbnail & metadata** 
- [ ] Docker support for easy deployment  

---

## 🤝 Contribute  

We ❤️ contributions!  
Here’s how you can help:  
1. **Fork** the repository  
2. **Create a new branch** (`feature/your-feature`)  
3. **Commit your changes**  
4. **Push to your branch**  
5. Open a **Pull Request (PR)**  

**Guidelines:**  
- Follow existing **code style**  
- Make sure your code is **well-documented**  
- Include a **clear description** in your PR  

---

### 💡 Ideas & Issues  
Have suggestions or found a bug?  
👉 Open an **Issue** [here](https://github.com/Th3C0D3R/yt-dl-node/issues)  

---

## 🛠 Tech Stack  
- **Node.js** + **Express**  
- **youtube-dl-exec** (yt-dlp backend)  
- **FFmpeg** for processing  

---

### ⭐ If you like this project, **star the repo** and share it with others!  
