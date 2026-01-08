const API_GIO_HANG = "http://127.0.0.1:5000/api/gio-hang";
const API_DON_HANG = "http://127.0.0.1:5000/api/don-hang";
const API_THANH_TOAN = "http://127.0.0.1:5000/api/thanh-toan/thanh-toan";
const IMAGE_URL = "http://127.0.0.1:5000/images/";
const PHI_VAN_CHUYEN = 15000;
const token = localStorage.getItem("token");

if (!token) {
    alert("Vui lòng đăng nhập");
    window.location.href = "login-khach.html";
}

let selectedKhuyenMai = null;
let tempDonHangId = null;
let tempTongTien = 0;

/* ===============================
   LOAD DỮ LIỆU
================================ */
document.addEventListener('DOMContentLoaded', function() {
    loadCustomerInfo();
    loadCartItems();
    loadCheckoutSummary();
});

/* ===============================
   LOAD THÔNG TIN KHÁCH HÀNG TỪ DATABASE
================================ */
function loadCustomerInfo() {
    // Load từ database thay vì localStorage
    fetch("http://127.0.0.1:5000/api/auth/profile", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.nguoiDung) {
            const userInfo = data.nguoiDung;
            
            // Load địa chỉ đã lưu từ database
            if (userInfo.hoTen && userInfo.dienThoai && userInfo.diaChi) {
                document.getElementById("savedNameHome").textContent = userInfo.hoTen;
                document.getElementById("savedPhoneHome").textContent = userInfo.dienThoai;
                document.getElementById("savedAddressHomeText").textContent = userInfo.diaChi;
                
                // Điền vào form mới nếu cần
                document.getElementById("hoTen").value = userInfo.hoTen;
                document.getElementById("dienThoai").value = userInfo.dienThoai;
                
                // Parse địa chỉ nếu có format "diaChi | Thời gian: ..."
                const diaChiParts = userInfo.diaChi.split(" | ");
                document.getElementById("diaChi").value = diaChiParts[0];
            } else {
                // Nếu chưa có địa chỉ, hiển thị form mới
                showNewAddressForm();
            }
            
            // Cập nhật localStorage để đồng bộ
            localStorage.setItem("user_info", JSON.stringify(userInfo));
        } else {
            showToast("Không thể tải thông tin người dùng", "error");
        }
    })
    .catch(err => {
        console.error("Error loading customer info:", err);
        // Fallback to localStorage nếu API fail
        const userInfo = JSON.parse(localStorage.getItem("user_info") || '{}');
        if (userInfo.hoTen && userInfo.dienThoai && userInfo.diaChi) {
            document.getElementById("savedNameHome").textContent = userInfo.hoTen;
            document.getElementById("savedPhoneHome").textContent = userInfo.dienThoai;
            document.getElementById("savedAddressHomeText").textContent = userInfo.diaChi;
        }
    });
}

/* ===============================
   XỬ LÝ THAY ĐỔI LOẠI ĐỊA CHỈ
================================ */
function handleAddressTypeChange() {
    const selectedType = document.querySelector('input[name="addressType"]:checked').value;
    const newAddressForm = document.getElementById("newAddressForm");
    
    if (selectedType === "saved") {
        newAddressForm.style.display = "none";
        // Load địa chỉ nhà riêng
        loadSavedAddress('home');
    } else if (selectedType === "office") {
        newAddressForm.style.display = "none";
        // Load địa chỉ văn phòng
        loadSavedAddress('office');
    }
}

function loadSavedAddress(type) {
    // Load từ database
    fetch("http://127.0.0.1:5000/api/auth/profile", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.nguoiDung) {
            const userInfo = data.nguoiDung;
            
            if (type === 'home') {
                document.getElementById("savedNameHome").textContent = userInfo.hoTen || '-';
                document.getElementById("savedPhoneHome").textContent = userInfo.dienThoai || '-';
                const diaChiParts = (userInfo.diaChi || '').split(" | ");
                document.getElementById("savedAddressHomeText").textContent = diaChiParts[0] || '-';
            } else if (type === 'office') {
                // Văn phòng có thể lưu riêng trong tương lai, tạm thời dùng thông tin chính
                document.getElementById("savedNameOffice").textContent = userInfo.hoTen || '-';
                document.getElementById("savedPhoneOffice").textContent = userInfo.dienThoai || '-';
                document.getElementById("savedAddressOfficeText").textContent = '-';
            }
        }
    })
    .catch(err => {
        console.error("Error loading saved address:", err);
    });
}

