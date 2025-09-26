export const STATUS = {
    QUEUED: 'queued',
    DOWNLOADING: 'downloading',
    ERROR: 'error'
};

export const PORT = process.env.PORT || 3000;
export const ISDEBUG = process.env.DEBUG === 'true';
export const DOWNLOAD_DIR = process.env.OUTPUT_DIRECTORY;
export const FFMPEG_DIR = process.env.FFMPEG_DIRECTORY;
export const COOKIES_FILE = process.env.COOKIES_FILE;