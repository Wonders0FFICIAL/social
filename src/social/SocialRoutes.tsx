import { Route, Routes } from 'react-router-dom';
import AuthPage from './AuthPage';
import Editor from './Editor';
import Home from './Home';
import ProfilePage from './ProfilePage';
import './social.css';

/**
 *   /          -> home (intro, sign up / log in)
 *   /signup    -> Google sign up
 *   /login     -> Google log in
 *   /edit      -> editor (needs sign-in)
 *   /:username -> public phone page
 */
export default function SocialRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="signup" element={<AuthPage mode="signup" />} />
      <Route path="login" element={<AuthPage mode="login" />} />
      <Route path="edit" element={<Editor />} />
      <Route path=":username" element={<ProfilePage />} />
    </Routes>
  );
}
