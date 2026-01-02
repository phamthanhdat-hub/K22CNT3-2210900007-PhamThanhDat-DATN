const CART_KEY = "BABYCUTIE_CART";

// Lấy giỏ
function getCart() {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

// Lưu giỏ
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

// Badge
function updateCartCount() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;

    const cart = getCart();
    const total = cart.reduce((sum, sp) => sum + sp.soLuong, 0);
    badge.innerText = total;
}

// Thêm vào giỏ (DUY NHẤT)
function addToCart(sp) {
    let cart = getCart();
    const index = cart.findIndex(i => i.id === sp.id);

    if (index !== -1) {
        cart[index].soLuong++;
    } else {
        cart.push({ ...sp, soLuong: 1 });
    }

    saveCart(cart);
    alert("🛒 Đã thêm vào giỏ hàng");
}

document.addEventListener("DOMContentLoaded", updateCartCount);
