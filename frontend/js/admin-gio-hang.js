// ================================
// ADMIN GIỎ HÀNG - CRUD OPERATIONS
// ================================

const API_URL = "http://127.0.0.1:5000/api/admin/gio-hang";
const API_KHACH_HANG = `${API_URL}/khach-hang`;
const API_SAN_PHAM = `${API_URL}/san-pham`;
const IMAGE_URL = "http://127.0.0.1:5000/images/";
const token = localStorage.getItem("admin_token");

// Kiểm tra đăng nhập
if (!token) {
    alert("Vui lòng đăng nhập admin");
    window.location.href = "login-admin.html";
}

const cartModal = new bootstrap.Modal(document.getElementById("cartModal"));
const editQuantityModal = new bootstrap.Modal(document.getElementById("editQuantityModal"));
const gioHangList = document.getElementById("gioHangList");
const loadingGioHang = document.getElementById("loadingGioHang");
const emptyGioHang = document.getElementById("emptyGioHang");
let allGioHang = [];
let currentEditId = null;
let allKhachHang = [];
let allSanPham = [];

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
// LOAD DANH SÁCH KHÁCH HÀNG
// ================================
function loadKhachHang() {
    fetch(API_KHACH_HANG, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success === false) {
            console.error("Lỗi load khách hàng:", data.message);
            return;
        }
        
        allKhachHang = data;
        const select = document.getElementById("nguoiDungSelect");
        select.innerHTML = '<option value="">Chọn khách hàng...</option>';
        
        data.forEach(kh => {
            const option = document.createElement('option');
            option.value = kh.id;
            option.textContent = `${kh.hoTen} (${kh.email})`;
            select.appendChild(option);
        });
    })
    .catch(err => {
        console.error("Lỗi load khách hàng:", err);
    });
}

// ================================
// LOAD DANH SÁCH SẢN PHẨM
// ================================
function loadSanPham() {
    fetch(API_SAN_PHAM, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success === false) {
            console.error("Lỗi load sản phẩm:", data.message);
            return;
        }
        
        allSanPham = data;
        const select = document.getElementById("sanPhamSelect");
        select.innerHTML = '<option value="">Chọn sản phẩm...</option>';
        
        data.forEach(sp => {
            const option = document.createElement('option');
            option.value = sp.id;
            option.textContent = `${sp.tenSanPham} - ${sp.gia.toLocaleString()}₫ ${sp.trangThai ? '' : '(Đã ẩn)'}`;
            option.dataset.gia = sp.gia;
            option.dataset.hinhAnh = sp.hinhAnh;
            option.dataset.trangThai = sp.trangThai;
            select.appendChild(option);
        });
    })
    .catch(err => {
        console.error("Lỗi load sản phẩm:", err);
    });
}

// ================================
// PREVIEW SẢN PHẨM
// ================================
document.getElementById("sanPhamSelect").addEventListener("change", function() {
    const selectedOption = this.options[this.selectedIndex];
    const preview = document.getElementById("productPreview");
    
    if (selectedOption.value) {
        const gia = parseFloat(selectedOption.dataset.gia);
        const hinhAnh = selectedOption.dataset.hinhAnh;
        const tenSanPham = selectedOption.textContent.split(' - ')[0];
        
        document.getElementById("previewName").textContent = tenSanPham;
        document.getElementById("previewPrice").textContent = gia.toLocaleString() + "₫";
        document.getElementById("previewImage").src = hinhAnh 
            ? `${IMAGE_URL}${hinhAnh}` 
            : 'https://via.placeholder.com/60x60/ff6b81/ffffff?text=No+Image';
        preview.style.display = "flex";
    } else {
        preview.style.display = "none";
    }
});

