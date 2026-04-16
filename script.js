const cart = JSON.parse(localStorage.getItem("kunikCart")) || [];
let appliedPromo = localStorage.getItem("kunikPromo") || "";

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartBadge = document.getElementById("cart-badge");
const cartCount = document.getElementById("cart-count");
const cartBonus = document.getElementById("cart-bonus");
const cartDiscount = document.getElementById("cart-discount");
const discountRow = document.getElementById("discount-row");

const promoInput = document.getElementById("promo-input");
const applyPromoBtn = document.getElementById("apply-promo-btn");
const promoMessage = document.getElementById("promo-message");

const addButtons = document.querySelectorAll(".add-to-cart");
const clearCartBtn = document.getElementById("clear-cart-btn");
const sendOrderBtn = document.getElementById("send-order-btn");

const cartToggle = document.getElementById("cart-toggle");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const cartClose = document.getElementById("cart-close");

const serTriggerCard = document.getElementById("ser-product-trigger");
const serOpenBtn = document.querySelector(".open-ser-modal");
const serModal = document.getElementById("ser-modal");
const serModalOverlay = document.getElementById("product-modal-overlay");
const serModalClose = document.getElementById("ser-modal-close");
const serModalAddBtn = document.getElementById("ser-modal-add-btn");
const serOptionCards = document.querySelectorAll(".option-card");
const serOptionInputs = document.querySelectorAll('input[name="jalapeno-option"]');

const SER_BASE_NAME = "Сэр-Жермен";
const SER_BASE_PRICE = 590;
const SER_IMAGE = "ser.jpg";
const PROMO_CODE = "OVCHINNIKOV";
const PROMO_DISCOUNT = 0.2;

function showNotification(text, isError = false) {
  const notification = document.getElementById("notification");
  if (!notification) return;

  notification.textContent = text;
  notification.classList.remove("error");
  notification.classList.remove("show");

  if (isError) {
    notification.classList.add("error");
  }

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

function saveCart() {
  localStorage.setItem("kunikCart", JSON.stringify(cart));
  localStorage.setItem("kunikPromo", appliedPromo);
}

function updateBadge() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (cartBadge) {
    cartBadge.textContent = totalCount;
  }
}

function updatePromoUI() {
  if (!applyPromoBtn || !promoInput || !promoMessage) return;

  if (appliedPromo === PROMO_CODE) {
    applyPromoBtn.textContent = "Применён";
    applyPromoBtn.classList.add("applied");
    promoInput.value = PROMO_CODE;
    promoMessage.textContent = "Промокод применён: скидка 20%";
    promoMessage.style.color = "#1a8f3c";
  } else {
    applyPromoBtn.textContent = "Применить";
    applyPromoBtn.classList.remove("applied");
  }
}

function openCart() {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.classList.add("active");
  cartOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  if (!cartDrawer || !cartOverlay) return;
  cartDrawer.classList.remove("active");
  cartOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

function getSelectedSerOption() {
  const checked = document.querySelector('input[name="jalapeno-option"]:checked');
  const extra = checked ? Number(checked.value) : 0;

  if (extra === 50) {
    return {
      extra: 50,
      suffix: " + халапеньо x2"
    };
  }

  return {
    extra: 0,
    suffix: " без халапеньо"
  };
}

function updateSerModalPrice() {
  if (!serModalAddBtn) return;
  const option = getSelectedSerOption();
  const finalPrice = SER_BASE_PRICE + option.extra;
  serModalAddBtn.textContent = `В корзину за ${finalPrice} ₽`;
}

function updateOptionCards() {
  serOptionCards.forEach((card) => {
    const input = card.querySelector("input");
    card.classList.toggle("active", input.checked);
  });
  updateSerModalPrice();
}

function openSerModal() {
  if (!serModal || !serModalOverlay) return;
  serModal.classList.add("active");
  serModalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
  updateOptionCards();
}

function closeSerModal() {
  if (!serModal || !serModalOverlay) return;
  serModal.classList.remove("active");
  serModalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

function calculateTotals() {
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const bonus = Math.floor(subtotal * 0.05);
  const discount = appliedPromo === PROMO_CODE ? Math.round(subtotal * PROMO_DISCOUNT) : 0;
  const finalTotal = subtotal - discount;

  return {
    itemsCount,
    subtotal,
    bonus,
    discount,
    finalTotal
  };
}

function renderCart() {
  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = "";

  if (promoInput && appliedPromo !== PROMO_CODE) {
    promoInput.value = "";
  }

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">Корзина пока пуста</div>';
    cartTotal.textContent = "0 ₽";
    if (cartCount) cartCount.textContent = "0";
    if (cartBonus) cartBonus.textContent = "0 ₽";
    if (cartDiscount) cartDiscount.textContent = "0 ₽";
    if (discountRow) discountRow.style.display = "none";
    updateBadge();
    updatePromoUI();
    saveCart();
    return;
  }

  cart.forEach((item) => {
    const lineTotal = item.price * item.quantity;

    const row = document.createElement("div");
    row.className = "cart-row";

    row.innerHTML = `
      <div class="cart-item-left">
        <img src="${item.image || '5215357575149325867.jpg'}" alt="${item.name}" class="cart-item-thumb">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${item.price} ₽ за шт.</div>
        </div>
      </div>

      <div class="cart-right">
        <div class="cart-controls">
          <button class="qty-btn minus-btn" data-name="${item.name}" type="button">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn plus-btn" data-name="${item.name}" type="button">+</button>
        </div>
        <div class="cart-line-total">${lineTotal} ₽</div>
      </div>
    `;

    cartItems.appendChild(row);
  });

  const totals = calculateTotals();

  cartTotal.textContent = `${totals.finalTotal} ₽`;
  if (cartCount) cartCount.textContent = `${totals.itemsCount}`;
  if (cartBonus) cartBonus.textContent = `+${totals.bonus} ₽`;

  if (totals.discount > 0) {
    if (cartDiscount) cartDiscount.textContent = `−${totals.discount} ₽`;
    if (discountRow) discountRow.style.display = "flex";
  } else {
    if (cartDiscount) cartDiscount.textContent = "0 ₽";
    if (discountRow) discountRow.style.display = "none";
  }

  updateBadge();
  updatePromoUI();
  saveCart();

  document.querySelectorAll(".plus-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const item = cart.find((product) => product.name === button.dataset.name);
      if (item) {
        item.quantity += 1;
        renderCart();
      }
    });
  });

  document.querySelectorAll(".minus-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = cart.findIndex((product) => product.name === button.dataset.name);

      if (index !== -1) {
        cart[index].quantity -= 1;

        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }

        renderCart();
      }
    });
  });
}

