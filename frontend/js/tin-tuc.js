// ================================
// LOAD TIN TỨC – BABYCUTIE (ENHANCED)
// ================================

document.addEventListener("DOMContentLoaded", () => {
    loadTinTuc();
    updateBookmarkButtons();
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
            
            // Lưu data vào sessionStorage để dùng sau
            sessionStorage.setItem('allNews', JSON.stringify(data));

            data.forEach((n, index) => {
                const card = document.createElement("div");
                card.className = "news-card-wrapper";
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
                    updateBookmarkButtons();
                    updateLikeButtons();
                    updateViewsCounters();
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
// TEMPLATE 1 BÀI TIN (ENHANCED - GIỐNG HÌNH ẢNH)
// ================================
function renderTinTuc(n) {
    const imageUrl = n.hinhAnh 
        ? `http://127.0.0.1:5000/images/${n.hinhAnh}` 
        : 'https://via.placeholder.com/400x220/ff6b81/ffffff?text=BabyCutie';
    
    const noiDung = n.noiDung || "Chưa có nội dung";
    const noiDungEscaped = escapeHtml(noiDung);
    const noiDungShort = noiDung.length > 120 ? noiDung.substring(0, 120) + "..." : noiDung;
    const noiDungShortEscaped = escapeHtml(noiDungShort);
    
    // Tính thời gian đọc (ước tính 200 từ/phút)
    const readingTime = Math.ceil((noiDung.length / 200) || 1);
    
    // Category mặc định (có thể mở rộng sau)
    const category = "DINH DƯỠNG";

    return `
        <div class="news-card-wrapper">
            <!-- Category Badge -->
            <div class="news-category-badge">${category}</div>
            
            <!-- Image -->
            <div class="news-card-image-wrapper">
                ${n.hinhAnh ? `<img src="${imageUrl}" alt="${escapeHtml(n.tieuDe)}" onerror="this.src='https://via.placeholder.com/400x250/ff6b81/ffffff?text=BabyCutie'">` : ''}
            </div>
            
            <!-- Body -->
            <div class="news-card-body">
                <!-- Title với icons -->
                <div class="news-title-row">
                    <h4 onclick="xemChiTiet(${n.id}, '${escapeHtml(n.tieuDe).replace(/'/g, "\\'")}', \`${noiDungEscaped.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, '${imageUrl}', '${category}')">${escapeHtml(n.tieuDe)}</h4>
                    <div class="news-title-actions">
                        <button class="btn-icon" onclick="event.stopPropagation(); bookmarkNews(${n.id})" title="Lưu bài viết">
                            <i class="fa fa-bookmark"></i>
                        </button>
                        <button class="btn-icon" onclick="event.stopPropagation(); shareNews(${n.id}, '${escapeHtml(n.tieuDe).replace(/'/g, "\\'")}')" title="Chia sẻ">
                            <i class="fa fa-share-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- Meta Info -->
                <div class="news-meta">
                    <div class="news-author-info">
                        <i class="fa fa-user-circle"></i>
                        <span>Đăng bởi ${n.nguoiDang || 'Admin'}</span>
                    </div>
                    <div class="news-date-time">
                        <span class="date">${formatDate(n.ngayDang)}</span>
                        <span class="separator">•</span>
                        <span class="reading-time">${readingTime} phút đọc</span>
                    </div>
                </div>

                <!-- Content Preview -->
                <div class="news-content">
                    <p>${noiDungShortEscaped}</p>
                </div>

                <!-- Read More -->
                <a href="#" class="read-more" onclick="event.preventDefault(); xemChiTiet(${n.id}, '${escapeHtml(n.tieuDe).replace(/'/g, "\\'")}', \`${noiDungEscaped.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`, '${imageUrl}', '${category}')">
                    Đọc thêm <i class="fa fa-arrow-right"></i>
                </a>
            </div>
            
            <!-- Social Sidebar (Mini) -->
            <div class="news-social-mini">
                <div class="social-item" onclick="event.stopPropagation(); commentNews(${n.id})">
                    <i class="fa fa-comment"></i>
                    <span class="comment-count-${n.id}">0</span>
                </div>
                <div class="social-item" onclick="event.stopPropagation(); likeNews(${n.id})" id="mini-like-${n.id}">
                    <i class="fa fa-heart"></i>
                    <span class="like-count-${n.id}">0</span>
                </div>
                <div class="social-item" onclick="event.stopPropagation(); shareNews(${n.id}, '${escapeHtml(n.tieuDe).replace(/'/g, "\\'")}')">
                    <i class="fa fa-share"></i>
                </div>
            </div>
        </div>
    `;
}

// Bookmark news
function bookmarkNews(id) {
    // Có thể lưu vào localStorage hoặc gọi API
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
    if (bookmarks.includes(id)) {
        bookmarks.splice(bookmarks.indexOf(id), 1);
        if (typeof showToast === 'function') {
            showToast("Đã bỏ lưu bài viết", "info");
        }
    } else {
        bookmarks.push(id);
        if (typeof showToast === 'function') {
            showToast("Đã lưu bài viết", "success");
        }
    }
    localStorage.setItem('bookmarkedNews', JSON.stringify(bookmarks));
    updateBookmarkButtons();
}

// Share news
function shareNews(id, title) {
    const url = window.location.href.split('#')[0] + `#news-${id}`;
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: title + " - BabyCutie",
            url: url
        }).then(() => {
            showToast("Đã chia sẻ bài viết thành công!", "success");
        }).catch((err) => {
            // User cancelled hoặc lỗi
            if (err.name !== 'AbortError') {
                copyToClipboard(url);
            }
        });
    } else {
        // Fallback: copy to clipboard
        copyToClipboard(url);
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast("✅ Đã sao chép link bài viết!", "success");
        }).catch(() => {
            // Fallback cho trình duyệt cũ
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast("✅ Đã sao chép link bài viết!", "success");
            } catch (err) {
                showToast("❌ Không thể sao chép", "error");
            }
            document.body.removeChild(textarea);
        });
    } else {
        showToast("❌ Trình duyệt không hỗ trợ sao chép", "error");
    }
}

