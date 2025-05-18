import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api, { EmployeeDto, DepartmentReturnDto, CreateEmployeeDto } from '../services/api';

interface EmployeeCrudFormProps {
  departments: DepartmentReturnDto[];
  onSuccess: (employees: EmployeeDto[], isUpdate: boolean) => void;
  editingEmployee: EmployeeDto | null;
  onCancel: () => void;
}

const EmployeeCrudForm: React.FC<EmployeeCrudFormProps> = ({
  departments,
  onSuccess,
  editingEmployee,
  onCancel,
}) => {
  const [employeeEntries, setEmployeeEntries] = useState<CreateEmployeeDto[]>([
    { name: '', salary: 0, departmentNames: [], manager: false },
  ]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (editingEmployee) {
      setEmployeeEntries([
        {
          name: editingEmployee.name,
          salary: Number(editingEmployee.salary), // Ensure salary is a number
          departmentNames: editingEmployee.departmentNames,
          manager: editingEmployee.manager,
        },
      ]);
    } else {
      setEmployeeEntries([{ name: '', salary: 0, departmentNames: [], manager: false }]);
    }
  }, [editingEmployee]);

  const addEntry = () => {
    setEmployeeEntries(prev => [
      ...prev,
      { name: '', salary: 0, departmentNames: [], manager: false },
    ]);
  };

  const updateEntry = (
    index: number,
    field: keyof CreateEmployeeDto,
    value: string | string[] | boolean
  ) => {
    setEmployeeEntries(prev => {
      const newEntries = [...prev];
      if (field === 'name') {
        newEntries[index].name = value as string;
      } else if (field === 'salary') {
        newEntries[index].salary = parseFloat(value as string) || 0;
      } else if (field === 'departmentNames') {
        newEntries[index].departmentNames = value as string[];
      } else if (field === 'manager') {
        newEntries[index].manager = value as boolean;
      }
      return newEntries;
    });
  };

  const removeEntry = (index: number) => {
    setEmployeeEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleDepartmentChange = (index: number, deptName: string, checked: boolean) => {
    setEmployeeEntries(prev => {
      const newEntries = [...prev];
      const currentDepts = newEntries[index].departmentNames;
      if (checked) {
        newEntries[index].departmentNames = [...currentDepts, deptName];
      } else {
        newEntries[index].departmentNames = currentDepts.filter(d => d !== deptName);
      }
      return newEntries;
    });
  };

  const groupedDepartments = departments.reduce((acc, dept) => {
    if (!acc[dept.company]) {
      acc[dept.company] = [];
    }
    acc[dept.company].push(dept);
    return acc;
  }, {} as Record<string, DepartmentReturnDto[]>);

  const sortedCompanies = Object.keys(groupedDepartments).sort();
  const sortedGroupedDepartments = sortedCompanies.reduce((acc, company) => {
    acc[company] = groupedDepartments[company].sort((a, b) => a.name.localeCompare(b.name));
    return acc;
  }, {} as Record<string, DepartmentReturnDto[]>);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        const updatedEmployee = await api.updateEmployee(editingEmployee.id, {
          name: employeeEntries[0].name,
          salary: employeeEntries[0].salary,
          manager: employeeEntries[0].manager,
        });
        onSuccess([updatedEmployee], true);
      } else {
        const response = await api.createEmployeesBulk(employeeEntries);
        const { created, errors: apiErrors } = response;
        if (created.length > 0) {
          onSuccess(created, false);
        }
        if (Object.keys(apiErrors).length > 0) {
          setErrors(Object.entries(apiErrors).map(([name, err]) => `${name}: ${JSON.stringify(err)}`));
          toast.error('Some employees failed to create');
          return;
        }
      }
      setErrors([]);
    } catch (err: any) {
      console.error('Error saving employee(s):', err.message);
      toast.error('Failed to save employee(s): ' + err.message);
      setErrors(['Failed to save employee(s)']);
    }
  };

  return (
    <div>
      <h3>{editingEmployee ? 'Edit Employee' : 'Add Employee(s)'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="entries-container">
          {employeeEntries.map((entry, index) => (
            <div key={index} className="employee-entry">
              {employeeEntries.length > 1 && (
                <>
                  <span className="form-number">{index + 1}</span>
                  <button
                    type="button"
                    className="remove-entry"
                    onClick={() => removeEntry(index)}
                  >
                    ×
                  </button>
                </>
              )}
              <label className="centered-label">
                <input
                  type="text"
                  value={entry.name}
                  onChange={e => updateEntry(index, 'name', e.target.value)}
                  required
                  placeholder="Full name"
                />
              </label>
              <label className="centered-label">
                <input
                  type="number"
                  onChange={e => updateEntry(index, 'salary', e.target.value)}
                  required
                  min="0"
                  step="1"
                  placeholder="Salary"
                />
              </label>
              <div className="departments-section">
                <h4>Departments</h4>
                {sortedCompanies.length > 0 ? (
                  sortedCompanies.map(company => (
                    <div key={company} className="company-departments">
                      <h5>{company}</h5>
                      <div className="department-list">
                        {sortedGroupedDepartments[company].map(dept => (
                          <label key={dept.id} className="department-checkbox">
                            <input
                              type="checkbox"
                              checked={entry.departmentNames.includes(dept.name)}
                              onChange={e => handleDepartmentChange(index, dept.name, e.target.checked)}
                            />
                            {dept.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No departments available</p>
                )}
              </div>
              <label className="manager-label">
                Manager:
                <input
                  type="checkbox"
                  checked={entry.manager}
                  onChange={e => updateEntry(index, 'manager', e.target.checked)}
                />
              </label>
            </div>
          ))}
        </div>
        <div className="actions">
          <button type="submit" className="primary">
            {editingEmployee ? 'Update' : 'Create'}
          </button>
          <button type="button" className="cancelbtt" onClick={onCancel}>
            Cancel
          </button>
          {!editingEmployee && employeeEntries.length < 10 && (
            <button type="button" className="primary" onClick={addEntry}>
              +
            </button>
          )}
        </div>
        {errors.length > 0 && (
          <div className="error-boundary mt-4">
            <h4>Errors</h4>
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default EmployeeCrudForm;