function login(email, matKhau) {
    return fetch("http://127.0.0.1:5000/api/auth/login", {
        "email": "admin@babycutie.com",
        "matKhau": "admin123",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, matKhau })
    }).then(res => res.json());
    
}
