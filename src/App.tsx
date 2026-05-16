import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sileo';
import { Layout } from './components/layout/Layout';
import { useThemeStore } from './store/themeStore';
import { AdminAssistant } from './components/admin/AdminAssistant';
import { LoadingFallback } from './components/ui/LoadingFallback';

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage').then(m => ({ default: m.CreateEventPage })));
const EventDetailsPage = lazy(() => import('./pages/EventDetailsPage').then(m => ({ default: m.EventDetailsPage })));
const MyEventsPage = lazy(() => import('./pages/MyEventsPage').then(m => ({ default: m.MyEventsPage })));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage').then(m => ({ default: m.UserManagementPage })));

const App = () => {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (<>
    <Router>
      <Toaster
        offset={{ top: 20, right: 16 }}
        theme='dark'
        position="bottom-center"
        options={{
          styles: { description: "text-white/75!" },
        }}

      />
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<MyEventsPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/events/:id/edit" element={<CreateEventPage />} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
          </Routes>
        </Suspense>
      </Layout>
      <AdminAssistant />
    </Router></>
  );
}

export default App;
