const API_URL = "http://127.0.0.1:5000/api/admin/san-pham";
const API_THUC_DON = "http://127.0.0.1:5000/api/thuc-don";
const IMAGE_URL = "http://127.0.0.1:5000/images/";

const table = document.getElementById("productTable");
const modal = new bootstrap.Modal(document.getElementById("productModal"));
let danhMucList = [];

// Kiểm tra đăng nhập
const adminToken = localStorage.getItem("admin_token");
if (!adminToken) {
    window.location.href = "login-admin.html";
}

// Load danh mục
fetch("http://127.0.0.1:5000/api/admin/san-pham/danh-muc")
    .then(res => res.json())
    .then(data => {
        danhMucList = data;
        const select = document.getElementById("danhMucSelect");
        select.innerHTML = '<option value="">Chọn danh mục</option>';
        data.forEach(dm => {
            select.innerHTML += `<option value="${dm.id}">${dm.tenDanhMuc}</option>`;
        });
    });

// Load sản phẩm
function loadProducts() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            table.innerHTML = "";
            if (data.length === 0) {
                table.innerHTML = `<tr><td colspan="6" class="text-center">Chưa có sản phẩm</td></tr>`;
                return;
            }

            data.forEach((p, i) => {
                const trangThaiBadge = p.trangThai 
                    ? '<span class="badge bg-success">Hoạt động</span>'
                    : '<span class="badge bg-secondary">Đã ẩn</span>';

                table.innerHTML += `
                    <tr>
                        <td>${i + 1}</td>
                        <td>
                            <img src="${IMAGE_URL + (p.hinhAnh || 'default.jpg')}" width="50" height="50" style="object-fit: cover;">
                        </td>
                        <td>${p.tenSanPham}</td>
                        <td>${new Intl.NumberFormat('vi-VN').format(p.gia)}đ</td>
                        <td>${p.tenDanhMuc || '-'}</td>
                        <td>${trangThaiBadge}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editProduct(${p.id})">Sửa</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Xóa</button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(err => {
            console.error("Lỗi load sản phẩm:", err);
            table.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu</td></tr>`;
        });
}

function openForm() {
    document.getElementById("productId").value = "";
    document.getElementById("tenSanPham").value = "";
    document.getElementById("moTa").value = "";
    document.getElementById("giaSanPham").value = "";
    document.getElementById("hinhAnh").value = "";
    document.getElementById("doTuoi").value = "";
    document.getElementById("protein").value = "";
    document.getElementById("carb").value = "";
    document.getElementById("chatBeo").value = "";
    document.getElementById("danhMucSelect").value = "";
    modal.show();
}

function editProduct(id) {
    fetch(`${API_THUC_DON}/${id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById("productId").value = data.id;
            document.getElementById("tenSanPham").value = data.tenSanPham || "";
            document.getElementById("moTa").value = data.moTa || "";
            document.getElementById("giaSanPham").value = data.gia || "";
            document.getElementById("hinhAnh").value = data.hinhAnh || "";
            document.getElementById("doTuoi").value = data.doTuoi || "";
            document.getElementById("protein").value = data.protein || "";
            document.getElementById("carb").value = data.carb || "";
            document.getElementById("chatBeo").value = data.chatBeo || "";
            document.getElementById("danhMucSelect").value = data.danhMuc_id || "";
            modal.show();
        })
        .catch(err => {
            alert("Không thể tải thông tin sản phẩm");
            console.error(err);
        });
}

function saveProduct() {
    const id = document.getElementById("productId").value;
    const data = {
        tenSanPham: document.getElementById("tenSanPham").value,
        moTa: document.getElementById("moTa").value,
        gia: document.getElementById("giaSanPham").value,
        hinhAnh: document.getElementById("hinhAnh").value,
        doTuoi: document.getElementById("doTuoi").value,
        protein: parseFloat(document.getElementById("protein").value) || null,
        carb: parseFloat(document.getElementById("carb").value) || null,
        chatBeo: parseFloat(document.getElementById("chatBeo").value) || null,
        danhMuc_id: parseInt(document.getElementById("danhMucSelect").value)
    };

    if (!data.tenSanPham || !data.gia || !data.danhMuc_id) {
        alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
        return;
    }

    const url = id ? `${API_THUC_DON}/${id}` : API_THUC_DON;
    const method = id ? "PUT" : "POST";

    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success !== false) {
            alert(id ? "Cập nhật thành công" : "Thêm thành công");
            modal.hide();
            loadProducts();
        } else {
            alert(result.message || "Có lỗi xảy ra");
        }
    })
    .catch(err => {
        alert("Lỗi: " + err.message);
        console.error(err);
    });
}

function deleteProduct(id) {
    if (!confirm("Xóa sản phẩm này? (Sản phẩm sẽ bị ẩn)")) {
        return;
    }

    fetch(`${API_THUC_DON}/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            alert("Đã xóa sản phẩm");
            loadProducts();
        } else {
            alert(result.message || "Có lỗi xảy ra");
        }
    })
    .catch(err => {
        alert("Lỗi: " + err.message);
        console.error(err);
    });
}

// Load ban đầu
loadProducts();
