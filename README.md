# LaComanda — Waiter View

Angular app for waiter staff at LaComanda. Lets waiters take orders on behalf of customers who prefer not to use their own phone, directly from a table-side device.

🔗 **Live demo**: [lacomanda-camarero.netlify.app](https://lacomanda-camarero.netlify.app/)
🔗 **Project page (with video walkthroughs)**: [crissdeev.netlify.app/proyecto-lacomanda](https://crissdeev.netlify.app/proyecto-lacomanda)
🔗 **Related repos**: [backend](https://github.com/Arcezx/lacomanda-backend) · [digital menu](https://github.com/Arcezx/lacomanda-frontend) · [admin](https://github.com/Arcezx/lacomanda-admin) · [kitchen](https://github.com/Arcezx/lacomanda-cocina)

> ⏳ **Heads up**: the backend runs on Render's free tier. If it's been idle, the first request can take 30–60 seconds to wake up.

## Test Credentials

```
Username: camarero1
Password: camarero1123
```

## Features

- Select a table to start or continue taking an order for it
- Browse the menu by category, with allergen info per product
- Customize products with extras before adding to the order
- Review the full order summary before sending it to the kitchen — shared in real time with kitchen and the customer's own session

## Tech Stack

- **Framework**: Angular 19
- **Real-time**: WebSocket (STOMP over SockJS, shared protocol with the rest of the system)
- **Deployment**: Netlify

## Architecture

```
src/app/
├── guards/
│   └── auth.guard.ts              Route protection
├── components/
│   └── producto-modal/            Product customization modal (extras)
├── models/                        TypeScript interfaces (producto, mesa, extra...)
├── pages/
│   ├── login/                      Login page
│   ├── mesas/                      Table selection
│   ├── categoria-detalle/          Menu browsing by category
│   ├── tomar-pedido/                Order-taking flow
│   └── resumen-pedido/              Order summary & confirmation
└── services/
    ├── auth.service.ts
    ├── auth-interceptor.interceptor.ts
    ├── carrito.service.ts          Cart state
    ├── carta.service.ts             Menu data
    ├── mesas.service.ts             Table data
    └── pedidos.service.ts           Order placement
```

## Running Locally

```bash
git clone https://github.com/Arcezx/lacomanda-camarero.git
cd lacomanda-camarero
npm install
ng serve
```

Open `http://localhost:4200` in your browser.

## Related Repositories

| Repo | Description |
|---|---|
| [lacomanda-backend](https://github.com/Arcezx/lacomanda-backend) | Spring Boot REST API |
| [lacomanda-frontend](https://github.com/Arcezx/lacomanda-frontend) | Customer-facing digital menu |
| [lacomanda-admin](https://github.com/Arcezx/lacomanda-admin) | Admin dashboard |
| [lacomanda-cocina](https://github.com/Arcezx/lacomanda-cocina) | Kitchen view |
