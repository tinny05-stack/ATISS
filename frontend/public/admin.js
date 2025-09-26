document.addEventListener("DOMContentLoaded", () => {
  const usersTableBody = document.querySelector("#usersTable tbody");
  const adminStatus = document.getElementById("adminStatus");

  async function fetchUsers() {
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
          <td>${user.payment_date}</td>
          <td>${user.expiry}</td>
          <td>${user.time_remaining}</td>
          <td><button class="deleteBtn" data-phone="${user.phone}">Delete</button></td>
        `;
        usersTableBody.appendChild(tr);
      });
    } else {
      adminStatus.innerText = data.error || "Failed to fetch users.";
    }
  }

  usersTableBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("deleteBtn")) {
      const phone = e.target.getAttribute("data-phone");
      if (confirm(`Delete user ${phone}?`)) {
        const res = await fetch(`/api/admin/users/${phone}`, { method: "DELETE" });
        const data = await res.json();
        adminStatus.innerText = res.ok ? "User deleted." : (data.error || "Delete failed.");
        fetchUsers();
      }
    }
  });

  fetchUsers();
  setInterval(fetchUsers, 30000); // Refresh every 30s
});
