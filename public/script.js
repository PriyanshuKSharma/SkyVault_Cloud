// Login functionality
document
  .getElementById("loginForm")
  ?.addEventListener("submit", async function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();

    if (result.success) {
      sessionStorage.setItem("authenticated", "true");
      window.location.href = "/index.html"; // Redirect to the main page
    } else {
      document.getElementById("loginError").innerText = result.message;
    }
  });

// Upload file
document
  .getElementById("uploadForm")
  ?.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (sessionStorage.getItem("authenticated") !== "true") {
      alert("Unauthorized. Please login.");
      window.location.href = "/";
      return;
    }

    const formData = new FormData();
    formData.append("file", document.getElementById("fileInput").files[0]);

    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    // Check the response for success or failure
    const result = await response.json();
    if (result.success) {
      alert(`File uploaded successfully: ${result.filename}`);
    } else {
      alert(`File upload failed: ${result.message}`);
    }
  });

// Download file
async function downloadFile() {
  if (sessionStorage.getItem("authenticated") !== "true") {
    alert("Unauthorized. Please login.");
    window.location.href = "/";
    return;
  }

  const filename = document.getElementById("filename").value;
  const response = await fetch(`/download/${filename}`, {
    method: "GET",
  });

  if (response.ok) {
    // Initiate file download
    window.location.href = `/download/${filename}`;
  } else {
    const errorText = await response.json(); // Get JSON response
    alert(`Download failed: ${errorText.message}`);
  }
}
