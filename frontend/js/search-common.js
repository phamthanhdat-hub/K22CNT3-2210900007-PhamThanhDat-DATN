/* ===============================
   CHỨC NĂNG TÌM KIẾM CHUNG CHO TẤT CẢ CÁC TRANG
================================ */

function handleSearch(event) {
    if (event.key === 'Enter' || event.type === 'click') {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const keyword = searchInput.value.trim();
        if (keyword) {
            // Chuyển đến trang thuc-don với search parameter
            window.location.href = `thuc-don.html?search=${encodeURIComponent(keyword)}`;
        } else {
            // Nếu không có từ khóa, chuyển đến trang thuc-don
            window.location.href = 'thuc-don.html';
        }
    }
}

// Thêm event listener cho search icon khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const searchIcon = document.getElementById('searchIcon') || document.querySelector('.search i.fa-search');
    if (searchIcon) {
        searchIcon.addEventListener('click', handleSearch);
        searchIcon.style.cursor = 'pointer';
    }
});

