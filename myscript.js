    const products = [
    { id: 1, name: "Iphone 12", price: 500, category: "phones", image: "image/Iphone_12.png" },
    { id: 2, name: "Iphone 13", price: 800, category: "phones", image: "image/Iphone_13.png" },
    { id: 3, name: "Iphone 14", price: 1000, category: "phones", image: "image/Iphone_14.png" },
    { id: 4, name: "Iphone 15", price: 1199, category: "phones", image: "image/Iphone_15.png" },
    { id: 5, name: "Macbook Pro", price: 899, category: "Mac Book", image: "image/macbookpro.png"},
    { id: 6, name: "Iphone 17 Pro Max", price: 2500, category: "phones", image: "image/Iphone17.png"},
    { id: 7, name: "Airpod Max", price: 450, category: "audio", image: "image/airpordmax.png"},
    { id: 8, name: "Airpod", price: 200, category: "audio", image: "image/airpod.png"},
    { id: 9, name: "Apple Watch Series 11", price: 399, category: "wearables", image:"image/iwatch.png"},
    {id: 10, name: "Iphone 16 Pro Max", price: 1500, category: "phones", image:"image/Iphone_16.png"},
    ];

    const CART_STORAGE_KEY = "nova_cart_v1";

    function formatMoney(value) {
    try {
        return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
        }).format(value);
    } catch {
        return `$${value}`;
    }
    }

    function loadCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return parsed
        .filter(i => i && typeof i.id === "number" && typeof i.qty === "number")
        .map(i => ({ id: i.id, qty: Math.max(1, Math.floor(i.qty)) }));
    } catch {
        return [];
    }
    }

    function saveCart() {
    const minimal = cart.map(i => ({ id: i.id, qty: i.qty }));
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(minimal));
    } catch {
        
    }
    }

    function hydrateCart(items) {
    const hydrated = [];
    items.forEach(i => {
        const product = products.find(p => p.id === i.id);
        if (product) hydrated.push({ ...product, qty: i.qty });
    });
    return hydrated;
    }

    let cart = hydrateCart(loadCart());

    // DISPLAY PRODUCTS
    function displayProducts(list) {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = "";

    if (!list.length) {
        grid.innerHTML = `<div class="empty-state">No products match your search.</div>`;
        return;
    }

    list.forEach((p, i) => {
        setTimeout(() => {
        grid.innerHTML += `
            <div class="card show">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p>${formatMoney(p.price)}</p>
            <button onclick="addToCart(${p.id})">Add to cart</button>
            </div>
        `;
        }, i * 100);
    });
    }

    // ADD
    function addToCart(id) {
    const item = cart.find(i => i.id === id);

    if (item) item.qty++;
    else {
        const product = products.find(p => p.id === id);
        cart.push({ ...product, qty: 1 });
    }

    renderCart();
    }

    // REMOVE
    function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    renderCart();
    }

    // QUANTITY
    function changeQty(id, action) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    if (action === "inc") item.qty++;
    if (action === "dec") item.qty--;

    if (item.qty <= 0) removeFromCart(id);

    renderCart();
    }

    // RENDER CART
    function renderCart() {
    const cartDiv = document.getElementById("cartItems");
    const totalEl = document.getElementById("totalPrice");
    const countEl = document.getElementById("cartCount");

    cartDiv.innerHTML = "";
    let total = 0;
    let count = 0;

    if (!cart.length) {
        cartDiv.innerHTML = `<div class="empty-cart">Your cart is empty. Add some products!</div>`;
        totalEl.innerText = "0";
        countEl.innerText = "0";
        saveCart();
        return;
    }

    cart.forEach(item => {
        total += item.price * item.qty;
        count += item.qty;

        cartDiv.innerHTML += `
        <div class="cart-item">
            <span>${item.name}</span>

            <div class="qty-controls">
            <button class="qty-btn" onclick="changeQty(${item.id}, 'dec')">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 'inc')">+</button>

            <button class="remove-btn" onclick="removeFromCart(${item.id})">✕</button>
            </div>
        </div>
        `;
    });

    totalEl.innerText = total;
    countEl.innerText = count;
    saveCart();
    }

    // SEARCH_FILTER
    function filterProducts() {
    const search = document.getElementById("searchInput").value.toLowerCase();
    const price = document.getElementById("priceFilter").value;
    const category = document.getElementById("categoryFilter")?.value ?? "all";

    let filtered = products.filter(p => p.name.toLowerCase().includes(search));

    if (category !== "all") filtered = filtered.filter(p => p.category === category);

    if (price === "low") filtered = filtered.filter(p => p.price < 800);
    if (price === "mid") filtered = filtered.filter(p => p.price >= 800 && p.price <= 1000);
    if (price === "high") filtered = filtered.filter(p => p.price > 1000);

    displayProducts(filtered);
    }

    // EVENTS
    document.getElementById("searchInput").addEventListener("input", filterProducts);
    document.getElementById("priceFilter").addEventListener("change", filterProducts);
    document.getElementById("categoryFilter")?.addEventListener("change", filterProducts);

    // SCROLL ANIMATION
    window.addEventListener("scroll", () => {
    document.querySelectorAll(".reveal").forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight - 100) {
        el.classList.add("active");
        }
    });
    });

    // INIT
    displayProducts(products);
    renderCart();