import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { CompanyReturnDto } from '../services/api';
import { toast } from 'react-toastify';

function CompanyList() {
  const [companies, setCompanies] = useState<CompanyReturnDto[]>([]);

  useEffect(() => {
    api.getCompanies()
      .then(data => {
        console.log('Raw GET /company response:', JSON.stringify(data, null, 2));
        if (!Array.isArray(data)) {
          console.error('Expected array, got:', data);
          toast.error('Invalid company data: Expected an array');
          setCompanies([]);
          return;
        }
        setCompanies(data);
      })
      .catch(err => {
        console.error('Error fetching companies:', err.message, err.response?.data);
        toast.error('Failed to load companies: ' + err.message);
        setCompanies([]);
      });
  }, []);

  return (
    <div className="company-list">
      <h2>Company List</h2>
      <Link to="/company/new" className="primary button">
        Add Company
      </Link>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {companies.length ? (
            companies.map(company => (
              <tr key={company.id}>
                <td>
                  <Link to={`/company/${company.id}`}>
                    {company.name}
                  </Link>
                </td>
                <td>{company.location}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>No companies found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CompanyList;