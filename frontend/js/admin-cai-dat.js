const adminToken = localStorage.getItem("admin_token");
if (!adminToken) {
    window.location.href = "login-admin.html";
}

document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    document.getElementById("shopSettingsForm").addEventListener("submit", saveSettings);
});

function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
    const toastId = "toast-" + Date.now();
    const bgColor = type === "success" ? "#10b981" : "#ef4444";
    
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white border-0" role="alert" style="background: ${bgColor}; min-width: 300px;">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === "success" ? "check-circle" : "exclamation-circle"} me-2"></i>${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML("beforeend", toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', function() {
        toastElement.remove();
    });
}

function loadSettings() {
    // Lấy từ localStorage hoặc API nếu có
    const settings = JSON.parse(localStorage.getItem("shopSettings") || "{}");
    
    if (settings.tenCuaHang) document.getElementById("tenCuaHang").value = settings.tenCuaHang;
    if (settings.email) document.getElementById("email").value = settings.email;
    if (settings.dienThoai) document.getElementById("dienThoai").value = settings.dienThoai;
    if (settings.diaChi) document.getElementById("diaChi").value = settings.diaChi;
    if (settings.moTa) document.getElementById("moTa").value = settings.moTa;
    if (settings.gioLamViec) document.getElementById("gioLamViec").value = settings.gioLamViec;
}

function saveSettings(event) {
    event.preventDefault();
    
    const settings = {
        tenCuaHang: document.getElementById("tenCuaHang").value.trim(),
        email: document.getElementById("email").value.trim(),
        dienThoai: document.getElementById("dienThoai").value.trim(),
        diaChi: document.getElementById("diaChi").value.trim(),
        moTa: document.getElementById("moTa").value.trim(),
        gioLamViec: document.getElementById("gioLamViec").value.trim()
    };
    
    // Validation
    if (!settings.tenCuaHang || !settings.email || !settings.dienThoai || !settings.diaChi) {
        showToast("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
        return;
    }
    
    // Lưu vào localStorage (có thể thay bằng API sau)
    localStorage.setItem("shopSettings", JSON.stringify(settings));
    
    showToast("Lưu cài đặt thành công!", "success");
}





