// Toggle password visibility
const togglePassword = document.getElementById("toggle-password");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", () => {
  const type =
    passwordInput.getAttribute("type") === "password" ? "text" : "password";
  passwordInput.setAttribute("type", type);
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

function formatDateTime(inputValue) {
  const date = new Date(inputValue);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}

document
  .getElementById("loginForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const outingType = document.querySelector(
      'input[name="outingType"]:checked'
    )?.value;
    const rawFormat = document.getElementById("time").value;
    const ForamattedTime = formatDateTime(rawFormat);

    const details = {
      rollno: document.getElementById("rollno").value,
      password: document.getElementById("password").value,
      outingType: outingType || null,
      returnTime: ForamattedTime,
    };

    console.log(details);

    try {
      const response = await fetch(
        "https://outingrequestsves.onrender.com/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(details),
        }
      );
      const data = await response.json();

      if (response.ok) {
        alert(`✅ Success: ${data.message}`);
      
        if (data.screenshot) {
          const img = document.createElement("img");
          img.src = data.screenshot;
          img.alt = "Submission Screenshot";
          document.body.appendChild(img);
        }
      } else {
        alert(
          `❌ Error: ${data.message}\nDetails: ${data.error || "No extra info."}`
        );
        console.error("Server Error:", data.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("There was an error submitting the form.");
    }
  });
