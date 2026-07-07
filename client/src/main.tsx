import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './store';
import './index.css';

// Import Route components
import { Route as rootRoute } from './routes/__root';
import { Route as indexRoute } from './routes/index';
import { Route as shopRoute } from './routes/shop';
import { Route as detailRoute } from './routes/product.$productId';
import { Route as cartRoute } from './routes/cart';
import { Route as loginRoute } from './routes/login';
import { Route as registerRoute } from './routes/register';
import { Route as adminDashboardRoute } from './routes/admin/dashboard';
import { Route as adminLoginRoute } from './routes/admin/login';
import { Route as ordersRoute } from './routes/orders';
import { Route as trackRoute } from './routes/orders.track';
import { Route as profileRoute } from './routes/profile';
import { Route as aboutRoute } from './routes/about';
import { Route as contactRoute } from './routes/contact';
import { Route as loggedOutRoute } from './routes/logged-out';

// Configure route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  shopRoute,
  detailRoute,
  cartRoute,
  loginRoute,
  registerRoute,
  adminDashboardRoute,
  adminLoginRoute,
  ordersRoute,
  trackRoute,
  profileRoute,
  aboutRoute,
  contactRoute,
  loggedOutRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
