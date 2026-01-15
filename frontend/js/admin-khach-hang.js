const API_URL = "http://127.0.0.1:5000/api/admin/khach-hang";

const adminToken = localStorage.getItem("admin_token");
if (!adminToken) {
    window.location.href = "login-admin.html";
}

document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
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

async function safeFetch(url, options = {}) {
    try {
        const defaultOptions = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`,
                ...options.headers
            },
            ...options
        };

        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
            const text = await response.text();
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
                const error = JSON.parse(text);
                errorMessage = error.message || errorMessage;
            } catch {
                errorMessage = text || errorMessage;
            }
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        if (error.message.includes("Failed to fetch")) {
            throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.");
        }
        throw error;
    }
}

function loadCustomers() {
    const customerList = document.getElementById("customerList");
    
    safeFetch(API_URL, { method: "GET" })
    .then(data => {
        customerList.innerHTML = "";
        
        if (!data || data.length === 0) {
            customerList.innerHTML = `
                <div class="empty-state text-center py-5">
                    <i class="fas fa-users" style="font-size: 64px; color: #94a3b8; margin-bottom: 20px;"></i>
                    <h4>Chưa có khách hàng nào</h4>
                </div>
            `;
            return;
        }
        
        // Filter chỉ hiển thị khách hàng đang hoạt động (trangThai = 1 hoặc true)
        // Xử lý cả trường hợp trangThai là số (1/0) hoặc boolean (true/false)
        const activeCustomers = data.filter(customer => {
            const trangThai = customer.trangThai;
            return trangThai === 1 || trangThai === true || trangThai == 1;
        });
        
        if (activeCustomers.length === 0) {
            customerList.innerHTML = `
                <div class="empty-state text-center py-5">
                    <i class="fas fa-users" style="font-size: 64px; color: #94a3b8; margin-bottom: 20px;"></i>
                    <h4>Chưa có khách hàng nào</h4>
                </div>
            `;
            return;
        }
        
        activeCustomers.forEach((customer) => {
            const customerCard = document.createElement("div");
            customerCard.className = "customer-card";
            customerCard.innerHTML = `
                <div class="customer-header">
                    <div class="customer-info">
                        <h5>${customer.hoTen || 'Chưa có tên'}</h5>
                        <p class="text-muted mb-1"><i class="fas fa-envelope"></i> ${customer.email}</p>
                        ${customer.dienThoai ? `<p class="text-muted mb-1"><i class="fas fa-phone"></i> ${customer.dienThoai}</p>` : ''}
                        ${customer.diaChi ? `<p class="text-muted mb-1"><i class="fas fa-map-marker-alt"></i> ${customer.diaChi}</p>` : ''}
                        <span class="badge ${customer.trangThai ? 'bg-success' : 'bg-secondary'}">
                            ${customer.trangThai ? '✓ Hoạt động' : '✗ Đã khóa'}
                        </span>
                    </div>
                    <div class="btn-action-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewCustomerDetail(${customer.id})">
                            <i class="fas fa-eye"></i> Chi tiết
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editCustomer(${customer.id})">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.id})">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </div>
                <div class="customer-stats">
                    <div class="stat-item">
                        <div class="stat-value">${customer.soDonHang || 0}</div>
                        <div class="stat-label">Đơn hàng</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${new Intl.NumberFormat('vi-VN').format(customer.tongTien || 0)}₫</div>
                        <div class="stat-label">Tổng tiền</div>
                    </div>
                </div>
            `;
            customerList.appendChild(customerCard);
        });
    })
    .catch(error => {
        const errorMsg = error.message || "Lỗi không xác định";
        showToast(`Lỗi khi tải danh sách: ${errorMsg}`, "error");
        customerList.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> ${errorMsg}
            </div>
        `;
    });
}

function viewCustomerDetail(id) {
    safeFetch(`${API_URL}/${id}`, { method: "GET" })
    .then(data => {
        let donHangHTML = '';
        if (data.donHang && data.donHang.length > 0) {
            donHangHTML = '<h6 class="mt-3 mb-2">Lịch sử đơn hàng:</h6><ul class="list-group">';
            data.donHang.forEach(dh => {
                donHangHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Đơn hàng #${dh.id}</strong><br>
                            <small class="text-muted">${dh.ngayDat ? new Date(dh.ngayDat).toLocaleDateString('vi-VN') : 'N/A'}</small>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-primary">${new Intl.NumberFormat('vi-VN').format(dh.tongTien)}₫</span><br>
                            <small class="text-muted">${dh.trangThai}</small>
                        </div>
                    </li>
                `;
            });
            donHangHTML += '</ul>';
        } else {
            donHangHTML = '<p class="text-muted mt-3">Chưa có đơn hàng nào</p>';
        }

        const modalHTML = `
            <div class="modal fade" id="customerDetailModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header" style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white;">
                            <h5 class="modal-title"><i class="fas fa-user"></i> Chi tiết khách hàng</h5>
                            <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <h5>${data.hoTen || 'Chưa có tên'}</h5>
                            <p><strong>Email:</strong> ${data.email}</p>
                            <p><strong>Điện thoại:</strong> ${data.dienThoai || 'Chưa có'}</p>
                            <p><strong>Địa chỉ:</strong> ${data.diaChi || 'Chưa có'}</p>
                            ${data.diaChiVanPhong ? `<p><strong>Địa chỉ văn phòng:</strong> ${data.diaChiVanPhong}</p>` : ''}
                            <p><strong>Ngày đăng ký:</strong> ${data.ngayTao ? new Date(data.ngayTao).toLocaleDateString('vi-VN') : 'N/A'}</p>
                            <p><strong>Trạng thái:</strong> <span class="badge ${data.trangThai ? 'bg-success' : 'bg-secondary'}">${data.trangThai ? 'Hoạt động' : 'Đã khóa'}</span></p>
                            ${donHangHTML}
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('customerDetailModal'));
        modal.show();
        
        document.getElementById('customerDetailModal').addEventListener('hidden.bs.modal', function() {
            document.getElementById('customerDetailModal').remove();
        });
    })
    .catch(error => {
        showToast(`Lỗi khi tải chi tiết: ${error.message}`, "error");
    });
}

let modal = null;

// Khởi tạo modal sau khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', function() {
    const modalElement = document.getElementById("customerModal");
    if (modalElement) {
        modal = new bootstrap.Modal(modalElement);
    }
});

