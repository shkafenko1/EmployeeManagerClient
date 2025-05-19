import axios from 'axios';

const getApiBaseURL = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
};

const apiClient = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

interface CompanyReturnDto {
  id: number;
  name: string;
  location: string;
}

interface CompanyDto {
  name: string;
  location: string;
}

interface DepartmentReturnDto {
  id: number;
  company: string;
  name: string;
}

interface DepartmentDto {
  company: string;
  name: string;
}

interface EmployeeDto {
  id: number;
  name: string;
  salary: number;
  departmentNames: string[];
  manager: boolean;
}

interface CreateEmployeeDto {
  name: string;
  salary: number;
  departmentNames: string[];
  manager: boolean;
}

interface UpdateDto {
  name: string;
  salary: number;
  manager: boolean;
}

interface DepartmentWithEmployees {
  department: DepartmentReturnDto;
  employees: EmployeeDto[];
}

interface BulkResponse {
  created: EmployeeDto[];
  errors: Record<string, Record<string, string>>;
}

const api = {
  getCompanies: () => apiClient.get('/company').then(res => res.data as CompanyReturnDto[]),
  getCompany: (id: number) => apiClient.get(`/company/${id}`).then(res => res.data as CompanyReturnDto),
  createCompany: (data: CompanyDto) => apiClient.post('/company', data).then(async res => {
    const newCompany = res.data as CompanyDto;
    const companies = await api.getCompanies();
    const createdCompany = companies.find(c => c.name === newCompany.name && c.location === newCompany.location);
    return createdCompany || { ...newCompany, id: companies.length + 1 } as CompanyReturnDto;
  }),
  updateCompany: (id: number, data: CompanyDto) => apiClient.put(`/company/${id}`, data).then(res => res.data as CompanyDto),
  deleteCompany: (id: number) => apiClient.delete(`/company/${id}`),
  getDepartments: () => apiClient.get('/departments').then(res => res.data as DepartmentReturnDto[]),
  getDepartment: (id: number) => apiClient.get(`/departments/${id}`).then(res => res.data as DepartmentReturnDto),
  createDepartment: (data: DepartmentDto) => apiClient.post('/departments', data).then(res => res.data as DepartmentReturnDto),
  updateDepartment: (id: number, data: DepartmentDto) => apiClient.put(`/departments/${id}`, data).then(res => res.data as DepartmentReturnDto),
  deleteDepartment: (id: number) => apiClient.delete(`/departments/${id}`),
  getDepartmentsWithEmployees: () => apiClient.get('/departments/unwrap').then(res => {
    const data = res.data as any[];
    return data.map((item: any) => ({
      department: item.department as DepartmentReturnDto,
      employees: item.employees as EmployeeDto[],
    })) as DepartmentWithEmployees[];
  }),
  getEmployeesByDepartment: (companyId: number, departmentName: string) =>
    apiClient.get(`/company/${companyId}/employees`, { params: { departmentName } }).then(res => res.data as EmployeeDto[]),
  getAllEmployees: () => apiClient.get('/employee').then(res => res.data as EmployeeDto[]),
  getEmployee: (id: number) => apiClient.get(`/employee/${id}`).then(res => res.data as CreateEmployeeDto),
  createEmployee: (data: CreateEmployeeDto) => apiClient.post('/employee/create', data).then(res => res.data as EmployeeDto),
  createEmployeesBulk: (data: CreateEmployeeDto[]) => apiClient.post('/employee/bulk', data).then(res => res.data as BulkResponse),
  updateEmployee: (id: number, data: UpdateDto) => apiClient.put(`/employee/${id}`, data).then(res => res.data as EmployeeDto),
  deleteEmployee: (id: number) => apiClient.delete(`/employee/${id}`),
};

export default api;

export type { CompanyReturnDto, CompanyDto, DepartmentReturnDto, DepartmentDto, EmployeeDto, CreateEmployeeDto, UpdateDto, DepartmentWithEmployees, BulkResponse };