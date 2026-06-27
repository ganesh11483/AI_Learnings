import { useQuery } from '@tanstack/react-query'
import { metricsAPI } from '../services/api'
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar
} from 'lucide-react'
import Card from '../components/Card'

export default function ClaimsProcessingDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['claims-processing-metrics'],
    queryFn: () => metricsAPI.getClaimsProcessing(30).then(res => res.data),
  })

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => metricsAPI.getDashboardSummary().then(res => res.data),
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const latestMetrics = summary?.latest_metrics?.claims_processing
  const history = metrics?.history || []

  // Calculate totals from history
  const totalProcessed = history.reduce((sum, m) => sum + (m.total_claims_processed || 0), 0)
  const totalApproved = history.reduce((sum, m) => sum + (m.claims_approved || 0), 0)
  const totalDenied = history.reduce((sum, m) => sum + (m.claims_denied || 0), 0)
  const totalPending = history.reduce((sum, m) => sum + (m.claims_pending || 0), 0)
  const totalValue = history.reduce((sum, m) => sum + (m.total_claims_value || 0), 0)
  const avgTAT = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.avg_turnaround_time_hours || 0), 0) / history.length 
    : 0

  const approvalRate = totalProcessed > 0 ? ((totalApproved / totalProcessed) * 100).toFixed(1) : 0
  const denialRate = totalProcessed > 0 ? ((totalDenied / totalProcessed) * 100).toFixed(1) : 0

  // Payer performance data
  const payerPerformance = latestMetrics?.payer_performance || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Claims Processing Dashboard</h1>
        <p className="text-blue-100 mt-2">Monitor claims processing performance and metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Claims</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalProcessed}</p>
              <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalApproved}</p>
              <p className="text-sm text-green-600 mt-1">{approvalRate}% approval rate</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Denied</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{totalDenied}</p>
              <p className="text-sm text-red-600 mt-1">{denialRate}% denial rate</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{totalPending}</p>
              <p className="text-sm text-yellow-600 mt-1">Awaiting processing</p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Total Claims Value</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+8.5% from last month</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Avg Turnaround Time</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgTAT.toFixed(1)} hrs</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">-12% improvement</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Processing Rate</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{(totalProcessed / 30).toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-2">claims per day</p>
        </Card>
      </div>

      {/* Payer Performance */}
      <Card>
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Payer-wise Performance</h3>
        </div>
        <div className="space-y-4">
          {Object.entries(payerPerformance).length > 0 ? (
            Object.entries(payerPerformance).map(([payer, data]) => (
              <div key={payer} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-900">{payer}</h4>
                  <span className="text-sm text-gray-500">${data.total_value?.toLocaleString() || 0}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Approved</p>
                    <p className="font-semibold text-green-600">{data.approved || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Denied</p>
                    <p className="font-semibold text-red-600">{data.denied || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rate</p>
                    <p className="font-semibold text-blue-600">
                      {data.approved + data.denied > 0 
                        ? ((data.approved / (data.approved + data.denied)) * 100).toFixed(1) 
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No payer data available</p>
          )}
        </div>
      </Card>

      {/* Claims Status Distribution */}
      <Card>
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Claims Status Distribution</h3>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Approved</span>
              <span className="text-sm font-medium text-gray-700">{totalApproved} ({approvalRate}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${approvalRate}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Denied</span>
              <span className="text-sm font-medium text-gray-700">{totalDenied} ({denialRate}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${denialRate}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Pending</span>
              <span className="text-sm font-medium text-gray-700">{totalPending} ({((totalPending / totalProcessed) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${(totalPending / totalProcessed) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
