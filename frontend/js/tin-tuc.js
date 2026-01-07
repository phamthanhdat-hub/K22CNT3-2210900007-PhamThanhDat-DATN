// ================================
// LOAD TIN TỨC – BABYCUTIE
// ================================

document.addEventListener("DOMContentLoaded", () => {
    loadTinTuc();
    capNhatSoLuongGio();
});

// ================================
// CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG
// ================================
function capNhatSoLuongGio() {
    try {
        const gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];
        const tong = gioHang.reduce((sum, sp) => sum + (sp.soLuong || 0), 0);
        const cartCountEl = document.getElementById("cartCount");
        if (cartCountEl) {
            cartCountEl.innerText = tong;
        }
    } catch (e) {
        console.error("Lỗi tải giỏ hàng:", e);
    }
}

function loadTinTuc() {
    const loadingState = document.getElementById("loadingState");
    const newsList = document.getElementById("newsList");
    const errorState = document.getElementById("errorState");

    // Hiển thị loading
    loadingState.style.display = "block";
    newsList.style.display = "none";
    errorState.style.display = "none";

    fetch("http://127.0.0.1:5000/api/tin-tuc")
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            // Ẩn loading
            loadingState.style.display = "none";
            newsList.style.display = "block";
            newsList.innerHTML = "";

            if (!data || data.length === 0) {
                newsList.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px;">
                        <div style="font-size: 64px; margin-bottom: 20px;">📰</div>
                        <p style="font-size: 18px; color: #888;">Chưa có tin tức nào.</p>
                        <p style="color: #aaa; margin-top: 10px;">Vui lòng quay lại sau.</p>
                    </div>
                `;
                return;
            }

            // Render từng tin tức
            data.forEach((n, index) => {
                newsList.innerHTML += renderTinTuc(n, index);
            });
        })
        .catch(err => {
            console.error("Lỗi tải tin tức:", err);
            loadingState.style.display = "none";
            errorState.style.display = "block";
        });
}

// ================================
// TEMPLATE 1 BÀI TIN
// ================================
function renderTinTuc(n, index) {
    // Xử lý hình ảnh
    const imageHtml = n.hinhAnh 
        ? `<div class="news-image">
             <img src="http://127.0.0.1:5000/images/${n.hinhAnh}" 
                  alt="${n.tieuDe}" 
                  onerror="this.style.display='none'">
           </div>`
        : "";

    // Xử lý nội dung - nếu quá dài thì cắt ngắn
    const noiDung = n.noiDung || "Nội dung đang được cập nhật...";
    const noiDungRutGon = noiDung.length > 300 
        ? noiDung.substring(0, 300) + "..." 
        : noiDung;

    return `
        <div class="news-card" style="animation-delay: ${index * 0.1}s;">
            ${imageHtml}
            
            <h4>${escapeHtml(n.tieuDe || "Không có tiêu đề")}</h4>

            <small>
                🗓 ${formatDate(n.ngayDang)}
                ${n.nguoiDang ? " | 👤 " + escapeHtml(n.nguoiDang) : ""}
            </small>

            <div class="news-content">
                <p>
                    <b>🥗 Kiến thức dinh dưỡng:</b><br>
                    ${escapeHtml(noiDungRutGon)}
                </p>

                ${noiDung.length > 300 ? `
                <button class="btn-read-more" onclick="toggleFullContent(${n.id}, this)">
                    Đọc thêm...
                </button>
                <div id="fullContent-${n.id}" style="display: none;">
                    <p>${escapeHtml(noiDung)}</p>
                </div>
                ` : ""}
            </div>

            <div class="news-tips">
                <p>
                    <b>💖 Lời khuyên:</b><br>
                    Phụ huynh nên đa dạng thực đơn,
                    theo dõi phản ứng của bé và lựa chọn
                    món ăn phù hợp nhất với thể trạng của bé.
                </p>
            </div>
        </div>
    `;
}

// ================================
// ESCAPE HTML (BẢO MẬT)
// ================================
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// ================================
// TOGGLE FULL CONTENT
// ================================
function toggleFullContent(id, btnElement) {
    const fullContent = document.getElementById(`fullContent-${id}`);
    const btn = btnElement;
    
    if (!fullContent || !btn) return;
    
    if (fullContent.style.display === "none" || !fullContent.style.display) {
        fullContent.style.display = "block";
        btn.textContent = "Thu gọn";
        // Scroll to button after expanding
        btn.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
        fullContent.style.display = "none";
        btn.textContent = "Đọc thêm...";
    }
}

// ================================
// FORMAT DATE
// ================================
function formatDate(dateStr) {
    if (!dateStr) return "Chưa có ngày";
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return dateStr; // Return original if invalid
        }
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    } catch (e) {
        return dateStr;
    }
}
