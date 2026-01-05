// ===============================
// GIỎ HÀNG – DỰA CSDL CHAO BABY CUTIE
// ===============================

// demo: sau login bạn nên lưu nguoiDung_id
const nguoiDung_id = 2; // Nguyễn Thị Lan (demo)

const cartBody = document.getElementById("cartBody");
const tongTienEl = document.getElementById("tongTien");

// ===============================
// LOAD GIỎ HÀNG
// ===============================
function loadCart() {
    fetch(`http://127.0.0.1:5000/api/gio-hang/${nguoiDung_id}`)
        .then(res => res.json())
        .then(data => {
            cartBody.innerHTML = "";
            let tong = 0;

            data.forEach(item => {
                const tamTinh = item.gia * item.soLuong;
                tong += tamTinh;

                cartBody.innerHTML += `
                <tr>
                    <td>${item.tenSanPham}</td>
                    <td>${item.gia.toLocaleString()}đ</td>
                    <td>
                        <input type="number" min="1"
                            value="${item.soLuong}"
                            onchange="updateQty(${item.gioHang_id}, this.value)">
                    </td>
                    <td>${tamTinh.toLocaleString()}đ</td>
                    <td>
                        <button onclick="removeItem(${item.gioHang_id})">❌</button>
                    </td>
                </tr>
                `;
            });

            tongTienEl.innerText = tong.toLocaleString();
        });
}

// ===============================
// CẬP NHẬT SỐ LƯỢNG
// ===============================
function updateQty(id, soLuong) {
    fetch(`http://127.0.0.1:5000/api/gio-hang/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soLuong: soLuong })
    }).then(loadCart);
}

// ===============================
// XÓA SẢN PHẨM
// ===============================
function removeItem(id) {
    fetch(`http://127.0.0.1:5000/api/gio-hang/${id}`, {
        method: "DELETE"
    }).then(loadCart);
}

// ===============================
// ĐẶT HÀNG + THANH TOÁN
// ===============================
function datHang() {
    // lấy phương thức thanh toán (radio)
    const phuongThuc = document.querySelector(
        "input[name='pttt']:checked"
    ).value;

    // 1️⃣ tạo đơn hàng
    fetch("http://127.0.0.1:5000/api/don-hang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nguoiDung_id: nguoiDung_id,
            diaChiGiaoHang: "TP Hồ Chí Minh"
        })
    })
    .then(res => res.json())
    .then(data => {
        // 2️⃣ ghi thanh toán
        return fetch("http://127.0.0.1:5000/api/thanh-toan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                donHang_id: data.donHang_id,
                phuongThuc: phuongThuc
            })
        });
    })
    .then(res => res.json())
    .then(() => {
        alert("🎉 Đặt hàng & thanh toán thành công!");
        loadCart();
    })
    .catch(err => {
        alert("Có lỗi xảy ra khi đặt hàng!");
        console.error(err);
    });
}
function apDungKhuyenMai() {
    const ma = document.getElementById("maKhuyenMai").value;

    if (!ma) {
        alert("Vui lòng nhập mã khuyến mãi");
        return;
    }

    // ⚠️ Áp mã cho ĐƠN HÀNG MỚI NHẤT của user
    fetch("http://127.0.0.1:5000/api/don-hang")
        .then(res => res.json())
        .then(ds => {
            const donHangMoiNhat = ds.find(d => d.hoTen);

            return fetch("http://127.0.0.1:5000/api/khuyen-mai/ap-dung", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    donHang_id: donHangMoiNhat.id,
                    maKhuyenMai: ma
                })
            });
        })
        .then(res => res.json())
        .then(data => {
            alert("Áp mã thành công! Giảm: " +
                data.soTienGiam.toLocaleString() + "đ");
            document.getElementById("tongTien").innerText =
                data.tongTienMoi.toLocaleString();
        })
        .catch(err => {
            alert("Mã không hợp lệ hoặc đã hết hạn");
        });
}

// ===============================
loadCart();
