import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Nav from './components/misc/Nav';
import { Footer } from './components/misc/Footer';
import ShortenPage from './components/ShortenPage';
import Dashboard from './components/Dashboard';
import RedirectPage from './components/utils/RedirectPage';

import "./assets/scss/style.scss";

function App() {
  return (
    <Router>
      <Nav />

      <Routes>
        <Route path="/" element={<ShortenPage />} />
        <Route path="/faq" element={<ShortenPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/:shortId" element={<RedirectPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
