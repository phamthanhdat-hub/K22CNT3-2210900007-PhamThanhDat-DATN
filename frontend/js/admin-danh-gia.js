const API_URL = "http://127.0.0.1:5000/api/admin/danh-gia";
const API_SAN_PHAM = "http://127.0.0.1:5000/api/thuc-don";

const adminToken = localStorage.getItem("admin_token");
if (!adminToken) {
    window.location.href = "login-admin.html";
}

document.addEventListener('DOMContentLoaded', function() {
    loadSanPham();
    loadDanhGia();
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

// Load danh sách sản phẩm cho filter
async function loadSanPham() {
    try {
        const data = await safeFetch(API_SAN_PHAM, { method: "GET" });
        const select = document.getElementById("filterSanPham");
        
        // Giữ lại option "Tất cả"
        select.innerHTML = '<option value="">Tất cả sản phẩm</option>';
        
        if (data && Array.isArray(data)) {
            data.forEach(sp => {
                const option = document.createElement("option");
                option.value = sp.id;
                option.textContent = sp.tenSanPham;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách sản phẩm:", error);
    }
}

// Load danh sách đánh giá
function loadDanhGia() {
    const reviewsList = document.getElementById("reviewsList");
    
    // Lấy filter values
    const sanPham_id = document.getElementById("filterSanPham").value;
    const soSao = document.getElementById("filterSoSao").value;
    
    // Build URL với query params
    let url = API_URL;
    const params = [];
    if (sanPham_id) params.push(`sanPham_id=${sanPham_id}`);
    if (soSao) params.push(`soSao=${soSao}`);
    if (params.length > 0) {
        url += "?" + params.join("&");
    }
    
    reviewsList.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
        </div>
    `;
    
    safeFetch(url, { method: "GET" })
    .then(data => {
        reviewsList.innerHTML = "";
        
        if (!data || data.length === 0) {
            reviewsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-star"></i>
                    <h4>Chưa có đánh giá nào</h4>
                    <p>Hiện tại chưa có đánh giá nào trong hệ thống.</p>
                </div>
            `;
            return;
        }
        
        data.forEach((review) => {
            const reviewCard = document.createElement("div");
            reviewCard.className = "review-card";
            reviewCard.innerHTML = renderReviewCard(review);
            reviewsList.appendChild(reviewCard);
        });
    })
    .catch(error => {
        const errorMsg = error.message || "Lỗi không xác định";
        showToast(`Lỗi khi tải danh sách: ${errorMsg}`, "error");
        reviewsList.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle"></i> ${errorMsg}
            </div>
        `;
    });
}

// Render một review card
function renderReviewCard(review) {
    const stars = renderStars(review.soSao);
    const imageUrl = review.hinhAnh 
        ? `http://127.0.0.1:5000/images/${review.hinhAnh}` 
        : 'https://via.placeholder.com/60x60/ff6b81/ffffff?text=SP';
    const date = review.ngayDanhGia 
        ? new Date(review.ngayDanhGia).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : 'Chưa có ngày';
    
    const userInitial = (review.hoTen || 'U').charAt(0).toUpperCase();
    
    return `
        <div class="review-header">
            <div class="review-user">
                <div class="review-user-avatar">${userInitial}</div>
                <div class="review-user-info">
                    <h5>${escapeHtml(review.hoTen || 'Khách hàng')}</h5>
                    <small>${escapeHtml(review.email || '')}</small>
                </div>
            </div>
            <div class="review-stars">
                ${stars}
            </div>
        </div>
        
        <div class="review-product">
            <img src="${imageUrl}" alt="${escapeHtml(review.tenSanPham)}" onerror="this.src='https://via.placeholder.com/60x60/ff6b81/ffffff?text=SP'">
            <div class="review-product-info">
                <h6>${escapeHtml(review.tenSanPham)}</h6>
                <small>Sản phẩm ID: ${review.sanPham_id}</small>
            </div>
        </div>
        
        ${review.noiDung ? `
            <div class="review-content">
                ${escapeHtml(review.noiDung)}
            </div>
        ` : ''}
        
        <div class="review-footer">
            <div class="review-date">
                <i class="fas fa-clock"></i> ${date}
            </div>
            <div class="btn-action-group">
                <button class="btn btn-view" onclick="viewReviewDetail(${review.id})">
                    <i class="fas fa-eye"></i> Chi tiết
                </button>
                <button class="btn btn-delete" onclick="deleteReview(${review.id})">
                    <i class="fas fa-trash"></i> Xóa
                </button>
            </div>
        </div>
    `;
}

// Render stars
function renderStars(soSao) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= soSao) {
            html += '<span class="star"><i class="fas fa-star"></i></span>';
        } else {
            html += '<span class="star empty"><i class="far fa-star"></i></span>';
        }
    }
    return html;
}

// Xem chi tiết đánh giá
function viewReviewDetail(id) {
    safeFetch(`${API_URL}/${id}`, { method: "GET" })
    .then(result => {
        if (result.success && result.data) {
            const review = result.data;
            const stars = renderStars(review.soSao);
            const imageUrl = review.hinhAnh 
                ? `http://127.0.0.1:5000/images/${review.hinhAnh}` 
                : 'https://via.placeholder.com/200x200/ff6b81/ffffff?text=SP';
            const date = review.ngayDanhGia 
                ? new Date(review.ngayDanhGia).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
                : 'Chưa có ngày';
            
            const userInitial = (review.hoTen || 'U').charAt(0).toUpperCase();
            
            const modalContent = document.getElementById("reviewDetailContent");
            modalContent.innerHTML = `
                <div class="review-header mb-4">
                    <div class="review-user">
                        <div class="review-user-avatar" style="width: 64px; height: 64px; font-size: 24px;">${userInitial}</div>
                        <div class="review-user-info">
                            <h5>${escapeHtml(review.hoTen || 'Khách hàng')}</h5>
                            <small>${escapeHtml(review.email || '')}</small>
                        </div>
                    </div>
                    <div class="review-stars" style="font-size: 24px;">
                        ${stars}
                    </div>
                </div>
                
                <div class="review-product mb-4" style="padding: 16px;">
                    <img src="${imageUrl}" alt="${escapeHtml(review.tenSanPham)}" style="width: 100px; height: 100px;" onerror="this.src='https://via.placeholder.com/100x100/ff6b81/ffffff?text=SP'">
                    <div class="review-product-info">
                        <h6 style="font-size: 18px;">${escapeHtml(review.tenSanPham)}</h6>
                        <small>Giá: ${new Intl.NumberFormat('vi-VN').format(review.gia)}₫</small><br>
                        <small>Sản phẩm ID: ${review.sanPham_id}</small>
                    </div>
                </div>
                
                ${review.noiDung ? `
                    <div class="review-content mb-4" style="padding: 16px; background: #f8fafc; border-radius: 12px;">
                        <strong>Nội dung đánh giá:</strong>
                        <p style="margin-top: 12px; margin-bottom: 0;">${escapeHtml(review.noiDung)}</p>
                    </div>
                ` : '<p class="text-muted mb-4">Không có nội dung đánh giá.</p>'}
                
                <div class="review-date text-muted">
                    <i class="fas fa-clock"></i> Đánh giá vào: ${date}
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById("reviewDetailModal"));
            modal.show();
        } else {
            showToast("Không tìm thấy đánh giá", "error");
        }
    })
    .catch(error => {
        showToast(`Lỗi khi tải chi tiết: ${error.message}`, "error");
    });
}

// Xóa đánh giá
function deleteReview(id) {
    if (!confirm("Bạn có chắc chắn muốn xóa đánh giá này?\n\nHành động này không thể hoàn tác.")) {
        return;
    }
    
    safeFetch(`${API_URL}/${id}`, { method: "DELETE" })
    .then(result => {
        if (result.success) {
            showToast("Xóa đánh giá thành công!", "success");
            loadDanhGia();
        } else {
            showToast(result.message || "Không thể xóa đánh giá", "error");
        }
    })
    .catch(error => {
        showToast(`Lỗi khi xóa: ${error.message}`, "error");
    });
}

// Reset filter
function resetFilter() {
    document.getElementById("filterSanPham").value = "";
    document.getElementById("filterSoSao").value = "";
    loadDanhGia();
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

