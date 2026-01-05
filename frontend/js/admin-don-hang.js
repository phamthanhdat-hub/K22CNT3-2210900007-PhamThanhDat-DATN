let orders = JSON.parse(localStorage.getItem("orders")) || [
    {
        id: 1,
        ten: "Nguyễn Thị Lan",
        phone: "0902222222",
        total: 135000,
        status: "Chờ xác nhận"
    },
    {
        id: 2,
        ten: "Trần Văn Minh",
        phone: "0912333444",
        total: 90000,
        status: "Đang giao"
    }
];

const table = document.getElementById("orderTable");

function renderOrders() {
    table.innerHTML = "";
    orders.forEach((o, i) => {
        table.innerHTML += `
        <tr>
            <td>${i + 1}</td>
            <td>${o.ten}</td>
            <td>${o.phone}</td>
            <td>${o.total.toLocaleString()}đ</td>
            <td>
                <select class="form-select form-select-sm"
                        onchange="updateStatus(${o.id}, this.value)">
                    <option ${o.status === "Chờ xác nhận" ? "selected" : ""}>
                        Chờ xác nhận
                    </option>
                    <option ${o.status === "Đang giao" ? "selected" : ""}>
                        Đang giao
                    </option>
                    <option ${o.status === "Hoàn thành" ? "selected" : ""}>
                        Hoàn thành
                    </option>
                </select>
            </td>
            <td>
                <button class="btn btn-sm btn-danger"
                        onclick="deleteOrder(${o.id})">
                    Xóa
                </button>
            </td>
        </tr>
        `;
    });

    localStorage.setItem("orders", JSON.stringify(orders));
}

renderOrders();

function updateStatus(id, status) {
    const order = orders.find(o => o.id === id);
    order.status = status;
    renderOrders();
}

function deleteOrder(id) {
    if (confirm("Xóa đơn hàng này?")) {
        orders = orders.filter(o => o.id !== id);
        renderOrders();
    }
}