// Like news
function likeNews(id) {
    const likes = JSON.parse(localStorage.getItem('likedNews') || '[]');
    const likeCounts = JSON.parse(localStorage.getItem('newsLikeCounts') || '{}');
    
    // Initialize count if not exists
    if (!likeCounts[id]) {
        likeCounts[id] = Math.floor(Math.random() * 50) + 10;
    }
    
    if (likes.includes(id)) {
        likes.splice(likes.indexOf(id), 1);
        likeCounts[id] = Math.max(0, likeCounts[id] - 1);
        showToast("Đã bỏ thích bài viết", "info");
        
        // Update UI immediately
        const likeBtn = document.getElementById(`likeBtn-${id}`);
        if (likeBtn) {
            likeBtn.classList.remove('liked');
            const icon = likeBtn.querySelector('i.fa-heart');
            if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
            const countSpan = likeBtn.querySelector(`.like-count-${id}`);
            if (countSpan) {
                countSpan.textContent = likeCounts[id];
            }
        }
    } else {
        likes.push(id);
        likeCounts[id] = (likeCounts[id] || 0) + 1;
        showToast("❤️ Đã thích bài viết", "success");
        
        // Update UI immediately
        const likeBtn = document.getElementById(`likeBtn-${id}`);
        if (likeBtn) {
            likeBtn.classList.add('liked');
            const icon = likeBtn.querySelector('i.fa-heart');
            if (icon) {
                icon.classList.add('fas');
                icon.classList.remove('far');
            }
            const countSpan = likeBtn.querySelector(`.like-count-${id}`);
            if (countSpan) {
                countSpan.textContent = likeCounts[id];
            }
        }
    }
    
    localStorage.setItem('likedNews', JSON.stringify(likes));
    localStorage.setItem('newsLikeCounts', JSON.stringify(likeCounts));
    
    // Update all like buttons and counts
    setTimeout(() => {
        updateLikeButtons();
        updateLikeCounts();
    }, 50);
}

// Comment news (placeholder - có thể mở rộng sau)
function commentNews(id) {
    showToast("Tính năng bình luận đang được phát triển", "info");
    // Có thể mở modal comment hoặc redirect đến trang comment
}

// Update views counter
function updateViewsCounter(id) {
    const views = JSON.parse(localStorage.getItem('newsViews') || '{}');
    if (!views[id]) {
        views[id] = 0;
    }
    views[id]++;
    localStorage.setItem('newsViews', JSON.stringify(views));
    updateViewsCounters();
}

// Format views number
function formatViews(count) {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
}

// Update bookmark buttons
function updateBookmarkButtons() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
    
    // Update buttons in cards
    document.querySelectorAll('.btn-icon[onclick*="bookmarkNews"], .btn-action[onclick*="bookmarkNews"]').forEach(btn => {
        const match = btn.getAttribute('onclick').match(/bookmarkNews\((\d+)\)/);
        if (match) {
            const newsId = parseInt(match[1]);
            const icon = btn.querySelector('i');
            if (bookmarks.includes(newsId)) {
                if (icon) {
                    icon.classList.add('fas');
                    icon.classList.remove('far');
                }
                btn.classList.add('bookmarked');
            } else {
                if (icon) {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
                btn.classList.remove('bookmarked');
            }
        }
    });
}

