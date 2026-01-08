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
                card.style.animationDelay = `${index * 0.08}s`;
                card.innerHTML = renderTinTuc(n);
                newsList.appendChild(card);
                
                // Thêm intersection observer để animate khi scroll vào view
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'scale(1) translateY(0)';
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1 });
                
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95) translateY(20px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                setTimeout(() => {
                    observer.observe(card);
                }, 100);
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
    // Escape HTML để tránh XSS và xử lý xuống dòng
    const noiDungEscaped = escapeHtml(noiDung);
    const noiDungShort = noiDung.length > 150 ? noiDung.substring(0, 150) + "..." : noiDung;
    const noiDungShortEscaped = escapeHtml(noiDungShort);

    return `
        ${n.hinhAnh ? `<img src="${imageUrl}" alt="${escapeHtml(n.tieuDe)}" onerror="this.src='https://via.placeholder.com/400x220/ff6b81/ffffff?text=BabyCutie'">` : ''}
        
        <h4>${escapeHtml(n.tieuDe)}</h4>

        <div class="news-meta">
            <small class="date">
                <i class="fa fa-calendar"></i> ${formatDate(n.ngayDang)}
            </small>
            ${n.nguoiDang ? `
                <small class="author">
                    <i class="fa fa-user"></i> ${escapeHtml(n.nguoiDang)}
                </small>
            ` : ''}
        </div>

        <div class="news-content">
            <p>${noiDungShortEscaped}</p>
        </div>

        <a href="#" class="read-more" onclick="event.preventDefault(); xemChiTiet(${n.id}, '${escapeHtml(n.tieuDe).replace(/'/g, "\\'")}', \`${noiDungEscaped.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, '${imageUrl}')">
            Đọc thêm <i class="fa fa-arrow-right"></i>
        </a>
    `;
}

// Escape HTML để tránh XSS
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
function xemChiTiet(id, tieuDe, noiDung, hinhAnh) {
    const modal = document.createElement("div");
    modal.className = "news-detail-modal";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
        animation: fadeIn 0.3s ease;
    `;
    
    const imageHtml = hinhAnh && hinhAnh !== 'https://via.placeholder.com/400x220/ff6b81/ffffff?text=BabyCutie' 
        ? `<img src="${hinhAnh}" alt="${tieuDe}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 20px; margin-bottom: 25px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);">` 
        : '';
    
    modal.innerHTML = `
        <div class="news-detail-content" style="
            background: linear-gradient(135deg, #ffffff, #fff6f8);
            border-radius: 32px;
            padding: 45px;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 70px rgba(0,0,0,0.4);
            position: relative;
            border: 2px solid rgba(255,107,129,0.2);
            animation: slideUp 0.4s ease;
        ">
            <button onclick="this.closest('.news-detail-modal').remove()" 
                    style="
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, #ff6b81, #ff8fa3);
                        color: white;
                        border: none;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 22px;
                        font-weight: 900;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 15px rgba(255,107,129,0.3);
                        z-index: 1;
                    "
                    onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 20px rgba(255,107,129,0.5)'"
                    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(255,107,129,0.3)'"
            >×</button>
            
            ${imageHtml}
            
            <h2 style="
                color: #ff6b81; 
                margin-bottom: 20px; 
                font-weight: 900;
                font-size: 32px;
                line-height: 1.3;
                background: linear-gradient(135deg, #ff6b81, #ff8fa3);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            ">${tieuDe}</h2>
            
            <div style="
                color: #555; 
                line-height: 2; 
                white-space: pre-wrap;
                font-size: 16px;
                text-align: justify;
            ">${noiDung}</div>
        </div>
    `;
    
    // Thêm CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(30px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
        .news-detail-content::-webkit-scrollbar {
            width: 8px;
        }
        .news-detail-content::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        .news-detail-content::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #ff6b81, #ff8fa3);
            border-radius: 10px;
        }
        .news-detail-content::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #ff5a75, #ff7a95);
        }
    `;
    document.head.appendChild(style);
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    // Đóng bằng phím ESC
    const closeOnEsc = function(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    document.body.appendChild(modal);
}
