// ================================
// CẤU HÌNH API
// ================================
const API_URL = "http://127.0.0.1:5000/api";

// ================================
// HIỂN THỊ FORM
// ================================
function showRegister() {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("registerBox").style.display = "block";
}

function showLogin() {
    document.getElementById("registerBox").style.display = "none";
    document.getElementById("loginBox").style.display = "block";
}

// ================================
// ĐĂNG NHẬP (ADMIN + KHÁCH)
// ================================
function dangNhap() {
    const email = document.getElementById("loginEmail").value;
    const matKhau = document.getElementById("loginPassword").value;

    if (!email || !matKhau) {
        alert("Vui lòng nhập đầy đủ email và mật khẩu");
        return;
    }

    fetch(`${API_URL}/xac-thuc/dang-nhap`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            matKhau: matKhau
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.loi) {
            alert(data.loi);
            return;
        }

        // LƯU SESSION
        localStorage.setItem("nguoiDung", JSON.stringify(data));

        // PHÂN QUYỀN
        if (data.vaiTro === "admin") {
            window.location.href = "admin/dashboard.html";
        } else {
            window.location.href = "index.html";
        }
    })
    .catch(err => {
        alert("Lỗi kết nối server");
        console.error(err);
    });
}

// ================================
// ĐĂNG KÝ (CHỈ KHÁCH HÀNG)
// ================================
function dangKy() {
    const hoTen = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const matKhau = document.getElementById("regPassword").value;

    if (!hoTen || !email || !matKhau) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    fetch(`${API_URL}/xac-thuc/dang-ky`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            hoTen: hoTen,
            email: email,
            matKhau: matKhau
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.loi) {
            alert(data.loi);
            return;
        }

        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        showLogin();
    })
    .catch(err => {
        alert("Lỗi kết nối server");
        console.error(err);
    });
}
// ================== CẤU HÌNH GIỎ HÀNG ==================
const CART_KEY = "BABYCUTIE_CART";

// Lấy giỏ hàng
function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// Lưu giỏ hàng
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

// Cập nhật số lượng trên icon giỏ hàng
function updateCartCount() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.soLuong, 0);

    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
        cartCount.innerText = totalQty;
    }
}

// Chạy ngay khi load trang
document.addEventListener("DOMContentLoaded", updateCartCount);
