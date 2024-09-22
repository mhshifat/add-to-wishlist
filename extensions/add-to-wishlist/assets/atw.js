class BackendService {
  constructor() {
    if (!BackendService.instance) BackendService.instance = this;
    return BackendService.instance;
  }

  async getLists(shop, customer) {
    try {
      const res = await fetch(`/apps/myapp/wishlist?shop=${shop}&customerId=${customer}`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "69420",
        }
      });
      const { data } = await res.json();
      return data || [];
    } catch (err) {
      console.error(err);
    }
  }

  async addToWishlist(shop, customerId, variantId, properties) {
    try {
      const payload = {
        shop: shop,
        images: [properties?.featured_image?.src || ""],
        name: properties?.name,
        price: properties?.price + "",
        compareAtPrice: properties?.compare_at_price + "",
        productId: variantId,
        customerId: customerId,
      }
      const res = await fetch(`/apps/myapp/wishlist`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify(payload)
      });
      await res.json();
    } catch (err) {
      console.error(err);
    }
  }

  async removeFromWishlist(shop, customer, variantId) {
    try {
      const res = await fetch(`/apps/myapp/wishlist?shop=${shop}&productId=${variantId}&customerId=${customer}`, {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
      });
      await res.json();
    } catch (err) {
      console.error(err);
    }
  }

  async isListed(shop, customer, variantId) {
    try {
      const res = await fetch(`/apps/myapp/wishlist?shop=${shop}&productId=${variantId}&customerId=${customer}`, {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "69420",
        }
      });
      const data = await res.json();
      return !!data?.data?.id;
    } catch (err) {
      console.error(err);
      return false;
    }
  }
}

class ATWButton extends HTMLElement {
  state = {
    shop: null,
    product: null,
    variant: null,
    customer: null,
    properties: {},
    styleVariables: "",
    atwBtnStyles: "",
    checked: false
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = {
      shop: this.getAttribute("shop"),
      product: this.getAttribute("product"),
      customer: this.getAttribute("customer"),
      variant: this.getAttribute("variant"),
      properties: this.getAttribute("properties"),
      styleVariables: "",
      atwBtnStyles: "",
      checked: false
    }
    this.service = new BackendService();
    this.render({
      loading: true
    });
    this.fetchBtnStyles();
    this.updateElementState();
  }

  async fetchBtnStyles() {
    try {
      const res = await fetch(`/apps/myapp/customization?shop=${this.state.shop}`, {
        headers: {
          "ngrok-skip-browser-warning": "69420"
        }
      });
      const json = await res.json();
      this.state.styleVariables = Object.entries(JSON.parse(json?.data?.styleVariables || "{}"))?.map(([key, val]) => `${key}:${val};`).join("");
      this.state.atwBtnStyles = json?.data?.atwBtnStyles;
      this.updateTemplate({
        loading: true
      });
    } catch (err) {
      console.error(err);
    }
  }

  updateTemplate({ loading } = {}) {
    if (loading) return;
    this.shadowRoot.querySelector("div")?.setAttribute("style", this.state.styleVariables);
    this.shadowRoot.querySelector("div").innerHTML = `
      <button style="${this.state.atwBtnStyles}">${this.state.checked ? "Added to Wishlist" : "Add to Wishlist"}</button>
    `;
    this.attachBtnEventListener();
  }

  attachBtnEventListener() {
    this.atwBtn = this.shadowRoot.querySelector("button");
    this.atwBtn?.addEventListener("click", (e) => {
      const isChecked = this.state.checked;
      const newValue = !isChecked;
      if (newValue) this.addVariantToWishlist();
      else this.removeVariantFromWishlist();
      this.setAttribute("checked", newValue);
      this.state.checked = newValue;
      this.updateTemplate();
    })
  }

  async updateElementState() {
    await sleep(1000);
    const isListed = await this.service.isListed(this.state.shop, this.state.customer, this.state?.variant);
    this.state.checked = isListed;
    this.updateTemplate();
  }

