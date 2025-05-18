import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { EmployeeDto } from '../services/api';

interface CompanyInfo {
  id: number;
  name: string;
}

function Salaries() {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [departmentToCompany, setDepartmentToCompany] = useState<{ [key: string]: CompanyInfo }>({});
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true at the start
        // Fetch employees
        const employeeData = await api.getAllEmployees();
        console.log('Raw GET /employee response:', JSON.stringify(employeeData, null, 2));
        if (!Array.isArray(employeeData)) {
          console.error('Expected array, got:', employeeData);
          toast.error('Invalid employee data: Expected an array');
          setEmployees([]);
          return;
        }
        const sortedEmployees = employeeData.sort((a, b) => b.salary - a.salary);
        setEmployees(sortedEmployees);

        // Fetch departments and companies
        const [departmentData, companyData] = await Promise.all([
          api.getDepartments(),
          api.getCompanies(),
        ]);

        console.log('Raw GET /departments response:', JSON.stringify(departmentData, null, 2));
        console.log('Raw GET /company response:', JSON.stringify(companyData, null, 2));

        // Create department-to-company mapping
        const mapping: { [key: string]: CompanyInfo } = {};
        departmentData.forEach(dept => {
          const company = companyData.find(comp => comp.name === dept.company);
          if (company) {
            mapping[dept.name] = { id: company.id, name: company.name };
          }
        });
        setDepartmentToCompany(mapping);
      } catch (err: any) {
        console.error('Error fetching data:', err.message, err.response?.data);
        toast.error('Failed to load data: ' + err.message);
        setEmployees([]);
        setDepartmentToCompany({});
      } finally {
        setLoading(false); // Set loading to false when done
      }
    };

    fetchData();
  }, []);

  const getCompanyInfo = (departmentNames: string[]): CompanyInfo | null => {
    if (!departmentNames.length) return null;
    const firstDept = departmentNames[0];
    return departmentToCompany[firstDept] || null;
  };

  const topThree = employees.slice(0, 3);

  return (
    <div className="salaries">
      <h2>Employee Salaries</h2>
      <div className="highlight-section">
        <h3>Top 3 Earners</h3>
        {loading ? (
          <div className="loader-wrapper">
            <div className="loader"></div>
          </div>
        ) : topThree.length ? (
          <div className="highlight-list">
            {topThree.map(emp => {
              const companyInfo = getCompanyInfo(emp.departmentNames);
              return (
                <div key={emp.id} className="highlight-item">
                  <p><strong>{emp.name}</strong></p>
                  <p>Salary: ${emp.salary.toFixed(0)}</p>
                  <p>
                    Company:{' '}
                    {companyInfo ? (
                      <Link to={`/company/${companyInfo.id}`}>{companyInfo.name}</Link>
                    ) : (
                      'Unknown'
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p>No employees found.</p>
        )}
      </div>
      <h3>All Employees</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Salary</th>
            <th>Company</th>
            <th>Manager</th>
          </tr>
        </thead>
        <tbody>
          {employees.length ? (
            employees.map(emp => {
              const companyInfo = getCompanyInfo(emp.departmentNames);
              return (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>${emp.salary.toFixed(0)}</td>
                  <td>
                    {companyInfo ? (
                      <Link to={`/company/${companyInfo.id}`}>{companyInfo.name}</Link>
                    ) : (
                      'Unknown'
                    )}
                  </td>
                  <td>{emp.manager ? 'Yes' : 'No'}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4}>No employees found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Salaries;