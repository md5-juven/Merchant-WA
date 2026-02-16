import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Nav from './components/Nav';
import Home from './pages/Home';
import MerchantForm from './components/MerchantForm';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Nav />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/form" element={<MerchantForm />} />
          </Routes>
        </main>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