function showNewAddressForm() {
    document.getElementById("newAddressForm").style.display = "block";
    document.querySelector('input[name="addressType"][value="saved"]').checked = false;
    document.querySelector('input[name="addressType"][value="office"]').checked = false;
}

function editAddress(type) {
    showNewAddressForm();
    loadSavedAddress(type);
}

/* ===============================
   CHỌN THỜI GIAN NHẬN HÀNG
================================ */
let selectedDeliveryTime = 'immediate';

function selectDeliveryTime(time, element) {
    selectedDeliveryTime = time;
    
    // Remove active class from all
    document.querySelectorAll('.time-option').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to selected
    element.classList.add('active');
}

/* ===============================
   LOAD SẢN PHẨM TRONG GIỎ HÀNG
================================ */
function loadCartItems() {
    fetch(API_GIO_HANG, {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        const orderItemsList = document.getElementById("orderItemsList");
        orderItemsList.innerHTML = "";

        if (data.length === 0) {
            orderItemsList.innerHTML = '<p class="text-muted text-center">Giỏ hàng trống</p>';
            return;
        }

        let tongPhu = 0;
        data.forEach(item => {
            const tamTinh = item.gia * item.soLuong;
            tongPhu += tamTinh;
            orderItemsList.innerHTML += `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="${IMAGE_URL + item.hinhAnh}" alt="${item.tenSanPham}">
                    </div>
                    <div class="order-item-details">
                        <h6 class="order-item-name">${item.tenSanPham}</h6>
                        <div class="order-item-meta">
                            <span>x${item.soLuong}</span>
                            <span>•</span>
                            <span>Size: M(250g)</span>
                        </div>
                    </div>
                    <div class="order-item-price">
                        ${tamTinh.toLocaleString()}₫
                    </div>
                </div>
            `;
        });
        
        // Cập nhật tổng tiền
        updateSummaryFromCart(tongPhu);
    })
    .catch(err => {
        console.error("Error loading cart:", err);
    });
}

/* ===============================
   LOAD TÓM TẮT ĐƠN HÀNG
================================ */
function loadCheckoutSummary() {
    const checkoutData = JSON.parse(localStorage.getItem("checkout_data") || '{}');
    
    if (checkoutData.khuyenMai) {
        selectedKhuyenMai = checkoutData.khuyenMai;
    }

    const tongPhu = checkoutData.tongPhu || 0;
    updateSummaryFromCart(tongPhu);
}

function updateSummaryFromCart(tongPhu) {
    const phiVanChuyen = PHI_VAN_CHUYEN;
    const giamGia = selectedKhuyenMai ? selectedKhuyenMai.soTienGiam : 0;
    const tongCong = tongPhu + phiVanChuyen - giamGia;

    document.getElementById("summaryTongPhu").textContent = tongPhu.toLocaleString() + "₫";
    document.getElementById("summaryPhiVanChuyen").textContent = phiVanChuyen.toLocaleString() + "₫";
    
    if (giamGia > 0) {
        document.getElementById("summaryGiamGiaRow").style.display = "flex";
        document.getElementById("summaryGiamGia").textContent = "-" + giamGia.toLocaleString() + "₫";
    } else {
        document.getElementById("summaryGiamGiaRow").style.display = "none";
    }
    
    document.getElementById("summaryTongCong").textContent = tongCong.toLocaleString() + "₫";
}

