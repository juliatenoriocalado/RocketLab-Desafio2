import { BrowserRouter, Link, Route, Routes } from "react-router";
import { CatalogPage } from "./pages/CatalogPage";
import { MovieDetailPage } from "./pages/MovieDetailPage";
import { ToastProvider } from "./components/Toast";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <header className="topbar">
          <div className="container topbar-inner">
            <Link to="/" className="brand">
              <span className="brand-mark" aria-hidden="true" />
              Cinemateca
            </Link>
            <span className="topbar-tag">Painel do administrador</span>
          </div>
        </header>

        <main className="container page">
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/filmes/:movieId" element={<MovieDetailPage />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <p>Página não encontrada.</p>
                  <Link to="/" className="button button-ghost">
                    Ir para o catálogo
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
