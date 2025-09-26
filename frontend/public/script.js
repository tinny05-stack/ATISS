const api = "http://localhost:8080/api";
const phoneInput = document.getElementById("phone");
const payBtn = document.getElementById("payBtn");
const otpSection = document.getElementById("otp-section");
const otpInput = document.getElementById("otp");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const statusDiv = document.getElementById("status");

payBtn.addEventListener("click", async () => {
  const phone = phoneInput.value.trim();
  if (!phone) { alert("Enter phone number"); return; }

  const res = await fetch(`${api}/payment/initiate`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ phone })
  });
  const data = await res.json();
  if (res.ok) {
    statusDiv.innerText = data.message;
    otpSection.style.display = "block";
  } else statusDiv.innerText = data.error;
});

verifyOtpBtn.addEventListener("click", async () => {
  const phone = phoneInput.value.trim();
  const otp = otpInput.value.trim();
  if (!otp) { alert("Enter OTP"); return; }

  const res = await fetch(`${api}/payment/verify`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ phone, otp })
  });
  const data = await res.json();
  statusDiv.innerText = res.ok ? data.message : data.error;
});

document.addEventListener("DOMContentLoaded", () => {
  const payBtn = document.getElementById("payBtn");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const otpSection = document.getElementById("otpSection");
  const message = document.getElementById("message");

  // Admin modal elements
  const adminLoginBtn = document.getElementById("adminLoginBtn");
  const adminModal = document.getElementById("adminModal");
  const closeModal = document.getElementById("closeModal");
  const adminLoginSubmit = document.getElementById("adminLoginSubmit");
  const adminMessage = document.getElementById("adminMessage");

  // Show admin modal on button click
  adminLoginBtn.addEventListener("click", () => {
    adminModal.style.display = "block";
  });

  // Close modal on X click
  closeModal.addEventListener("click", () => {
    adminModal.style.display = "none";
  });

  // Close modal when clicking outside modal content
  window.addEventListener("click", (e) => {
    if (e.target === adminModal) {
      adminModal.style.display = "none";
    }
  });

  // --- Admin Dashboard Logic ---
  const usersTableBody = document.querySelector("#usersTable tbody");
  const adminStatus = document.getElementById("adminStatus");


  // --- Admin Dashboard Logic ---
  async function fetchAdminUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    usersTableBody.innerHTML = "";
    if (res.ok && Array.isArray(data.users)) {
      if (data.users.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="5">No active users.</td></tr>';
        return;
      }
      data.users.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${user.phone}</td>
          <td>${user.issued_on || user.payment_date}</td>
          <td>${user.expiry_time || user.expiry}</td>
          <td>${user.time_remaining}</td>
          <td><button class="deleteBtn" data-phone="${user.phone}">Delete</button></td>
        `;
        usersTableBody.appendChild(tr);
      });
    } else {
      adminStatus.innerText = data.error || "Failed to fetch users.";
    }
  }

  if (usersTableBody) {
    usersTableBody.addEventListener("click", async (e) => {
      if (e.target.classList.contains("deleteBtn")) {
        const phone = e.target.getAttribute("data-phone");
        if (confirm(`Delete user ${phone}?`)) {
          const res = await fetch(`/api/admin/users/${phone}`, { method: "DELETE" });
          const data = await res.json();
          adminStatus.innerText = res.ok ? "User deleted." : (data.error || "Delete failed.");
          fetchAdminUsers();
        }
      }
    });
    setInterval(fetchAdminUsers, 30000); // Refresh every 30s
  }

  // Admin login submit
  adminLoginSubmit.addEventListener("click", async () => {
    const username = document.getElementById("adminUser").value;
    const password = document.getElementById("adminPass").value;

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
      // Hide login modal, show dashboard
      adminModal.style.display = "none";
      document.querySelector(".container").style.display = "none";
      document.getElementById("admin-dashboard").style.display = "block";
      fetchAdminUsers();
    } else {
      adminMessage.innerText = data.error || "Login failed.";
    }
  });
});