/* ===============================
   ÁP DỤNG MÃ KHUYẾN MÃI
================================ */
function apDungKhuyenMai() {
    const maKM = document.getElementById("maKhuyenMai").value.trim().toUpperCase();
    if (!maKM) {
        showToast("Vui lòng nhập mã khuyến mãi", "error");
        return;
    }

    const tongPhu = parseInt(document.getElementById("summaryTongPhu").textContent.replace(/[^\d]/g, '')) || 0;

    if (tongPhu === 0) {
        showToast("Giỏ hàng trống. Vui lòng thêm sản phẩm", "error");
        return;
    }

    fetch("http://127.0.0.1:5000/api/khuyen-mai/tinh-toan", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            maKhuyenMai: maKM,
            tongTien: tongPhu
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            showToast(data.message || "Mã khuyến mãi không hợp lệ", "error");
            return;
        }

        selectedKhuyenMai = {
            id: data.khuyenMai_id,
            maKhuyenMai: maKM,
            tenKhuyenMai: data.tenKhuyenMai,
            soTienGiam: data.soTienGiam
        };

        // Cập nhật tóm tắt
        const tongPhu = parseInt(document.getElementById("summaryTongPhu").textContent.replace(/[^\d]/g, '')) || 0;
        updateSummaryFromCart(tongPhu);

        // Hiển thị thông tin
        const promoInfo = document.getElementById("promoInfo");
        promoInfo.style.display = "block";
        promoInfo.innerHTML = `<i class="fa fa-check-circle"></i> Đã áp dụng mã "${maKM}" - Giảm ${data.soTienGiam.toLocaleString()}₫`;

        showToast(`✅ Áp dụng mã "${maKM}" thành công! Giảm ${data.soTienGiam.toLocaleString()}₫`, "success");

        document.getElementById("maKhuyenMai").disabled = true;
        document.querySelector('button[onclick="apDungKhuyenMai()"]').disabled = true;
    })
    .catch(err => {
        showToast("❌ Lỗi kết nối. Vui lòng thử lại", "error");
        console.error("Promo error:", err);
    });
}

/* ===============================
   VALIDATE THÔNG TIN
================================ */
function validateCustomerInfo() {
    const addressType = document.querySelector('input[name="addressType"]:checked')?.value;
    
    let hoTen, dienThoai, diaChi;
    
    if (addressType === "saved" || addressType === "office") {
        // Lấy từ database hoặc localStorage
        const userInfo = JSON.parse(localStorage.getItem("user_info") || '{}');
        
        if (addressType === "saved") {
            hoTen = userInfo.hoTen || '';
            dienThoai = userInfo.dienThoai || '';
            const diaChiFull = userInfo.diaChi || '';
            // Parse địa chỉ nếu có format "diaChi | Thời gian: ..."
            const diaChiParts = diaChiFull.split(" | ");
            diaChi = diaChiParts[0] || '';
        } else {
            // Văn phòng - tạm thời dùng thông tin chính
            hoTen = userInfo.hoTen || '';
            dienThoai = userInfo.dienThoai || '';
            diaChi = ''; // Cần nhập mới
        }
    } else {
        // Lấy từ form mới
        hoTen = document.getElementById("hoTen").value.trim();
        dienThoai = document.getElementById("dienThoai").value.trim();
        const tinhThanh = document.getElementById("tinhThanh").value;
        const quanHuyen = document.getElementById("quanHuyen").value;
        const diaChiCuThe = document.getElementById("diaChi").value.trim();
        
        diaChi = [diaChiCuThe, quanHuyen, tinhThanh].filter(x => x).join(", ");
    }

    let isValid = true;
    const phonePattern = /^[0-9]{10,11}$/;

    // Validate
    if (!hoTen || hoTen.length < 2) {
        isValid = false;
    }

    if (!dienThoai || !phonePattern.test(dienThoai)) {
        isValid = false;
    }

    if (!diaChi || diaChi.length < 10) {
        isValid = false;
    }

    if (!isValid) {
        showToast("Vui lòng nhập đầy đủ và chính xác thông tin giao hàng", "error");
        
        // Nếu đang dùng form mới, highlight các field lỗi
        const newAddressForm = document.getElementById("newAddressForm");
        if (newAddressForm.style.display !== "none") {
            if (!hoTen || hoTen.length < 2) {
                const hoTenEl = document.getElementById("hoTen");
                hoTenEl.classList.add("is-invalid");
                hoTenEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                hoTenEl.focus();
            } else if (!dienThoai || !phonePattern.test(dienThoai)) {
                const dienThoaiEl = document.getElementById("dienThoai");
                dienThoaiEl.classList.add("is-invalid");
                dienThoaiEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                dienThoaiEl.focus();
            } else if (!diaChi || diaChi.length < 10) {
                const diaChiEl = document.getElementById("diaChi");
                diaChiEl.classList.add("is-invalid");
                diaChiEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                diaChiEl.focus();
            }
        } else {
            // Nếu đang dùng địa chỉ đã lưu nhưng thiếu thông tin, chuyển sang form mới
            showNewAddressForm();
            showToast("Vui lòng nhập đầy đủ thông tin giao hàng", "error");
        }
    }

    return isValid;
}

