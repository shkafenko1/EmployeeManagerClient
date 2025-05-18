import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { DepartmentWithEmployees, CompanyReturnDto } from '../services/api';

function DepartmentRanking() {
  const [departments, setDepartments] = useState<DepartmentWithEmployees[]>([]);
  const [companyMap, setCompanyMap] = useState<{ [key: string]: { id: number; name: string } }>({});
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true at the start
        // Fetch departments and companies
        const [departmentData, companyData] = await Promise.all([
          api.getDepartmentsWithEmployees(),
          api.getCompanies(),
        ]);

        console.log('Raw GET /departments/unwrap response:', JSON.stringify(departmentData, null, 2));
        console.log('Raw GET /company response:', JSON.stringify(companyData, null, 2));

        if (!Array.isArray(departmentData)) {
          console.error('Expected array, got:', departmentData);
          toast.error('Invalid department data: Expected an array');
          setDepartments([]);
          return;
        }

        // Create company mapping
        const mapping: { [key: string]: { id: number; name: string } } = {};
        companyData.forEach((company: CompanyReturnDto) => {
          mapping[company.name] = { id: company.id, name: company.name };
        });
        setCompanyMap(mapping);

        const sortedDepartments = departmentData.sort((a, b) => b.employees.length - a.employees.length);
        setDepartments(sortedDepartments);
      } catch (err: any) {
        console.error('Error fetching departments:', err.message, err.response?.data);
        toast.error('Failed to load departments: ' + err.message);
        setDepartments([]);
        setCompanyMap({});
      } finally {
        setLoading(false); // Set loading to false when done
      }
    };

    fetchData();
  }, []);

  const topThree = departments.slice(0, 3);

  return (
    <div className="department-ranking">
      <h2>Department Rankings</h2>
      <div className="highlight-section">
        <h3>Top 3 Departments by Employee Count</h3>
        {loading ? (
          <div className="loader-wrapper">
            <div className="loader"></div>
          </div>
        ) : topThree.length ? (
          <div className="highlight-list">
            {topThree.map(dept => (
              <div key={dept.department.id} className="highlight-item">
                <p><strong>{dept.department.name}</strong></p>
                <p>
                  Company:{' '}
                  {companyMap[dept.department.company] ? (
                    <Link to={`/company/${companyMap[dept.department.company].id}`}>
                      {dept.department.company}
                    </Link>
                  ) : (
                    dept.department.company
                  )}
                </p>
                <p>Employee Count: {dept.employees.length}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No departments found.</p>
        )}
      </div>
      <h3>All Departments</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Company</th>
            <th>Employee Count</th>
          </tr>
        </thead>
        <tbody>
          {departments.length ? (
            departments.map(dept => (
              <tr key={dept.department.id}>
                <td>{dept.department.name}</td>
                <td>
                  {companyMap[dept.department.company] ? (
                    <Link to={`/company/${companyMap[dept.department.company].id}`}>
                      {dept.department.company}
                    </Link>
                  ) : (
                    dept.department.company
                  )}
                </td>
                <td>{dept.employees.length}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No departments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentRanking;