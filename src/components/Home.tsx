import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { CompanyReturnDto, CompanyDto } from '../services/api';

const Home: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyReturnDto[]>([]);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [companyFormData, setCompanyFormData] = useState<CompanyDto>({
    name: '',
    location: '',
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.getCompanies();
        console.log('Raw GET /companies response:', JSON.stringify(response, null, 2));
        setCompanies(response.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (err: any) {
        console.error('Error fetching companies:', err.message);
        toast.error('Failed to load companies: ' + err.message);
      }
    };
    fetchCompanies();
  }, []);

  const handleCompanyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyFormData({
      ...companyFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCompanyFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCompany = await api.createCompany(companyFormData);
      setCompanies(prev => [...prev, newCompany].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Company created successfully');
      setIsCompanyFormOpen(false);
      setCompanyFormData({ name: '', location: '' });
    } catch (err: any) {
      console.error('Error creating company:', err.message, err.response?.data);
      toast.error(`Failed to create company: ${err.message || 'Server error'}`);
    }
  };

  return (
    <div className="home">
      <h2>Companies</h2>
      <div className="company-list">
        {companies.map(company => (
          <div key={company.id} className="company-card">
            <h3>
              <Link title ={`View ${company.name}`} to={`/company/${company.id}`}>{company.name}</Link>
            </h3>
            <p>Location: {company.location}</p>
          </div>
        ))}
        <div className="company-card">
          <Link to="#" className="add-company-link" title="Add Company" onClick={(e) => { e.preventDefault(); setIsCompanyFormOpen(true); }}>
            Add Company
          </Link>
        </div>
      </div>

      {isCompanyFormOpen && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Add Company</h2>
            <form onSubmit={handleCompanyFormSubmit}>
              <label className="centered-label">
                <input
                  type="text"
                  name="name"
                  value={companyFormData.name}
                  onChange={handleCompanyFormChange}
                  required
                  placeholder="Name"
                />
              </label>
              <label className="centered-label">
                <input
                  type="text"
                  name="location"
                  value={companyFormData.location}
                  onChange={handleCompanyFormChange}
                  required
                  placeholder="Location"
                />
              </label>
              <div className="actions">
                <button type="submit" className="primary">Save</button>
                <button type="button" className="cancelbtt" onClick={() => { setIsCompanyFormOpen(false); setCompanyFormData({ name: '', location: '' }); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;