// ================================
// LOAD DANH SÁCH GIỎ HÀNG
// ================================
function loadGioHang() {
    loadingGioHang.style.display = "block";
    emptyGioHang.style.display = "none";
    gioHangList.innerHTML = "";

    fetch(API_URL, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
    })
    .then(data => {
        loadingGioHang.style.display = "none";

        if (data.success === false) {
            showToast(data.message || "Lỗi khi tải giỏ hàng", "error");
            return;
        }

        if (!data || data.length === 0) {
            emptyGioHang.style.display = "block";
            return;
        }

        emptyGioHang.style.display = "none";
        allGioHang = data;
        
        // Filter
        const searchName = document.getElementById("searchInput").value.toLowerCase();
        const searchProduct = document.getElementById("searchProductInput").value.toLowerCase();
        
        let filtered = data;
        if (searchName) {
            filtered = filtered.filter(item => 
                (item.hoTen || "").toLowerCase().includes(searchName)
            );
        }
        if (searchProduct) {
            filtered = filtered.filter(item => 
                (item.tenSanPham || "").toLowerCase().includes(searchProduct)
            );
        }

        renderGioHangList(filtered);
    })
    .catch(err => {
        loadingGioHang.style.display = "none";
        gioHangList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="fa fa-exclamation-triangle"></i> 
                    Không thể tải danh sách giỏ hàng. Vui lòng thử lại sau.
                </div>
            </div>
        `;
        console.error("Lỗi load giỏ hàng:", err);
    });
}

// ================================
// RENDER DANH SÁCH GIỎ HÀNG
// ================================
function renderGioHangList(data) {
    gioHangList.innerHTML = "";

    data.forEach((item, index) => {
        const thanhTien = item.gia * item.soLuong;
        const imageUrl = item.hinhAnh 
            ? `${IMAGE_URL}${item.hinhAnh}` 
            : 'https://via.placeholder.com/80x80/ff6b81/ffffff?text=No+Image';

        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4";
        card.innerHTML = `
            <div class="cart-item-card">
                <div class="cart-item-header">
                    <div class="customer-info">
                        <div class="customer-name">
                            <i class="fa fa-user-circle"></i> ${escapeHtml(item.hoTen || 'Không tên')}
                        </div>
                        <a href="mailto:${escapeHtml(item.email)}" class="customer-email">
                            <i class="fa fa-envelope"></i> ${escapeHtml(item.email || 'Không có email')}
                        </a>
                        <div style="color: #999; font-size: 14px; margin-top: 5px;">
                            <i class="fa fa-phone"></i> ${escapeHtml(item.dienThoai || 'Không có')}
                        </div>
                    </div>
                </div>
                
                <div class="product-info">
                    <img src="${imageUrl}" 
                         alt="${escapeHtml(item.tenSanPham)}" 
                         class="product-image"
                         onerror="this.src='https://via.placeholder.com/80x80/ff6b81/ffffff?text=No+Image'">
                    <div class="product-details">
                        <div class="product-name">${escapeHtml(item.tenSanPham)}</div>
                        <div class="product-price">${item.gia.toLocaleString()}₫</div>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center mt-3">
                    <div>
                        <span style="color: #999; font-size: 14px;">Số lượng:</span>
                        <span class="quantity-badge">${item.soLuong}</span>
                    </div>
                    <div>
                        <span style="color: #999; font-size: 14px;">Thành tiền:</span>
                        <span class="total-price">${thanhTien.toLocaleString()}₫</span>
                    </div>
                </div>
                
                <div class="btn-action-group">
                    <button class="btn btn-warning btn-sm" onclick="editCart(${item.id})" title="Sửa">
                        <i class="fa fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-info btn-sm" onclick="openEditQuantityModal(${item.id}, ${item.soLuong})" title="Sửa số lượng">
                        <i class="fa fa-hashtag"></i> Số lượng
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteCart(${item.id})" title="Xóa">
                        <i class="fa fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        `;
        gioHangList.appendChild(card);
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
// MỞ FORM THÊM/SỬA
// ================================
function openForm() {
    document.getElementById("cartId").value = "";
    document.getElementById("nguoiDungSelect").value = "";
    document.getElementById("sanPhamSelect").value = "";
    document.getElementById("soLuong").value = "1";
    document.getElementById("modalTitle").textContent = "Thêm sản phẩm vào giỏ hàng";
    document.getElementById("saveCartBtn").innerHTML = '<i class="fa fa-save"></i> Thêm vào giỏ hàng';
    document.getElementById("productPreview").style.display = "none";
    cartModal.show();
}

// ================================
// SỬA GIỎ HÀNG
// ================================
function editCart(id) {
    fetch(`${API_URL}/${id}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(result => {
        if (!result.success) {
            showToast(result.message || "Không tìm thấy giỏ hàng", "error");
            return;
        }

        const cart = result.data;
        document.getElementById("cartId").value = cart.id;
        document.getElementById("nguoiDungSelect").value = cart.nguoiDung_id;
        document.getElementById("sanPhamSelect").value = cart.sanPham_id;
        document.getElementById("soLuong").value = cart.soLuong;
        document.getElementById("modalTitle").textContent = "Sửa giỏ hàng";
        document.getElementById("saveCartBtn").innerHTML = '<i class="fa fa-save"></i> Cập nhật';

        // Trigger preview
        const select = document.getElementById("sanPhamSelect");
        select.dispatchEvent(new Event('change'));

        cartModal.show();
    })
    .catch(err => {
        showToast("Lỗi khi tải thông tin giỏ hàng", "error");
        console.error(err);
    });
}

// ================================
// LƯU GIỎ HÀNG (THÊM/SỬA)
// ================================
function saveCart() {
    const id = document.getElementById("cartId").value;
    const nguoiDung_id = document.getElementById("nguoiDungSelect").value;
    const sanPham_id = document.getElementById("sanPhamSelect").value;
    const soLuong = parseInt(document.getElementById("soLuong").value);

    // Validation
    if (!nguoiDung_id) {
        showToast("Vui lòng chọn khách hàng", "error");
        document.getElementById("nguoiDungSelect").focus();
        return;
    }

    if (!sanPham_id) {
        showToast("Vui lòng chọn sản phẩm", "error");
        document.getElementById("sanPhamSelect").focus();
        return;
    }

    if (!soLuong || soLuong <= 0) {
        showToast("Số lượng phải lớn hơn 0", "error");
        document.getElementById("soLuong").focus();
        return;
    }

    const data = {
        nguoiDung_id: parseInt(nguoiDung_id),
        sanPham_id: parseInt(sanPham_id),
        soLuong: soLuong
    };

    const saveBtn = document.getElementById("saveCartBtn");
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang lưu...';

    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? "PUT" : "POST";

    // Nếu là PUT, cần gửi cả sanPham_id và soLuong
    if (id && method === "PUT") {
        data.sanPham_id = parseInt(sanPham_id);
    }

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
            showToast(id ? "✅ Cập nhật giỏ hàng thành công!" : "✅ Thêm vào giỏ hàng thành công!", "success");
            cartModal.hide();
            loadGioHang();
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
// MỞ MODAL SỬA SỐ LƯỢNG
// ================================
function openEditQuantityModal(id, soLuong) {
    currentEditId = id;
    document.getElementById("editQuantityInput").value = soLuong;
    editQuantityModal.show();
}

// ================================
// LƯU SỐ LƯỢNG
// ================================
function saveQuantity() {
    const soLuong = parseInt(document.getElementById("editQuantityInput").value);
    
    if (!soLuong || soLuong <= 0) {
        showToast("Số lượng phải lớn hơn 0", "error");
        return;
    }

    fetch(`${API_URL}/${currentEditId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ soLuong: soLuong })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success !== false) {
            showToast("✅ Cập nhật số lượng thành công!", "success");
            editQuantityModal.hide();
            loadGioHang();
        } else {
            showToast(data.message || "Có lỗi xảy ra", "error");
        }
    })
    .catch(err => {
        showToast("Lỗi: " + err.message, "error");
        console.error(err);
    });
}

// ================================
// XÓA GIỎ HÀNG
// ================================
function deleteCart(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng không?")) {
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
            showToast("✅ Xóa giỏ hàng thành công!", "success");
            loadGioHang();
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
// SEARCH ON ENTER
// ================================
document.getElementById("searchInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") loadGioHang();
});
document.getElementById("searchProductInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") loadGioHang();
});

// ================================
// LOAD KHI TRANG ĐƯỢC TẢI
// ================================
document.addEventListener("DOMContentLoaded", () => {
    loadKhachHang();
    loadSanPham();
    loadGioHang();
});

