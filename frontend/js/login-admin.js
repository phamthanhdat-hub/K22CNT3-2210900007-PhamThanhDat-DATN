// ===============================
// LOGIN ADMIN
// ===============================
function loginAdmin(event) {
    event.preventDefault();

    const email = document.getElementById("adminUser").value;
    const matKhau = document.getElementById("adminPass").value;

    if (!email || !matKhau) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    fetch("http://127.0.0.1:5000/api/auth/login-admin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            matKhau: matKhau
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            alert(data.message || "Đăng nhập thất bại");
            return;
        }

        // Lưu token + thông tin admin
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_info", JSON.stringify(data.admin));

        // Chuyển sang dashboard
        window.location.href = "admin-dashboard.html";
    })
    .catch(() => {
        alert("Không thể kết nối server");
    });
}
