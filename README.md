# Invoice Manager (MERN, JavaScript, Tailwind)

Scaffold, not a finished product. Included:
- Business sign-up / login, client login (JWT in httpOnly cookie)
- Business dashboard with fake data
- Client CRUD (business users only). The business user sets the client's email + password.
- Client portal home page (placeholder)

## Run it
Needs Node 18+ and MongoDB running locally (or an Atlas URI).

```bash
# terminal 1
cd server
cp .env.example .env     # then edit JWT_SECRET
npm install
npm run dev

# terminal 2
cd client
npm install
npm run dev
```
Open http://localhost:5173

## Try it
1. Go to /register and create a business account -> lands on /dashboard
2. Open Clients, add a client with an email + password
3. Log out, log in with the client's email + password -> lands on /portal

## Folder map
server/  models (User, Client), middleware/auth.js, controllers, routes
client/  src/pages, src/components, src/context/AuthContext.jsx, src/data/mockDashboard.js

## Next
Invoice model + routes, line items, PDF export, client-side invoice view in the portal.
