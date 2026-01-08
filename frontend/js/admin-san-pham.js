const API_URL = "http://127.0.0.1:5000/api/admin/san-pham";
const API_THUC_DON = "http://127.0.0.1:5000/api/thuc-don";
const IMAGE_URL = "http://127.0.0.1:5000/images/";

let modal = null;
let danhMucList = [];

// Kiểm tra đăng nhập
const adminToken = localStorage.getItem("admin_token");
if (!adminToken) {
    window.location.href = "login-admin.html";
}

// Initialize modal
document.addEventListener('DOMContentLoaded', function() {
    modal = new bootstrap.Modal(document.getElementById("productModal"));
    loadDanhMuc();
    loadProducts();
});

// Toast notification function
function showToast(message, type = "success") {
    const toastContainer = document.getElementById("toastContainer");
    const toastId = "toast-" + Date.now();
    const bgColor = type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#ffc107";
    const icon = type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle";
    
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${type === "success" ? "success" : type === "error" ? "danger" : "warning"} border-0" role="alert" style="min-width: 300px;">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${icon} me-2"></i>${message}
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

// Load danh mục - chỉ hiển thị: Cháo thịt, Cháo cá, Cháo dinh dưỡng
function loadDanhMuc() {
    fetch(`${API_URL}/danh-muc`)
        .then(res => res.json())
        .then(data => {
            danhMucList = data;
            const select = document.getElementById("danhMucSelect");
            select.innerHTML = '<option value="">Chọn danh mục</option>';
            
            // Lọc chỉ hiển thị 3 danh mục: Cháo thịt, Cháo cá, Cháo dinh dưỡng
            const allowedCategories = ["Cháo thịt", "Cháo cá", "Cháo dinh dưỡng"];
            
            data.forEach(dm => {
                // Kiểm tra nếu tên danh mục chứa một trong các từ khóa
                const tenDanhMuc = dm.tenDanhMuc || "";
                const isAllowed = allowedCategories.some(cat => 
                    tenDanhMuc.toLowerCase().includes(cat.toLowerCase())
                );
                
                if (isAllowed) {
                    select.innerHTML += `<option value="${dm.id}">${dm.tenDanhMuc}</option>`;
                }
            });
            
            // Nếu không tìm thấy danh mục nào, hiển thị tất cả (fallback)
            if (select.options.length === 1) {
                data.forEach(dm => {
                    select.innerHTML += `<option value="${dm.id}">${dm.tenDanhMuc}</option>`;
                });
            }
        })
        .catch(err => {
            console.error("Lỗi load danh mục:", err);
            showToast("Lỗi khi tải danh mục", "error");
        });
}

// Load sản phẩm
function loadProducts() {
    const productList = document.getElementById("productList");
    
    fetch(API_URL, {
        headers: {
            "Authorization": `Bearer ${adminToken}`
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Lỗi kết nối");
        return res.json();
    })
    .then(data => {
        productList.innerHTML = "";
        
        if (!data || data.length === 0) {
            productList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <h4>Chưa có sản phẩm nào</h4>
                    <p>Hãy thêm sản phẩm mới để bắt đầu!</p>
                </div>
            `;
            return;
        }
        
        data.forEach((p) => {
            const productCard = document.createElement("div");
            productCard.className = "product-card";
            productCard.innerHTML = `
                <div class="d-flex align-items-start gap-3">
                    <div>
                        <img src="${IMAGE_URL + (p.hinhAnh || 'default.jpg')}" 
                             alt="${p.tenSanPham}" 
                             class="product-image-preview"
                             onerror="this.src='${IMAGE_URL}default.jpg'">
                    </div>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h5 style="color: #333; margin-bottom: 5px; font-weight: 700;">${p.tenSanPham}</h5>
                                <span class="badge ${p.trangThai ? 'bg-success' : 'bg-secondary'}">
                                    ${p.trangThai ? '✓ Hoạt động' : '✗ Đã ẩn'}
                                </span>
                            </div>
                            <div style="text-align: right;">
                                <h4 style="color: #ff6b81; font-weight: 700; margin: 0;">
                                    ${new Intl.NumberFormat('vi-VN').format(p.gia)}₫
                                </h4>
                            </div>
                        </div>
                        
                        <p class="text-muted mb-2" style="font-size: 14px;">
                            ${p.moTa || 'Chưa có mô tả'}
                        </p>
                        
                        <div class="d-flex flex-wrap gap-3 mb-2" style="font-size: 13px;">
                            <span><strong>Danh mục:</strong> ${p.tenDanhMuc || '-'}</span>
                            ${p.doTuoi ? `<span><strong>Độ tuổi:</strong> ${p.doTuoi}</span>` : ''}
                            ${p.protein ? `<span><strong>Protein:</strong> ${p.protein}g</span>` : ''}
                            ${p.carb ? `<span><strong>Carb:</strong> ${p.carb}g</span>` : ''}
                            ${p.chatBeo ? `<span><strong>Chất béo:</strong> ${p.chatBeo}g</span>` : ''}
                        </div>
                        
                        <div class="btn-action-group">
                            <button class="btn btn-warning" onclick="editProduct(${p.id})">
                                <i class="fas fa-edit"></i> Sửa
                            </button>
                            <button class="btn btn-danger" onclick="deleteProduct(${p.id})">
                                <i class="fas fa-trash"></i> Xóa
                            </button>
                        </div>
                    </div>
                </div>
            `;
            productList.appendChild(productCard);
        });
    })
    .catch(error => {
        showToast("Lỗi khi tải danh sách sản phẩm: " + error.message, "error");
        productList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h4>Lỗi khi tải dữ liệu</h4>
                <p>${error.message}</p>
            </div>
        `;
    });
}

// Update image preview
function updateImagePreview() {
    const hinhAnh = document.getElementById("hinhAnh").value.trim();
    const previewContainer = document.getElementById("imagePreviewContainer");
    const preview = document.getElementById("imagePreview");
    
    if (hinhAnh) {
        preview.src = IMAGE_URL + hinhAnh;
        preview.onerror = function() {
            this.src = IMAGE_URL + 'default.jpg';
        };
        previewContainer.style.display = "block";
    } else {
        previewContainer.style.display = "none";
    }
}

// Open form for adding new product
function openForm() {
    document.getElementById("modalTitle").textContent = "Thêm sản phẩm mới";
    document.getElementById("productId").value = "";
    document.getElementById("tenSanPham").value = "";
    document.getElementById("moTa").value = "";
    document.getElementById("giaSanPham").value = "";
    document.getElementById("hinhAnh").value = "";
    document.getElementById("doTuoi").value = "";
    document.getElementById("protein").value = "";
    document.getElementById("carb").value = "";
    document.getElementById("chatBeo").value = "";
    document.getElementById("danhMucSelect").value = "";
    document.getElementById("trangThai").checked = true;
    document.getElementById("errorMessage").style.display = "none";
    document.getElementById("imagePreviewContainer").style.display = "none";
    modal.show();
}

// Edit product
function editProduct(id) {
    fetch(`${API_THUC_DON}/${id}`, {
        headers: {
            "Authorization": `Bearer ${adminToken}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (!data || !data.id) {
            showToast("Không tìm thấy sản phẩm", "error");
            return;
        }
        
        document.getElementById("modalTitle").textContent = "Sửa sản phẩm";
        document.getElementById("productId").value = data.id;
        document.getElementById("tenSanPham").value = data.tenSanPham || "";
        document.getElementById("moTa").value = data.moTa || "";
        document.getElementById("giaSanPham").value = data.gia || "";
        document.getElementById("hinhAnh").value = data.hinhAnh || "";
        document.getElementById("doTuoi").value = data.doTuoi || "";
        document.getElementById("protein").value = data.protein || "";
        document.getElementById("carb").value = data.carb || "";
        document.getElementById("chatBeo").value = data.chatBeo || "";
        document.getElementById("danhMucSelect").value = data.danhMuc_id || "";
        document.getElementById("trangThai").checked = data.trangThai !== false;
        document.getElementById("errorMessage").style.display = "none";
        
        // Update image preview
        if (data.hinhAnh) {
            updateImagePreview();
        } else {
            document.getElementById("imagePreviewContainer").style.display = "none";
        }
        
        modal.show();
    })
    .catch(error => {
        showToast("Lỗi khi tải thông tin sản phẩm: " + error.message, "error");
        console.error("Error loading product:", error);
    });
}

// Save product (create or update)
function saveProduct() {
    const errorMsg = document.getElementById("errorMessage");
    errorMsg.style.display = "none";
    
    // Validation
    const tenSanPham = document.getElementById("tenSanPham").value.trim();
    const gia = parseFloat(document.getElementById("giaSanPham").value);
    const danhMuc_id = parseInt(document.getElementById("danhMucSelect").value);
    const doTuoi = document.getElementById("doTuoi").value.trim();
    
    if (!tenSanPham || tenSanPham.length < 3) {
        errorMsg.textContent = "Tên sản phẩm phải có ít nhất 3 ký tự";
        errorMsg.style.display = "block";
        document.getElementById("tenSanPham").focus();
        return;
    }
    
    if (!gia || gia <= 0) {
        errorMsg.textContent = "Giá sản phẩm phải lớn hơn 0";
        errorMsg.style.display = "block";
        document.getElementById("giaSanPham").focus();
        return;
    }
    
    if (!danhMuc_id) {
        errorMsg.textContent = "Vui lòng chọn danh mục";
        errorMsg.style.display = "block";
        document.getElementById("danhMucSelect").focus();
        return;
    }
    
    if (!doTuoi) {
        errorMsg.textContent = "Vui lòng chọn độ tuổi";
        errorMsg.style.display = "block";
        document.getElementById("doTuoi").focus();
        return;
    }
    
    const id = document.getElementById("productId").value;
    const data = {
        tenSanPham: tenSanPham,
        moTa: document.getElementById("moTa").value.trim() || null,
        gia: gia,
        hinhAnh: document.getElementById("hinhAnh").value.trim() || null,
        doTuoi: doTuoi || null,
        protein: document.getElementById("protein").value ? parseFloat(document.getElementById("protein").value) : null,
        carb: document.getElementById("carb").value ? parseFloat(document.getElementById("carb").value) : null,
        chatBeo: document.getElementById("chatBeo").value ? parseFloat(document.getElementById("chatBeo").value) : null,
        danhMuc_id: danhMuc_id,
        trangThai: document.getElementById("trangThai").checked ? 1 : 0
    };

    const url = id ? `${API_THUC_DON}/${id}` : API_THUC_DON;
    const method = id ? "PUT" : "POST";
    const saveBtn = document.getElementById("saveBtn");
    const originalText = saveBtn.innerHTML;
    
    // Show loading state
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => {
                throw new Error(err.message || `HTTP ${res.status}: ${res.statusText}`);
            });
        }
        return res.json();
    })
    .then(result => {
        if (result.success !== false) {
            showToast(id ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!", "success");
            modal.hide();
            loadProducts();
        } else {
            errorMsg.textContent = result.message || "Có lỗi xảy ra";
            errorMsg.style.display = "block";
            showToast(result.message || "Có lỗi xảy ra", "error");
        }
    })
    .catch(error => {
        errorMsg.textContent = "Lỗi kết nối: " + error.message;
        errorMsg.style.display = "block";
        showToast("Lỗi kết nối: " + error.message, "error");
        console.error("Save product error:", error);
    })
    .finally(() => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
    });
}

// Delete product
function deleteProduct(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?\n\nLưu ý: Sản phẩm sẽ bị ẩn khỏi danh sách (soft delete).")) {
        return;
    }
    
    fetch(`${API_THUC_DON}/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${adminToken}`
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
    .then(result => {
        if (result.success) {
            showToast("Xóa sản phẩm thành công!", "success");
            loadProducts();
        } else {
            showToast(result.message || "Không thể xóa sản phẩm này", "error");
        }
    })
    .catch(error => {
        showToast("Lỗi khi xóa sản phẩm: " + error.message, "error");
        console.error("Delete product error:", error);
    });
}
