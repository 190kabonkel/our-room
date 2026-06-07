document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('uploadForm');
    const statusDiv = document.getElementById('status');

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const fileInput = document.getElementById('zipFile');
        const comments = document.getElementById('comments').value;
        
        // Reset Status
        statusDiv.innerHTML = "";
        statusDiv.style.color = "#fff";

        if(fileInput.files.length === 0) {
            statusDiv.innerHTML = "ERROR: NO FILE DETECTED.";
            statusDiv.style.color = "red";
            return;
        }

        const fileName = fileInput.files[0].name;
        const timestamp = new Date().toISOString();

        // Validate Extension
        if (!fileName.toLowerCase().endsWith('.zip')) {
            statusDiv.innerHTML = "ERROR: ONLY .ZIP FILES ALLOWED.";
            statusDiv.style.color = "red";
            return;
        }

        statusDiv.innerHTML = "CONNECTING TO SERVER...";
        statusDiv.style.color = "#00ff00";

        // Simulate Network Delay
        setTimeout(() => {
            // Prepare Payload for Backend
            const payload = {
                username: username,
                filename: fileName,
                comments: comments,
                timestamp: timestamp
            };

            console.log("=== READY FOR BACKEND ===");
            console.log("Sending to upload.php:", payload);
            
            // --- REAL IMPLEMENTATION ---
            // Uncomment the lines below when you have upload.php ready
            /*
            const formData = new FormData();
            formData.append('username', username);
            formData.append('zipFile', fileInput.files[0]);
            formData.append('comments', comments);

            fetch('upload.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                statusDiv.innerHTML = "SUCCESS: " + data;
                statusDiv.style.color = "#00ff00";
                form.reset();
            })
            .catch(error => {
                statusDiv.innerHTML = "ERROR: CONNECTION FAILED.";
                statusDiv.style.color = "red";
                console.error('Error:', error);
            });
            */

            // Simulation Message
            statusDiv.innerHTML = "TRANSMISSION SIMULATED.<br>CHECK CONSOLE (F12) FOR DATA.";
        }, 1500);
    });
});   