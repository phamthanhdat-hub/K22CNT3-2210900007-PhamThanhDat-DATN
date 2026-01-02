// ===============================
// CẤU HÌNH GIỎ HÀNG
// ===============================
const CART_KEY = "BABYCUTIE_CART";

// ===============================
// DỮ LIỆU SẢN PHẨM DEMO
// ===============================
const sanPhamNoiBat = document.getElementById("sanPhamNoiBat");

const sanPhamDemo = [
    {
        id: 1,
        ten: "Cháo Cá Hồi Bí Đỏ",
        gia: 45000,
        img: "images/cahoibido.jpg",
        protein: 18,
        carb: 35,
        fat: 12,
        nguyenLieu: ["Cá hồi", "Bí đỏ", "Gạo tẻ", "Dầu ô liu"]
    },
    {
        id: 2,
        ten: "Cháo Thịt Bò Rau Ngót",
        gia: 40000,
        img: "images/thitboraungot.jpg",
        protein: 20,
        carb: 32,
        fat: 10,
        nguyenLieu: ["Thịt bò", "Rau ngót", "Gạo tẻ"]
    },
    {
        id: 3,
        ten: "Cháo Tôm Hạt Sen",
        gia: 55000,
        img: "images/tomhatsen.jpg",
        protein: 22,
        carb: 38,
        fat: 8,
        nguyenLieu: ["Tôm", "Hạt sen", "Gạo tẻ"]
    },
    {
        id: 4,
        ten: "Súp Gà Ngô Non",
        gia: 35000,
        img: "images/supgangonon.jpg",
        protein: 16,
        carb: 28,
        fat: 6,
        nguyenLieu: ["Ức gà", "Ngô non", "Trứng"]
    }
];

// ===============================
// GIỎ HÀNG CORE
// ===============================
function layGioHang() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function luuGioHang(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    capNhatSoLuongGio();
}

function capNhatSoLuongGio() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;

    const cart = layGioHang();
    const tong = cart.reduce((sum, sp) => sum + sp.soLuong, 0);
    badge.innerText = tong;
}

// ===============================
// THÊM VÀO GIỎ (KHÔNG TRÙNG)
// ===============================
function themVaoGio(sp) {
    let cart = layGioHang();
    const index = cart.findIndex(item => item.id === sp.id);

    if (index !== -1) {
        cart[index].soLuong += 1;
    } else {
        cart.push({
            id: sp.id,
            ten: sp.ten,
            gia: sp.gia,
            img: sp.img,
            soLuong: 1,
            protein: sp.protein,
            carb: sp.carb,
            fat: sp.fat
        });
    }

    luuGioHang(cart);
    alert("🛒 Đã thêm vào giỏ hàng");
}

// ===============================
// RENDER SẢN PHẨM NỔI BẬT
// ===============================
if (sanPhamNoiBat) {
    sanPhamNoiBat.innerHTML = "";

    sanPhamDemo.forEach(sp => {
        sanPhamNoiBat.innerHTML += `
            <div class="col-md-3 mb-4">
                <div class="product-card">
                    <img src="${sp.img}">
                    <h6>${sp.ten}</h6>

                    <p class="text-muted" style="font-size:13px">
                        🥩 ${sp.protein}g |
                        🍚 ${sp.carb}g |
                        🧈 ${sp.fat}g
                    </p>

                    <p><b>${sp.gia.toLocaleString()}đ</b></p>

                    <button class="btn-add"
                        onclick='themVaoGio(${JSON.stringify(sp)})'>
                        <i class="fa fa-cart-plus"></i> Thêm
                    </button>
                </div>
            </div>
        `;
    });
}

// ===============================
// TÌM KIẾM
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchIcon = document.querySelector(".search i");

    if (!searchInput) return;

    function timKiem() {
        const tuKhoa = searchInput.value.trim();
        if (!tuKhoa) {
            alert("Vui lòng nhập từ khóa tìm kiếm");
            return;
        }
        window.location.href =
            `thuc-don.html?search=${encodeURIComponent(tuKhoa)}`;
    }

    searchInput.addEventListener("keypress", e => {
        if (e.key === "Enter") timKiem();
    });

    if (searchIcon) {
        searchIcon.addEventListener("click", timKiem);
    }
});

// ===============================
// NÚT ĐIỀU HƯỚNG
// ===============================
document.querySelectorAll(".btn-primary, .btn-outline").forEach(btn => {
    btn.onclick = () => window.location.href = "thuc-don.html";
});

const iconGioHang = document.querySelector(".cart-icon");
if (iconGioHang) {
    iconGioHang.onclick = () => window.location.href = "gio-hang.html";
}

// ===============================
// NHẬN ƯU ĐÃI
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const btnUuDai = document.getElementById("btnUuDai");
    if (!btnUuDai) return;

    btnUuDai.onclick = () => {
        const uuDai = {
            ma: "COMBO15",
            giamGia: 15,
            moTa: "Giảm 15% combo tuần"
        };
        localStorage.setItem("uuDai", JSON.stringify(uuDai));
        alert("🎉 Đã nhận mã COMBO15 (-15%)");
        window.location.href = "gio-hang.html";
    };
});

// ===============================
// NEWSLETTER
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btnNewsletter");
    const input = document.getElementById("newsletterEmail");
    if (!btn || !input) return;

    btn.onclick = () => {
        const email = input.value.trim();
        if (!email) {
            alert("Vui lòng nhập email");
            return;
        }
        let ds = JSON.parse(localStorage.getItem("newsletter")) || [];
        if (ds.includes(email)) {
            alert("Email đã đăng ký");
            return;
        }
        ds.push(email);
        localStorage.setItem("newsletter", JSON.stringify(ds));
        alert("🎉 Đăng ký thành công");
        input.value = "";
    };
});

// ===============================
// LOAD
// ===============================
document.addEventListener("DOMContentLoaded", capNhatSoLuongGio);
