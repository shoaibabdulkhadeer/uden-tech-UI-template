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
