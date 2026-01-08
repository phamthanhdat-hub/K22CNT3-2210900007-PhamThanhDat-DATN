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
            
            // Load địa chỉ nhà riêng từ database
            if (userInfo.hoTen && userInfo.dienThoai) {
                document.getElementById("savedNameHome").textContent = userInfo.hoTen;
                document.getElementById("savedPhoneHome").textContent = userInfo.dienThoai;
                
                // Parse địa chỉ nhà riêng nếu có format "diaChi | Thời gian: ..."
                const diaChiHome = userInfo.diaChi || '';
                const diaChiHomeParts = diaChiHome.split(" | ");
                document.getElementById("savedAddressHomeText").textContent = diaChiHomeParts[0] || '-';
                
                // Load địa chỉ văn phòng
                document.getElementById("savedNameOffice").textContent = userInfo.hoTen;
                document.getElementById("savedPhoneOffice").textContent = userInfo.dienThoai;
                const diaChiOffice = userInfo.diaChiVanPhong || '';
                document.getElementById("savedAddressOfficeText").textContent = diaChiOffice || '-';
                
                // Điền vào form mới nếu cần
                document.getElementById("hoTen").value = userInfo.hoTen;
                document.getElementById("dienThoai").value = userInfo.dienThoai;
                document.getElementById("diaChi").value = diaChiHomeParts[0] || '';
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
                document.getElementById("savedNameOffice").textContent = userInfo.hoTen || '-';
                document.getElementById("savedPhoneOffice").textContent = userInfo.dienThoai || '-';
                document.getElementById("savedAddressOfficeText").textContent = userInfo.diaChiVanPhong || '-';
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
    
    // Ẩn nút Lưu lại và Hủy khi thêm địa chỉ mới (không phải chỉnh sửa)
    if (!currentEditingAddressType) {
        document.getElementById("addressActionButtons").style.display = "none";
    }
    
    // Scroll to form
    document.getElementById("newAddressForm").scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Lưu loại địa chỉ đang chỉnh sửa
let currentEditingAddressType = 'home';

function editAddress(type) {
    currentEditingAddressType = type; // Lưu loại địa chỉ đang chỉnh sửa
    showNewAddressForm();
    
    // Hiển thị nút Lưu lại và Hủy ngay lập tức khi bắt đầu chỉnh sửa
    document.getElementById("addressActionButtons").style.display = "flex";
    
    // Load thông tin từ database và điền vào form
    fetch("http://127.0.0.1:5000/api/auth/profile", {
        headers: {
            "Authorization": "Bearer " + token
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.nguoiDung) {
            const userInfo = data.nguoiDung;
            
            // Điền thông tin vào form
            document.getElementById("hoTen").value = userInfo.hoTen || '';
            document.getElementById("dienThoai").value = userInfo.dienThoai || '';
            
            // Lấy địa chỉ tùy theo loại
            let diaChiToEdit = '';
            if (type === 'home') {
                const diaChiFull = userInfo.diaChi || '';
                const diaChiParts = diaChiFull.split(" | ");
                diaChiToEdit = diaChiParts[0] || '';
            } else if (type === 'office') {
                diaChiToEdit = userInfo.diaChiVanPhong || '';
            }
            
            // Parse địa chỉ thành các phần: địa chỉ cụ thể, quận/huyện, tỉnh/thành phố
            // Format: "Số nhà, tên đường, Quận/Huyện, Tỉnh/Thành phố"
            const diaChiArray = diaChiToEdit.split(',').map(s => s.trim());
            
            if (diaChiArray.length >= 3) {
                // Địa chỉ cụ thể (phần đầu)
                const diaChiCuThe = diaChiArray.slice(0, -2).join(', ');
                document.getElementById("diaChi").value = diaChiCuThe;
                
                // Quận/Huyện (phần thứ 2 từ cuối)
                const quanHuyen = diaChiArray[diaChiArray.length - 2];
                // Map tên quận/huyện về value của select
                const quanHuyenSelect = document.getElementById("quanHuyen");
                for (let option of quanHuyenSelect.options) {
                    if (option.text.includes(quanHuyen) || quanHuyen.includes(option.text)) {
                        quanHuyenSelect.value = option.value;
                        break;
                    }
                }
                
                // Tỉnh/Thành phố (phần cuối)
                const tinhThanh = diaChiArray[diaChiArray.length - 1];
                const tinhThanhSelect = document.getElementById("tinhThanh");
                for (let option of tinhThanhSelect.options) {
                    if (option.text.includes(tinhThanh) || tinhThanh.includes(option.text)) {
                        tinhThanhSelect.value = option.value;
                        break;
                    }
                }
            } else {
                // Nếu không parse được, điền toàn bộ vào địa chỉ cụ thể
                document.getElementById("diaChi").value = diaChiToEdit;
            }
            
            // Bỏ chọn radio button địa chỉ đã lưu
            document.querySelector('input[name="addressType"][value="saved"]').checked = false;
            document.querySelector('input[name="addressType"][value="office"]').checked = false;
        } else {
            // Nếu không load được, vẫn hiển thị nút để người dùng có thể nhập mới
            console.warn("Không thể load thông tin địa chỉ, nhưng vẫn cho phép chỉnh sửa");
        }
    })
    .catch(err => {
        console.error("Error loading address for edit:", err);
        // Vẫn hiển thị nút để người dùng có thể nhập và lưu
    });
}

/* ===============================
   LƯU ĐỊA CHỈ NGAY LẬP TỨC
================================ */
function saveAddressNow() {
    const userInfo = JSON.parse(localStorage.getItem("user_info") || '{}');
    
    if (!userInfo.id) {
        showToast("Vui lòng đăng nhập", "error");
        return;
    }
    
    // Validate thông tin
    const hoTen = document.getElementById("hoTen").value.trim();
    const dienThoai = document.getElementById("dienThoai").value.trim();
    const tinhThanh = document.getElementById("tinhThanh").value;
    const quanHuyen = document.getElementById("quanHuyen").value;
    const diaChiCuThe = document.getElementById("diaChi").value.trim();
    
    // Validate
    if (!hoTen || hoTen.length < 2) {
        showToast("Vui lòng nhập họ và tên (ít nhất 2 ký tự)", "error");
        document.getElementById("hoTen").focus();
        return;
    }
    
    const phonePattern = /^[0-9]{10,11}$/;
    if (!dienThoai || !phonePattern.test(dienThoai)) {
        showToast("Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số)", "error");
        document.getElementById("dienThoai").focus();
        return;
    }
    
    if (!diaChiCuThe || diaChiCuThe.length < 5) {
        showToast("Vui lòng nhập địa chỉ cụ thể", "error");
        document.getElementById("diaChi").focus();
        return;
    }
    
    // Tạo địa chỉ đầy đủ
    const diaChiParts = [diaChiCuThe];
    if (quanHuyen) {
        const quanHuyenText = document.querySelector(`#quanHuyen option[value="${quanHuyen}"]`)?.text || '';
        if (quanHuyenText) diaChiParts.push(quanHuyenText);
    }
    if (tinhThanh) {
        const tinhThanhText = document.querySelector(`#tinhThanh option[value="${tinhThanh}"]`)?.text || '';
        if (tinhThanhText) diaChiParts.push(tinhThanhText);
    }
    const diaChi = diaChiParts.filter(x => x).join(", ");
    
    if (diaChi.length < 10) {
        showToast("Địa chỉ phải có ít nhất 10 ký tự", "error");
        return;
    }
    
    // Đánh dấu đang lưu từ nút "Lưu lại"
    window.isSavingAddressNow = true;
    
    // Gọi hàm updateCustomerInfo với thông tin đã nhập
    const addressTypeToUpdate = currentEditingAddressType || 'home';
    
    const updateBody = {
        id: userInfo.id,
        hoTen: hoTen,
        dienThoai: dienThoai,
        addressType: addressTypeToUpdate
    };
    
    if (addressTypeToUpdate === "home") {
        updateBody.diaChi = diaChi;
    } else {
        updateBody.diaChiVanPhong = diaChi;
    }
    
    // Disable nút trong khi đang lưu
    const saveBtn = document.getElementById("saveAddressBtn");
    const originalText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Đang lưu...';
    
    // Gọi API để lưu
    fetch("http://127.0.0.1:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(updateBody)
    })
    .then(res => res.json())
    .then(data => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
        
        if (data.success) {
            // Cập nhật localStorage
            userInfo.hoTen = hoTen;
            userInfo.dienThoai = dienThoai;
            if (addressTypeToUpdate === "home") {
                userInfo.diaChi = diaChi;
            } else {
                userInfo.diaChiVanPhong = diaChi;
            }
            localStorage.setItem("user_info", JSON.stringify(userInfo));
            
            // Cập nhật hiển thị địa chỉ đã lưu
            if (addressTypeToUpdate === "home") {
                document.getElementById("savedNameHome").textContent = hoTen;
                document.getElementById("savedPhoneHome").textContent = dienThoai;
                document.getElementById("savedAddressHomeText").textContent = diaChi;
            } else {
                document.getElementById("savedNameOffice").textContent = hoTen;
                document.getElementById("savedPhoneOffice").textContent = dienThoai;
                document.getElementById("savedAddressOfficeText").textContent = diaChi;
            }
            
            // Ẩn form và reset
            document.getElementById("newAddressForm").style.display = "none";
            document.getElementById("addressActionButtons").style.display = "none";
            currentEditingAddressType = null;
            window.isSavingAddressNow = false;
            
            // Chọn lại địa chỉ vừa lưu
            if (addressTypeToUpdate === "home") {
                document.querySelector('input[name="addressType"][value="saved"]').checked = true;
            } else {
                document.querySelector('input[name="addressType"][value="office"]').checked = true;
            }
            
            showToast(`✅ Đã lưu địa chỉ ${addressTypeToUpdate === "home" ? "nhà riêng" : "văn phòng"} thành công!`, "success");
        } else {
            showToast(data.message || "Lỗi khi lưu địa chỉ", "error");
            window.isSavingAddressNow = false;
        }
    })
    .catch(err => {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalText;
        showToast("Lỗi kết nối khi lưu địa chỉ", "error");
        console.error("Error saving address:", err);
        window.isSavingAddressNow = false;
    });
}

