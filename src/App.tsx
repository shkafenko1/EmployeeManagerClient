import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Component, ReactNode } from 'react';
import Home from './components/Home';
import CompanyPage from './components/CompanyPage';
import Salaries from './components/Salaries';
import DepartmentRanking from './components/DepartmentRanking';
import EmployeeManagement from './components/EmployeeManagement';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Error</h2>
          <p>Something went wrong. Check the console for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  console.log('Rendering App with Router context');
  return (
    <Router>
      <ErrorBoundary>
        <div className="app-wrapper">
          <header>
            <h1>
              <Link to="/">Employee Manager</Link>
            </h1>
            <nav>
              <Link to="/salaries">Salaries</Link>
              <Link to="/department-ranking">Department Ranking</Link>
              <Link to="/employees">Manage Employees</Link>
            </nav>
          </header>
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/company/:id" element={<CompanyPage />} />
              <Route path="/salaries" element={<Salaries />} />
              <Route path="/department-ranking" element={<DepartmentRanking />} />
              <Route path="/employees" element={<EmployeeManagement />} />
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </ErrorBoundary>
    </Router>
  );
};

export default App;