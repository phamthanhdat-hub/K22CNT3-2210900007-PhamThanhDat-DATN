// ===============================
// LOGIN ADMIN
// ===============================
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("adminLoginForm");
    if (form) {
        form.onsubmit = loginAdmin;
    }
});

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type} show`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function loginAdmin(event) {
    event.preventDefault();

    const email = document.getElementById("adminUser").value.trim();
    const matKhau = document.getElementById("adminPass").value;
    const errorDiv = document.getElementById("errorMessage");
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Ẩn thông báo lỗi cũ
    if (errorDiv) {
        errorDiv.style.display = "none";
        errorDiv.textContent = "";
    }

    // Validation
    if (!email || !matKhau) {
        showError("Vui lòng nhập đầy đủ email và mật khẩu");
        return;
    }

    // Disable button và hiển thị loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang đăng nhập...';

    fetch("http://127.0.0.1:5000/api/admin/auth/login", {
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
        // Re-enable button
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Đăng nhập Admin";

        if (!data.success) {
            showError(data.message || "Đăng nhập thất bại");
            return;
        }

        // Lưu token + thông tin admin vào localStorage
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_info", JSON.stringify(data.admin));

        // Hiển thị thông báo thành công
        showToast("✅ Đăng nhập admin thành công!", "success");

        // Chuyển sang dashboard sau 1 giây
        setTimeout(() => {
            window.location.href = "admin-dashboard.html";
        }, 1000);
    })
    .catch(err => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = "Đăng nhập Admin";
        showError("❌ Không thể kết nối server. Vui lòng kiểm tra kết nối và thử lại sau.");
        console.error("Admin login error:", err);
    });
}

function showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) {
        errorDiv.innerHTML = `<i class="fa fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.display = "block";
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        alert(message);
    }
}