// Update like buttons
function updateLikeButtons() {
    const likes = JSON.parse(localStorage.getItem('likedNews') || '[]');
    
    // Update sidebar items
    document.querySelectorAll('.sidebar-item[onclick*="likeNews"]').forEach(btn => {
        const match = btn.getAttribute('onclick').match(/likeNews\((\d+)\)/);
        if (match) {
            const newsId = parseInt(match[1]);
            const icon = btn.querySelector('i.fa-heart');
            if (icon) {
                if (likes.includes(newsId)) {
                    icon.classList.add('fas');
                    icon.classList.remove('far');
                    btn.classList.add('liked');
                    btn.style.background = 'linear-gradient(135deg, #ff4d6d, #ff6b81)';
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    btn.classList.remove('liked');
                    btn.style.background = 'linear-gradient(135deg, #ff6b81, #ff8fa3)';
                }
            }
        }
    });
    
    // Update mini social items
    document.querySelectorAll('.social-item[onclick*="likeNews"]').forEach(btn => {
        const match = btn.getAttribute('onclick').match(/likeNews\((\d+)\)/);
        if (match) {
            const newsId = parseInt(match[1]);
            const icon = btn.querySelector('i.fa-heart');
            if (icon && likes.includes(newsId)) {
                icon.classList.add('fas');
                icon.classList.remove('far');
            } else if (icon) {
                icon.classList.remove('fas');
                icon.classList.add('far');
            }
        }
    });
}

// Update like counts
function updateLikeCounts() {
    const likeCounts = JSON.parse(localStorage.getItem('newsLikeCounts') || '{}');
    
    // Initialize counts for all news if not exists
    document.querySelectorAll('[class*="like-count-"]').forEach(el => {
        const match = el.className.match(/like-count-(\d+)/);
        if (match) {
            const id = match[1];
            if (!likeCounts[id]) {
                likeCounts[id] = Math.floor(Math.random() * 50) + 10;
            }
        }
    });
    
    Object.keys(likeCounts).forEach(id => {
        const count = likeCounts[id];
        document.querySelectorAll(`.like-count-${id}`).forEach(el => {
            el.textContent = count || 0;
        });
    });
    
    // Save updated counts
    localStorage.setItem('newsLikeCounts', JSON.stringify(likeCounts));
}