function openForm() {
    document.getElementById("modalTitle").textContent = "Thêm khách hàng";
    document.getElementById("customerId").value = "";
    document.getElementById("hoTen").value = "";
    document.getElementById("email").value = "";
    document.getElementById("matKhau").value = "";
    document.getElementById("dienThoai").value = "";
    document.getElementById("diaChi").value = "";
    document.getElementById("trangThai").checked = true;
    document.getElementById("errorMessage").style.display = "none";
    document.getElementById("passwordRequired").style.display = "inline";
    document.getElementById("passwordHint").textContent = "Tối thiểu 6 ký tự";
    document.getElementById("matKhau").required = true;
    modal.show();
}

function editCustomer(id) {
    safeFetch(`${API_URL}/${id}`, { method: "GET" })
    .then(data => {
        document.getElementById("modalTitle").textContent = "Sửa khách hàng";
        document.getElementById("customerId").value = data.id;
        document.getElementById("hoTen").value = data.hoTen || "";
        document.getElementById("email").value = data.email || "";
        document.getElementById("matKhau").value = "";
        document.getElementById("dienThoai").value = data.dienThoai || "";
        document.getElementById("diaChi").value = data.diaChi || "";
        document.getElementById("trangThai").checked = data.trangThai !== false;
        document.getElementById("errorMessage").style.display = "none";
        document.getElementById("passwordRequired").style.display = "none";
        document.getElementById("passwordHint").textContent = "Để trống nếu không muốn đổi mật khẩu";
        document.getElementById("matKhau").required = false;
        modal.show();
    })
    .catch(error => {
        showToast(`Lỗi khi tải thông tin: ${error.message}`, "error");
    });
}

function saveCustomer() {
    const errorMsg = document.getElementById("errorMessage");
    errorMsg.style.display = "none";
    
    const id = document.getElementById("customerId").value;
    const hoTen = document.getElementById("hoTen").value.trim();
    const email = document.getElementById("email").value.trim();
    const matKhau = document.getElementById("matKhau").value;
    const dienThoai = document.getElementById("dienThoai").value.trim();
    const diaChi = document.getElementById("diaChi").value.trim();
    const trangThai = document.getElementById("trangThai").checked;
    
    // Validation
    if (!hoTen || hoTen.length < 2) {
        errorMsg.textContent = "Họ và tên phải có ít nhất 2 ký tự";
        errorMsg.style.display = "block";
        return;
    }
    
    if (!email) {
        errorMsg.textContent = "Vui lòng nhập email";
        errorMsg.style.display = "block";
        return;
    }
    
    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        errorMsg.textContent = "Email không hợp lệ";
        errorMsg.style.display = "block";
        return;
    }
    
    // Validate password (required khi thêm mới)
    if (!id && (!matKhau || matKhau.length < 6)) {
        errorMsg.textContent = "Mật khẩu phải có ít nhất 6 ký tự";
        errorMsg.style.display = "block";
        return;
    }
    
    const data = {
        hoTen: hoTen,
        email: email,
        dienThoai: dienThoai || null,
        diaChi: diaChi || null,
        trangThai: trangThai
    };
    
    // Chỉ thêm mật khẩu nếu có nhập (khi thêm mới hoặc muốn đổi khi sửa)
    if (matKhau && matKhau.length >= 6) {
        data.matKhau = matKhau;
    } else if (!id) {
        // Khi thêm mới mà không có mật khẩu
        errorMsg.textContent = "Mật khẩu phải có ít nhất 6 ký tự";
        errorMsg.style.display = "block";
        return;
    }
    
    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? "PUT" : "POST";
    const saveBtn = document.getElementById("saveBtn");
    const originalText = saveBtn.innerHTML;
    
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    
    safeFetch(url, {
        method: method,
        body: JSON.stringify(data)
    })
    .then(result => {
        if (result.success !== false) {
            showToast(id ? "Cập nhật khách hàng thành công!" : "Thêm khách hàng thành công!", "success");
            modal.hide();
            loadCustomers();
        } else {
            errorMsg.textContent = result.message || "Có lỗi xảy ra";
            errorMsg.style.display = "block";
            showToast(result.message || "Có lỗi xảy ra", "error");
        }
    })
    .catch(error => {
        errorMsg.textContent = error.message || "Lỗi không xác định";
        errorMsg.style.display = "block";
        showToast(`Lỗi: ${error.message}`, "error");
    })
    .finally(() => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    });
}

function deleteCustomer(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa khách hàng này?\n\nLưu ý: Không thể xóa nếu khách hàng đang có đơn hàng.")) {
        return;
    }
    
    safeFetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(result => {
        if (result.success) {
            showToast("Xóa khách hàng thành công!", "success");
            loadCustomers();
        } else {
            showToast(result.message || "Không thể xóa khách hàng này", "error");
        }
    })
    .catch(error => {
        showToast(`Lỗi khi xóa: ${error.message}`, "error");
    });
}

