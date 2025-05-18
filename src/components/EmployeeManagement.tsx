import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { EmployeeDto, DepartmentReturnDto, CompanyReturnDto } from '../services/api';
import EmployeeList from './EmployeeList';
import EmployeeCrudForm from './EmployeeCrudForm';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [departments, setDepartments] = useState<DepartmentReturnDto[]>([]);
  const [companies, setCompanies] = useState<CompanyReturnDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const location = useLocation();
  useEffect(() => {
    if (location.search.includes('add=true')) {
      setIsModalOpen(true);
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeeRes, deptRes, companyRes] = await Promise.all([
          api.getAllEmployees(),
          api.getDepartments(),
          api.getCompanies(),
        ]);
        setEmployees(employeeRes.sort((a, b) => a.name.localeCompare(b.name)));
        setDepartments(deptRes);
        setCompanies(companyRes);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching data:', err.message);
        setError('Failed to load employees, departments, or companies');
        toast.error('Failed to load data: ' + err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCrudSuccess = (newEmployees: EmployeeDto[], isUpdate: boolean) => {
    if (isUpdate) {
      setEmployees(prev =>
        prev
          .map(emp => newEmployees.find(newEmp => newEmp.id === emp.id) || emp)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success('Employee(s) updated successfully');
    } else {
      setEmployees(prev => [...prev, ...newEmployees].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Employee(s) created successfully');
    }
    setIsModalOpen(false);
  };

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-boundary"><h2>Error</h2><p>{error}</p></div>;

  return (
    <div>
      <h2>Employee Management</h2>
      <EmployeeList
        employees={employees}
        departments={departments}
        companies={companies}
      />
      <button className="add-employee-btn" onClick={handleAdd}>
        +
      </button>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <EmployeeCrudForm
              departments={departments}
              onSuccess={handleCrudSuccess}
              editingEmployee={null} 
              onCancel={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;