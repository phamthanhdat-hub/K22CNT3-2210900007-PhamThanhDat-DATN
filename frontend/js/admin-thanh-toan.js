const API_URL = "http://127.0.0.1:5000/api/admin/thanh-toan";
const token = localStorage.getItem("admin_token");

if (!token) {
    alert("Vui lòng đăng nhập admin");
    window.location.href = "login-admin.html";
}

// Toast notification
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

// Load danh sách thanh toán
function loadThanhToan() {
    fetch(API_URL, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById("thanhToanBody");
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-5">
                        <i class="fa fa-credit-card" style="font-size: 3rem; color: #ccc;"></i>
                        <p class="mt-3 text-muted">Chưa có thanh toán nào</p>
                    </td>
                </tr>
            `;
            return;
        }

        let html = "";
        data.forEach((tt, index) => {
            const ngayThanhToan = tt.ngayThanhToan 
                ? new Date(tt.ngayThanhToan).toLocaleString('vi-VN')
                : "Chưa có";
            
            const trangThaiClass = getTrangThaiClass(tt.trangThai);
            const phuongThucBadge = tt.phuongThuc === "COD" 
                ? '<span class="badge bg-warning">COD</span>'
                : '<span class="badge bg-info">Chuyển khoản</span>';

            html += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>#${tt.id}</strong></td>
                    <td>
                        <a href="admin-don-hang.html" style="color: #ff6b81; text-decoration: none;">
                            #${tt.donHang_id}
                        </a>
                    </td>
                    <td>
                        <strong>${tt.hoTen}</strong><br>
                        <small class="text-muted">${tt.email}</small>
                    </td>
                    <td><strong>${new Intl.NumberFormat('vi-VN').format(tt.tongTien)}đ</strong></td>
                    <td>${phuongThucBadge}</td>
                    <td>
                        <span class="badge ${trangThaiClass}">${tt.trangThai}</span>
                    </td>
                    <td>${ngayThanhToan}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="openUpdateModal(${tt.id})">
                            <i class="fa fa-edit"></i> Cập nhật
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
    })
    .catch(err => {
        console.error("Error loading payments:", err);
        document.getElementById("thanhToanBody").innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger">
                    <i class="fa fa-exclamation-triangle"></i> 
                    Không thể tải dữ liệu. Vui lòng thử lại sau.
                </td>
            </tr>
        `;
    });
}

// Lấy class cho trạng thái
function getTrangThaiClass(trangThai) {
    const statusMap = {
        "Đã thanh toán": "bg-success",
        "Chờ xác nhận": "bg-warning",
        "Đã hủy": "bg-danger",
        "Hoàn tiền": "bg-secondary"
    };
    return statusMap[trangThai] || "bg-secondary";
}

// Mở modal cập nhật
function openUpdateModal(id) {
    fetch(`${API_URL}/${id}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("updateId").value = data.id;
        document.getElementById("updatePhuongThuc").value = data.phuongThuc;
        document.getElementById("updateTrangThai").value = data.trangThai;
        
        const modal = new bootstrap.Modal(document.getElementById("updateModal"));
        modal.show();
    })
    .catch(err => {
        showToast("Không thể tải thông tin thanh toán", "error");
        console.error(err);
    });
}

// Lưu cập nhật
function saveUpdate() {
    const id = document.getElementById("updateId").value;
    const phuongThuc = document.getElementById("updatePhuongThuc").value;
    const trangThai = document.getElementById("updateTrangThai").value;

    if (!trangThai) {
        showToast("Vui lòng chọn trạng thái", "error");
        return;
    }

    const btn = event.target;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang lưu...';

    fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            phuongThuc: phuongThuc,
            trangThai: trangThai
        })
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa fa-save"></i> Lưu thay đổi';

        if (data.success) {
            showToast("✅ Cập nhật trạng thái thanh toán thành công", "success");
            const modal = bootstrap.Modal.getInstance(document.getElementById("updateModal"));
            modal.hide();
            loadThanhToan(); // Reload danh sách
        } else {
            showToast(data.message || "Không thể cập nhật", "error");
        }
    })
    .catch(err => {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa fa-save"></i> Lưu thay đổi';
        showToast("❌ Lỗi kết nối. Vui lòng thử lại", "error");
        console.error(err);
    });
}

// Load ban đầu
loadThanhToan();