/* ===============================
   HỦY CHỈNH SỬA ĐỊA CHỈ
================================ */
function cancelEditAddress() {
    // Ẩn form
    document.getElementById("newAddressForm").style.display = "none";
    document.getElementById("addressActionButtons").style.display = "none";
    
    // Reset biến
    currentEditingAddressType = null;
    
    // Chọn lại địa chỉ đã lưu trước đó
    if (document.querySelector('input[name="addressType"][value="saved"]')) {
        document.querySelector('input[name="addressType"][value="saved"]').checked = true;
    }
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
    const saveInfoEl = document.getElementById("saveInfo");
    const saveInfo = saveInfoEl ? saveInfoEl.checked : false;

    // Nếu không có checkbox hoặc không được chọn, không lưu
    if (!saveInfoEl || !saveInfo || !userInfo.id) {
        return Promise.resolve();
    }

    const addressType = document.querySelector('input[name="addressType"]:checked')?.value;
    let hoTen, dienThoai, diaChi;
    
    // Xác định loại địa chỉ đang chỉnh sửa
    const newAddressForm = document.getElementById("newAddressForm");
    let addressTypeToUpdate = 'home'; // Mặc định là nhà riêng
    
    if (newAddressForm && newAddressForm.style.display !== "none") {
        // Nếu đang chỉnh sửa từ form, dùng loại đã lưu
        addressTypeToUpdate = currentEditingAddressType || 'home';
        
        // Lấy từ form mới
        hoTen = document.getElementById("hoTen").value.trim();
        dienThoai = document.getElementById("dienThoai").value.trim();
        const tinhThanh = document.getElementById("tinhThanh").value;
        const quanHuyen = document.getElementById("quanHuyen").value;
        const diaChiCuThe = document.getElementById("diaChi").value.trim();
        
        // Tạo địa chỉ đầy đủ
        const diaChiParts = [diaChiCuThe];
        if (quanHuyen) {
            const quanHuyenText = document.querySelector(`#quanHuyen option[value="${quanHuyen}"]`)?.text || '';
            if (quanHuyenText) diaChiParts.push(quanHuyenText);
        }
        if (tinhThanh) {
            const tinhThanhText = document.querySelector(`#tinhThanh option[value="${tinhThanh}"]`)?.text || '';
            if (tinhThanhText) diaChiParts.push(tinhThanhText);
        }
        diaChi = diaChiParts.filter(x => x).join(", ");
    } else if (addressType === "saved" || addressType === "office") {
        // Lấy từ thông tin đã lưu
        addressTypeToUpdate = addressType === "saved" ? "home" : "office";
        hoTen = userInfo.hoTen || '';
        dienThoai = userInfo.dienThoai || '';
        if (addressType === "saved") {
            const diaChiFull = userInfo.diaChi || '';
            const diaChiParts = diaChiFull.split(" | ");
            diaChi = diaChiParts[0] || '';
        } else {
            diaChi = userInfo.diaChiVanPhong || '';
        }
    } else {
        // Không có thông tin, không cập nhật
        return Promise.resolve();
    }

    // Validate trước khi cập nhật
    if (!hoTen || hoTen.length < 2 || !dienThoai) {
        return Promise.resolve();
    }
    
    if (addressTypeToUpdate === "home" && (!diaChi || diaChi.length < 10)) {
        return Promise.resolve();
    }
    
    if (addressTypeToUpdate === "office" && (!diaChi || diaChi.length < 10)) {
        return Promise.resolve();
    }

    // Chuẩn bị body để gửi
    const updateBody = {
        id: userInfo.id,
        hoTen: hoTen,
        dienThoai: dienThoai,
        addressType: addressTypeToUpdate
    };
    
    if (addressTypeToUpdate === "home") {
        updateBody.diaChi = diaChi;
    } else {
        updateBody.diaChiVanPhong = diaChi;
    }

    // Cập nhật vào database
    return fetch("http://127.0.0.1:5000/api/auth/update-profile", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify(updateBody)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            // Cập nhật localStorage sau khi lưu vào database
            userInfo.hoTen = hoTen;
            userInfo.dienThoai = dienThoai;
            if (addressTypeToUpdate === "home") {
                userInfo.diaChi = diaChi;
            } else {
                userInfo.diaChiVanPhong = diaChi;
            }
            localStorage.setItem("user_info", JSON.stringify(userInfo));
            
            // Cập nhật lại hiển thị địa chỉ đã lưu
            if (addressTypeToUpdate === "home") {
                document.getElementById("savedNameHome").textContent = hoTen;
                document.getElementById("savedPhoneHome").textContent = dienThoai;
                document.getElementById("savedAddressHomeText").textContent = diaChi;
            } else {
                document.getElementById("savedNameOffice").textContent = hoTen;
                document.getElementById("savedPhoneOffice").textContent = dienThoai;
                document.getElementById("savedAddressOfficeText").textContent = diaChi;
            }
            
            console.log("Đã cập nhật thông tin vào database");
            showToast(`✅ Đã lưu địa chỉ ${addressTypeToUpdate === "home" ? "nhà riêng" : "văn phòng"}`, "success");
        } else {
            console.error("Lỗi cập nhật:", data.message);
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
            hoTen = userInfo.hoTen || '';
            dienThoai = userInfo.dienThoai || '';
            const diaChiFull = userInfo.diaChi || '';
            const diaChiParts = diaChiFull.split(" | ");
            diaChi = diaChiParts[0] || '';
        } else if (addressType === "office") {
            hoTen = userInfo.hoTen || '';
            dienThoai = userInfo.dienThoai || '';
            diaChi = userInfo.diaChiVanPhong || '';
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
            // Cập nhật cart count về 0 vì giỏ hàng đã được xóa
            updateHeaderCartCount();
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
            
            // Cập nhật cart count về 0 vì giỏ hàng đã được xóa
            updateHeaderCartCount();
            
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
   CẬP NHẬT CART COUNT TRÊN HEADER
================================ */
function updateHeaderCartCount() {
    const cartCountEl = document.getElementById("cartCount");
    if (!cartCountEl) return;

    fetch(API_GIO_HANG, {
        headers: {"Authorization": "Bearer " + token}
    })
    .then(res => res.json())
    .then(data => {
        const total = data.reduce((sum, item) => sum + item.soLuong, 0);
        cartCountEl.textContent = total;
        
        if (total > 0) {
            cartCountEl.style.display = "flex";
        } else {
            cartCountEl.style.display = "none";
        }
    })
    .catch(err => {
        console.error("Error updating header cart count:", err);
        if (cartCountEl) cartCountEl.textContent = "0";
    });
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

