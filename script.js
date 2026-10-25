const PRODUCTS = [
    {
        id: "headphones",
        name: "Wireless Headphones",
        price: 999,
        image: "images/wireless headphones.jpeg",
        description: "Immersive sound, all-day comfort",
        category: "Audio"
    },
    {
        id: "watch",
        name: "Smart Watch",
        price: 1999,
        image: "images/smart watch.jpeg",
        description: "Your health and day, in sync",
        category: "Wearables"
    },
    {
        id: "keyboard",
        name: "Gaming Keyboard",
        price: 1499,
        image: "images/gaming keyboard.jpeg",
        description: "Responsive keys for every session",
        category: "Accessories"
    },
    {
        id: "mouse",
        name: "Wireless Mouse",
        price: 799,
        image: "images/wireless mouse.jpeg",
        description: "Precise control, no cable clutter",
        category: "Accessories"
    }
];

const CART_KEY = "shirisha-store-cart";
const FREE_SHIPPING_THRESHOLD = 2500;
const SHIPPING_FEE = 99;
const money = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
});

function readCart() {
    try {
        const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
        return Object.fromEntries(
            Object.entries(savedCart).filter(([id, quantity]) =>
                PRODUCTS.some((product) => product.id === id) &&
                Number.isInteger(quantity) && quantity > 0
            )
        );
    } catch {
        return {};
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount(cart);
}

function updateCartCount(cart = readCart()) {
    const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
    document.querySelectorAll("[data-cart-count]").forEach((element) => {
        element.textContent = count;
        element.closest(".cart-link")?.setAttribute("aria-label", `Shopping bag, ${count} items`);
    });
}

function cartLines(cart = readCart()) {
    return Object.entries(cart).map(([id, quantity]) => ({
        ...PRODUCTS.find((product) => product.id === id),
        quantity
    }));
}

function subtotalFor(lines) {
    return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}

function shippingFor(subtotal) {
    return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

function renderProducts() {
    const grid = document.querySelector("[data-product-grid]");
    if (!grid) return;

    const search = document.querySelector("[data-product-search]");
    const sort = document.querySelector("[data-product-sort]");
    const categoryFilters = document.querySelector("[data-category-filters]");
    let selectedCategory = "all";

    function drawProducts() {
        const query = search.value.trim().toLowerCase();
        const products = PRODUCTS.filter((product) =>
            (selectedCategory === "all" || product.category === selectedCategory) &&
            `${product.name} ${product.description} ${product.category}`
                .toLowerCase()
                .includes(query)
        );

        if (sort.value === "price-low") products.sort((a, b) => a.price - b.price);
        if (sort.value === "price-high") products.sort((a, b) => b.price - a.price);

        grid.innerHTML = products.length
            ? products.map((product) => `
                <article class="product-card">
                    <div class="product-image-wrap">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        <span class="product-category">${product.category}</span>
                    </div>
                    <div class="product-details">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <div class="product-purchase">
                            <strong>${money.format(product.price)}</strong>
                            <button class="button button-dark" type="button" data-add-to-cart="${product.id}">
                                Add to cart
                            </button>
                        </div>
                    </div>
                </article>
            `).join("")
            : '<p class="empty-search">No products match your search.</p>';
    }

    search.addEventListener("input", drawProducts);
    sort.addEventListener("change", drawProducts);
    categoryFilters.addEventListener("click", (event) => {
        const button = event.target.closest("[data-category]");
        if (!button) return;
        selectedCategory = button.dataset.category;
        categoryFilters.querySelectorAll("[data-category]").forEach((filter) => {
            const isSelected = filter === button;
            filter.classList.toggle("active", isSelected);
            filter.setAttribute("aria-pressed", String(isSelected));
        });
        drawProducts();
    });
    grid.addEventListener("click", (event) => {
        const button = event.target.closest("[data-add-to-cart]");
        if (!button) return;
        const cart = readCart();
        const id = button.dataset.addToCart;
        cart[id] = (cart[id] || 0) + 1;
        saveCart(cart);
        button.textContent = "Added";
        window.setTimeout(() => {
            if (button.isConnected) button.textContent = "Add to cart";
        }, 900);
    });
    drawProducts();
}

function renderCart() {
    const container = document.querySelector("[data-cart-items]");
    if (!container) return;

    const lines = cartLines();
    const subtotal = subtotalFor(lines);
    const shipping = shippingFor(subtotal);
    const emptyState = document.querySelector("[data-cart-empty]");
    const summary = document.querySelector("[data-cart-summary]");

    emptyState.hidden = lines.length > 0;
    summary.hidden = lines.length === 0;
    container.innerHTML = lines.map((line) => `
        <article class="cart-line">
            <img src="${line.image}" alt="${line.name}">
            <div class="cart-line-info">
                <h2>${line.name}</h2>
                <p>${money.format(line.price)} each</p>
                <button class="text-button" type="button" data-remove-item="${line.id}">Remove</button>
            </div>
            <div class="quantity-control" aria-label="Quantity for ${line.name}">
                <button type="button" aria-label="Decrease ${line.name} quantity" data-change-quantity="-1" data-product-id="${line.id}">−</button>
                <span>${line.quantity}</span>
                <button type="button" aria-label="Increase ${line.name} quantity" data-change-quantity="1" data-product-id="${line.id}">+</button>
            </div>
            <strong class="cart-line-total">${money.format(line.price * line.quantity)}</strong>
        </article>
    `).join("");

    document.querySelector("[data-subtotal]").textContent = money.format(subtotal);
    document.querySelector("[data-shipping]").textContent = shipping === 0 ? "Free" : money.format(shipping);
    document.querySelector("[data-total]").textContent = money.format(subtotal + shipping);
    document.querySelector("[data-shipping-note]").textContent = subtotal >= FREE_SHIPPING_THRESHOLD
        ? "You unlocked free shipping."
        : `Add ${money.format(FREE_SHIPPING_THRESHOLD - subtotal)} for free shipping.`;
}

function renderCheckout() {
    const summary = document.querySelector("[data-checkout-items]");
    if (!summary) return;

    const lines = cartLines();
    const subtotal = subtotalFor(lines);
    const shipping = shippingFor(subtotal);
    const form = document.querySelector("[data-checkout-form]");
    const emptyState = document.querySelector("[data-checkout-empty]");

    emptyState.hidden = lines.length > 0;
    form.hidden = lines.length === 0;
    summary.innerHTML = lines.map((line) => `
        <div class="checkout-line"><span>${line.name} × ${line.quantity}</span><strong>${money.format(line.price * line.quantity)}</strong></div>
    `).join("");
    document.querySelector("[data-checkout-subtotal]").textContent = money.format(subtotal);
    document.querySelector("[data-checkout-shipping]").textContent = shipping === 0 ? "Free" : money.format(shipping);
    document.querySelector("[data-checkout-total]").textContent = money.format(subtotal + shipping);
}

function placeDemoOrder(event) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;

    const lines = cartLines();
    if (!lines.length) return;

    const orderReference = `SS-${Date.now().toString().slice(-8)}`;
    saveCart({});
    event.currentTarget.hidden = true;
    document.querySelector("[data-checkout-items]").innerHTML = "";
    document.querySelector("[data-order-success]").innerHTML = `
        <div class="success-mark" aria-hidden="true">✓</div>
        <h2>Order placed</h2>
        <p>Your demo order reference is <strong>${orderReference}</strong>.</p>
        <p class="muted">This prototype does not process payments or send orders to a server.</p>
        <a class="button button-dark" href="index.html">Continue shopping</a>
    `;
    document.querySelector("[data-order-success]").hidden = false;
}

function setupAccountForms() {
    document.querySelectorAll("[data-account-form]").forEach((form) => {
        const password = form.querySelector("[data-password]");
        const confirmation = form.querySelector("[data-confirm-password]");

        function validatePasswordMatch() {
            if (confirmation) {
                confirmation.setCustomValidity(
                    confirmation.value && confirmation.value !== password.value
                        ? "Passwords do not match."
                        : ""
                );
            }
        }

        password?.addEventListener("input", validatePasswordMatch);
        confirmation?.addEventListener("input", validatePasswordMatch);
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            form.querySelector("[data-account-notice]").hidden = false;
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    renderProducts();
    renderCart();
    renderCheckout();
    setupAccountForms();

    document.querySelector("[data-cart-items]")?.addEventListener("click", (event) => {
        const removeButton = event.target.closest("[data-remove-item]");
        const quantityButton = event.target.closest("[data-change-quantity]");
        const cart = readCart();

        if (removeButton) delete cart[removeButton.dataset.removeItem];
        if (quantityButton) {
            const id = quantityButton.dataset.productId;
            cart[id] += Number(quantityButton.dataset.changeQuantity);
            if (cart[id] <= 0) delete cart[id];
        }

        if (removeButton || quantityButton) {
            saveCart(cart);
            renderCart();
        }
    });

    document.querySelector("[data-checkout-form]")?.addEventListener("submit", placeDemoOrder);
});