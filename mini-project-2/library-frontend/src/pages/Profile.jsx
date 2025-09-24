// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { userService } from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await userService.getProfile();
      setProfile(res.data?.user || res.data?.data || null);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      });
      alert('Profile updated');
    } catch {
      alert('Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div className="card p-6">Loading...</div>;

  return (
    <div className="max-w-lg card p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">First Name</label>
          <input
            className="input"
            value={profile.firstName || ''}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Last Name</label>
          <input
            className="input"
            value={profile.lastName || ''}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Email</label>
          <input
            className="input"
            type="email"
            value={profile.email || ''}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            required
          />
        </div>
        <button disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;