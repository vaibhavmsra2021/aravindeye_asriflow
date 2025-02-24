document.addEventListener('DOMContentLoaded', () => {
    // Handle file upload input changes
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', function(event) {
            handleFileUpload(event.target);
        });
    });

    // Handle camera button clicks
    document.querySelectorAll('.camera-btn').forEach(button => {
        button.addEventListener('click', function() {
            const fieldName = button.getAttribute('data-field');
            openCamera(fieldName);
        });
    });

    // Handle camera capture button click
    document.getElementById('camera-capture-btn').addEventListener('click', capturePhoto);

    // Handle download button click
    document.getElementById('downloadBtn').addEventListener('click', downloadFiles);

    // Initialize IndexedDB
    initIndexedDB();
});

let db;
function initIndexedDB() {
    const request = indexedDB.open('UploadsDB', 1);

    request.onupgradeneeded = function(event) {
        db = event.target.result;
        const objectStore = db.createObjectStore('files', { keyPath: 'name' });
        objectStore.createIndex('name', 'name', { unique: true });
    };

    request.onsuccess = function(event) {
        db = event.target.result;
    };

    request.onerror = function(event) {
        console.error('Error opening IndexedDB: ', event.target.errorCode);
    };
}

function handleFileUpload(input) {
    const fieldName = input.id;
    const files = Array.from(input.files);

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const blob = new Blob([e.target.result], { type: file.type });
            compressFile(blob, fieldName, (compressedBlob) => {
                saveToIndexedDB(fieldName, compressedBlob);

                const checkbox = document.getElementById(`${fieldName}-uploaded`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        };
        reader.readAsArrayBuffer(file);
    });
}

function openCamera(fieldName) {
    const cameraContainer = document.getElementById('camera-container');
    cameraContainer.style.display = 'block';
    cameraContainer.dataset.fieldName = fieldName;

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.getElementById('camera-video');
            video.srcObject = stream;
            video.play();
        })
        .catch(err => {
            console.error('Error accessing camera: ', err);
        });
}

function capturePhoto() {
    const canvas = document.getElementById('camera-canvas');
    const video = document.getElementById('camera-video');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
        const fieldName = document.getElementById('camera-container').dataset.fieldName;
        const fileName = `${fieldName}.jpg`;
        saveToIndexedDB(fileName, blob);

        const checkbox = document.getElementById(`${fieldName}-uploaded`);
        if (checkbox) {
            checkbox.checked = true;
        }

        const videoStream = video.srcObject;
        if (videoStream) {
            const tracks = videoStream.getTracks();
            tracks.forEach(track => track.stop());
        }

        document.getElementById('camera-container').style.display = 'none';
    }, 'image/jpeg');
}

function compressFile(blob, name, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const arrayBuffer = e.target.result;
        try {
            const compressedArrayBuffer = pako.deflate(new Uint8Array(arrayBuffer), { level: 9 });
            const compressedBlob = new Blob([compressedArrayBuffer], { type: blob.type });

            if (compressedBlob.size > 200 * 1024) {
                console.warn(`${name} is larger than 200 KB after compression.`);
            }

            callback(compressedBlob);
        } catch (error) {
            console.error('Compression failed: ', error);
        }
    };
    reader.readAsArrayBuffer(blob);
}

function saveToIndexedDB(name, blob) {
    const transaction = db.transaction(['files'], 'readwrite');
    const objectStore = transaction.objectStore('files');

    const request = objectStore.put({ name: name, data: blob });
    request.onsuccess = function(event) {
        console.log('File saved to IndexedDB: ', name);
    };

    request.onerror = function(event) {
        console.error('Error saving file to IndexedDB: ', event.target.errorCode);
    };
}

function downloadFiles() {
    const zip = new JSZip();
    const emrId = localStorage.getItem('loggedInEmrId') || 'default'; // Default if EMR ID not found

    const transaction = db.transaction(['files'], 'readonly');
    const objectStore = transaction.objectStore('files');
    const request = objectStore.openCursor();

    request.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const { name, data } = cursor.value;
            zip.file(`emrId/${name}`, data);
            cursor.continue();
        } else {
            zip.generateAsync({ type: 'blob' }).then(function(content) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = `${emrId}_uploads.zip`; // Use EMR ID as zip file name
                link.click();
            });
        }
    };

    request.onerror = function(event) {
        console.error('Error reading files from IndexedDB: ', event.target.errorCode);
    };
}
