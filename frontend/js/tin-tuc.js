// ================================
// LOAD TIN TỨC – BABYCUTIE
// ================================

document.addEventListener("DOMContentLoaded", () => {
    loadTinTuc();
});

function loadTinTuc() {
    fetch("http://127.0.0.1:5000/api/tin-tuc")
        .then(res => res.json())
        .then(data => {
            const newsList = document.getElementById("newsList");
            newsList.innerHTML = "";

            if (!data || data.length === 0) {
                newsList.innerHTML = "<p>Chưa có tin tức nào.</p>";
                return;
            }

            data.forEach(n => {
                newsList.innerHTML += renderTinTuc(n);
            });
        })
        .catch(err => {
            document.getElementById("newsList").innerHTML =
                "<p>Lỗi tải tin tức.</p>";
            console.error(err);
        });
}

// ================================
// TEMPLATE 1 BÀI TIN
// ================================
function renderTinTuc(n) {
    return `
        <div class="news-card">

            <h4>${n.tieuDe}</h4>

            <small>
                🗓 ${formatDate(n.ngayDang)}
                ${n.nguoiDang ? " | 👤 " + n.nguoiDang : ""}
            </small>

            <p>
                <b>🔍 Vấn đề phụ huynh thường gặp:</b><br>
                Nhiều phụ huynh lo lắng không biết nên lựa chọn
                món ăn nào vừa đủ chất, vừa dễ tiêu hóa cho bé
                trong giai đoạn phát triển.
            </p>

            <p>
                <b>🥗 Kiến thức dinh dưỡng:</b><br>
                ${n.noiDung}
            </p>

            <p>
                <b>🍲 Gợi ý món cháo phù hợp:</b><br>
                Cháo cá hồi bí đỏ, cháo gà cà rốt,
                cháo bò rau ngót là những món ăn
                giàu dinh dưỡng và dễ hấp thu.
            </p>

            <p>
                <b>💖 Lời khuyên:</b><br>
                Phụ huynh nên đa dạng thực đơn,
                theo dõi phản ứng của bé và lựa chọn
                món ăn phù hợp nhất với thể trạng.
            </p>

        </div>
    `;
}

// ================================
// FORMAT DATE
// ================================
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("vi-VN");
}
