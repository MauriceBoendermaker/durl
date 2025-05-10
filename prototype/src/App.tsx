import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Nav from './components/misc/Nav';
import { Footer } from './components/misc/Footer';
import ShortenPage from './components/ShortenPage';
import Dashboard from './components/Dashboard';
import RedirectPage from './components/utils/RedirectPage';
import About from './components/About';

import "./assets/scss/style.scss";

function App() {
  useEffect(() => {
    const cursor = document.getElementById('custom-cursor');

    const move = (e: MouseEvent) => {
      if (cursor) {
        cursor.style.top = `${e.clientY}px`;
        cursor.style.left = `${e.clientX}px`;
      }
    };

    const addHoverClass = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a')) {
        cursor?.classList.add('cursor-link');
        cursor?.classList.remove('cursor-hovering');
      } else if (target.closest('button') || target.closest('input')) {
        cursor?.classList.add('cursor-hovering');
        cursor?.classList.remove('cursor-link');
      } else {
        cursor?.classList.remove('cursor-hovering', 'cursor-link');
      }
    };

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', addHoverClass);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', addHoverClass);
    };
  }, []);

  return (
    <Router>
      <Nav />

      <Routes>
        <Route path="/" element={<ShortenPage />} />
        <Route path="/faq" element={<ShortenPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/:shortId" element={<RedirectPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Footer />
      <div
        id="toast-container"
        className="toast-container position-fixed bottom-0 end-0 p-3"
        style={{ zIndex: 1055 }}
      ></div>
    </Router>
  );
}

export default App;
