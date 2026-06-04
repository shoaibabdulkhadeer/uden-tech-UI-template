// ─── Cross-tab auth bridge ───────────────────────────────────────────────────
// Runs synchronously before ANY React or Redux code. If this tab was opened via
// window.open('_blank') from an authenticated tab, the parent copied the auth
// tokens to localStorage. Promote them to sessionStorage immediately so that
// PrivateRoutes, Axios interceptors, and Redux all see a valid session.
(function crossTabAuthBridge() {
  const access  = localStorage.getItem('_crossTabToken');
  const refresh = localStorage.getItem('_crossTabRefresh');
  if (access) {
    sessionStorage.setItem('accessToken',  access);
    localStorage.removeItem('_crossTabToken');
  }
  if (refresh) {
    sessionStorage.setItem('refreshToken', refresh);
    localStorage.removeItem('_crossTabRefresh');
  }
})();
// ─────────────────────────────────────────────────────────────────────────────

import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import './assets/vendors/style';
import './styles/phase2-theme.css';
import './styles/app-header.css';
import NextApp from './NextApp';
import store from './redux/store';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// const store = configureStore();

root.render(
  <Provider store={store}>
    <BrowserRouter>
      <NextApp />
    </BrowserRouter>
  </Provider>
);
