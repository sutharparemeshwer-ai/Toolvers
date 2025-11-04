// js/tools/ecommerce-cart.js

// --- Sample Data ---
const products = [
    { id: 1, name: 'Wireless Mouse', price: 25.99, image: 'https://via.placeholder.com/150/92c952/FFFFFF?text=Mouse' },
    { id: 2, name: 'Mechanical Keyboard', price: 89.99, image: 'https://via.placeholder.com/150/771796/FFFFFF?text=Keyboard' },
    { id: 3, name: 'USB-C Hub', price: 45.50, image: 'https://via.placeholder.com/150/24f355/FFFFFF?text=Hub' },
    { id: 4, name: '4K Webcam', price: 120.00, image: 'https://via.placeholder.com/150/d32776/FFFFFF?text=Webcam' },
];

// --- Application State ---
let cart = []; // Array of { productId, quantity }

// --- DOM Elements ---
let productListEl, cartItemsEl, emptyCartMessageEl, cartTotalEl, checkoutBtnEl;

// --- Rendering Functions ---

function renderProducts() {
    productListEl.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'col';
        productCard.innerHTML = `
            <div class="card h-100">
                <img src="${product.image}" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text fw-bold">$${product.price.toFixed(2)}</p>
                    <button class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
        productListEl.appendChild(productCard);
    });
}

function renderCart() {
    cartItemsEl.innerHTML = ''; // Clear previous items

    if (cart.length === 0) {
        cartItemsEl.appendChild(emptyCartMessageEl);
        emptyCartMessageEl.classList.remove('d-none');
    } else {
        emptyCartMessageEl.classList.add('d-none');
        cart.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            const cartItemEl = document.createElement('div');
            cartItemEl.className = 'list-group-item d-flex justify-content-between align-items-center';
            cartItemEl.innerHTML = `
                <div>
                    <h6 class="my-0">${product.name}</h6>
                    <small class="text-muted">Price: $${product.price.toFixed(2)}</small>
                </div>
                <div class="d-flex align-items-center">
                    <button class="btn btn-sm btn-secondary update-quantity-btn" data-product-id="${product.id}" data-change="-1">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-sm btn-secondary update-quantity-btn" data-product-id="${product.id}" data-change="1">+</button>
                    <button class="btn btn-sm btn-danger ms-3 remove-from-cart-btn" data-product-id="${product.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            cartItemsEl.appendChild(cartItemEl);
        });
    }

    updateCartTotal();
}

function updateCartTotal() {
    const total = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        return sum + (product.price * item.quantity);
    }, 0);

    cartTotalEl.textContent = `$${total.toFixed(2)}`;
    checkoutBtnEl.disabled = cart.length === 0;
}

// --- Cart Logic Functions ---

function addToCart(productId) {
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ productId: productId, quantity: 1 });
    }
    renderCart();
}

function updateQuantity(productId, change) {
    const cartItem = cart.find(item => item.productId === productId);
    if (!cartItem) return;

    cartItem.quantity += change;

    if (cartItem.quantity <= 0) {
        removeFromCart(productId);
    } else {
        renderCart();
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    renderCart();
}

// --- Event Handlers ---

function handleProductListClick(event) {
    const target = event.target;
    if (target.classList.contains('add-to-cart-btn')) {
        const productId = parseInt(target.dataset.productId, 10);
        addToCart(productId);
    }
}

function handleCartItemsClick(event) {
    const target = event.target.closest('button');
    if (!target) return;

    const productId = parseInt(target.dataset.productId, 10);

    if (target.classList.contains('update-quantity-btn')) {
        const change = parseInt(target.dataset.change, 10);
        updateQuantity(productId, change);
    } else if (target.classList.contains('remove-from-cart-btn')) {
        removeFromCart(productId);
    }
}

function handleCheckout() {
    if (cart.length > 0) {
        alert(`Checkout successful! Total: ${cartTotalEl.textContent}`);
        cart = [];
        renderCart();
    }
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    productListEl = document.getElementById('product-list');
    cartItemsEl = document.getElementById('cart-items');
    emptyCartMessageEl = document.getElementById('empty-cart-message');
    cartTotalEl = document.getElementById('cart-total');
    checkoutBtnEl = document.getElementById('checkout-btn');

    // Initial render
    renderProducts();
    renderCart();

    // Attach event listeners
    productListEl.addEventListener('click', handleProductListClick);
    cartItemsEl.addEventListener('click', handleCartItemsClick);
    checkoutBtnEl.addEventListener('click', handleCheckout);
}

export function cleanup() {
    // Remove event listeners to prevent memory leaks
    productListEl.removeEventListener('click', handleProductListClick);
    cartItemsEl.removeEventListener('click', handleCartItemsClick);
    checkoutBtnEl.removeEventListener('click', handleCheckout);
}