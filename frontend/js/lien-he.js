// ================================
// LIÊN HỆ – BABYCUTIE
// ================================

document.addEventListener("DOMContentLoaded", () => {
    capNhatSoLuongGio();
    initContactForm();
});

// ================================
// CẬP NHẬT SỐ LƯỢNG GIỎ HÀNG
// ================================
function capNhatSoLuongGio() {
    try {
        const gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];
        const tong = gioHang.reduce((sum, sp) => sum + (sp.soLuong || 0), 0);
        const cartCountEl = document.getElementById("cartCount");
        if (cartCountEl) {
            cartCountEl.innerText = tong;
        }
    } catch (e) {
        console.error("Lỗi tải giỏ hàng:", e);
    }
}

// ================================
// KHỞI TẠO FORM
// ================================
function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;

    form.addEventListener("submit", handleSubmit);

    // Real-time validation
    const inputs = form.querySelectorAll("input, textarea");
    inputs.forEach(input => {
        input.addEventListener("blur", () => validateField(input));
        input.addEventListener("input", () => clearFieldError(input));
    });
}

// ================================
// XỬ LÝ SUBMIT
// ================================
async function handleSubmit(e) {
    e.preventDefault();

    const form = document.getElementById("contactForm");
    const hoTen = document.getElementById("hoTen").value.trim();
    const email = document.getElementById("email").value.trim();
    const noiDung = document.getElementById("noiDung").value.trim();

    // Validate all fields
    let isValid = true;
    isValid = validateField(document.getElementById("hoTen")) && isValid;
    isValid = validateField(document.getElementById("email")) && isValid;
    isValid = validateField(document.getElementById("noiDung")) && isValid;

    if (!isValid) {
        showError("Vui lòng điền đầy đủ và đúng thông tin");
        return;
    }

    // Show loading
    setLoading(true);
    hideMessages();

    try {
        const response = await fetch("http://127.0.0.1:5000/api/lien-he", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                hoTen: hoTen,
                email: email,
                noiDung: noiDung
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success !== false) {
            // Success
            showSuccess();
            form.reset();
            clearAllErrors();
        } else {
            throw new Error("Gửi liên hệ thất bại");
        }
    } catch (error) {
        console.error("Lỗi gửi liên hệ:", error);
        showError("Không thể gửi liên hệ. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
        setLoading(false);
    }
}

// ================================
// VALIDATION
// ================================
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name || field.id;
    const errorEl = document.getElementById(`${fieldName}Error`);

    // Clear previous error
    clearFieldError(field);

    // Check required
    if (field.hasAttribute("required") && !value) {
        showFieldError(field, "Trường này không được để trống");
        return false;
    }

    // Email validation
    if (fieldName === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, "Email không hợp lệ");
            return false;
        }
    }

    // Min length for content
    if (fieldName === "noiDung" && value && value.length < 10) {
        showFieldError(field, "Nội dung phải có ít nhất 10 ký tự");
        return false;
    }

    // Min length for name
    if (fieldName === "hoTen" && value && value.length < 2) {
        showFieldError(field, "Họ tên phải có ít nhất 2 ký tự");
        return false;
    }

    return true;
}

// ================================
// SHOW/HIDE FIELD ERROR
// ================================
function showFieldError(field, message) {
    const fieldName = field.name || field.id;
    const errorEl = document.getElementById(`${fieldName}Error`);
    
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = "block";
    }
    
    field.classList.add("error");
}

function clearFieldError(field) {
    const fieldName = field.name || field.id;
    const errorEl = document.getElementById(`${fieldName}Error`);
    
    if (errorEl) {
        errorEl.textContent = "";
        errorEl.style.display = "none";
    }
    
    field.classList.remove("error");
}

function clearAllErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(el => {
        if (el.id && el.id.includes("Error")) {
            el.textContent = "";
            el.style.display = "none";
        }
    });

    const fields = document.querySelectorAll("#contactForm input, #contactForm textarea");
    fields.forEach(field => field.classList.remove("error"));
}

// ================================
// LOADING STATE
// ================================
function setLoading(loading) {
    const submitBtn = document.getElementById("submitBtn");
    const submitText = document.getElementById("submitText");
    const submitLoading = document.getElementById("submitLoading");

    if (!submitBtn) return;

    if (loading) {
        submitBtn.disabled = true;
        submitText.style.display = "none";
        submitLoading.style.display = "inline-block";
    } else {
        submitBtn.disabled = false;
        submitText.style.display = "inline-block";
        submitLoading.style.display = "none";
    }
}

// ================================
// MESSAGES
// ================================
function showSuccess() {
    const successMsg = document.getElementById("successMessage");
    const errorMsg = document.getElementById("errorMessage");
    
    if (successMsg) {
        successMsg.style.display = "flex";
        // Auto hide after 5 seconds
        setTimeout(() => {
            successMsg.style.display = "none";
        }, 5000);
    }
    
    if (errorMsg) {
        errorMsg.style.display = "none";
    }

    // Scroll to success message
    if (successMsg) {
        successMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function showError(message) {
    const successMsg = document.getElementById("successMessage");
    const errorMsg = document.getElementById("errorMessage");
    const errorText = document.getElementById("errorText");
    
    if (errorMsg && errorText) {
        errorText.textContent = message;
        errorMsg.style.display = "flex";
    }
    
    if (successMsg) {
        successMsg.style.display = "none";
    }

    // Scroll to error message
    if (errorMsg) {
        errorMsg.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function hideMessages() {
    const successMsg = document.getElementById("successMessage");
    const errorMsg = document.getElementById("errorMessage");
    
    if (successMsg) successMsg.style.display = "none";
    if (errorMsg) errorMsg.style.display = "none";
}

