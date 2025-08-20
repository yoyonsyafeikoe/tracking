import { useEffect, useState } from 'react';
import API from '../../api/api';

export default function ManageUsers() {
  const [role, setRole] = useState('driver');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({ username: '', password: '', role: 'driver' });
  const [editingId, setEditingId] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [role, refresh]);

  const fetchUsers = async () => {
    try {
      const res = await API.get(`/users?role=${role}&search=${search}`);
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleEdit = (user) => {
    setFormData({
      username: user.username,
      password: '',
      role: user.role
    });
    setEditingId(user._id);
  };

  const handleDelete = async (id) => {
    try {
      await API.patch(`/users/${id}/status`, { status: 'inactive' });
      setRefresh(r => r + 1);
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/users/${editingId}`, formData);
      } else {
        await API.post('/users/register', formData)
      }
      setFormData({ username: '', password: '', role });
      setEditingId(null);
      setRefresh(r => r + 1);
    } catch (err) {
      console.error('Failed to save user', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Manage {role === 'driver' ? 'Drivers' : 'Guides'}</h2>

      {/* Role switch */}
      <div className="flex gap-4 mb-4">
        <button onClick={() => setRole('driver')} className={`px-4 py-2 rounded ${role === 'driver' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Drivers</button>
        <button onClick={() => setRole('guide')} className={`px-4 py-2 rounded ${role === 'guide' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Guides</button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex mb-4 gap-2">
        <input type="text" placeholder="Search username" value={search} onChange={handleSearchChange} className="border px-3 py-2 rounded w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </form>

      {/* Add / Edit Form */}
      <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input type="text" name="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Username" className="border px-3 py-2 rounded" required />
        <input type="password" name="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Password" className="border px-3 py-2 rounded" required={!editingId} />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          {editingId ? 'Update' : 'Add'}
        </button>
      </form>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-t">
                <td className="px-4 py-2">{user.username}</td>
                <td className="px-4 py-2 text-center">{user.status}</td>
                <td className="px-4 py-2 flex gap-2 justify-center">
                  <button onClick={() => handleEdit(user)} className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
