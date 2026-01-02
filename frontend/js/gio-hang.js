// ===============================
function layUuDai() {
    return JSON.parse(localStorage.getItem("uuDai"));
}

// GIỎ HÀNG - BABYCUTIE
// ===============================
const CART_KEY = "BABYCUTIE_CART";

// ===============================
// LẤY / LƯU GIỎ HÀNG
// ===============================
function layGioHang() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function luuGioHang(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    capNhatSoLuongGio();
}

// Badge số lượng trên header
function capNhatSoLuongGio() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;

    const cart = layGioHang();
    const tongSoLuong = cart.reduce((sum, sp) => sum + sp.soLuong, 0);
    badge.innerText = tongSoLuong;
}

// ===============================
// RENDER GIỎ HÀNG
// ===============================
function renderGioHang() {
    const cart = layGioHang();
    const container = document.getElementById("danhSachGioHang");

    let tongTien = 0;
    let tongProtein = 0;
    let tongCarb = 0;
    let tongFat = 0;

    // Giỏ trống
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="text-center p-4 bg-white rounded">
                <p>🛒 Giỏ hàng của bạn đang trống</p>
                <a href="thuc-don.html" class="btn btn-primary btn-sm">
                    Quay lại thực đơn
                </a>
            </div>
        `;
        capNhatTong(0, 0, 0, 0);
        return;
    }

    let html = "";

    cart.forEach(sp => {
        const thanhTien = sp.gia * sp.soLuong;

        tongTien += thanhTien;
        tongProtein += (sp.protein || 0) * sp.soLuong;
        tongCarb += (sp.carb || 0) * sp.soLuong;
        tongFat += (sp.fat || 0) * sp.soLuong;

        html += `
        <div class="cart-item mb-3 p-3 bg-white rounded">
            <div class="row align-items-center">
                <div class="col-md-2">
                    <img src="${sp.img}" class="img-fluid rounded">
                </div>

                <div class="col-md-4">
                    <h6>${sp.ten}</h6>
                    <small class="text-muted">
                        🥩 ${sp.protein || 0}g |
                        🍚 ${sp.carb || 0}g |
                        🧈 ${sp.fat || 0}g
                    </small>
                </div>

                <div class="col-md-3">
                    <div class="d-flex align-items-center">
                        <button class="btn btn-sm btn-light"
                            onclick="giamSoLuong(${sp.id})">−</button>
                        <span class="mx-2">${sp.soLuong}</span>
                        <button class="btn btn-sm btn-light"
                            onclick="tangSoLuong(${sp.id})">+</button>
                    </div>
                </div>

                <div class="col-md-2 fw-bold">
                    ${thanhTien.toLocaleString()}đ
                </div>

                <div class="col-md-1 text-danger"
                     style="cursor:pointer"
                     onclick="xoaSanPham(${sp.id})">
                    <i class="fa fa-trash"></i>
                </div>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
    capNhatTong(tongTien, tongProtein, tongCarb, tongFat);
}

// ===============================
// CẬP NHẬT TỔNG
// ===============================
function capNhatTong(tien, protein, carb, fat) {
    const uuDai = layUuDai();
    let giamGia = 0;

    if (uuDai && uuDai.giamGia) {
        giamGia = Math.round(tien * uuDai.giamGia / 100);
    }

    const tongThanhToan = tien - giamGia;

    document.getElementById("tongTien").innerText =
        tien.toLocaleString() + "đ";

    document.getElementById("tongProtein").innerText = protein + "g";
    document.getElementById("tongCarb").innerText = carb + "g";
    document.getElementById("tongFat").innerText = fat + "g";

    // Hiển thị ưu đãi (nếu có)
    const box = document.getElementById("uuDaiBox");
    if (box) {
        if (uuDai) {
            box.innerHTML = `
                <p>🎁 Mã: <b>${uuDai.ma}</b></p>
                <p>Giảm: <b>-${giamGia.toLocaleString()}đ</b></p>
                <p class="fw-bold text-danger">
                    Thanh toán: ${tongThanhToan.toLocaleString()}đ
                </p>
            `;
        } else {
            box.innerHTML = "";
        }
    }
}

// ===============================
// TĂNG / GIẢM / XOÁ
// ===============================
function tangSoLuong(id) {
    let cart = layGioHang();
    cart = cart.map(sp =>
        sp.id === id ? { ...sp, soLuong: sp.soLuong + 1 } : sp
    );
    luuGioHang(cart);
    renderGioHang();
}

function giamSoLuong(id) {
    let cart = layGioHang();
    cart = cart
        .map(sp =>
            sp.id === id ? { ...sp, soLuong: sp.soLuong - 1 } : sp
        )
        .filter(sp => sp.soLuong > 0);

    luuGioHang(cart);
    renderGioHang();
}

function xoaSanPham(id) {
    let cart = layGioHang().filter(sp => sp.id !== id);
    luuGioHang(cart);
    renderGioHang();
}

// ===============================
// THANH TOÁN (DEMO)
// ===============================
function thanhToan() {
    if (layGioHang().length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }

    alert("🎉 Thanh toán thành công (demo)");

    localStorage.removeItem(CART_KEY);
    localStorage.removeItem("uuDai"); // XÓA ƯU ĐÃI

    renderGioHang();
    capNhatSoLuongGio();
}


// ===============================
// LOAD TRANG
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    capNhatSoLuongGio();
    renderGioHang();
});
