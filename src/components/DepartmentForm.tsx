import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { DepartmentDto,  CompanyReturnDto } from '../services/api';

function DepartmentForm() {
  const [form, setForm] = useState<DepartmentDto>({ company: '', name: '' });
  const [company, setCompany] = useState<CompanyReturnDto | null>(null);
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const companyId = new URLSearchParams(location.search).get('companyId');

  useEffect(() => {
    if (companyId) {
      api.getCompany(Number(companyId))
        .then(data => {
          setCompany(data);
          setForm(prev => ({ ...prev, company: data.name }));
        })
        .catch(err => {
          console.error('Error fetching company:', err);
          toast.error('Failed to load company');
        });
    }

    if (id) {
      api.getDepartment(Number(id))
        .then(data => {
          setForm({ company: data.company, name: data.name });
          if (!companyId) {
            api.getCompanies()
              .then(companies => {
                const foundCompany = companies.find(c => c.name === data.company);
                if (foundCompany) {
                  setCompany(foundCompany);
                }
              })
              .catch(err => {
                console.error('Error fetching companies:', err);
                toast.error('Failed to load companies');
              });
          }
        })
        .catch(err => {
          console.error('Error fetching department:', err);
          toast.error('Failed to load department');
        });
    }
  }, [id, companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) {
      toast.error('Company information is missing');
      return;
    }
    try {
      const updatedForm = { ...form, company: company.name };
      if (id) {
        await api.updateDepartment(Number(id), updatedForm);
        toast.success('Department updated successfully');
      } else {
        await api.createDepartment(updatedForm);
        toast.success('Department created successfully');
      }
      navigate(`/company/${companyId || company?.id}`);
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Failed to save department');
    }
  };

  return (
    <div>
      <h2>{id ? 'Edit Department' : 'Add Department'}</h2>
      <form onSubmit={handleSubmit}>
        <label className="centered-label">
          <p>{company ? company.name : 'Loading...'}</p>
        </label>
        <label className="centered-label">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Name"
          />
        </label>
        <div className="actions">
          <button type="submit" className="primary">
            {id ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            className="delete"
            onClick={() => navigate(`/company/${companyId || company?.id || ''}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default DepartmentForm;