function addSimpleProduct(name, price, image) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name,
      price,
      image,
      quantity: 1
    });
  }

  renderCart();
  openCart();
  showNotification("Добавлено в корзину");
}

function addSerProductWithOption() {
  const option = getSelectedSerOption();
  const finalName = `${SER_BASE_NAME}${option.suffix}`;
  const finalPrice = SER_BASE_PRICE + option.extra;

  const existingItem = cart.find((item) => item.name === finalName);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: finalName,
      price: finalPrice,
      image: SER_IMAGE,
      quantity: 1
    });
  }

  renderCart();
  closeSerModal();
  openCart();
  showNotification("Добавлено в корзину");
}

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);
    const image = button.dataset.image;
    addSimpleProduct(name, price, image);
  });
});

if (applyPromoBtn) {
  applyPromoBtn.addEventListener("click", () => {
    const entered = promoInput.value.trim().toUpperCase();

    if (entered === PROMO_CODE) {
      appliedPromo = PROMO_CODE;
      promoMessage.textContent = "Промокод применён: скидка 20%";
      promoMessage.style.color = "#1a8f3c";
      showNotification("Промокод применён");
    } else {
      appliedPromo = "";
      promoMessage.textContent = "Неверный промокод";
      promoMessage.style.color = "#d33";
      showNotification("Неверный промокод", true);
    }

    renderCart();
  });
}

if (clearCartBtn) {
  clearCartBtn.addEventListener("click", () => {
    cart.length = 0;
    appliedPromo = "";
    if (promoMessage) {
      promoMessage.textContent = "";
      promoMessage.style.color = "#666";
    }
    renderCart();
    showNotification("Корзина очищена");
  });
}

if (sendOrderBtn) {
  sendOrderBtn.addEventListener("click", async () => {
    if (cart.length === 0) {
      showNotification("Корзина пуста", true);
      return;
    }

    const totals = calculateTotals();

    try {
      sendOrderBtn.disabled = true;
      sendOrderBtn.innerHTML = `<i class="fab fa-telegram-plane"></i> Отправляем...`;

      const response = await fetch("https://kunik-backend.onrender.com/send-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: cart,
          itemsCount: totals.itemsCount,
          bonus: totals.bonus,
          discount: totals.discount,
          total: totals.finalTotal,
          promo: appliedPromo
        })
      });

      const data = await response.json();

      if (data.ok) {
        showNotification("Заказ отправлен 🚀");
      } else {
        showNotification("Ошибка: " + (data.error || "неизвестная ошибка"), true);
      }
    } catch (error) {
      console.error(error);
      showNotification("Ошибка соединения с сервером", true);
    } finally {
      sendOrderBtn.disabled = false;
      sendOrderBtn.innerHTML = `<i class="fab fa-telegram-plane"></i> К оформлению заказа`;
    }
  });
}

if (cartToggle) {
  cartToggle.addEventListener("click", openCart);
}

if (cartClose) {
  cartClose.addEventListener("click", closeCart);
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", closeCart);
}

if (serTriggerCard) {
  serTriggerCard.addEventListener("click", (e) => {
    if (e.target.closest(".open-ser-modal")) return;
    openSerModal();
  });
}

if (serOpenBtn) {
  serOpenBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openSerModal();
  });
}

if (serModalClose) {
  serModalClose.addEventListener("click", closeSerModal);
}

if (serModalOverlay) {
  serModalOverlay.addEventListener("click", closeSerModal);
}

if (serModalAddBtn) {
  serModalAddBtn.addEventListener("click", addSerProductWithOption);
}

serOptionInputs.forEach((input) => {
  input.addEventListener("change", updateOptionCards);
});

updateOptionCards();
renderCart();
