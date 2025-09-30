const STATUS = {
    QUEUED: 'queued',
    DOWNLOADING: 'downloading',
    ERROR: 'error'
};

document.getElementById('downloadBtn').addEventListener('click', async () => {
    const url = document.getElementById('url').value;
    const quality = document.getElementById('quality').value;

    if (!url) {
        alert('Please enter a YouTube URL');
        return;
    }

    document.getElementById('status').textContent = 'Starting download...';

    var res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format: quality })
    });

    if (res.status === 202) {
        const data = await res.json();
        showToast(data.response, "blue", 3000);
    }
    else if (res.status != 200) {
        const err = await res.json();
        showToast(`Error: ${err?.error || 'Unknown error'}`, "red", 5000);
        document.getElementById('status').textContent = `Error: ${err?.error || 'Unknown error'}`;
    }
    else {
        const data = await res.json();
        showToast('Download started successfully!', "green", 3000);
        document.getElementById('status').textContent = 'Download started successfully!';
    }
});

// Listen for progress updates
document.getElementById('progressBar').style.width = '0%';
document.getElementById('status').textContent = 'Waiting...';
const evtProgress = new EventSource('/progress');
evtProgress.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const progressBar = document.getElementById('progressBar');
    const status = document.getElementById('status');
    var currentWidth = parseInt(progressBar.style.width.replace("%", "") || "0");
    if (data.done) {
        progressBar.style.width = '100%';
        status.textContent = `✅ Download complete: ${data.title}`;
        showToast(status.textContent, "green", 3000);
    } else if (data.percent >= currentWidth && currentWidth == 100 && data.done != true) {
        progressBar.style.width = `${data.percent}%`;
        currentWidth = data.percent;
        status.textContent = `Downloading: ${data.title} - ${data.percent}%`;
    }
};

var selectedItems = [];
const evtQueue = new EventSource('/queue');
evtQueue.onmessage = (event) => {

    var data = JSON.parse(event.data);
    const queueList = document.getElementById('queueList');
    selectedItems = Array.from(document.getElementsByClassName('selected')).map(item => item.dataset.id);
    queueList.innerHTML = '';
    if (data.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No download in queue';
        li.classList.add('queue-item', 'disabled');
        queueList.appendChild(li);
        return;
    }

    data.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('queue-item');
        li.dataset.id = item.id;
        if (selectedItems.includes(item.id)) {
            li.classList.add('selected');
        }

        // Status icon
        const statusIcon = document.createElement('span');
        statusIcon.classList.add('status-icon');
        if (item.currentStatus === 'DOWNLOADING' || item.currentStatus === STATUS?.DOWNLOADING) {
            statusIcon.textContent = '⬇️'; // Downloading icon
        } else if (item.currentStatus === 'QUEUED' || item.currentStatus === STATUS?.QUEUED) {
            statusIcon.textContent = '⏳'; // Queued icon
        } else {
            statusIcon.textContent = '';
        }
        li.appendChild(statusIcon);

        // Title
        const titleSpan = document.createElement('span');
        titleSpan.textContent = item.title;
        titleSpan.title = item.title; // Tooltip with full title
        li.appendChild(titleSpan);

        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '🗑️';
        removeBtn.classList.add('remove-btn');
        removeBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await fetch('/api/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: item.id })
            });
        });
        li.appendChild(removeBtn);

        li.addEventListener('click', () => {
            Array.from(document.getElementsByClassName('selected')).forEach(el => {
                el.classList.remove('selected');
            });
            if (li.classList.contains('selected')) {
                li.classList.remove('selected');
                return;
            }
            else {
                li.classList.add('selected');
                li.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        queueList.appendChild(li);
    });
}

function showToast(message, type = 'blue', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'red') toast.classList.add('toast-red');
    else if (type === 'green') toast.classList.add('toast-green');
    else toast.classList.add('toast-blue');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => container.removeChild(toast), 300);
    }, duration);
}