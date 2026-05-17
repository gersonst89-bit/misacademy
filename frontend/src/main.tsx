import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./store";
import { setupGlobalInterceptors } from "./config/interceptor";
import ErrorBoundary from "./Components/ErrorBoundary";

import { ToastProvider } from "./hooks/useToast";

// Iniciar protección global de peticiones (401)
setupGlobalInterceptors();

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <StrictMode>
      <ErrorBoundary>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ErrorBoundary>
    </StrictMode>
  </Provider>
);
