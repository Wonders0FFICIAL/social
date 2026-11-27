import { Route, Routes } from 'react-router-dom';
import AdminPage from './AdminPage';
import AuthPage from './AuthPage';
import Editor from './Editor';
import Home from './Home';
import ProfilePage from './ProfilePage';
import './social.css';
import './screen.css';

/**
 *   /          -> home (intro, sign up / log in)
 *   /signup    -> Google sign up
 *   /login     -> Google log in
 *   /edit      -> editor (needs sign-in)
 *   /admin     -> moderation (ADMIN_EMAILS only)
 *   /:username -> public phone page
 */
export default function SocialRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="signup" element={<AuthPage mode="signup" />} />
      <Route path="login" element={<AuthPage mode="login" />} />
      <Route path="edit" element={<Editor />} />
      <Route path="admin" element={<AdminPage />} />
      <Route path=":username" element={<ProfilePage />} />
    </Routes>
  );
}
