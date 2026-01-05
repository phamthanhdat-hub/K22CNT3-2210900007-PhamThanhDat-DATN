let products = JSON.parse(localStorage.getItem("products")) || [
    { id: 1, ten: "Cháo Cá Hồi Bí Đỏ", gia: 45000, img: "cahoi.jpg" },
    { id: 2, ten: "Cháo Thịt Bò Rau Ngót", gia: 40000, img: "bo.jpg" }
];

const table = document.getElementById("productTable");
const modal = new bootstrap.Modal(document.getElementById("productModal"));

function render() {
    table.innerHTML = "";
    products.forEach((p, i) => {
        table.innerHTML += `
        <tr>
            <td>${i + 1}</td>
            <td>${p.ten}</td>
            <td>${p.gia.toLocaleString()}</td>
            <td>${p.img}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editProduct(${p.id})">Sửa</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">Xóa</button>
            </td>
        </tr>
        `;
    });
    localStorage.setItem("products", JSON.stringify(products));
}

render();

function openForm() {
    document.getElementById("productId").value = "";
    document.getElementById("tenSanPham").value = "";
    document.getElementById("giaSanPham").value = "";
    document.getElementById("hinhAnh").value = "";
    modal.show();
}

function saveProduct() {
    const id = document.getElementById("productId").value;
    const ten = document.getElementById("tenSanPham").value;
    const gia = document.getElementById("giaSanPham").value;
    const img = document.getElementById("hinhAnh").value;

    if (!ten || !gia) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (id) {
        const p = products.find(x => x.id == id);
        p.ten = ten;
        p.gia = Number(gia);
        p.img = img;
    } else {
        products.push({
            id: Date.now(),
            ten,
            gia: Number(gia),
            img
        });
    }

    modal.hide();
    render();
}

function editProduct(id) {
    const p = products.find(x => x.id === id);
    document.getElementById("productId").value = p.id;
    document.getElementById("tenSanPham").value = p.ten;
    document.getElementById("giaSanPham").value = p.gia;
    document.getElementById("hinhAnh").value = p.img;
    modal.show();
}

function deleteProduct(id) {
    if (confirm("Xóa sản phẩm này?")) {
        products = products.filter(x => x.id !== id);
        render();
    }
}
