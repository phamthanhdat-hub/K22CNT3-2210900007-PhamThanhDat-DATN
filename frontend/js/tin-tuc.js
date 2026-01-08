// ================================
// LOAD TIN TỨC – BABYCUTIE (ENHANCED)
// ================================

document.addEventListener("DOMContentLoaded", () => {
    loadTinTuc();
});

function loadTinTuc() {
    const newsList = document.getElementById("newsList");
    const loadingNews = document.getElementById("loadingNews");
    const emptyNews = document.getElementById("emptyNews");

    // Show loading
    newsList.innerHTML = "";
    loadingNews.style.display = "block";
    emptyNews.style.display = "none";

    fetch("http://127.0.0.1:5000/api/tin-tuc")
        .then(res => res.json())
        .then(data => {
            loadingNews.style.display = "none";

            if (!data || data.length === 0) {
                emptyNews.style.display = "flex";
                return;
            }

            emptyNews.style.display = "none";
            newsList.innerHTML = "";

            data.forEach((n, index) => {
                const card = document.createElement("div");
                card.className = "news-card";
                card.style.animationDelay = `${index * 0.1}s`;
                card.innerHTML = renderTinTuc(n);
                newsList.appendChild(card);
            });
        })
        .catch(err => {
            loadingNews.style.display = "none";
            newsList.innerHTML = `
                <div class="alert alert-danger text-center" style="grid-column: 1/-1;">
                    <i class="fa fa-exclamation-triangle"></i> 
                    Không thể tải tin tức. Vui lòng thử lại sau.
                </div>
            `;
            console.error(err);
        });
}

// ================================
// TEMPLATE 1 BÀI TIN (ENHANCED)
// ================================
function renderTinTuc(n) {
    const imageUrl = n.hinhAnh 
        ? `http://127.0.0.1:5000/images/${n.hinhAnh}` 
        : 'https://via.placeholder.com/400x220/ff6b81/ffffff?text=BabyCutie';
    
    const noiDung = n.noiDung || "Chưa có nội dung";
    const noiDungShort = noiDung.length > 150 ? noiDung.substring(0, 150) + "..." : noiDung;

    return `
        ${n.hinhAnh ? `<img src="${imageUrl}" alt="${n.tieuDe}" onerror="this.src='https://via.placeholder.com/400x220/ff6b81/ffffff?text=BabyCutie'">` : ''}
        
        <h4>${n.tieuDe}</h4>

        <div class="news-meta">
            <small class="date">
                <i class="fa fa-calendar"></i> ${formatDate(n.ngayDang)}
            </small>
            ${n.nguoiDang ? `
                <small class="author">
                    <i class="fa fa-user"></i> ${n.nguoiDang}
                </small>
            ` : ''}
        </div>

        <div class="news-content">
            <p>${noiDungShort}</p>
        </div>

        <a href="#" class="read-more" onclick="xemChiTiet('${n.tieuDe}', \`${noiDung.replace(/`/g, '\\`')}\`)">
            Đọc thêm <i class="fa fa-arrow-right"></i>
        </a>
    `;
}

// ================================
// FORMAT DATE
// ================================
function formatDate(dateStr) {
    if (!dateStr) return "Chưa có ngày";
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

// ================================
// XEM CHI TIẾT
// ================================
function xemChiTiet(tieuDe, noiDung) {
    const modal = document.createElement("div");
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 24px;
            padding: 40px;
            max-width: 700px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative;
        ">
            <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" 
                    style="
                        position: absolute;
                        top: 15px;
                        right: 15px;
                        background: #ff6b81;
                        color: white;
                        border: none;
                        width: 35px;
                        height: 35px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 18px;
                    ">×</button>
            <h2 style="color: #ff6b81; margin-bottom: 20px; font-weight: 900;">${tieuDe}</h2>
            <div style="color: #666; line-height: 1.9; white-space: pre-wrap;">${noiDung}</div>
        </div>
    `;
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    document.body.appendChild(modal);
}
