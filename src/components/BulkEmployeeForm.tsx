import { useState } from 'react';
import { toast } from 'react-toastify';
import api, { DepartmentReturnDto, CreateEmployeeDto, EmployeeDto } from '../services/api';

interface BulkEmployeeFormProps {
  departments: DepartmentReturnDto[];
  onSuccess: (newEmployees: EmployeeDto[]) => void;
}

const BulkEmployeeForm: React.FC<BulkEmployeeFormProps> = ({ departments, onSuccess }) => {
  const [employeeEntries, setEmployeeEntries] = useState<CreateEmployeeDto[]>([
    { name: '', salary: 0, departmentNames: [], manager: false }, // Initialize salary as number
  ]);
  const [errors, setErrors] = useState<string[]>([]);

  const addEntry = () => {
    setEmployeeEntries(prev => [
      ...prev,
      { name: '', salary: 0, departmentNames: [], manager: false }, // Use number for salary
    ]);
  };

  const updateEntry = (index: number, field: keyof CreateEmployeeDto, value: string | string[] | boolean) => {
    setEmployeeEntries(prev => {
      const newEntries = [...prev];
      if (field === 'departmentNames') {
        newEntries[index][field] = value as string[]; // Type assertion for string[]
      } else if (field === 'manager') {
        newEntries[index][field] = value as boolean;
      } else if (field === 'salary') {
        const numValue = parseFloat(value as string); // Convert string to number
        newEntries[index][field] = isNaN(numValue) ? 0 : numValue; // Handle invalid numbers
      } else {
        newEntries[index][field] = value as string;
      }
      return newEntries;
    });
  };

  const removeEntry = (index: number) => {
    setEmployeeEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.createEmployeesBulk(employeeEntries);
      const { created, errors: apiErrors } = response;
      if (created.length > 0) {
        onSuccess(created);
      }
      if (Object.keys(apiErrors).length > 0) {
        setErrors(Object.entries(apiErrors).map(([name, err]) => `${name}: ${JSON.stringify(err)}`));
        toast.error('Some employees failed to create');
      } else {
        setEmployeeEntries([{ name: '', salary: 0, departmentNames: [], manager: false }]);
        setErrors([]);
      }
    } catch (err: any) {
      console.error('Error creating employees:', err.message);
      toast.error('Failed to create employees: ' + err.message);
      setErrors(['Failed to create employees']);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {employeeEntries.map((entry, index) => (
        <div key={index} className="mb-4 p-4 border border-gray-200 rounded">
          <label>
            Name
            <input
              type="text"
              value={entry.name}
              onChange={e => updateEntry(index, 'name', e.target.value)}
              required
            />
          </label>
          <label>
            Salary
            <input
              type="number"
              value={entry.salary}
              onChange={e => updateEntry(index, 'salary', e.target.value)} // Value is converted in updateEntry
              min="0"
              step="0.01"
              required
            />
          </label>
          <label>
            Departments
            <select
              multiple
              value={entry.departmentNames}
              onChange={e =>
                updateEntry(index, 'departmentNames', Array.from(e.target.selectedOptions, option => option.value))
              }
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Manager
            <input
              type="checkbox"
              checked={entry.manager}
              onChange={e => updateEntry(index, 'manager', e.target.checked)}
            />
          </label>
          {employeeEntries.length > 1 && (
            <button type="button" className="cancelbtt" onClick={() => removeEntry(index)}>
              Remove
            </button>
          )}
        </div>
      ))}
      <div className="actions">
        <button type="button" className="primary" onClick={addEntry}>
          Add Employee
        </button>
        <button type="submit" className="primary">
          Create Employees
        </button>
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
  );
};

export default BulkEmployeeForm;