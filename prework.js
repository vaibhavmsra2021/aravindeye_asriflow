import PocketBase from 'https://cdn.jsdelivr.net/npm/pocketbase@0.14.1/dist/pocketbase.es.mjs';

// Initialize PocketBase instance
const pb = new PocketBase('https://aravindeyecare.pockethost.io');

document.addEventListener('DOMContentLoaded', () => {
    const uploadHandlers = {
        'clinical-notes-doc': handleFileUpload,
        'consent-form-doc': handleFileUpload,
        'counselling-form-doc': handleFileUpload,
        'a-scan-doc': handleFileUpload,
        'b-scan-doc': handleFileUpload,
        'fundus-doc': handleFileUpload,
        'hb-doc': handleFileUpload,
        'rbs-doc': handleFileUpload,
        'viral-marker-doc': handleFileUpload,
        'patient-photo-doc': handleFileUpload,
        'patient-id-proof-doc': handleFileUpload,
    };

    Object.keys(uploadHandlers).forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', uploadHandlers[id]);
        }
    });

    document.getElementById('downloadBtn').addEventListener('click', downloadFiles);

    const cameraButtons = document.querySelectorAll('button[id$="-camera-btn"]');
    cameraButtons.forEach(button => {
        button.addEventListener('click', () => {
            const fieldName = button.id.split('-')[0] + '-' + button.id.split('-')[1];
            openCamera(fieldName);
        });
    });

    document.getElementById('camera-capture-btn').addEventListener('click', capturePhoto);

    // Check file statuses on page load
    checkAllFileStatuses();
});

async function handleFileUpload(event) {
    const input = event.target;
    const fieldName = input.id.split('-')[0] + '-' + input.id.split('-')[1]; // e.g., clinical-notes, consent-form
    const file = input.files[0];
    const emrId = localStorage.getItem('loggedInEmrId') || 'default'; // Default if EMR ID not found

    if (file) {
        try {
            const formData = new FormData();
            formData.append('emrId', emrId); // Add the EMR ID
            formData.append(fieldName, file); // Append the file with the correct field name

            // Upload file to PocketBase
            const response = await pb.collection('prework').create(formData);

            // Check if the upload was successful
            if (response) {
                console.log(`File uploaded successfully: ${file.name}`);

                // Update checkbox status
                const checkbox = document.getElementById(`${fieldName}-uploaded`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            } else {
                console.error('Failed to upload file:', file.name);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }
}

async function checkAllFileStatuses() {
    const emrId = localStorage.getItem('loggedInEmrId') || 'default'; // Default if EMR ID not found
    const fileTypes = [
        'clinical-notes-doc',
        'consent-form-doc',
        'counselling-form-doc',
        'a-scan-doc',
        'b-scan-doc',
        'fundus-doc',
        'hb-doc',
        'rbs-doc',
        'viral-marker-doc',
        'patient-photo-doc',
        'patient-id-proof-doc'
    ];

    try {
        const records = await pb.collection('prework').getFullList({
            filter: `emrId = "${emrId}"`
        });

        for (const fileType of fileTypes) {
            const fileFound = records.some(record => record[fileType]);

            const checkbox = document.getElementById(`${fileType}-uploaded`);
            if (checkbox) {
                checkbox.checked = fileFound;
            }
        }
    } catch (error) {
        console.error('Error checking file statuses:', error);
    }
}

function openCamera(fieldName) {
    const cameraContainer = document.getElementById('camera-container');
    cameraContainer.style.display = 'block';

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            const video = document.getElementById('camera-video');
            video.srcObject = stream;
            video.play();
            // Store fieldName in the button for later use
            cameraContainer.dataset.fieldName = fieldName;
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
        saveToLocalStorage(fileName, blob);

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

function saveToLocalStorage(name, blob) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const dataUrl = e.target.result;
        try {
            localStorage.setItem(name, dataUrl);
        } catch (e) {
            console.error('Local Storage quota exceeded or error occurred: ', e);
        }
    };
    reader.readAsDataURL(blob);
}

function downloadFiles() {
    const zip = new JSZip();
    const emrId = localStorage.getItem('loggedInEmrId') || 'default'; // Default if EMR ID not found

    Object.keys(localStorage).forEach(key => {
        const dataUrl = localStorage.getItem(key);
        if (dataUrl) {
            const base64Data = dataUrl.split(',')[1];
            try {
                const binaryData = atob(base64Data);
                const arrayBuffer = new ArrayBuffer(binaryData.length);
                const uint8Array = new Uint8Array(arrayBuffer);

                for (let i = 0; i < binaryData.length; i++) {
                    uint8Array[i] = binaryData.charCodeAt(i);
                }

                zip.file(`emrId/${key}`, arrayBuffer);
            } catch (error) {
                console.error('Failed to decode base64 data: ', error);
            }
        }
    });

    zip.generateAsync({ type: 'blob' }).then(function(content) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${emrId}_pre-work.zip`; // Use EMR ID as zip file name
        link.click();
    });
}
