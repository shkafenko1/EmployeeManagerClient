import { useState } from 'react';
import { toast } from 'react-toastify';
import api, { EmployeeDto, DepartmentReturnDto } from '../services/api';

interface AssignDepartmentsFormProps {
  employees: EmployeeDto[];
  departments: DepartmentReturnDto[];
  onSuccess: (updatedEmployee: EmployeeDto) => void;
}

const AssignDepartmentsForm: React.FC<AssignDepartmentsFormProps> = ({ employees, departments, onSuccess }) => {
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      setError('Please select an employee');
      return;
    }
    try {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) throw new Error('Employee not found');
      const updateData = {
        name: employee.name,
        salary: employee.salary,
        departmentNames: selectedDepartments,
        manager: employee.manager,
      };
      const updatedEmployee = await api.updateEmployee(employeeId, updateData);
      onSuccess(updatedEmployee);
      setEmployeeId(null);
      setSelectedDepartments([]);
      setError(null);
    } catch (err: any) {
      console.error('Error assigning departments:', err.message);
      setError('Failed to assign departments: ' + err.message);
      toast.error('Failed to assign departments');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Employee
        <select
          value={employeeId ?? ''}
          onChange={e => setEmployeeId(Number(e.target.value) || null)}
          required
        >
          <option value="">Select Employee</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>
              {emp.name} (ID: {emp.id})
            </option>
          ))}
        </select>
      </label>
      <label>
        Departments
        <select
          multiple
          value={selectedDepartments}
          onChange={e =>
            setSelectedDepartments(Array.from(e.target.selectedOptions, option => option.value))
          }
        >
          {departments.map(dept => (
            <option key={dept.id} value={dept.name}>
              {dept.name}
            </option>
          ))}
        </select>
      </label>
      <div className="actions">
        <button type="submit" className="primary">
          Assign Departments
        </button>
      </div>
      {error && <p className="error-boundary">{error}</p>}
    </form>
  );
};

export default AssignDepartmentsForm;