/* ===============================
   CẬP NHẬT THÔNG TIN KHÁCH HÀNG
================================ */
function updateCustomerInfo() {
    const userInfo = JSON.parse(localStorage.getItem("user_info") || '{}');
    const saveInfo = document.getElementById("saveInfo")?.checked || false;

    if (!saveInfo || !userInfo.id) {
        return Promise.resolve();
    }

    const addressType = document.querySelector('input[name="addressType"]:checked')?.value;
    let hoTen, dienThoai, diaChi;
    
    if (addressType === "saved" || addressType === "office") {
        // Lấy từ thông tin đã lưu
        hoTen = userInfo.hoTen || '';
        dienThoai = userInfo.dienThoai || '';
        const diaChiFull = userInfo.diaChi || '';
        const diaChiParts = diaChiFull.split(" | ");
        diaChi = diaChiParts[0] || '';
    } else {
        // Lấy từ form mới
        hoTen = document.getElementById("hoTen").value.trim();
        dienThoai = document.getElementById("dienThoai").value.trim();
        const tinhThanh = document.getElementById("tinhThanh").value;
        const quanHuyen = document.getElementById("quanHuyen").value;
        const diaChiCuThe = document.getElementById("diaChi").value.trim();
        diaChi = [diaChiCuThe, quanHuyen, tinhThanh].filter(x => x).join(", ");
    }

    // Cập nhật vào database
    return fetch("http://127.0.0.1:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            id: userInfo.id,
            hoTen: hoTen,
            dienThoai: dienThoai,
            diaChi: diaChi
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Cập nhật localStorage sau khi lưu vào database
            userInfo.hoTen = hoTen;
            userInfo.dienThoai = dienThoai;
            userInfo.diaChi = diaChi;
            localStorage.setItem("user_info", JSON.stringify(userInfo));
            console.log("Đã cập nhật thông tin vào database");
        }
        return Promise.resolve();
    })
    .catch(err => {
        console.error("Lỗi cập nhật thông tin:", err);
        return Promise.resolve();
    });
}

/* ===============================
   XỬ LÝ THAY ĐỔI PHƯƠNG THỨC THANH TOÁN
================================ */
function handlePaymentMethodChange() {
    const selectedMethod = document.querySelector('input[name="pttt"]:checked').value;
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (selectedMethod === "Chuyển khoản") {
        checkoutBtn.innerHTML = '<i class="fa fa-qrcode"></i> Xem mã QR & Đặt hàng';
    } else {
        checkoutBtn.innerHTML = '<i class="fa fa-credit-card"></i> Đặt hàng & Thanh toán';
    }
}

/* ===============================
   ĐẶT HÀNG & THANH TOÁN
================================ */
function datHang() {
    const userInfo = JSON.parse(localStorage.getItem("user_info") || '{}');
    
    if (!userInfo.id) {
        showToast("Vui lòng đăng nhập để đặt hàng", "error");
        setTimeout(() => {
            window.location.href = "login-khach.html";
        }, 1500);
        return;
    }

    if (!validateCustomerInfo()) {
        return;
    }

    const addressType = document.querySelector('input[name="addressType"]:checked')?.value;
    let hoTen, dienThoai, diaChi;
    
    if (addressType === "saved" || addressType === "office") {
        const savedAddresses = JSON.parse(localStorage.getItem("saved_addresses") || '{}');
        const userInfo = JSON.parse(localStorage.getItem("user_info") || '{}');
        
        if (addressType === "saved") {
            const address = savedAddresses.home || {
                hoTen: userInfo.hoTen || '',
                dienThoai: userInfo.dienThoai || '',
                diaChi: userInfo.diaChi || ''
            };
            hoTen = address.hoTen;
            dienThoai = address.dienThoai;
            diaChi = address.diaChi;
        } else {
            const address = savedAddresses.office || {};
            hoTen = address.hoTen || userInfo.hoTen || '';
            dienThoai = address.dienThoai || userInfo.dienThoai || '';
            diaChi = address.diaChi || '';
        }
    } else {
        hoTen = document.getElementById("hoTen").value.trim();
        dienThoai = document.getElementById("dienThoai").value.trim();
        const tinhThanh = document.getElementById("tinhThanh").value;
        const quanHuyen = document.getElementById("quanHuyen").value;
        const diaChiCuThe = document.getElementById("diaChi").value.trim();
        diaChi = [diaChiCuThe, quanHuyen, tinhThanh].filter(x => x).join(", ");
    }
    
    const phuongThuc = document.querySelector('input[name="pttt"]:checked').value;
    const thoiGianNhanHang = getSelectedDeliveryTime();

    updateCustomerInfo().then(() => {
        if (phuongThuc === "COD") {
            processCODOrder(userInfo.id, hoTen, dienThoai, diaChi, thoiGianNhanHang);
        } else if (phuongThuc === "Chuyển khoản") {
            processBankTransferOrder(userInfo.id, hoTen, dienThoai, diaChi, thoiGianNhanHang);
        }
    });
}

