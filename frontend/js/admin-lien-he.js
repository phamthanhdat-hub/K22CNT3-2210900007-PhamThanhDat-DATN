// ================================
// ADMIN LIÊN HỆ - QUẢN LÝ
// ================================

const API_URL = "http://127.0.0.1:5000/api/admin/lien-he";
const token = localStorage.getItem("admin_token");

// Kiểm tra đăng nhập
if (!token) {
    alert("Vui lòng đăng nhập admin");
    window.location.href = "login-admin.html";
}

const lienHeList = document.getElementById("lienHeList");
const loadingLienHe = document.getElementById("loadingLienHe");
const emptyLienHe = document.getElementById("emptyLienHe");
const contactModal = new bootstrap.Modal(document.getElementById("contactModal"));
const viewModal = new bootstrap.Modal(document.getElementById("viewContactModal"));
let currentContactId = null;

// ================================
// TOAST NOTIFICATION
// ================================
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

// ================================
// LOAD DANH SÁCH LIÊN HỆ
// ================================
function loadLienHe() {
    loadingLienHe.style.display = "block";
    emptyLienHe.style.display = "none";
    lienHeList.innerHTML = "";

    fetch(API_URL, {
        headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => {
                throw new Error(err.message || `HTTP ${res.status}: ${res.statusText}`);
            });
        }
        return res.json();
    })
    .then(data => {
        loadingLienHe.style.display = "none";

        // Kiểm tra nếu data có success: false (lỗi từ backend)
        if (data && data.success === false) {
            throw new Error(data.message || "Lỗi khi tải danh sách liên hệ");
        }

        // Đảm bảo data là array
        const contactArray = Array.isArray(data) ? data : [];

        if (contactArray.length === 0) {
            emptyLienHe.style.display = "block";
            return;
        }

        emptyLienHe.style.display = "none";
        renderLienHeList(contactArray);
    })
    .catch(err => {
        loadingLienHe.style.display = "none";
        const errorMsg = err.message || "Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.";
        lienHeList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="fa fa-exclamation-triangle"></i> 
                    <strong>Lỗi khi tải danh sách liên hệ:</strong><br>
                    ${errorMsg}
                    <br><br>
                    <button class="btn btn-primary btn-sm" onclick="loadLienHe()">
                        <i class="fa fa-refresh"></i> Thử lại
                    </button>
                </div>
            </div>
        `;
        console.error("Lỗi load liên hệ:", err);
        showToast(`Lỗi: ${errorMsg}`, "error");
    });
}

// ================================
// RENDER DANH SÁCH LIÊN HỆ
// ================================
function renderLienHeList(data) {
    lienHeList.innerHTML = "";

    if (!data || !Array.isArray(data) || data.length === 0) {
        emptyLienHe.style.display = "block";
        return;
    }

    data.forEach((contact, index) => {
        const noiDung = contact.noiDung || "";
        const noiDungShort = noiDung.length > 150 
            ? noiDung.substring(0, 150) + "..." 
            : noiDung || "Chưa có nội dung";
        
        const ngayGui = contact.ngayGui 
            ? new Date(contact.ngayGui).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : "Chưa có ngày";
        
        const hoTen = contact.hoTen || "Khách hàng";
        const email = contact.email || "Chưa có email";

        const trangThai = contact.trangThai || "Chưa xử lý";
        let statusClass = "chua-xu-ly";
        if (trangThai.includes("Đã xử lý") || trangThai.includes("Đã")) {
            statusClass = "da-xu-ly";
        } else if (trangThai.includes("Đang") || trangThai.includes("đang")) {
            statusClass = "dang-xu-ly";
        }
        
        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4";
        card.innerHTML = `
            <div class="contact-card">
                <div class="contact-header">
                    <div class="contact-info">
                        <div class="contact-name">
                            <i class="fa fa-user-circle"></i> ${escapeHtml(hoTen)}
                        </div>
                        <a href="mailto:${escapeHtml(email)}" class="contact-email">
                            <i class="fa fa-envelope"></i> ${escapeHtml(email)}
                        </a>
                        <div class="contact-date">
                            <i class="fa fa-calendar"></i> ${ngayGui}
                        </div>
                        <div style="margin-top: 8px;">
                            <span class="status-badge ${statusClass}">${escapeHtml(trangThai)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="contact-content" style="font-size: 14px;">
                    ${escapeHtml(noiDungShort)}
                </div>
                
                <div class="btn-action-group">
                    <button class="btn btn-info btn-sm" onclick="viewContact(${contact.id})" title="Xem chi tiết">
                        <i class="fa fa-eye"></i> Xem
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="editContact(${contact.id})" title="Sửa">
                        <i class="fa fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteContact(${contact.id})" title="Xóa">
                        <i class="fa fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        `;
        lienHeList.appendChild(card);
    });
}

