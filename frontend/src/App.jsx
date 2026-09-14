import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import { supabase } from './lib/supabase';

function ProtectedLayout({ session, children }) {
  if (session === undefined) return null; // still loading
  if (!session) return <Navigate to="/login" replace />;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowX: 'hidden', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedLayout session={session}>
            <Dashboard session={session} />
          </ProtectedLayout>
        } />
        <Route path="/expenses" element={
          <ProtectedLayout session={session}>
            <Expenses />
          </ProtectedLayout>
        } />
        <Route path="/categories" element={
          <ProtectedLayout session={session}>
            <Categories />
          </ProtectedLayout>
        } />
        <Route path="/settings" element={
          <ProtectedLayout session={session}>
            <Settings session={session} />
          </ProtectedLayout>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
