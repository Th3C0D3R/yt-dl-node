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

    await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, format: quality })
    });
});

// Listen for progress updates
const evtProgress = new EventSource('/progress');
evtProgress.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const progressBar = document.getElementById('progressBar');
    const status = document.getElementById('status');

    if (data.done) {
        progressBar.style.width = '100%';
        status.textContent = `✅ Download complete: ${data.title}`;
    } else if(data.percent >= parseInt(progressBar.style.width.replace("%",""))) {
        progressBar.style.width = `${data.percent}%`;
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