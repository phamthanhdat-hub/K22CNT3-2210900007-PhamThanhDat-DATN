const API_URL = "http://127.0.0.1:5000/api/admin/don-hang";

// Kiểm tra đăng nhập
const adminToken = localStorage.getItem("admin_token");
if (!adminToken) {
    window.location.href = "login-admin.html";
}

function loadDonHang() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("donHangBody");
            tbody.innerHTML = "";

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center">Chưa có đơn hàng</td></tr>`;
                return;
            }

            data.forEach((dh, i) => {
                const ngayDat = dh.ngayDat ? new Date(dh.ngayDat).toLocaleDateString('vi-VN') : '-';
                const trangThaiClass = {
                    'Chờ xác nhận': 'warning',
                    'Đang giao': 'info',
                    'Hoàn thành': 'success',
                    'Đã thanh toán': 'success',
                    'Đã hủy': 'danger'
                }[dh.trangThai] || 'secondary';

                tbody.innerHTML += `
                    <tr>
                        <td>${i + 1}</td>
                        <td>#${dh.id}</td>
                        <td>${dh.hoTen}</td>
                        <td>${dh.dienThoai || '-'}</td>
                        <td>${new Intl.NumberFormat('vi-VN').format(dh.tongTien)}đ</td>
                        <td>
                            <span class="badge bg-${trangThaiClass}">${dh.trangThai}</span>
                        </td>
                        <td>${ngayDat}</td>
                        <td>
                            <select class="form-select form-select-sm" onchange="capNhatTrangThai(${dh.id}, this.value)">
                                <option ${dh.trangThai == "Chờ xác nhận" ? "selected" : ""}>Chờ xác nhận</option>
                                <option ${dh.trangThai == "Đang giao" ? "selected" : ""}>Đang giao</option>
                                <option ${dh.trangThai == "Hoàn thành" ? "selected" : ""}>Hoàn thành</option>
                                <option ${dh.trangThai == "Đã hủy" ? "selected" : ""}>Đã hủy</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="xemChiTiet(${dh.id})">👁 Xem</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            console.error("Lỗi load đơn hàng:", err);
            document.getElementById("donHangBody").innerHTML = 
                `<tr><td colspan="7" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>`;
        });
}

function capNhatTrangThai(id, trangThai) {
    fetch(`${API_URL}/${id}/trang-thai`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ trangThai })
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            loadDonHang();
        } else {
            alert("Có lỗi xảy ra");
        }
    })
    .catch(err => {
        alert("Lỗi: " + err.message);
        console.error(err);
    });
}

function xemChiTiet(id) {
    fetch(`${API_URL}/${id}`)
        .then(res => res.json())
        .then(data => {
            let html = `
                <h5>Chi tiết đơn hàng #${data.donHang.id}</h5>
                <p><strong>Khách hàng:</strong> ${data.donHang.hoTen}</p>
                <p><strong>Điện thoại:</strong> ${data.donHang.dienThoai || '-'}</p>
                <p><strong>Tổng tiền:</strong> ${new Intl.NumberFormat('vi-VN').format(data.donHang.tongTien)}đ</p>
                <p><strong>Trạng thái:</strong> ${data.donHang.trangThai}</p>
                <p><strong>Địa chỉ giao hàng:</strong> ${data.donHang.diaChiGiaoHang || '-'}</p>
                <hr>
                <h6>Sản phẩm:</h6>
                <ul>
            `;
            data.sanPham.forEach(sp => {
                html += `<li>${sp.tenSanPham} - ${sp.soLuong}x ${new Intl.NumberFormat('vi-VN').format(sp.gia)}đ</li>`;
            });
            html += `</ul>`;
            
            alert(html.replace(/<[^>]*>/g, ''));
        })
        .catch(err => {
            alert("Không thể tải chi tiết đơn hàng");
            console.error(err);
        });
}

// Load ban đầu
loadDonHang();