function getSelectedDeliveryTime() {
    const activeTimeBtn = document.querySelector('.time-option.active');
    if (!activeTimeBtn) return 'Ngay lập tức';
    
    const timeText = activeTimeBtn.textContent.trim();
    if (timeText === 'Ngay lập tức') return 'Ngay lập tức';
    if (timeText === '11:00-12:00') return '11:00-12:00';
    if (timeText === '16:00-17:00') return '16:00-17:00';
    if (timeText === 'Khác...') return 'Khác';
    return timeText;
}

/* ===============================
   XỬ LÝ THANH TOÁN COD
================================ */
function processCODOrder(nguoiDung_id, hoTen, dienThoai, diaChi, thoiGianNhanHang) {
    const btn = document.getElementById('checkoutBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang xử lý đơn hàng...';

    const checkoutData = JSON.parse(localStorage.getItem("checkout_data") || '{}');

    fetch(API_DON_HANG, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            nguoiDung_id: nguoiDung_id,
            hoTen: hoTen,
            dienThoai: dienThoai,
            diaChiGiaoHang: diaChi,
            thoiGianNhanHang: thoiGianNhanHang,
            khuyenMai_id: checkoutData.khuyenMai ? checkoutData.khuyenMai.id : null
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            throw new Error(data.message || "Không thể tạo đơn hàng");
        }

        return fetch(API_THANH_TOAN, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                donHang_id: data.donHang_id,
                phuongThuc: "COD"
            })
        });
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.innerHTML = originalText;

        if (data.success) {
            showToast("🎉 Đặt hàng thành công! Bạn sẽ thanh toán khi nhận hàng.", "success");
            localStorage.removeItem("checkout_data");
            setTimeout(() => {
                window.location.href = "don-hang-cua-toi.html";
            }, 2000);
        } else {
            showToast(data.message || "Thanh toán thất bại", "error");
        }
    })
    .catch(err => {
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.innerHTML = originalText;
        showToast("❌ Lỗi: " + err.message, "error");
        console.error("Order error:", err);
    });
}

/* ===============================
   XỬ LÝ THANH TOÁN CHUYỂN KHOẢN
================================ */
function processBankTransferOrder(nguoiDung_id, hoTen, dienThoai, diaChi, thoiGianNhanHang) {
    const btn = document.getElementById('checkoutBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.classList.add('loading');
    btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang tạo đơn hàng...';

    const checkoutData = JSON.parse(localStorage.getItem("checkout_data") || '{}');
    const tongTien = checkoutData.tongCong || 0;

    fetch(API_DON_HANG, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            nguoiDung_id: nguoiDung_id,
            hoTen: hoTen,
            dienThoai: dienThoai,
            diaChiGiaoHang: diaChi,
            thoiGianNhanHang: thoiGianNhanHang,
            khuyenMai_id: checkoutData.khuyenMai ? checkoutData.khuyenMai.id : null
        })
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.innerHTML = originalText;

        if (!data.success) {
            throw new Error(data.message || "Không thể tạo đơn hàng");
        }

        tempDonHangId = data.donHang_id;
        tempTongTien = tongTien;

        showQRCodeModal(tongTien, data.donHang_id, hoTen, dienThoai, diaChi);
    })
    .catch(err => {
        btn.disabled = false;
        btn.classList.remove('loading');
        btn.innerHTML = originalText;
        showToast("❌ Lỗi: " + err.message, "error");
        console.error("Order error:", err);
    });
}

