import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosResponse } from 'axios';
import api, { CompanyReturnDto, DepartmentReturnDto, DepartmentDto, EmployeeDto, DepartmentWithEmployees, CreateEmployeeDto, UpdateDto } from '../services/api';
import ConfirmModal from './ConfirmModal';

// Define the correct API service interface reflecting actual return types
interface ApiService {
  getCompany(id: number): Promise<CompanyReturnDto>;
  getDepartments(): Promise<DepartmentReturnDto[]>;
  getDepartmentsWithEmployees(): Promise<DepartmentWithEmployees[]>;
  deleteCompany(id: number): Promise<AxiosResponse<void>>;
  deleteDepartment(id: number): Promise<AxiosResponse<void>>;
  deleteEmployee(id: number): Promise<AxiosResponse<void>>;
  createDepartment(dto: DepartmentDto): Promise<DepartmentReturnDto>;
  updateDepartment(id: number, dto: DepartmentDto): Promise<DepartmentReturnDto>;
  updateCompany(id: number, dto: Partial<CompanyReturnDto>): Promise<CompanyReturnDto>;
  createEmployee(dto: CreateEmployeeDto): Promise<EmployeeDto>;
  updateEmployee(id: number, dto: UpdateDto): Promise<EmployeeDto>;
}

// Type the api object directly as ApiService
const typedApi: ApiService = api;

