import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { CreateEmployeeDto, DepartmentReturnDto } from '../services/api';

function EmployeeForm() {
  const [form, setForm] = useState<CreateEmployeeDto>({ name: '', salary: 0, departmentNames: [], manager: false });
  const [departments, setDepartments] = useState<DepartmentReturnDto[]>([]);
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const companyId = new URLSearchParams(location.search).get('companyId');

  useEffect(() => {
    if (companyId) {
      Promise.all([
        api.getCompany(Number(companyId)),
        api.getDepartments()
      ])
        .then(([companyData, deptData]) => {
          console.log('Company:', companyData);
          console.log('Departments:', deptData);
          const filteredDepartments = deptData.filter(d => d.company === companyData.name);
          setDepartments(filteredDepartments);
          const deptName = new URLSearchParams(location.search).get('dept');
          if (deptName) {
            setForm(prev => ({ ...prev, departmentNames: [decodeURIComponent(deptName)] }));
          }
        })
        .catch(err => {
          console.error('Error fetching data:', err);
          toast.error('Failed to load company or departments');
        });
    }

    if (id) {
      api.getEmployee(Number(id))
        .then(data => {
          setForm({
            name: data.name,
            salary: Number(data.salary), // Ensure salary is a number
            departmentNames: data.departmentNames,
            manager: data.manager,
          });
          if (companyId) {
            api.getCompany(Number(companyId))
              .then(companyData => {
                api.getDepartments()
                  .then(deptData => {
                    const filteredDepartments = deptData.filter(d => d.company === companyData.name);
                    setDepartments(filteredDepartments);
                  })
                  .catch(err => {
                    console.error('Error fetching departments:', err);
                    toast.error('Failed to load departments');
                  });
              })
              .catch(err => {
                console.error('Error fetching company:', err);
                toast.error('Failed to load company');
              });
          }
        })
        .catch(err => {
          console.error('Error fetching employee:', err);
          toast.error('Failed to load employee');
        });
    }
  }, [id, companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'departmentNames') {
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions).map(option => option.value);
      setForm({ ...form, departmentNames: selectedOptions });
    } else if (name === 'salary') {
      setForm({ ...form, salary: parseFloat(value) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await api.updateEmployee(Number(id), {
          name: form.name,
          salary: form.salary,
          manager: form.manager,
        });
        toast.success('Employee updated successfully');
      } else {
        await api.createEmployee(form);
        toast.success('Employee created successfully');
      }
      navigate(`/company/${companyId}`);
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee');
    }
  };

  return (
    <div>
      <h2>{id ? 'Edit Employee' : 'Add Employee'}</h2>
      <form onSubmit={handleSubmit}>
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
        <label className="centered-label">
          <input
            type="number"
            name="salary"
            value={form.salary}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="Salary"
          />
        </label>
        <div className="departments-section">
          <h4>Departments</h4>
          {departments.length ? (
            <select
              name="departmentNames"
              multiple
              value={form.departmentNames}
              onChange={handleChange}
              required
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          ) : (
            <p>No departments available</p>
          )}
        </div>
        <label className="manager-label">
          Manager:
          <input
            type="checkbox"
            name="manager"
            checked={form.manager}
            onChange={handleChange}
          />
        </label>
        <div className="actions">
          <button type="submit" className="primary">
            {id ? 'Update' : 'Create'}
          </button>
          <button
            type="button"
            className="delete"
            onClick={() => navigate(`/company/${companyId}`)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeForm;