<?php
// CONFIGURATION
$webhook_url = "https://discord.com/api/webhooks/1513129709955711066/lJjitcSM6maxri8XLpt54KokbCJPoKWaTLudVr3uIkpkUNQDHGdh69pxj_nf7oYdOxFl";
$upload_dir = "uploads/"; // Ensure this folder exists and is writable

// 1. Handle File Upload
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['htmlFile'])) {
    $username = htmlspecialchars($_POST['username']);
    $comments = htmlspecialchars($_POST['comments']);
    $file = $_FILES['htmlFile'];
    
    // Security: Only allow .html and .htm
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if ($ext !== 'html' && $ext !== 'htm') {
        die("ERROR: INVALID FILE TYPE. ONLY .html ALLOWED.");
    }

    // Generate safe filename
    $safe_name = bin2hex(random_bytes(8)) . "." . $ext;
    $target_path = $upload_dir . $safe_name;

    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        
        // 2. Prepare Discord Message
        $payload = [
            'content' => "🚨 **NEW PAGE SUBMISSION!**\n" .
                         "📄 **FILE:** `$safe_name` (Original: `{$file['name']}`)\n" .
                         "👤 **USER:** `$username`\n" .
                         "📝 **NOTES:** $comments\n" .
                         "⏰ **TIME:** `" . date('Y-m-d H:i:s') . "`\n" .
                         "🔍 **STATUS:** AWAITING REVIEW",
            'username' => 'Vinci Upload Bot'
        ];

        // 3. Send to Discord
        $ch = curl_init($webhook_url);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Content-Length: ' . strlen(json_encode($payload))
        ]);

        $result = curl_exec($ch);
        curl_close($ch);

        echo "SUCCESS: FILE UPLOADED. MODS NOTIFIED.";
    } else {
        echo "ERROR: FAILED TO SAVE FILE.";
    }
} else {
    echo "ERROR: NO FILE RECEIVED.";
}
?>   