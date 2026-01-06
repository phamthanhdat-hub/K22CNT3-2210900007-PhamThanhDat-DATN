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
        khuVuc.innerHTML = "<p>Không có sản phẩm phù hợp</p>";
        return;
    }

    ds.forEach(sp => {
        html += `
        <div class="col-md-4 mb-4">
            <div class="product-card">

                <img src="images/${sp.hinhAnh}" alt="${sp.tenSanPham}">

                <h5>${sp.tenSanPham}</h5>
                <p class="price">${Number(sp.gia).toLocaleString()}đ</p>

                <!-- MÔ TẢ -->
                <p class="desc">${sp.moTa || ""}</p>

                <!-- DINH DƯỠNG -->
                <div class="nutrition">
                    <span>💪 Protein <b>${sp.protein || 0}g</b></span>
                    <span>🍚 Carb <b>${sp.carb || 0}g</b></span>
                    <span>🥑 Fat <b>${sp.chatBeo || 0}g</b></span>
                </div>

                <small class="age">👶 Độ tuổi: ${sp.doTuoi}</small>

                <button class="btn-add" onclick="themVaoGio(${sp.id})">
                    🛒 Thêm vào giỏ
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
document.querySelector(".search-box input")?.addEventListener("input", function () {
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
document.querySelector("select")?.addEventListener("change", function () {
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
    alert("✅ Đã thêm vào giỏ hàng");
}

/* ===============================
   LOAD BAN ĐẦU
================================ */
taiSanPham();
