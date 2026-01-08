const API_URL = "http://127.0.0.1:5000/api/admin/danh-muc";

let modal = null;
const adminToken = localStorage.getItem("admin_token");
if (!adminToken) {
    window.location.href = "login-admin.html";
}

document.addEventListener('DOMContentLoaded', function() {
    modal = new bootstrap.Modal(document.getElementById("categoryModal"));
    loadCategories();
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

function loadCategories() {
    const categoryList = document.getElementById("categoryList");
    
    safeFetch(API_URL, { method: "GET" })
    .then(data => {
        categoryList.innerHTML = "";
        
        if (!data || data.length === 0) {
            categoryList.innerHTML = `
                <div class="empty-state text-center py-5">
                    <i class="fas fa-folder-open" style="font-size: 64px; color: #94a3b8; margin-bottom: 20px;"></i>
                    <h4>Chưa có danh mục nào</h4>
                    <p>Hãy thêm danh mục mới để bắt đầu!</p>
                </div>
            `;
            return;
        }
        
        data.forEach((cat) => {
            const categoryCard = document.createElement("div");
            categoryCard.className = "category-card";
            categoryCard.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5 style="color: #333; margin-bottom: 10px; font-weight: 700;">${cat.tenDanhMuc}</h5>
                        ${cat.moTa ? `<p class="text-muted mb-2" style="font-size: 14px;">${cat.moTa}</p>` : ''}
                        ${cat.danhMucCha_id ? `<small class="text-muted"><i class="fas fa-layer-group"></i> Danh mục con</small>` : '<small class="text-muted"><i class="fas fa-folder"></i> Danh mục gốc</small>'}
                    </div>
                    <div class="btn-action-group">
                        <button class="btn btn-warning" onclick="editCategory(${cat.id})">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="btn btn-danger" onclick="deleteCategory(${cat.id})">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            `;
            categoryList.appendChild(categoryCard);
        });
    })
    .catch(error => {
        const errorMsg = error.message || "Lỗi không xác định";
        showToast(`Lỗi khi tải danh sách: ${errorMsg}`, "error");
        categoryList.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> ${errorMsg}
            </div>
        `;
    });
}

function loadParentCategories() {
    safeFetch(API_URL, { method: "GET" })
    .then(data => {
        const select = document.getElementById("danhMucCha_id");
        select.innerHTML = '<option value="">Không có (danh mục gốc)</option>';
        data.forEach(cat => {
            select.innerHTML += `<option value="${cat.id}">${cat.tenDanhMuc}</option>`;
        });
    })
    .catch(err => console.error("Lỗi load danh mục cha:", err));
}

function openForm() {
    document.getElementById("modalTitle").textContent = "Thêm danh mục";
    document.getElementById("categoryId").value = "";
    document.getElementById("tenDanhMuc").value = "";
    document.getElementById("moTa").value = "";
    document.getElementById("danhMucCha_id").value = "";
    document.getElementById("errorMessage").style.display = "none";
    loadParentCategories();
    modal.show();
}

function editCategory(id) {
    safeFetch(`${API_URL}/${id}`, { method: "GET" })
    .then(data => {
        document.getElementById("modalTitle").textContent = "Sửa danh mục";
        document.getElementById("categoryId").value = data.id;
        document.getElementById("tenDanhMuc").value = data.tenDanhMuc || "";
        document.getElementById("moTa").value = data.moTa || "";
        document.getElementById("danhMucCha_id").value = data.danhMucCha_id || "";
        document.getElementById("errorMessage").style.display = "none";
        loadParentCategories();
        setTimeout(() => {
            document.getElementById("danhMucCha_id").value = data.danhMucCha_id || "";
        }, 100);
        modal.show();
    })
    .catch(error => {
        showToast(`Lỗi khi tải thông tin: ${error.message}`, "error");
    });
}

function saveCategory() {
    const errorMsg = document.getElementById("errorMessage");
    errorMsg.style.display = "none";
    
    const tenDanhMuc = document.getElementById("tenDanhMuc").value.trim();
    const moTa = document.getElementById("moTa").value.trim();
    const danhMucCha_id = document.getElementById("danhMucCha_id").value || null;
    
    if (!tenDanhMuc || tenDanhMuc.length < 2) {
        errorMsg.textContent = "Tên danh mục phải có ít nhất 2 ký tự";
        errorMsg.style.display = "block";
        return;
    }
    
    const id = document.getElementById("categoryId").value;
    const data = {
        tenDanhMuc: tenDanhMuc,
        moTa: moTa || null,
        danhMucCha_id: danhMucCha_id ? parseInt(danhMucCha_id) : null
    };
    
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
            showToast(id ? "Cập nhật danh mục thành công!" : "Thêm danh mục thành công!", "success");
            modal.hide();
            loadCategories();
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

function deleteCategory(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?\n\nLưu ý: Không thể xóa nếu danh mục đang có sản phẩm hoặc danh mục con.")) {
        return;
    }
    
    safeFetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(result => {
        if (result.success) {
            showToast("Xóa danh mục thành công!", "success");
            loadCategories();
        } else {
            showToast(result.message || "Không thể xóa danh mục này", "error");
        }
    })
    .catch(error => {
        showToast(`Lỗi khi xóa: ${error.message}`, "error");
    });
}