  addVariantToWishlist() {
    this.service.addToWishlist(this.state?.shop, this.state.customer, this.state?.variant, JSON.parse(this.state.properties || "{}"));
  }

  removeVariantFromWishlist() {
    this.service.removeFromWishlist(this.state.shop, this.state.customer, this.state?.variant);
  }

  render(props) {
    this.shadowRoot.innerHTML = `
      <style>${this.css(props)}</style>
      ${this.template(props)}
    `;
    this.attachBtnEventListener();
  }

  css() {
    return `
      :host > div {
        --atw-btn-background: #101010;
        --atw-btn-foreground: #FFFFFF;
        --atw-btn-border: #101010;
        --atw-btn-px: 25px;
        --atw-btn-py: 16px;
        --atw-btn-height: auto;
        --atw-btn-width: auto;
        --atw-btn-root: 10px;
      }

      :host > div > button {
        width: var(--atw-btn-width);
        height: var(--atw-btn-height);
        font-size: calc((var(--atw-btn-root)* 1.8));
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--atw-btn-background);
        color: var(--atw-btn-foreground);
        padding: var(--atw-btn-py) var(--atw-btn-px);
        border: 1px solid var(--atw-btn-border);
        cursor: pointer;
      }
    `;
  }

  template({ isChecked, loading }) {
    return `
      <div>
        ${loading ? '<p>Loading...</p>' : '<button>${isChecked ? "Added To Wishlist" : "Add To Wishlist"}</button>'}
      </div>
    `;
  }

  static get observedAttributes() {
    return [
      "shop",
      "product",
      "variant",
      "properties",
      "customer",
    ]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if ([
      "shop",
      "product",
      "variant",
      "properties",
      "customer",
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
  }
}

class ATWList extends HTMLElement {
  state = {
    shop: null,
    customer: null,
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.state = {
      shop: this.getAttribute("shop"),
      customer: this.getAttribute("customer"),
    }
    this.service = new BackendService();
    this.render();
  }

  static get observedAttributes() {
    return [
      "shop",
      "customer",
    ]
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if ([
      "shop",
      "customer",
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

  async render(props) {
    await sleep(1000);
    const items = await this.service.getLists(this.state.shop, this.state.customer);
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
                <button data-id="${item?.productId}" class="Wishlist__Remove">X</button>
                <img
                  src="${item?.images?.[0]}"
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
                  ${item?.compareAtPrice && item?.compareAtPrice !== item?.price ? `
                  <span class="Wishlist__ComparePrice">${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'BDT',
                  })?.format(item?.compareAtPrice)}</span>
                  ` : ''}
                </p>
                <button data-id="${item?.productId}" class="Wishlist__ATC">Add to cart</button>
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
    this.atwItems = this.shadowRoot.querySelectorAll(".Wishlist__Item");
    Array.from(this.atwItems).forEach(el => {
      el?.querySelector(".Wishlist__Remove").addEventListener("click", (e) => {
        const id = e?.target?.dataset?.id;
        this.service?.removeFromWishlist(this.state.shop, this.state.customer, id);
        this.render();
      });
      el?.querySelector(".Wishlist__ATC").addEventListener("click", async (e) => {
        const id = e?.target?.dataset?.id;
        await this.addToCart(id);
        this.service.removeFromWishlist(this.state.shop, this.state.customer, id);
        this.render();
      });
    });

    this.atwAddAllBtn = this.shadowRoot.querySelector(".Wishlist__AddAll");
    this.atwAddAllBtn?.addEventListener("click", async () => {
      const items = await this.service.getLists(this.state.shop, this.state.customer);
      if (!items?.length) return;
      for (const product of items) {
        await this.addToCart(product.productId);
        await this.service.removeFromWishlist(this.state.shop, this.state.customer, product.productId);
      }
      this.render();
    })
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

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms))
}
