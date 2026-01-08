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

                <img src="http://127.0.0.1:5000/images/${sp.hinhAnh}" alt="${sp.tenSanPham}" 
                     onclick="window.location='chi-tiet-san-pham.html?id=${sp.id}'" 
                     style="cursor: pointer;">

                <h5 onclick="window.location='chi-tiet-san-pham.html?id=${sp.id}'" style="cursor: pointer;">${sp.tenSanPham}</h5>
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
   THÊM VÀO GIỎ HÀNG (API)
================================ */
function themVaoGio(id) {
    const token = localStorage.getItem("token");
    
    if (!token) {
        alert("Vui lòng đăng nhập để thêm vào giỏ hàng");
        window.location.href = "login-khach.html";
        return;
    }

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
        if (data.success) {
            alert("✅ Đã thêm vào giỏ hàng");
        } else {
            alert("Lỗi: " + (data.message || "Không thể thêm vào giỏ"));
        }
    })
    .catch(err => {
        alert("Lỗi: " + err.message);
    });
}

/* ===============================
   LOAD BAN ĐẦU
================================ */
taiSanPham();
