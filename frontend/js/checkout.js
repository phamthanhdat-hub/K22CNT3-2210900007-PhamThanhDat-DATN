const CART_KEY = "BABYCUTIE_CART";

// ===============================
// LẤY DỮ LIỆU
// ===============================
function layGioHang() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function layUuDai() {
    return JSON.parse(localStorage.getItem("uuDai"));
}

// ===============================
// 👉 CHUYỂN SANG TRANG CHECKOUT
// (DÙNG TỪ GIỎ HÀNG)
// ===============================
function chuyenSangCheckout() {
    if (layGioHang().length === 0) {
        alert("Giỏ hàng trống!");
        return;
    }
    window.location.href = "checkout.html";
}

// ===============================
// RENDER ĐƠN HÀNG
// ===============================
function renderDonHang() {
    const cart = layGioHang();
    const box = document.getElementById("donHangBox");

    if (!box) return;

    if (cart.length === 0) {
        box.innerHTML = "<p>Giỏ hàng trống</p>";
        return;
    }

    let tong = 0;
    let html = "<ul class='list-group'>";

    cart.forEach(sp => {
        const tien = sp.gia * sp.soLuong;
        tong += tien;

        html += `
            <li class="list-group-item d-flex justify-content-between">
                <div>
                    ${sp.ten} <small>x${sp.soLuong}</small><br>
                    <small class="text-muted">
                        🥩 ${sp.protein || 0}g |
                        🍚 ${sp.carb || 0}g |
                        🧈 ${sp.fat || 0}g
                    </small>
                </div>
                <b>${tien.toLocaleString()}đ</b>
            </li>
        `;
    });

    html += "</ul>";
    box.innerHTML = html;

    // ===============================
    // TÍNH GIẢM GIÁ
    // ===============================
    const uuDai = layUuDai();
    let giamGia = 0;

    if (uuDai && uuDai.giamGia) {
        giamGia = Math.round(tong * uuDai.giamGia / 100);
    }

    const thanhToan = tong - giamGia;

    document.getElementById("tamTinh").innerText =
        tong.toLocaleString() + "đ";
    document.getElementById("giamGia").innerText =
        "-" + giamGia.toLocaleString() + "đ";
    document.getElementById("thanhToan").innerText =
        thanhToan.toLocaleString() + "đ";
}

// ===============================
// XÁC NHẬN THANH TOÁN
// ===============================
function xacNhanThanhToan() {
    const ten = document.getElementById("tenKH").value.trim();
    const sdt = document.getElementById("sdtKH").value.trim();
    const diaChi = document.getElementById("diaChiKH").value.trim();

    if (!ten || !sdt || !diaChi) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    alert(
        "🎉 Đặt hàng thành công!\n" +
        "Cảm ơn bạn đã mua cháo tại BabyCutie ❤️"
    );

    // RESET GIỎ + ƯU ĐÃI
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem("uuDai");

    window.location.href = "index.html";
}

// ===============================
// LOAD TRANG CHECKOUT
// ===============================
document.addEventListener("DOMContentLoaded", renderDonHang);
