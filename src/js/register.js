import { API_BASE_URL } from "./api.js";
import { loadNav } from "./utils.js";

loadNav();

const registerForm = document.getElementById("registerForm");
const messageDiv = document.getElementById("message");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const avatar = document.getElementById("avatar").value.trim();

  const userData = {
    name,
    email,
    password,
    ...(avatar && { avatar }),
  };

  try {
    const response = await fetch(`${API_BASE_URL}auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("accessToken", data.data.accessToken);

      messageDiv.textContent = "Registration successful! Redirecting...";
      messageDiv.className = "text-green-500";

      setTimeout(() => {
        window.location.href = `${window.location.origin}/index.html`;
      }, 2000);
    } else {
      messageDiv.textContent = `Error: ${data.message}`;
      messageDiv.className = "text-red-500";
    }
  } catch (error) {
    messageDiv.textContent =
      "An unexpected error occurred. Please try again later.";
    messageDiv.className = "text-red-500";
  }
});
