import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { DepartmentReturnDto } from '../services/api';
import { toast } from 'react-toastify';

function DepartmentList() {
  const [departments, setDepartments] = useState<DepartmentReturnDto[]>([]);
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId');

  useEffect(() => {
    api.getDepartments()
      .then(data => {
        console.log('Raw GET /departments response:', JSON.stringify(data, null, 2));
        if (!Array.isArray(data)) {
          console.error('Expected array, got:', data);
          toast.error('Invalid department data: Expected an array');
          setDepartments([]);
          return;
        }
        const filteredDepartments = companyId
          ? data.filter(d => d.company === companyId)
          : data;
        setDepartments(filteredDepartments);
      })
      .catch(err => {
        console.error('Error fetching departments:', err.message, err.response?.data);
        toast.error('Failed to load departments: ' + err.message);
        setDepartments([]);
      });
  }, [companyId]);

  return (
    <div className="department-list">
      <h2>Departments</h2>
      <Link to="/department/new" className="primary button">
        Add Department
      </Link>
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {departments.length ? (
            departments.map(dept => (
              <tr key={dept.id}>
                <td>
                  <Link to={`/company/${encodeURIComponent(dept.company)}`}>
                    {dept.company}
                  </Link>
                </td>
                <td>{dept.name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>No departments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentList;