class LocalStorageService {
  constructor() {
    if (!LocalStorageService.instance) LocalStorageService.instance = this;
    return LocalStorageService.instance;
  }

  getLists() {
    const productsStr = localStorage.getItem("WISHLIST_PRODUCTS");
    const parsedProducts = JSON.parse(productsStr || "{}");
    return Object.values(parsedProducts);
  }

  addToWishlist(variantId, properties) {
    const productsStr = localStorage.getItem("WISHLIST_PRODUCTS");
    const parsedProducts = JSON.parse(productsStr || "{}");
    const payload = {
      ...parsedProducts,
      [variantId]: properties
    }
    localStorage.setItem("WISHLIST_PRODUCTS", JSON.stringify(payload));
  }

  removeFromWishlist(variantId) {
    const productsStr = localStorage.getItem("WISHLIST_PRODUCTS");
    const parsedProducts = JSON.parse(productsStr || "{}");
    delete parsedProducts[variantId];
    localStorage.setItem("WISHLIST_PRODUCTS", JSON.stringify(parsedProducts));
  }

  isListed(variantId) {
    const productsStr = localStorage.getItem("WISHLIST_PRODUCTS");
    const parsedProducts = JSON.parse(productsStr || "{}");
    return !!parsedProducts[variantId];
  }
}

class ATWButton extends HTMLElement {
  state = {
    shop: null,
    product: null,
    variant: null,
    properties: {},
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render({});
    this.state = {
      shop: this.getAttribute("shop"),
      product: this.getAttribute("product"),
      variant: this.getAttribute("variant"),
      properties: this.getAttribute("properties"),
    }
    this.service = new LocalStorageService();
    this.updateElementState();
  }

  attachBtnEventListener() {
    this.atwBtn = this.shadowRoot.querySelector("button");
    this.atwBtn?.addEventListener("click", (e) => {
      const isChecked = this?.getAttribute("checked") === "true";
      const newValue = !isChecked;
      if (newValue) this.addVariantToWishlist();
      else this.removeVariantFromWishlist();
      this.setAttribute("checked", newValue);
      this.render({
        isChecked: newValue
      })
    })
  }

  updateElementState() {
    const isListed = this.service.isListed(this.state?.variant);
    this.setAttribute("checked", isListed);
    this.render({
      isChecked: isListed
    })
  }

  addVariantToWishlist() {
    this.service.addToWishlist(this.state?.variant, JSON.parse(this.state.properties || "{}"));
  }

  removeVariantFromWishlist() {
    this.service.removeFromWishlist(this.state?.variant);
  }

  render(props) {
    this.shadowRoot.innerHTML = `
      ${this.template(props)}
    `;
    this.attachBtnEventListener();
  }

  template({ isChecked }) {
    return `
      <button>${isChecked ? "Added To Wishlist" : "Add To Wishlist"}</button>
    `;
  }

  static get observedAttributes() {
    return [
      "shop",
      "product",
      "variant",
      "properties",
    ]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if ([
      "shop",
      "product",
      "variant",
      "properties",
    ].includes(name)) this.updateState(name, newValue);
    else this[name] = {
      oldValue,
      newValue,
    }
  }

  updateState(name, value) {
    this.state = {
      ...this.state,
      [name]: value
    }
    this.updateElementState();
  }
}

