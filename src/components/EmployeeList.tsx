import { Link } from 'react-router-dom';
import { EmployeeDto, DepartmentReturnDto, CompanyReturnDto } from '../services/api';

interface EmployeeListProps {
  employees: EmployeeDto[];
  departments: DepartmentReturnDto[];
  companies: CompanyReturnDto[];
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, departments, companies }) => {
  const getCompanyInfo = (departmentNames: string[]) => {
    const companyMap: { [key: string]: { id: number; name: string; departments: string[] } } = {};
    departmentNames.forEach(deptName => {
      const dept = departments.find(d => d.name === deptName);
      if (dept) {
        const company = companies.find(c => c.name === dept.company);
        if (company) {
          if (!companyMap[dept.company]) {
            companyMap[dept.company] = { id: company.id, name: company.name, departments: [] };
          }
          companyMap[dept.company].departments.push(deptName);
        }
      }
    });
    return companyMap;
  };

  const groupedEmployees = employees.reduce((acc, emp) => {
    const firstLetter = emp.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(emp);
    return acc;
  }, {} as Record<string, EmployeeDto[]>);

  const letters = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').filter(letter => groupedEmployees[letter]);

  return (
    <div className="employee-list">
      {letters.length > 0 ? (
        letters.map(letter => (
          <div key={letter} className="letter-section">
            <h3>{letter}</h3>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Salary</th>
                  <th>Manager</th>
                  <th>Occupation</th>
                </tr>
              </thead>
              <tbody>
                {groupedEmployees[letter].map(emp => {
                  const companyMap = getCompanyInfo(emp.departmentNames);
                  const companyDeptDisplay = Object.entries(companyMap)
                    .map(([companyName, info]) => (
                      <span key={info.id}>
                        <Link to={`/company/${info.id}`}>{companyName}</Link>: {info.departments.join(', ')}
                      </span>
                    ))
                    .reduce((prev, curr, index) => (
                      <>
                        {prev}
                        {index > 0 && '; '}
                        {curr}
                      </>
                    ), <></>) || 'None: None';

                  return (
                    <tr key={emp.id}>
                      <td>{emp.name}</td>
                      <td>${parseFloat(emp.salary.toString()).toFixed(2)}</td>
                      <td>{emp.manager ? 'Yes' : 'No'}</td>
                      <td><div className='occupation-scroll'>{companyDeptDisplay}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>No employees found.</p>
      )}
    </div>
  );
};

export default EmployeeList;