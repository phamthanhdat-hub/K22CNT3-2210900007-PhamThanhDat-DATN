// ================================
// ADMIN TIN TỨC - CRUD OPERATIONS
// ================================

const API_URL = "http://127.0.0.1:5000/api/admin/tin-tuc";
const IMAGE_URL = "http://127.0.0.1:5000/images/";
const token = localStorage.getItem("admin_token");

// Kiểm tra đăng nhập
if (!token) {
    alert("Vui lòng đăng nhập admin");
    window.location.href = "login-admin.html";
}

const newsModal = new bootstrap.Modal(document.getElementById("newsModal"));
const newsList = document.getElementById("newsList");
const loadingNews = document.getElementById("loadingNews");
const emptyNews = document.getElementById("emptyNews");

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
// LOAD DANH SÁCH TIN TỨC
// ================================
function loadNews() {
    loadingNews.style.display = "block";
    emptyNews.style.display = "none";
    newsList.innerHTML = "";

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
        loadingNews.style.display = "none";

        if (!data || data.length === 0) {
            emptyNews.style.display = "block";
            return;
        }

        emptyNews.style.display = "none";
        renderNewsList(data);
    })
    .catch(err => {
        loadingNews.style.display = "none";
        newsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    <i class="fa fa-exclamation-triangle"></i> 
                    Không thể tải danh sách tin tức. Vui lòng thử lại sau.
                </div>
            </div>
        `;
        console.error("Lỗi load tin tức:", err);
    });
}

// ================================
// RENDER DANH SÁCH TIN TỨC
// ================================
function renderNewsList(data) {
    newsList.innerHTML = "";

    data.forEach((news, index) => {
        const imageUrl = news.hinhAnh 
            ? `${IMAGE_URL}${news.hinhAnh}` 
            : 'https://via.placeholder.com/300x200/ff6b81/ffffff?text=No+Image';
        
        const noiDungShort = news.noiDung 
            ? (news.noiDung.length > 150 ? news.noiDung.substring(0, 150) + "..." : news.noiDung)
            : "Chưa có nội dung";
        
        const ngayDang = news.ngayDang 
            ? new Date(news.ngayDang).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
            : "Chưa có ngày";

        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4";
        card.innerHTML = `
            <div class="admin-news-card">
                <div class="d-flex align-items-start gap-3 mb-3">
                    ${news.hinhAnh ? `
                        <img src="${imageUrl}" 
                             alt="${escapeHtml(news.tieuDe)}" 
                             class="news-image-preview"
                             onerror="this.src='https://via.placeholder.com/100x100/ff6b81/ffffff?text=No+Image'">
                    ` : `
                        <div class="news-image-preview d-flex align-items-center justify-content-center" 
                             style="background: linear-gradient(135deg, #ff6b81, #ff8fa3); color: #fff; font-size: 24px;">
                            <i class="fa fa-newspaper"></i>
                        </div>
                    `}
                    <div class="flex-grow-1">
                        <h5 class="mb-2" style="font-weight: 800; color: #333; line-height: 1.4;">
                            ${escapeHtml(news.tieuDe)}
                        </h5>
                        <p class="text-muted small mb-2" style="line-height: 1.6;">
                            ${escapeHtml(noiDungShort)}
                        </p>
                        <div class="d-flex flex-wrap gap-2 small text-muted">
                            <span><i class="fa fa-user"></i> ${escapeHtml(news.nguoiDang || 'Admin')}</span>
                            <span>•</span>
                            <span><i class="fa fa-calendar"></i> ${ngayDang}</span>
                        </div>
                    </div>
                </div>
                
                <div class="btn-action-group">
                    <button class="btn btn-warning btn-sm" onclick="editNews(${news.id})" title="Sửa">
                        <i class="fa fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteNews(${news.id})" title="Xóa">
                        <i class="fa fa-trash"></i> Xóa
                    </button>
                    <button class="btn btn-info btn-sm" onclick="viewNews(${news.id})" title="Xem chi tiết">
                        <i class="fa fa-eye"></i> Xem
                    </button>
                </div>
            </div>
        `;
        newsList.appendChild(card);
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
    document.getElementById("newsId").value = "";
    document.getElementById("tieuDe").value = "";
    document.getElementById("noiDung").value = "";
    document.getElementById("hinhAnh").value = "";
    document.getElementById("modalTitle").textContent = "Thêm tin tức mới";
    document.getElementById("imagePreview").style.display = "none";
    document.getElementById("saveNewsBtn").innerHTML = '<i class="fa fa-save"></i> Thêm tin tức';
    newsModal.show();
}

// ================================
// SỬA TIN TỨC
// ================================
function editNews(id) {
    fetch(`${API_URL}/${id}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(result => {
        if (!result.success) {
            showToast(result.message || "Không tìm thấy tin tức", "error");
            return;
        }

        const news = result.data;
        document.getElementById("newsId").value = news.id;
        document.getElementById("tieuDe").value = news.tieuDe || "";
        document.getElementById("noiDung").value = news.noiDung || "";
        document.getElementById("hinhAnh").value = news.hinhAnh || "";
        document.getElementById("modalTitle").textContent = "Sửa tin tức";
        document.getElementById("saveNewsBtn").innerHTML = '<i class="fa fa-save"></i> Cập nhật';

        // Preview image nếu có
        if (news.hinhAnh) {
            const previewImg = document.getElementById("previewImage");
            previewImg.src = `${IMAGE_URL}${news.hinhAnh}`;
            document.getElementById("imagePreview").style.display = "block";
        } else {
            document.getElementById("imagePreview").style.display = "none";
        }

        newsModal.show();
    })
    .catch(err => {
        showToast("Lỗi khi tải thông tin tin tức", "error");
        console.error(err);
    });
}

// ================================
// XEM CHI TIẾT TIN TỨC
// ================================
function viewNews(id) {
    fetch(`${API_URL}/${id}`, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(result => {
        if (!result.success) {
            showToast(result.message || "Không tìm thấy tin tức", "error");
            return;
        }

        const news = result.data;
        const imageUrl = news.hinhAnh ? `${IMAGE_URL}${news.hinhAnh}` : '';
        
        // Tạo modal xem chi tiết
        const viewModal = document.createElement('div');
        viewModal.className = 'modal fade';
        viewModal.innerHTML = `
            <div class="modal-dialog modal-lg modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header" style="background: linear-gradient(135deg, #ff6b81, #ff8fa3); color: #fff;">
                        <h5 class="modal-title">
                            <i class="fa fa-newspaper"></i> ${escapeHtml(news.tieuDe)}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${imageUrl ? `<img src="${imageUrl}" class="img-fluid rounded mb-3" style="max-height: 300px; object-fit: cover; width: 100%;" onerror="this.style.display='none'">` : ''}
                        <div class="mb-3">
                            <strong><i class="fa fa-user"></i> Người đăng:</strong> ${escapeHtml(news.nguoiDang || 'Admin')}<br>
                            <strong><i class="fa fa-calendar"></i> Ngày đăng:</strong> ${news.ngayDang ? new Date(news.ngayDang).toLocaleDateString('vi-VN') : 'Chưa có'}
                        </div>
                        <div style="white-space: pre-wrap; line-height: 1.8; color: #555;">
                            ${escapeHtml(news.noiDung || 'Chưa có nội dung')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                        <button type="button" class="btn btn-warning" onclick="editNews(${news.id}); bootstrap.Modal.getInstance(this.closest('.modal')).hide();">
                            <i class="fa fa-edit"></i> Sửa tin tức
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(viewModal);
        const bsModal = new bootstrap.Modal(viewModal);
        bsModal.show();
        
        viewModal.addEventListener('hidden.bs.modal', () => {
            viewModal.remove();
        });
    })
    .catch(err => {
        showToast("Lỗi khi tải thông tin tin tức", "error");
        console.error(err);
    });
}

// ================================
// LƯU TIN TỨC (THÊM/SỬA)
// ================================
function saveNews() {
    const id = document.getElementById("newsId").value;
    const tieuDe = document.getElementById("tieuDe").value.trim();
    const noiDung = document.getElementById("noiDung").value.trim();
    const hinhAnh = document.getElementById("hinhAnh").value.trim();

    // Validation
    if (!tieuDe) {
        showToast("Vui lòng nhập tiêu đề tin tức", "error");
        document.getElementById("tieuDe").focus();
        return;
    }

    if (!noiDung) {
        showToast("Vui lòng nhập nội dung tin tức", "error");
        document.getElementById("noiDung").focus();
        return;
    }

    const data = {
        tieuDe: tieuDe,
        noiDung: noiDung,
        hinhAnh: hinhAnh || null
    };

    const saveBtn = document.getElementById("saveNewsBtn");
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
            showToast(id ? "✅ Cập nhật tin tức thành công!" : "✅ Thêm tin tức thành công!", "success");
            newsModal.hide();
            loadNews();
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
// XÓA TIN TỨC
// ================================
function deleteNews(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa tin tức này không?")) {
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
            showToast("✅ Xóa tin tức thành công!", "success");
            loadNews();
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
// PREVIEW IMAGE
// ================================
document.getElementById("hinhAnh").addEventListener("input", function() {
    const fileName = this.value.trim();
    const preview = document.getElementById("imagePreview");
    const previewImg = document.getElementById("previewImage");
    
    if (fileName) {
        previewImg.src = `${IMAGE_URL}${fileName}`;
        preview.style.display = "block";
    } else {
        preview.style.display = "none";
    }
});

// ================================
// LOAD KHI TRANG ĐƯỢC TẢI
// ================================
document.addEventListener("DOMContentLoaded", () => {
    loadNews();
});