function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyReturnDto | null>(null);
  const [departments, setDepartments] = useState<DepartmentReturnDto[]>([]);
  const [unwrapData, setUnwrapData] = useState<DepartmentWithEmployees[]>([]);
  const [expandedDeptId, setExpandedDeptId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });
  const [isDepartmentFormOpen, setIsDepartmentFormOpen] = useState(false);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentReturnDto | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDto | null>(null);

  const [departmentForm, setDepartmentForm] = useState<DepartmentDto>({
    company: '',
    name: '',
  });

  const [companyForm, setCompanyForm] = useState<CompanyReturnDto>({
    id: 0,
    name: '',
    location: '',
  });

  const [employeeForm, setEmployeeForm] = useState<CreateEmployeeDto>({
    name: '',
    salary: 0,
    departmentNames: [],
    manager: false,
  });

  useEffect(() => {
    if (!id) {
      setError('No company ID provided');
      return;
    }

    const fetchCompanyData = async () => {
      try {
        const companyData = await typedApi.getCompany(Number(id));
        setCompany(companyData);
        setCompanyForm({ ...companyData });
        setDepartmentForm({ company: companyData.name, name: '' });

        const [deptData, unwrapDataResponse] = await Promise.all([
          typedApi.getDepartments(),
          typedApi.getDepartmentsWithEmployees(),
        ]);

        const companyDepartments = deptData.filter(d => d.company === companyData.name);
        setDepartments(companyDepartments);

        const filteredUnwrapData = unwrapDataResponse.filter(d => d.department.company === companyData.name);
        setUnwrapData(filteredUnwrapData);
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching company data:', error.message, (err as any).response?.data);
        setError('Failed to load company data: ' + error.message);
      }
    };

    fetchCompanyData();
  }, [id]);

  const toggleUnwrap = (deptId: number) => {
    console.log('Toggling department ID:', deptId, 'Current expanded:', expandedDeptId);
    setExpandedDeptId(expandedDeptId === deptId ? null : deptId);
  };

  const getEmployeesForDepartment = (deptId: number): EmployeeDto[] => {
    const deptData = unwrapData.find(d => d.department.id === deptId);
    console.log(`Finding employees for dept ID ${deptId}:`, deptData);
    return deptData ? deptData.employees : [];
  };

  const handleDeleteCompany = () => {
    if (!id || !company) return;
    setModalState({
      isOpen: true,
      message: `Are you sure you want to delete ${company.name}?`,
      onConfirm: async () => {
        try {
          await typedApi.deleteCompany(Number(id));
          toast.success('Company deleted successfully');
          navigate('/');
        } catch (error) {
          console.error('Error deleting company:', error);
          toast.error('Failed to delete company');
        }
        setModalState({ isOpen: false, message: '', onConfirm: () => {} });
      },
    });
  };

  const handleDeleteDepartment = (deptId: number, deptName: string) => {
    setModalState({
      isOpen: true,
      message: `Are you sure you want to delete ${deptName}?`,
      onConfirm: async () => {
        try {
          await typedApi.deleteDepartment(deptId);
          setDepartments(departments.filter(d => d.id !== deptId));
          setUnwrapData(unwrapData.filter(d => d.department.id !== deptId));
          toast.success('Department deleted successfully');
        } catch (error) {
          console.error('Error deleting department:', error);
          toast.error('Failed to delete department');
        }
        setModalState({ isOpen: false, message: '', onConfirm: () => {} });
      },
    });
  };

  const handleDeleteEmployee = (empId: number, empName: string, deptId: number) => {
    setModalState({
      isOpen: true,
      message: `Are you sure you want to delete ${empName}?`,
      onConfirm: async () => {
        try {
          await typedApi.deleteEmployee(empId);
          setUnwrapData(unwrapData.map(d =>
            d.department.id === deptId
              ? { ...d, employees: d.employees.filter(e => e.id !== empId) }
              : d
          ));
          toast.success('Employee deleted successfully');
        } catch (error) {
          console.error('Error deleting employee:', error);
          toast.error('Failed to delete employee');
        }
        setModalState({ isOpen: false, message: '', onConfirm: () => {} });
      },
    });
  };

  const handleDepartmentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDepartmentForm({ ...departmentForm, [e.target.name]: e.target.value });
  };

  const handleDepartmentFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!company) {
      toast.error('Company information is missing');
      return;
    }
    try {
      const updatedForm = { ...departmentForm, company: company.name };
      const response = await (editingDepartment
        ? typedApi.updateDepartment(editingDepartment.id, updatedForm)
        : typedApi.createDepartment(updatedForm));
      console.log('Raw department save response:', JSON.stringify(response, null, 2));
      
      if (editingDepartment) {
        setDepartments(departments.map(d => d.id === editingDepartment.id ? response : d));
      } else {
        setDepartments([...departments, response]);
      }
      
      toast.success(`${editingDepartment ? 'Department updated' : 'Department created'} successfully`);
      setIsDepartmentFormOpen(false);
      setEditingDepartment(null);
      setDepartmentForm({ company: company.name, name: '' });
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error('Failed to save department');
    }
  };

  const handleCompanyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyForm({ ...companyForm, [e.target.name]: e.target.value });
  };

  const handleCompanyFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!company) return;
    try {
      const updatedCompany = { name: companyForm.name, location: companyForm.location };
      const response = await typedApi.updateCompany(company.id, updatedCompany);
      setCompany(response);
      toast.success('Company updated successfully');
      setIsCompanyFormOpen(false);
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
    }
  };

  const handleEmployeeFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setEmployeeForm({ ...employeeForm, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === 'salary') {
      setEmployeeForm({ ...employeeForm, [name]: parseFloat(value) || 0 });
    } else {
      setEmployeeForm({ ...employeeForm, [name]: value });
    }
  };

  const handleEmployeeFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!employeeForm.departmentNames.length) {
      toast.error('Please select a department');
      return;
    }
    try {
      if (editingEmployee) {
        const updatedEmployee = await typedApi.updateEmployee(editingEmployee.id, {
          name: employeeForm.name,
          salary: employeeForm.salary,
          manager: employeeForm.manager,
        } as UpdateDto);
        setUnwrapData(unwrapData.map(d => ({
          ...d,
          employees: d.employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e)
        })));
        toast.success('Employee updated successfully');
      } else {
        const newEmployee = await typedApi.createEmployee(employeeForm);
        setUnwrapData(unwrapData.map(d => ({
          ...d,
          employees: d.department.name === employeeForm.departmentNames[0] ? [...d.employees, newEmployee] : d.employees
        })));
        toast.success('Employee created successfully');
      }
      setIsEmployeeFormOpen(false);
      setEditingEmployee(null);
      setEmployeeForm({ name: '', salary: 0, departmentNames: [], manager: false });
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Failed to save employee');
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, message: '', onConfirm: () => {} });
  };

  if (error) {
    return (
      <div>
        <h2>Error</h2>
        <p>{error}</p>
        <button className="primary" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    );
  }

  if (!company) return <p>Loading...</p>;

  return (
    <>
      <div className="company-page">
        <div className="company-header">
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <h2>{company.name}</h2>
            <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
              <button
                className="symbol-btn edit"
                onClick={() => setIsCompanyFormOpen(true)}
                title="Edit Company"
              >
                ✏️
              </button>
              <button
                className="symbol-btn delete"
                onClick={handleDeleteCompany}
                title="Delete Company"
              >
                🗑️
              </button>
            </div>
          </div>
          <p>Location: {company.location}</p>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <h3>Departments</h3>
            <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'row', gap: '0.5rem' }}>
              <button
                className="symbol-btn unwrap"
                onClick={() => setIsDepartmentFormOpen(true)}
                title="Add Department"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {departments.length ? (
              departments.map(dept => (
                <React.Fragment key={`dept-${dept.id}`}>
                  <tr>
                    <td>
                      <span>{dept.name}</span>
                      <div className="button-row" style={{ display: 'inline-flex', marginLeft: '1rem' }}>
                        <button
                          className="symbol-btn edit"
                          onClick={() => { setEditingDepartment(dept); setDepartmentForm({ company: dept.company, name: dept.name }); setIsDepartmentFormOpen(true); }}
                          title="Edit Department"
                        >
                          ✏️
                        </button>
                        <button
                          className="symbol-btn delete"
                          onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                          title="Delete Department"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                    <td className="actions-column">
                      <button
                        className="symbol-btn unwrap"
                        onClick={() => toggleUnwrap(dept.id)}
                        title={expandedDeptId === dept.id ? 'Hide Employees' : 'Show Employees'}
                      >
                        {expandedDeptId === dept.id ? '▲' : '▼'}
                      </button>
                    </td>
                  </tr>
                  {expandedDeptId === dept.id && (
                    <tr key={`unwrap-${dept.id}`}>
                      <td colSpan={2}>
                        <div className="unwrap-section">
                          <div className="title-section">
                          <h4>Employees in {dept.name}</h4>
                          <button
                            className="symbol-btn unwrap"
                            onClick={() => { setEmployeeForm({ name: '', salary: 0, departmentNames: [dept.name], manager: false }); setIsEmployeeFormOpen(true); }}
                            title="Add Employee"
                          >
                            +
                          </button>
                          </div>
                          {getEmployeesForDepartment(dept.id).length ? (
                            <table>
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>Salary</th>
                                  <th>Manager</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {getEmployeesForDepartment(dept.id).map(emp => (
                                  <tr key={`emp-${emp.id}`}>
                                    <td>{emp.name}</td>
                                    <td>${emp.salary}</td>
                                    <td>{emp.manager ? 'Yes' : 'No'}</td>
                                    <td>
                                      <div className="button-row">
                                        <button
                                          className="symbol-btn edit"
                                          onClick={() => { setEditingEmployee(emp); setEmployeeForm({ name: emp.name, salary: emp.salary, departmentNames: emp.departmentNames, manager: emp.manager }); setIsEmployeeFormOpen(true); }}
                                          title="Edit Employee"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          className="symbol-btn delete"
                                          onClick={() => handleDeleteEmployee(emp.id, emp.name, dept.id)}
                                          title="Delete Employee"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p>No employees found for this department.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={2}>There are no departments yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isDepartmentFormOpen && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>{editingDepartment ? 'Edit Department' : 'Add Department'}</h2>
            <form onSubmit={handleDepartmentFormSubmit}>
              <label className="centered-label">
                <p>{company.name}</p>
              </label>
              <label className="centered-label">
                <input
                  type="text"
                  name="name"
                  //value={departmentForm.name}
                  onChange={handleDepartmentFormChange}
                  required
                  placeholder=/*{departmentForm.name}*/"Name"
                />
              </label>
              <div className="actions">
                <button type="submit" className="primary">
                  {editingDepartment ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="cancelbtt"
                  onClick={() => { setIsDepartmentFormOpen(false); setEditingDepartment(null); setDepartmentForm({ company: company!.name, name: '' }); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCompanyFormOpen && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>Edit Company</h2>
            <form onSubmit={handleCompanyFormSubmit}>
              <label className="centered-label">
                <input
                  type="text"
                  name="name"
                  //value={companyForm.name}
                  onChange={handleCompanyFormChange}
                  required
                  placeholder={companyForm.name}
                />
              </label>
              <label className="centered-label">
                <input
                  type="text"
                  name="location"
                  //value={companyForm.location}
                  onChange={handleCompanyFormChange}
                  required
                  placeholder={companyForm.location}
                />
              </label>
              <div className="actions">
                <button type="submit" className="primary">
                  Update
                </button>
                <button
                  type="button"
                  className="cancelbtt"
                  onClick={() => { setIsCompanyFormOpen(false); setCompanyForm({ id: company!.id, name: company!.name, location: company!.location }); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEmployeeFormOpen && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h2>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</h2>
            <form onSubmit={handleEmployeeFormSubmit}>
                <p><b>{companyForm.name}:</b> {employeeForm.departmentNames[0]}</p>
              <label className="centered-label">
                <input
                  type="text"
                  name="name"
                  //value={employeeForm.name}
                  onChange={handleEmployeeFormChange}
                  required
                  placeholder="Full name"
                />
              </label>
              <label className="centered-label">
                <input
                  type="number"
                  name="salary"
                  onChange={handleEmployeeFormChange}
                  required
                  min="0"
                  step="1"
                  placeholder="Salary"
                />
              </label>
              <label className="manager-label">
                Manager:
                <input
                  type="checkbox"
                  name="manager"
                  checked={employeeForm.manager}
                  onChange={handleEmployeeFormChange}
                />
              </label>
              <div className="actions">
                <button type="submit" className="primary">
                  {editingEmployee ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="cancelbtt"
                  onClick={() => { setIsEmployeeFormOpen(false); setEditingEmployee(null); setEmployeeForm({ name: '', salary: 0, departmentNames: [], manager: false }); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={modalState.onConfirm}
        message={modalState.message}
      />
    </>
  );
}

export default CompanyPage;