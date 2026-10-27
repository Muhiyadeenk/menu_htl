# Restaurant Digital Menu & WhatsApp Ordering

A lightweight, static restaurant menu. Customers browse dishes, fill a cart, enter their details and send the order to your WhatsApp number (**+91 97479 47772**) with the message pre-filled.

Plain HTML, CSS and JavaScript. No backend, database, build step, accounts or paid APIs.

```
index.html     page structure (menu, cart, checkout, menu manager)
style.css      styling; colours and fonts are CSS variables at the top
script.js      all logic; shop settings and sample menu are at the top
assets/        logo.svg, placeholder.svg (add your own food photos here)
```

## Features

- Responsive, mobile-first layout with hero banner, search and horizontal category filters
- Food cards: image, name, description, price in ₹, availability badge, Add to Cart
- Cart with quantity +/−, remove, line totals, subtotal, delivery charge and total; saved in LocalStorage
- Floating cart bar on mobile, cart button on desktop; unavailable items cannot be ordered
- Checkout form (name, phone, address required; landmark and notes optional) with friendly validation and an order summary
- WhatsApp order message opened via `https://wa.me/919747947772?text=…`, fully URL-encoded
- Cart is kept if the customer comes back without sending; the page never claims the order is placed
- Built-in menu manager: add, edit, delete, availability toggle, categories, **Reset Sample Menu**
- Images fall back to a local placeholder if a URL fails to load

## Run locally

Option 1: double-click `index.html`.

Option 2 (closer to real hosting): from this folder run one of

```bash
python3 -m http.server 8000      # then open http://localhost:8000
npx serve .
```

## Customise

Everything you will normally change is at the top of `script.js` in `CONFIG`:

| Setting | Purpose |
|---|---|
| `restaurantName`, `tagline` | Name and hero text |
| `whatsappNumber` | Country code + number, digits only (`919747947772`) |
| `deliveryCharge` | Rupees, applied to every order. Default `0` and shown as "(none set)" |
| `categories` | Category list used by filters and the menu manager |
| `heroImage` | Hero banner image URL |

- **Colours and fonts:** edit the variables in `:root` at the top of `style.css`.
- **Logo:** replace `assets/logo.svg`.
- **Starter menu:** edit `SAMPLE_MENU` in `script.js`. Each item is `{ id, name, description, price, category, image, available }`. Image URLs must start with `https://` or `assets/`.
- **Your own photos:** put files in `assets/` and use `assets/your-photo.jpg` as the image URL.

> The sample menu uses Unsplash photo URLs. Photos can be removed or renamed over time, so replace them with your own images before going live. A broken image automatically shows the placeholder.

## Managing the menu (LocalStorage)

Click **Manage menu** in the page footer. You can add, edit, delete, mark available/unavailable and reset to the sample menu.

**Important:** menu changes are saved in LocalStorage, which is **local to the current browser on the current device**. They are **not synchronised** between devices and are **not visible to your customers**. Clearing browser data erases them. To publish a permanent menu for everyone, edit `SAMPLE_MENU` in `script.js` and redeploy.

Note that a customer who has visited before keeps their previously stored menu in their browser. If you change `SAMPLE_MENU` after launch, change `menuKey` in `CONFIG` (for example `rm_menu_v2`) so every browser loads the new menu.

## Deploy as a static site

**Netlify (drag and drop)**
1. Go to <https://app.netlify.com/drop>.
2. Drag this whole folder (or unzip the ZIP and drag the folder) onto the page.

**Netlify (CLI)**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir .
```

**Vercel (CLI)**
```bash
npm i -g vercel
vercel --prod      # framework: "Other", no build command, output directory "."
```

**Vercel / Netlify via GitHub:** push the folder to a repository, import it, leave the build command empty and the output/publish directory as the project root.

## How ordering works

1. The customer fills the cart and taps Checkout.
2. After validation, the app opens WhatsApp with the order text ready.
3. The order exists only when the customer presses **Send** in WhatsApp. You receive it as a normal WhatsApp message.

Message format:

```
NEW ORDER

Customer Name: …
Customer Phone: +91 …
Delivery Address: …
Landmark: …

ORDER ITEMS:
Paneer Tikka x 2 = ₹480

Subtotal: ₹…
Delivery Charge: ₹…
Grand Total: ₹…

Order Notes: …
```

Phone validation expects an Indian 10-digit mobile number (an optional `+91` or leading `0` is accepted). To support other countries, change `normalizePhone`, `validateCheckout` and the `+91` prefix in `buildOrderMessage` in `script.js`.

## Notes

- Prices are handled in paise internally, so totals are exact (for example 3 × ₹99.99 = ₹299.97).
- User-entered text is escaped before display and URL-encoded before it goes into the WhatsApp link.
- The cart always uses current menu prices; if an item is deleted or marked unavailable, it is removed from the cart.