// Update views counters
function updateViewsCounters() {
    const views = JSON.parse(localStorage.getItem('newsViews') || '{}');
    
    // Update views in sidebar của modal
    document.querySelectorAll('.news-detail-modal').forEach(modal => {
        const newsId = modal.getAttribute('data-news-id');
        if (newsId) {
            const viewCount = views[newsId] || Math.floor(Math.random() * 5000) + 8000;
            const viewsSpan = modal.querySelector(`.views-count-${newsId}`);
            if (viewsSpan) {
                viewsSpan.textContent = formatViews(viewCount);
            } else {
                // Fallback: tìm span trong sidebar-views
                const sidebarViews = modal.querySelector('.sidebar-views span');
                if (sidebarViews && !sidebarViews.classList.contains('views-count')) {
                    sidebarViews.textContent = formatViews(viewCount);
                }
            }
        }
    });
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
// FORMAT NEWS CONTENT
// ================================
function formatNewsContent(content) {
    if (!content) return escapeHtml(content || "");
    
    // Escape HTML trước
    let formatted = escapeHtml(content);
    
    // Tìm pattern "Mẹo nhỏ cho mẹ" hoặc tương tự và wrap trong highlight box
    formatted = formatted.replace(
        /(•\s*)?(Mẹo nhỏ cho mẹ|Mẹo|Lưu ý|Tip|Gợi ý)[:：]?\s*([^\n]+(?:\n(?!\d+\.)[^\n]+)*)/gi,
        '<div class="news-tip-box"><div class="tip-header"><i class="fa fa-lightbulb"></i> $2</div><div class="tip-content">$3</div></div>'
    );
    
    // Format các heading (số + text) - chỉ áp dụng cho dòng bắt đầu bằng số
    formatted = formatted.replace(
        /^(\d+\.\s+[^\n]+)$/gm,
        '<h3 class="news-section-heading">$1</h3>'
    );
    
    // Format các bullet points (•)
    formatted = formatted.replace(
        /^(\s*•\s+[^\n]+)$/gm,
        '<div class="news-bullet-point">$1</div>'
    );
    
    // Chuyển các đoạn văn thành <p>
    formatted = formatted.split('\n\n').map(para => {
        para = para.trim();
        if (!para) return '';
        if (para.startsWith('<')) return para; // Đã được format
        return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
    }).join('');
    
    return formatted;
}

// ================================
// TOAST NOTIFICATION
// ================================
function showToast(message, type = 'success') {
    // Remove existing toasts
    document.querySelectorAll('.toast-notification').forEach(toast => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ================================
// XEM CHI TIẾT (GIỐNG HÌNH ẢNH)
// ================================
function xemChiTiet(id, tieuDe, noiDung, hinhAnh, category = "DINH DƯỠNG") {
    // Tăng views counter
    updateViewsCounter(id);
    
    const readingTime = Math.ceil((noiDung.length / 200) || 1);
    const formattedContent = formatNewsContent(noiDung);
    
    
    // Initialize like count if not exists
    if (!likeCounts[id]) {
        likeCounts[id] = Math.floor(Math.random() * 50) + 10;
        localStorage.setItem('newsLikeCounts', JSON.stringify(likeCounts));
    }
    const likeCount = likeCounts[id] || 0;
    
    // Format date từ ngayDang nếu có (lấy từ data gốc)
    let newsDate = formatDate(new Date().toISOString());
    const allNews = JSON.parse(sessionStorage.getItem('allNews') || '[]');
    const newsData = allNews.find(n => n.id === id);
    if (newsData && newsData.ngayDang) {
        newsDate = formatDate(newsData.ngayDang);
    }
    
    const modal = document.createElement("div");
    modal.className = "news-detail-modal";
    modal.setAttribute('data-news-id', id);
    
    const imageHtml = hinhAnh && hinhAnh !== 'https://via.placeholder.com/400x220/ff6b81/ffffff?text=BabyCutie' 
        ? `<div class="news-detail-image">
            <img src="${hinhAnh}" alt="${tieuDe}" onerror="this.style.display='none'">
        </div>` 
        : '';
    
    modal.innerHTML = `
        <div class="news-detail-wrapper">
            <!-- Social Sidebar -->
            <div class="news-detail-sidebar">
                <div class="sidebar-item" onclick="commentNews(${id})">
                    <i class="fa fa-comment"></i>
                    <span class="comment-count-${id}">0</span>
                </div>
                <div class="sidebar-item ${isLiked ? 'liked' : ''}" onclick="likeNews(${id}); setTimeout(() => { updateLikeButtons(); updateLikeCounts(); }, 100);" id="likeBtn-${id}">
                    <i class="fa ${isLiked ? 'fas' : 'far'} fa-heart"></i>
                    <span class="like-count-${id}">${likeCount}</span>
                </div>
                <div class="sidebar-item" onclick="shareNews(${id}, '${tieuDe.replace(/'/g, "\\'")}')">
                    <i class="fa fa-share"></i>
                </div>
                <div class="sidebar-views">
                    <span class="views-count-${id}">${formatViews(viewCount)}</span>
                    <small>Lượt xem</small>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="news-detail-content">
                <button class="close-modal-btn" onclick="this.closest('.news-detail-modal').remove()">
                    <i class="fa fa-times"></i>
                </button>
                
                <!-- Category Badge -->
                <div class="news-detail-category">${category}</div>
                
                <!-- Title với actions -->
                <div class="news-detail-title-row">
                    <h1>${tieuDe}</h1>
                    <div class="news-detail-actions">
                        <button class="btn-action" onclick="bookmarkNews(${id})" title="Lưu bài viết">
                            <i class="fa fa-bookmark"></i>
                        </button>
                        <button class="btn-action" onclick="shareNews(${id}, '${tieuDe.replace(/'/g, "\\'")}')" title="Chia sẻ">
                            <i class="fa fa-share-alt"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Author & Date -->
                <div class="news-detail-meta">
                    <div class="author-info">
                        <i class="fa fa-user-circle"></i>
                        <span>Đăng bởi Admin</span>
                    </div>
                    <div class="date-time">
                        <span>${newsDate}</span>
                        <span class="separator">•</span>
                        <span>${readingTime} phút đọc</span>
                    </div>
                </div>
                
                ${imageHtml}
                
                <!-- Content -->
                <div class="news-detail-body">
                    ${formattedContent}
                </div>
            </div>
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
    
    // Update buttons sau khi modal được tạo
    setTimeout(() => {
        updateBookmarkButtons();
        updateLikeButtons();
        updateLikeCounts();
    }, 100);
    
    // Scroll to top của modal content
    const content = modal.querySelector('.news-detail-content');
    if (content) {
        content.scrollTop = 0;
    }
}
