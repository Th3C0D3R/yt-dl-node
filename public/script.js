document.getElementById('downloadBtn').addEventListener('click', async () => {
    const url = document.getElementById('url').value;
    const quality = document.getElementById('quality').value;

    if (!url) {
        alert('Please enter a YouTube URL');
        return;
    }

    document.getElementById('status').textContent = 'Starting download...';

    await fetch('/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format: quality })
    });
});

// Listen for progress updates
const evtSource = new EventSource('/progress');
evtSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const progressBar = document.getElementById('progressBar');
    const status = document.getElementById('status');

    if (data.done) {
        progressBar.style.width = '100%';
        status.textContent = `✅ Download complete: ${data.title}`;
    } else {
        progressBar.style.width = `${data.percent}%`;
        status.textContent = `Downloading: ${data.title} - ${data.percent}%`;
    }
};
