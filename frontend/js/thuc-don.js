const API_URL = "http://127.0.0.1:5000/api/thuc-don";

let danhSachSanPham = [];

/* ===============================
   LOAD SẢN PHẨM TỪ API
================================ */
function taiSanPham(thamSo = "") {
    let url = API_URL + thamSo;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            danhSachSanPham = data;
            window.allProducts = data; // Lưu để tìm kiếm
            hienThiSanPham(data);
        })
        .catch(err => {
            console.error(err);
            alert("Không thể kết nối server");
        });
}

/* ===============================
   HIỂN THỊ SẢN PHẨM (FULL THÔNG TIN)
================================ */
function hienThiSanPham(ds) {
    const khuVuc = document.querySelector(".col-md-9 .row");
    let html = "";

    if (!ds || ds.length === 0) {
        khuVuc.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                <p class="text-muted">Không có sản phẩm phù hợp</p>
            </div>
        `;
        return;
    }

    ds.forEach(sp => {
        html += `
        <div class="col-md-4 mb-4">
            <div class="product-card" onclick="viewProductDetail(${sp.id})" style="cursor: pointer;">
                <div class="product-image-wrapper">
                    <img 
                        src="http://127.0.0.1:5000/images/${sp.hinhAnh || 'default.jpg'}" 
                        alt="${sp.tenSanPham}"
                        onerror="this.src='images/default.jpg'"
                    >
                    <div class="product-overlay">
                        <button class="btn-quick-view" onclick="event.stopPropagation(); viewProductDetail(${sp.id})">
                            <i class="fa fa-eye"></i> Xem chi tiết
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h5 onclick="event.stopPropagation(); viewProductDetail(${sp.id})" style="cursor: pointer;">${sp.tenSanPham}</h5>
                    <p class="price">${Number(sp.gia).toLocaleString()}đ</p>
                    
                    ${sp.moTa ? `<p class="desc">${sp.moTa.substring(0, 60)}${sp.moTa.length > 60 ? '...' : ''}</p>` : ''}
                    
                    <div class="nutrition">
                        <span>💪 <b>${sp.protein || 0}g</b></span>
                        <span>🍚 <b>${sp.carb || 0}g</b></span>
                        <span>🥑 <b>${sp.chatBeo || 0}g</b></span>
                    </div>
                    
                    ${sp.doTuoi ? `<small class="age">👶 ${sp.doTuoi}</small>` : ''}
                    
                    <button class="btn-add-cart" onclick="event.stopPropagation(); themVaoGio(${sp.id})">
                        <i class="fa fa-cart-plus"></i> Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
        `;
    });

    khuVuc.innerHTML = html;
    
    // Cập nhật số lượng trên các nút sau khi render
    setTimeout(() => {
        updateAllProductButtons();
    }, 100);
}

// Xem chi tiết sản phẩm
function viewProductDetail(id) {
    window.location.href = `chi-tiet-san-pham.html?id=${id}`;
}

/* ===============================
   ÁP DỤNG BỘ LỌC DANH MỤC
================================ */
// Thêm event listener cho các radio button danh mục khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[name="danhMuc"]').forEach(radio => {
        radio.addEventListener("change", apDungBoLoc);
    });
});

/* ===============================
   ÁP DỤNG BỘ LỌC TỔNG HỢP
================================ */
function apDungBoLoc() {
    let ketQua = [...danhSachSanPham];
    
    // Lọc theo danh mục (Cháo thịt, Cháo cá, Cháo dinh dưỡng) - chỉ chọn 1 loại
    const selectedDanhMuc = document.querySelector('input[name="danhMuc"]:checked');
    if (selectedDanhMuc) {
        const loai = selectedDanhMuc.dataset.danhmuc;
        ketQua = ketQua.filter(sp => {
            const tenSanPham = (sp.tenSanPham || "").toLowerCase();
            
            if (loai === "thit") {
                // Cháo thịt: tìm các từ khóa liên quan đến thịt
                return tenSanPham.includes("thịt") || 
                       tenSanPham.includes("thit") ||
                       tenSanPham.includes("gà") || 
                       tenSanPham.includes("ga") ||
                       tenSanPham.includes("bò") || 
                       tenSanPham.includes("bo") ||
                       tenSanPham.includes("heo") ||
                       tenSanPham.includes("lợn") ||
                       tenSanPham.includes("lon") ||
                       tenSanPham.includes("sườn") ||
                       tenSanPham.includes("suon") ||
                       tenSanPham.includes("lươn") ||
                       tenSanPham.includes("luon");
            } else if (loai === "ca") {
                // Cháo cá: tìm các từ khóa liên quan đến cá
                return tenSanPham.includes("cá") || 
                       tenSanPham.includes("ca") ||
                       tenSanPham.includes("tôm") ||
                       tenSanPham.includes("tom");
            } else if (loai === "dinh-duong") {
                // Cháo dinh dưỡng: các loại khác hoặc có từ "dinh dưỡng"
                return tenSanPham.includes("dinh dưỡng") ||
                       tenSanPham.includes("dinh-duong") ||
                       tenSanPham.includes("hạt") ||
                       tenSanPham.includes("hat") ||
                       tenSanPham.includes("ngũ cốc") ||
                       tenSanPham.includes("ngu coc") ||
                       tenSanPham.includes("rau") ||
                       tenSanPham.includes("củ") ||
                       tenSanPham.includes("cu");
            }
            return false;
        });
    }
    
    // Lọc theo độ tuổi
    const selectedAge = document.querySelector('input[name="age"]:checked');
    if (selectedAge) {
        const ageValue = selectedAge.value;
        if (ageValue === "6-12") {
            ketQua = ketQua.filter(sp => sp.doTuoi && sp.doTuoi.includes("6") && sp.doTuoi.includes("12"));
        } else if (ageValue === "1-3") {
            ketQua = ketQua.filter(sp => sp.doTuoi && (sp.doTuoi.includes("1") || sp.doTuoi.includes("3")));
        }
    }
    
    // Lọc theo giá
    const selectedPrice = document.querySelector('input[name="gia"]:checked');
    if (selectedPrice) {
        const priceValue = selectedPrice.value;
        if (priceValue === "duoi30") {
            ketQua = ketQua.filter(sp => sp.gia < 30000);
        } else if (priceValue === "30-50") {
            ketQua = ketQua.filter(sp => sp.gia >= 30000 && sp.gia <= 50000);
        } else if (priceValue === "tren50") {
            ketQua = ketQua.filter(sp => sp.gia > 50000);
        }
    }
    
    // Áp dụng sắp xếp
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
        const sortValue = sortSelect.value;
        if (sortValue === "pho-bien") {
            // Phổ biến nhất: sắp xếp theo giá thấp đến cao (sản phẩm phổ biến thường có giá hợp lý)
            ketQua.sort((a, b) => a.gia - b.gia);
        } else if (sortValue === "gia-thap-cao") {
            ketQua.sort((a, b) => a.gia - b.gia);
        } else if (sortValue === "gia-cao-thap") {
            ketQua.sort((a, b) => b.gia - a.gia);
        } else if (sortValue === "ten-a-z") {
            ketQua.sort((a, b) => a.tenSanPham.localeCompare(b.tenSanPham, 'vi'));
        } else if (sortValue === "ten-z-a") {
            ketQua.sort((a, b) => b.tenSanPham.localeCompare(a.tenSanPham, 'vi'));
        }
    }
    
    hienThiSanPham(ketQua);
    
    // Hiển thị số lượng kết quả
    const resultCount = document.getElementById("resultCount");
    if (resultCount) {
        resultCount.textContent = `Tìm thấy ${ketQua.length} sản phẩm`;
    }
}

/* ===============================
   XÓA BỘ LỌC
================================ */
function resetFilters() {
    // Xóa tất cả checkbox và radio
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[type="radio"]').forEach(radio => radio.checked = false);
    
    // Reset select về giá trị mặc định
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
        sortSelect.value = "pho-bien";
    }
    
    // Hiển thị tất cả sản phẩm
    hienThiSanPham(danhSachSanPham);
    
    // Reset result count
    const resultCount = document.getElementById("resultCount");
    if (resultCount) {
        resultCount.textContent = "";
    }
    
    showToast("Đã xóa bộ lọc", "info");
}

/* ===============================
   LỌC THEO ĐỘ TUỔI
================================ */
document.querySelectorAll("input[name='age']").forEach(radio => {
    radio.addEventListener("change", function () {
        apDungBoLoc();
    });
});

/* ===============================
   LỌC THEO GIÁ
================================ */
document.querySelectorAll("input[name='gia']").forEach(radio => {
    radio.addEventListener("change", function () {
        apDungBoLoc();
    });
});

/* ===============================
   SẮP XẾP
================================ */
document.getElementById("sortSelect")?.addEventListener("change", function () {
    // Áp dụng lại bộ lọc và sắp xếp
    apDungBoLoc();
});

/* ===============================
   THÊM VÀO GIỎ HÀNG (API)
================================ */
function themVaoGio(id) {
    const token = localStorage.getItem("token");
    
    if (!token) {
        alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
        window.location.href = "login-khach.html";
        return;
    }

    // Disable button và hiển thị loading
    const buttons = document.querySelectorAll(`button[onclick*="themVaoGio(${id})"]`);
    buttons.forEach(btn => {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang thêm...';
    });

    fetch("http://127.0.0.1:5000/api/gio-hang", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            sanPham_id: id,
            soLuong: 1
        })
    })
    .then(res => res.json())
    .then(data => {
        // Re-enable buttons
        buttons.forEach(btn => {
            btn.disabled = false;
        });

        if (data.success) {
            // Hiển thị số lượng đã thêm
            updateCartCount();
            updateProductButtonQuantity(id);
            
            // Toast notification
            showToast("✅ Đã thêm vào giỏ hàng!", "success");
            
            // Animation cho cart icon
            const cartIcon = document.querySelector('.cart-icon');
            if (cartIcon) {
                cartIcon.classList.add('bounce');
                setTimeout(() => cartIcon.classList.remove('bounce'), 500);
            }
        } else {
            showToast("Lỗi: " + (data.message || "Không thể thêm vào giỏ"), "error");
        }
    })
    .catch(err => {
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.innerHTML = '🛒 Thêm vào giỏ';
        });
        showToast("Lỗi kết nối. Vui lòng thử lại.", "error");
        console.error("Error:", err);
    });
}

/* ===============================
   CẬP NHẬT SỐ LƯỢNG TRÊN NÚT
================================ */
function updateProductButtonQuantity(sanPhamId) {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Lấy số lượng sản phẩm trong giỏ
    fetch("http://127.0.0.1:5000/api/gio-hang", {
        headers: {"Authorization": "Bearer " + token}
    })
    .then(res => res.json())
    .then(cartItems => {
        const item = cartItems.find(i => i.sanPham_id === sanPhamId);
        const buttons = document.querySelectorAll(`button[onclick*="themVaoGio(${sanPhamId})"]`);
        
        buttons.forEach(btn => {
            if (item && item.soLuong > 0) {
                btn.innerHTML = `<i class="fa fa-cart-plus"></i> Đã thêm (${item.soLuong})`;
                btn.style.background = "linear-gradient(135deg, #28a745, #20c997)";
                btn.style.color = "#fff";
            } else {
                btn.innerHTML = '<i class="fa fa-cart-plus"></i> Thêm vào giỏ';
                btn.style.background = "";
                btn.style.color = "";
            }
        });
    })
    .catch(err => console.error("Error updating button:", err));
}

/* ===============================
   CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG TRÊN HEADER
================================ */
function updateCartCount() {
    const token = localStorage.getItem("token");
    const cartCountEl = document.getElementById("cartCount");
    
    if (!token || !cartCountEl) {
        if (cartCountEl) cartCountEl.textContent = "0";
        return;
    }
    
    fetch("http://127.0.0.1:5000/api/gio-hang", {
        headers: {"Authorization": "Bearer " + token}
    })
    .then(res => {
        if (!res.ok) throw new Error('Failed to fetch cart');
        return res.json();
    })
    .then(data => {
        const total = data.reduce((sum, item) => sum + item.soLuong, 0);
        cartCountEl.textContent = total;
        
        // Hiển thị/ẩn badge
        if (total > 0) {
            cartCountEl.style.display = "flex";
            // Animation
            cartCountEl.classList.add("bounce");
            setTimeout(() => cartCountEl.classList.remove("bounce"), 500);
        } else {
            cartCountEl.style.display = "none";
        }
    })
    .catch(() => {
        if (cartCountEl) cartCountEl.textContent = "0";
    });
}

/* ===============================
   TOAST NOTIFICATION
================================ */
function showToast(message, type = 'success') {
    // Sử dụng toast element có sẵn hoặc tạo mới
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast-notification ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/* ===============================
   CẬP NHẬT TẤT CẢ NÚT SẢN PHẨM KHI LOAD
================================ */
function updateAllProductButtons() {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://127.0.0.1:5000/api/gio-hang", {
        headers: {"Authorization": "Bearer " + token}
    })
    .then(res => res.json())
    .then(cartItems => {
        cartItems.forEach(item => {
            updateProductButtonQuantity(item.sanPham_id);
        });
    })
    .catch(err => console.error("Error:", err));
}

/* ===============================
   XỬ LÝ TÌM KIẾM TỪ HEADER
================================ */
function handleSearch(event) {
    if (event.key === 'Enter' || event.type === 'click') {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        const keyword = searchInput.value.trim();
        if (keyword) {
            // Nếu đang ở trang thuc-don, tìm kiếm ngay tại đây
            if (window.location.pathname.includes('thuc-don.html')) {
                // Lọc sản phẩm theo từ khóa
                const allProducts = window.allProducts || [];
                const filtered = allProducts.filter(sp => 
                    sp.tenSanPham.toLowerCase().includes(keyword.toLowerCase()) ||
                    (sp.moTa && sp.moTa.toLowerCase().includes(keyword.toLowerCase()))
                );
                
                if (filtered.length > 0) {
                    hienThiSanPham(filtered);
                    // Scroll to products section
                    document.querySelector('.menu-page')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                    const productGrid = document.getElementById('productGrid');
                    if (productGrid) {
                        productGrid.innerHTML = `
                            <div class="text-center py-5">
                                <i class="fa fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 20px;"></i>
                                <p class="text-muted">Không tìm thấy sản phẩm nào với từ khóa "<strong>${keyword}</strong>"</p>
                            </div>
                        `;
                    }
                }
            } else {
                // Nếu ở trang khác, chuyển đến trang thuc-don với search param
                window.location.href = `thuc-don.html?search=${encodeURIComponent(keyword)}`;
            }
        } else {
            // Nếu không có từ khóa và đang ở trang thuc-don, hiển thị tất cả
            if (window.location.pathname.includes('thuc-don.html')) {
                taiSanPham();
            }
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

/* ===============================
   LOAD BAN ĐẦU
================================ */
// Load sản phẩm
taiSanPham();

// Cập nhật cart count khi load trang
if (document.getElementById("cartCount")) {
    updateCartCount();
    // Cập nhật lại sau khi load sản phẩm
    setTimeout(() => {
        updateAllProductButtons();
        handleSearchFromURL();
    }, 1000);
}
