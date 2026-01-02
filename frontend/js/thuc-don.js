const API_URL = "http://127.0.0.1:5000/api/san-pham";

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
            hienThiSanPham(data);
        })
        .catch(() => {
            alert("Không thể kết nối server");
        });
}

/* ===============================
   HIỂN THỊ SẢN PHẨM
================================ */
function hienThiSanPham(ds) {
    const khuVuc = document.querySelector(".col-md-9 .row");
    let html = "";

    if (ds.length === 0) {
        khuVuc.innerHTML = "<p>Không có sản phẩm phù hợp</p>";
        return;
    }

    ds.forEach(sp => {
        html += `
        <div class="col-md-4 mb-4">
            <div class="product-card">
                <span class="badge badge-hot">${sp.doTuoi} tháng</span>
                <img src="${sp.hinhAnh}">
                <h6>${sp.tenSanPham}</h6>
                <p class="desc">Phù hợp cho bé ${sp.doTuoi} tháng</p>
                <div class="price">${Number(sp.gia).toLocaleString()}đ</div>
                <button class="btn-add" onclick="themVaoGio(${sp.id})">
                    <i class="fa fa-cart-plus"></i>
                </button>
            </div>
        </div>
        `;
    });

    khuVuc.innerHTML = html;
}

/* ===============================
   TÌM KIẾM
================================ */
document.querySelector(".search-box input").addEventListener("input", function () {
    const tuKhoa = this.value.toLowerCase();

    const ketQua = danhSachSanPham.filter(sp =>
        sp.tenSanPham.toLowerCase().includes(tuKhoa)
    );

    hienThiSanPham(ketQua);
});

/* ===============================
   LỌC THEO ĐỘ TUỔI
================================ */
document.querySelectorAll("input[name='age']").forEach(radio => {
    radio.addEventListener("change", function () {
        taiSanPham(`?doTuoi=${this.value}`);
    });
});

/* ===============================
   LỌC THEO GIÁ
================================ */
document.querySelectorAll("input[name='gia']").forEach((radio, index) => {
    radio.addEventListener("change", function () {
        let ketQua = [];

        if (index === 0) {
            ketQua = danhSachSanPham.filter(sp => sp.gia < 30000);
        } else if (index === 1) {
            ketQua = danhSachSanPham.filter(sp => sp.gia >= 30000 && sp.gia <= 50000);
        } else {
            ketQua = danhSachSanPham.filter(sp => sp.gia > 50000);
        }

        hienThiSanPham(ketQua);
    });
});

/* ===============================
   SẮP XẾP
================================ */
document.querySelector("select").addEventListener("change", function () {
    let ds = [...danhSachSanPham];

    if (this.value.includes("thấp")) {
        ds.sort((a, b) => a.gia - b.gia);
    } else if (this.value.includes("cao")) {
        ds.sort((a, b) => b.gia - a.gia);
    }

    hienThiSanPham(ds);
});

/* ===============================
   GIỎ HÀNG (LOCAL STORAGE)
================================ */
function themVaoGio(id) {
    let gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];

    const sanPham = danhSachSanPham.find(sp => sp.id === id);
    if (!sanPham) return;

    const tonTai = gioHang.find(sp => sp.id === id);

    if (tonTai) {
        tonTai.soLuong += 1;
    } else {
        gioHang.push({
            id: sanPham.id,
            tenSanPham: sanPham.tenSanPham,
            gia: sanPham.gia,
            hinhAnh: sanPham.hinhAnh,
            soLuong: 1
        });
    }

    localStorage.setItem("gioHang", JSON.stringify(gioHang));
    alert("Đã thêm vào giỏ hàng");
}

/* ===============================
   LOAD BAN ĐẦU
================================ */
taiSanPham();
