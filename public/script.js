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
      window.location.href = "/index.html";
    } else {
      document.getElementById("loginError").innerText = result.message;
    }
  });

// Check authentication on index page
if (
  window.location.pathname === "/index.html" &&
  sessionStorage.getItem("authenticated") !== "true"
) {
  alert("Please log in first.");
  window.location.href = "/";
}

// File upload functionality
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
      headers: { Authorization: "authenticated" },
    });
    const result = await response.text();
    alert(result);
  });

// File download functionality
async function downloadFile() {
  if (sessionStorage.getItem("authenticated") !== "true") {
    alert("Unauthorized. Please login.");
    window.location.href = "/";
    return;
  }

  const filename = document.getElementById("filename").value;
  window.location.href = `/download/${filename}`;
}