class ATWList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.service = new LocalStorageService();
    this.render({
      items: this.service.getLists()
    });

    this.atwItems = this.shadowRoot.querySelectorAll(".Wishlist__Item");
    Array.from(this.atwItems).forEach(el => {
      el?.querySelector(".Wishlist__Remove").addEventListener("click", (e) => {
        const id = e?.target?.dataset?.id;
        this.service?.removeFromWishlist(id);
      });
      el?.querySelector(".Wishlist__ATC").addEventListener("click", async (e) => {
        const id = e?.target?.dataset?.id;
        await this.addToCart(id);
        this.service.removeFromWishlist(id);
        this.render({
          items: this.service.getLists()
        });
      });
    });

    this.atwAddAllBtn = this.shadowRoot.querySelector(".Wishlist__AddAll");
    this.atwAddAllBtn?.addEventListener("click", async () => {
      const items = this.service.getLists();
      if (!items?.length) return;
      for (const product of items) {
        await this.addToCart(product.id);
        await this.service.removeFromWishlist(product.id);
      }
      this.render({
        items: this.service.getLists()
      });
    })
  }

  async addToCart(id) {
    try {
      const res = await fetch("/cart/add.js", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id,
          quantity: 1
        })
      });
      await res.json();
      return {
        message: "Successfully added"
      }
    } catch (err) {
      console.error(err);
    }
  }

  render(props) {
    const { items = [] } = props;
    this.shadowRoot.innerHTML = `
      <style>${this.css(props)}</style>
      <div class="Wishlist">
        <div class="Wishlist__Header">
          <h3>Wishlist</h3>
          <span>
            <button class="Wishlist__AddAll">Add all to cart</button>
          </span>
        </div>

        <div class="Wishlist__Main">
          ${items?.map(item => `
            <div class="Wishlist__Item">
              <div class="Wishlist__Media">
                <button data-id="${item?.id}" class="Wishlist__Remove">X</button>
                <img
                  src="${item?.featured_image?.src}"
                  alt=""
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              </div>

              <div class="Wishlist__Info">
                <h3>${item?.name}</h3>
                <p>
                  <span class="Wishlist__RegularPrice">${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'BDT',
                  })?.format(item?.price)}</span>
                  <span class="Wishlist__ComparePrice">${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'BDT',
                  })?.format(item?.compare_at_price)}</span>
                </p>
                <button data-id="${item?.id}" class="Wishlist__ATC">Add to cart</button>
              </div>
            </div>
          `)?.join("")}
        </div>

        ${!items?.length ? `
          <div class="Wishlist__Empty">
            <p>No products found!</p>
            <a href="/">Go Home</a>
          </div>
        ` : ""}
      </div>
    `;
  }

  css(props) {
    return `
      :host {}

      :host .Wishlist {
        width:  100%;
        display: flex;
        flex-direction: column;
        padding: 50px 0;
      }

      :host .Wishlist__Header {
        width:  100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
      }

      :host .Wishlist__Header > h3 {
        font-size: 20px;
        font-weight: 600;
      }

      :host .Wishlist__Header > span > button {
        border: 1px solid #101010;
        background: transparent;
        padding: 8px 18px;
        outline: none;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all .4s ease-in-out;
      }

      :host .Wishlist__Header > span > button:hover {
        color: #fff;
        background: #101010;
      }

      :host .Wishlist__Header > span > button:disabled {
        color: darkgray;
        border-color: lightgray;
        background: lightgray;
        cursor: not-allowed;
      }

      :host .Wishlist__Main {
        width:  100%;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
      }

      :host .Wishlist__Item {
        width:  100%;
        display: flex;
        flex-direction: column;
        border-radius: 5px;
      }

      :host .Wishlist__Media {
        width:  100%;
        aspect-ratio: 1/1.2;
        background: #f0f5f7;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        position: relative;
      }

      :host .Wishlist__Media > img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      :host .Wishlist__Info {
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px 10px;
      }

      :host .Wishlist__Info > h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
      }

      :host .Wishlist__Info > p {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
        text-align: center;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
        gap: 10px;
      }

      :host .Wishlist__Info > p .Wishlist__ComparePrice {
        text-decoration: line-through;
        color: gray;
      }

      :host .Wishlist__Info > button {
        border: 1px solid #101010;
        background: transparent;
        padding: 8px 18px;
        outline: none;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all .4s ease-in-out;
        margin-top: 12px;
        width: 100%;
      }

      :host .Wishlist__Info > button:hover {
        color: #fff;
        background: #101010;
      }

      :host .Wishlist__Remove {
        position: absolute;
        top: 5px;
        right: 5px;
        background: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        border: none;
        outline: none;
        box-shadow: none;
        cursor: pointer;
        width: 35px;
        height: 35px;
        border-radius: 5px;
        display: none;
        opacity: 0;
        transition: opacity .4s ease-in-out;
        will-change: opacity;
      }

      :host .Wishlist__Media:hover .Wishlist__Remove {
        display: flex;
        opacity: 1;
      }

      :host .Wishlist__Empty {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 50px 20px;
      }

      :host .Wishlist__Empty > p {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }

      :host .Wishlist__Empty > a {
        margin: 0;
        margin-top: 10px;
        color: #101010;
        text-underline-offset: 2px;
      }
    `;
  }
}

customElements.define("atw-btn", ATWButton);
customElements.define("atw-list", ATWList);