/* ===============================
   HIỂN THỊ MODAL QR CODE
================================ */
function showQRCodeModal(tongTien, donHangId, hoTen, dienThoai, diaChi) {
    const accountHolder = "PHẠM THÀNH ĐẠT";
    const phoneNumber = "0984868340";
    const amount = tongTien;
    const content = `DonHang${donHangId}`;
    
    document.getElementById("accountHolder").textContent = accountHolder;
    document.getElementById("phoneNumber").textContent = phoneNumber;
    document.getElementById("paymentAmount").textContent = new Intl.NumberFormat('vi-VN').format(amount) + "₫";
    document.getElementById("paymentContent").textContent = content;
    
    const qrImage = document.getElementById("qrImage");
    if (qrImage) {
        qrImage.src = "images/qr.jpg";
        qrImage.style.display = "block";
    }
    
    const modal = new bootstrap.Modal(document.getElementById("qrPaymentModal"));
    modal.show();
    
    const confirmBtn = document.getElementById("confirmTransferBtn");
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fa fa-check"></i> Đã chuyển khoản';
    }
}

/* ===============================
   ĐÓNG MODAL QR CODE
================================ */
function closeQRModal() {
    if (tempDonHangId) {
        if (confirm("⚠️ Bạn có chắc muốn đóng?\n\nĐơn hàng #" + tempDonHangId + " đã được tạo.\nBạn có thể thanh toán sau trong mục 'Đơn hàng của tôi'.\n\nBạn có muốn tiếp tục đóng không?")) {
            const modal = bootstrap.Modal.getInstance(document.getElementById("qrPaymentModal"));
            if (modal) {
                modal.hide();
            }
            showToast("💡 Bạn có thể quay lại thanh toán đơn hàng này sau trong mục 'Đơn hàng của tôi'", "info");
        }
    } else {
        const modal = bootstrap.Modal.getInstance(document.getElementById("qrPaymentModal"));
        if (modal) {
            modal.hide();
        }
    }
}

/* ===============================
   XÁC NHẬN ĐÃ CHUYỂN KHOẢN
================================ */
function confirmBankTransfer(event) {
    if (!tempDonHangId) {
        showToast("Không tìm thấy thông tin đơn hàng. Vui lòng thử lại.", "error");
        return;
    }

    if (!confirm("Bạn đã chuyển khoản thành công?\n\nVui lòng đảm bảo:\n✓ Đã chuyển đúng số tiền\n✓ Đã nhập đúng nội dung chuyển khoản\n✓ Đã quét mã QR hoặc chuyển khoản thủ công\n\nBạn có chắc chắn đã hoàn tất chuyển khoản?")) {
        return;
    }

    const confirmBtn = event ? event.target : document.getElementById("confirmTransferBtn");
    const originalText = confirmBtn.innerHTML;
    
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang xử lý...';

    fetch(API_THANH_TOAN, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
            donHang_id: tempDonHangId,
            phuongThuc: "Chuyển khoản"
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById("qrPaymentModal"));
            if (modal) {
                modal.hide();
            }
            
            showToast("✅ Đã ghi nhận thanh toán! Đơn hàng đang chờ xác nhận từ admin.", "success");
            
            localStorage.removeItem("checkout_data");
            tempDonHangId = null;
            tempTongTien = 0;
            
            setTimeout(() => {
                window.location.href = "don-hang-cua-toi.html";
            }, 2000);
        } else {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalText;
            showToast(data.message || "Không thể ghi nhận thanh toán. Vui lòng thử lại.", "error");
        }
    })
    .catch(err => {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = originalText;
        showToast("❌ Lỗi kết nối: " + (err.message || "Vui lòng kiểm tra kết nối và thử lại"), "error");
        console.error("Payment error:", err);
    });
}

/* ===============================
   COPY TO CLIPBOARD
================================ */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("✅ Đã sao chép: " + text, "success");
    }).catch(() => {
        showToast("❌ Không thể sao chép", "error");
    });
}

function copyPaymentContent() {
    const content = document.getElementById("paymentContent").textContent;
    copyToClipboard(content);
}

/* ===============================
   TOAST NOTIFICATION
================================ */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

