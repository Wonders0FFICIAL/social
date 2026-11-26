import { Navigate, Route, Routes } from 'react-router-dom';
import Editor from './Editor';
import ProfilePage from './ProfilePage';
import './social.css';

/**
 *   /          -> redirects to /edit
 *   /edit      -> editor (Google sign-in)
 *   /:username -> public phone page
 */
export default function SocialRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="/edit" replace />} />
      <Route path="edit" element={<Editor />} />
      <Route path=":username" element={<ProfilePage />} />
    </Routes>
  );
}