// ================================
// ESCAPE HTML
// ================================
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ================================
// XEM CHI TIẾT LIÊN HỆ
// ================================
function viewContact(id) {
    fetch(`${API_URL}/${id}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(result => {
        if (!result.success) {
            showToast(result.message || "Không tìm thấy liên hệ", "error");
            return;
        }

        const contact = result.data;
        currentContactId = contact.id;
        
        document.getElementById("viewHoTen").textContent = contact.hoTen || "Không có";
        document.getElementById("viewEmail").innerHTML = contact.email 
            ? `<a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>`
            : "Không có";
        document.getElementById("viewNgayGui").textContent = contact.ngayGui 
            ? new Date(contact.ngayGui).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : "Chưa có";
        document.getElementById("viewNoiDung").textContent = contact.noiDung || "Chưa có nội dung";
        
        // Hiển thị trạng thái nếu có
        const trangThai = contact.trangThai || "Chưa xử lý";
        let statusClass = "chua-xu-ly";
        if (trangThai.includes("Đã xử lý") || trangThai.includes("Đã")) {
            statusClass = "da-xu-ly";
        } else if (trangThai.includes("Đang") || trangThai.includes("đang")) {
            statusClass = "dang-xu-ly";
        }
        
        document.getElementById("viewTrangThai").innerHTML = `<span class="status-badge ${statusClass}">${escapeHtml(trangThai)}</span>`;
        
        // Set buttons
        const editBtn = document.getElementById("editFromModalBtn");
        const deleteBtn = document.getElementById("deleteFromModalBtn");
        
        editBtn.onclick = () => {
            viewModal.hide();
            setTimeout(() => {
                editContact(currentContactId);
            }, 300);
        };
        
        deleteBtn.onclick = () => {
            viewModal.hide();
            deleteContact(currentContactId);
        };
        
        viewModal.show();
    })
    .catch(err => {
        showToast("Lỗi khi tải thông tin liên hệ", "error");
        console.error(err);
    });
}

// ================================
// MỞ FORM THÊM/SỬA
// ================================
function openForm() {
    document.getElementById("contactId").value = "";
    document.getElementById("hoTen").value = "";
    document.getElementById("email").value = "";
    document.getElementById("noiDung").value = "";
    document.getElementById("modalTitle").textContent = "Thêm liên hệ mới";
    document.getElementById("saveContactBtn").innerHTML = '<i class="fa fa-save"></i> Thêm liên hệ';
    document.getElementById("charCount").textContent = "0";
    contactModal.show();
}

// ================================
// SỬA LIÊN HỆ
// ================================
function editContact(id) {
    fetch(`${API_URL}/${id}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(result => {
        if (!result.success) {
            showToast(result.message || "Không tìm thấy liên hệ", "error");
            return;
        }

        const contact = result.data;
        document.getElementById("contactId").value = contact.id;
        document.getElementById("hoTen").value = contact.hoTen || "";
        document.getElementById("email").value = contact.email || "";
        document.getElementById("noiDung").value = contact.noiDung || "";
        document.getElementById("modalTitle").textContent = "Sửa liên hệ";
        document.getElementById("saveContactBtn").innerHTML = '<i class="fa fa-save"></i> Cập nhật';
        document.getElementById("charCount").textContent = (contact.noiDung || "").length;
        
        contactModal.show();
    })
    .catch(err => {
        showToast("Lỗi khi tải thông tin liên hệ", "error");
        console.error(err);
    });
}

// ================================
// LƯU LIÊN HỆ (THÊM/SỬA)
// ================================
function saveContact() {
    const id = document.getElementById("contactId").value;
    const hoTen = document.getElementById("hoTen").value.trim();
    const email = document.getElementById("email").value.trim();
    const noiDung = document.getElementById("noiDung").value.trim();

    // Validation
    if (!hoTen || hoTen.length < 2) {
        showToast("Họ tên phải có ít nhất 2 ký tự", "error");
        document.getElementById("hoTen").focus();
        return;
    }

    if (!email) {
        showToast("Vui lòng nhập email", "error");
        document.getElementById("email").focus();
        return;
    }

    // Validate email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showToast("Email không hợp lệ", "error");
        document.getElementById("email").focus();
        return;
    }

    if (!noiDung || noiDung.length < 10) {
        showToast("Nội dung phải có ít nhất 10 ký tự", "error");
        document.getElementById("noiDung").focus();
        return;
    }

    if (noiDung.length > 500) {
        showToast("Nội dung không được vượt quá 500 ký tự", "error");
        document.getElementById("noiDung").focus();
        return;
    }

    const data = {
        hoTen: hoTen,
        email: email,
        noiDung: noiDung
    };

    const saveBtn = document.getElementById("saveContactBtn");
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang lưu...';

    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;

        if (result.success !== false) {
            showToast(id ? "✅ Cập nhật liên hệ thành công!" : "✅ Thêm liên hệ thành công!", "success");
            contactModal.hide();
            loadLienHe();
        } else {
            showToast(result.message || "Có lỗi xảy ra", "error");
        }
    })
    .catch(err => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
        showToast("Lỗi: " + err.message, "error");
        console.error(err);
    });
}

// ================================
// XÓA LIÊN HỆ
// ================================
function deleteContact(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa liên hệ này không?")) {
        return;
    }

    fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(result => {
        if (result.success !== false) {
            showToast("✅ Xóa liên hệ thành công!", "success");
            loadLienHe();
            // Đóng modal nếu đang mở
            if (viewModal._isShown) {
                viewModal.hide();
            }
        } else {
            showToast(result.message || "Có lỗi xảy ra", "error");
        }
    })
    .catch(err => {
        showToast("Lỗi: " + err.message, "error");
        console.error(err);
    });
}

// ================================
// ĐẾM KÝ TỰ NỘI DUNG
// ================================
document.getElementById("noiDung").addEventListener("input", function() {
    const charCount = this.value.length;
    document.getElementById("charCount").textContent = charCount;
    
    if (charCount > 500) {
        document.getElementById("charCount").style.color = "#dc3545";
    } else if (charCount > 450) {
        document.getElementById("charCount").style.color = "#ffc107";
    } else {
        document.getElementById("charCount").style.color = "#6c757d";
    }
});

// ================================
// LOAD KHI TRANG ĐƯỢC TẢI
// ================================
document.addEventListener("DOMContentLoaded", () => {
    loadLienHe();
});

