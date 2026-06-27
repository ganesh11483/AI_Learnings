import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import Claims from './pages/Claims'
import ClaimDetails from './pages/ClaimDetails'
import Patients from './pages/Patients'
import Audit from './pages/Audit'
import Settings from './pages/Settings'
import ClaimsProcessingDashboard from './pages/ClaimsProcessingDashboard'
import AIAutomationDashboard from './pages/AIAutomationDashboard'
import RevenueFinancialDashboard from './pages/RevenueFinancialDashboard'
import ComplianceAuditDashboard from './pages/ComplianceAuditDashboard'
import OperationalEfficiencyDashboard from './pages/OperationalEfficiencyDashboard'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="documents" element={<Documents />} />
        <Route path="claims" element={<Claims />} />
        <Route path="claims/:id" element={<ClaimDetails />} />
        <Route path="patients" element={<Patients />} />
        <Route path="audit" element={<Audit />} />
        <Route path="settings" element={<Settings />} />
        <Route path="metrics/claims-processing" element={<ClaimsProcessingDashboard />} />
        <Route path="metrics/ai-automation" element={<AIAutomationDashboard />} />
        <Route path="metrics/revenue-financial" element={<RevenueFinancialDashboard />} />
        <Route path="metrics/compliance-audit" element={<ComplianceAuditDashboard />} />
        <Route path="metrics/operational-efficiency" element={<OperationalEfficiencyDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
