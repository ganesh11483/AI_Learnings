import { useQuery } from '@tanstack/react-query'
import { metricsAPI } from '../services/api'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  FileText,
  Lock,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import Card from '../components/Card'

export default function ComplianceAuditDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['compliance-audit-metrics'],
    queryFn: () => metricsAPI.getComplianceAudit(30).then(res => res.data),
  })

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => metricsAPI.getDashboardSummary().then(res => res.data),
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const latestMetrics = summary?.latest_metrics?.compliance_audit
  const history = metrics?.history || []

  // Calculate totals from history
  const totalAudits = history.reduce((sum, m) => sum + (m.total_audits_performed || 0), 0)
  const totalPassed = history.reduce((sum, m) => sum + (m.audits_passed || 0), 0)
  const totalFailed = history.reduce((sum, m) => sum + (m.audits_failed || 0), 0)
  const totalHipaaViolations = history.reduce((sum, m) => sum + (m.hipaa_violations || 0), 0)
  const totalCodingErrors = history.reduce((sum, m) => sum + (m.coding_errors || 0), 0)
  const totalDocumentationErrors = history.reduce((sum, m) => sum + (m.documentation_errors || 0), 0)
  const avgComplianceScore = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.coding_compliance_score || 0), 0) / history.length 
    : 0

  const highRiskClaims = history.reduce((sum, m) => sum + (m.high_risk_claims || 0), 0)
  const mediumRiskClaims = history.reduce((sum, m) => sum + (m.medium_risk_claims || 0), 0)
  const lowRiskClaims = history.reduce((sum, m) => sum + (m.low_risk_claims || 0), 0)

  const auditFindings = latestMetrics?.audit_findings || []
  const violationTypes = latestMetrics?.violation_types || {}

  const passRate = totalAudits > 0 ? ((totalPassed / totalAudits) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Compliance & Audit Dashboard</h1>
        <p className="text-orange-100 mt-2">Monitor coding compliance, audit findings, and regulatory compliance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Compliance Score</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{avgComplianceScore.toFixed(1)}%</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">+2.3% improvement</span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Audits</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalAudits}</p>
              <p className="text-sm text-blue-600 mt-1">{passRate}% pass rate</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">HIPAA Violations</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{totalHipaaViolations}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">-15% from last month</span>
              </div>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coding Errors</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{totalCodingErrors}</p>
              <p className="text-sm text-orange-600 mt-1">Detected in audits</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Audit Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center mb-4">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Audits Passed</h3>
          </div>
          <p className="text-4xl font-bold text-green-600">{totalPassed}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${passRate}%` }}
            ></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <XCircle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Audits Failed</h3>
          </div>
          <p className="text-4xl font-bold text-red-600">{totalFailed}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-red-500 h-2 rounded-full" 
              style={{ width: `${100 - passRate}%` }}
            ></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Documentation Errors</h3>
          </div>
          <p className="text-4xl font-bold text-orange-600">{totalDocumentationErrors}</p>
          <p className="text-sm text-gray-500 mt-2">Missing or incomplete</p>
        </Card>
      </div>

      {/* Risk Categories */}
      <Card>
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Risk Categories</h3>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <p className="text-sm font-semibold text-red-800 uppercase tracking-wider">High Risk</p>
            <p className="text-4xl font-bold text-red-600 mt-2">{highRiskClaims}</p>
            <p className="text-sm text-red-600 mt-1">Claims requiring immediate attention</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
            <p className="text-sm font-semibold text-yellow-800 uppercase tracking-wider">Medium Risk</p>
            <p className="text-4xl font-bold text-yellow-600 mt-2">{mediumRiskClaims}</p>
            <p className="text-sm text-yellow-600 mt-1">Claims requiring review</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <p className="text-sm font-semibold text-green-800 uppercase tracking-wider">Low Risk</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{lowRiskClaims}</p>
            <p className="text-sm text-green-600 mt-1">Claims within normal parameters</p>
          </div>
        </div>
      </Card>

      {/* Violation Types */}
      <Card>
        <div className="flex items-center mb-4">
          <Lock className="w-5 h-5 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Violation Types</h3>
        </div>
        <div className="space-y-3">
          {Object.keys(violationTypes).length > 0 ? (
            Object.entries(violationTypes).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {type === 'hipaa' && <Lock className="w-5 h-5 text-red-500" />}
                  {type === 'coding' && <FileText className="w-5 h-5 text-orange-500" />}
                  {type === 'documentation' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                  <span className="font-semibold text-gray-900 capitalize">{type}</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{count}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No violations recorded</p>
          )}
        </div>
      </Card>

      {/* Audit Findings */}
      <Card>
        <div className="flex items-center mb-4">
          <Shield className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recent Audit Findings</h3>
        </div>
        <div className="space-y-3">
          {auditFindings.length > 0 ? (
            auditFindings.map((finding, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      finding.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      finding.severity === 'high' ? 'bg-red-50 text-red-700' :
                      finding.severity === 'medium' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {finding.severity.toUpperCase()}
                    </span>
                    <span className="font-semibold text-gray-900 capitalize">{finding.category}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{finding.count} occurrences</span>
                </div>
                <p className="text-sm text-gray-600">
                  {finding.category === 'coding' && 'Incorrect medical codes detected during audit review.'}
                  {finding.category === 'documentation' && 'Insufficient or missing documentation for claims.'}
                  {finding.category === 'hipaa' && 'Potential HIPAA compliance issues identified.'}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent audit findings</p>
          )}
        </div>
      </Card>

      {/* Compliance Trend */}
      <Card>
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Compliance Score Trend (Last 30 Days)</h3>
        </div>
        <div className="space-y-2">
          {history.slice(-7).map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                {new Date(metric.date).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">
                  {metric.coding_compliance_score?.toFixed(1)}% score
                </span>
                <span className={`text-sm font-semibold ${
                  metric.coding_compliance_score >= 95 ? 'text-green-600' :
                  metric.coding_compliance_score >= 85 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {metric.coding_compliance_score >= 95 ? 'Excellent' :
                   metric.coding_compliance_score >= 85 ? 'Good' :
                   'Needs Improvement'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Compliance Actions */}
      <Card>
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
        </div>
        <div className="space-y-3">
          {totalHipaaViolations > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Lock className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Address HIPAA Violations</p>
                  <p className="text-sm text-red-600 mt-1">
                    {totalHipaaViolations} HIPAA violation(s) detected. Review privacy policies and staff training immediately.
                  </p>
                </div>
              </div>
            </div>
          )}
          {totalCodingErrors > 10 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-800">Improve Coding Accuracy</p>
                  <p className="text-sm text-orange-600 mt-1">
                    High coding error rate detected. Consider additional coder training and implement double-check procedures.
                  </p>
                </div>
              </div>
            </div>
          )}
          {avgComplianceScore < 90 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800">Enhance Compliance Processes</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Compliance score below target. Review documentation requirements and implement quality assurance checks.
                  </p>
                </div>
              </div>
            </div>
          )}
          {avgComplianceScore >= 95 && totalHipaaViolations === 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800">Excellent Compliance Status</p>
                  <p className="text-sm text-green-600 mt-1">
                    Your compliance metrics are within acceptable ranges. Continue monitoring and maintaining current standards.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
