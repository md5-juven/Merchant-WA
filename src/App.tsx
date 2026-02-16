import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Nav from './components/Nav';
import Home from './pages/Home';
import MerchantForm from './components/MerchantForm';
import './App.css';

// HashRouter so routing works on GitHub Pages (no server redirects)
function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Nav />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/form" element={<MerchantForm />} />
          </Routes>
        </main>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
