import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

function CompanyForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.createCompany(formData);
      console.log('Raw POST /company response:', JSON.stringify(response, null, 2));
      toast.success('Company created successfully!');
      navigate('/');
    } catch (err: any) {
      console.error('Error creating company:', err.message, err.response?.data);
      toast.error('Failed to create company: ' + (err.message || 'Server error'));
      navigate('/');
    }
  };

  return (
    <div className="company-form">
      <h2>Add Company</h2>
      <form onSubmit={handleSubmit}>
        <label className="centered-label">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Name"
          />
        </label>
        <label className="centered-label">
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="Location"
          />
        </label>
        <div className="actions">
          <button type="submit" className="primary">Save</button>
          <button type="button" className="delete" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CompanyForm;