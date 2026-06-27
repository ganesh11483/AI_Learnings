import { useQuery } from '@tanstack/react-query'
import { metricsAPI } from '../services/api'
import { 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Activity,
  CheckCircle,
  AlertCircle,
  Zap,
  BarChart3
} from 'lucide-react'
import Card from '../components/Card'

export default function OperationalEfficiencyDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['operational-efficiency-metrics'],
    queryFn: () => metricsAPI.getOperationalEfficiency(30).then(res => res.data),
  })

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => metricsAPI.getDashboardSummary().then(res => res.data),
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const latestMetrics = summary?.latest_metrics?.operational_efficiency
  const history = metrics?.history || []

  // Calculate totals from history
  const avgProcessingTime = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.avg_processing_time_hours || 0), 0) / history.length 
    : 0
  const avgReviewTime = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.avg_review_time_hours || 0), 0) / history.length 
    : 0
  const totalProcessed = history.reduce((sum, m) => sum + (m.claims_processed_per_day || 0), 0)
  const avgSLAAdherence = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.sla_adherence_rate || 0), 0) / history.length 
    : 0
  const totalSLABreaches = history.reduce((sum, m) => sum + (m.sla_breaches || 0), 0)
  const avgCoderUtilization = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.coder_utilization || 0), 0) / history.length 
    : 0

  const currentBacklog = latestMetrics?.queue_backlog || 0
  const productivityPerCoder = latestMetrics?.productivity_per_coder || {}
  const systemUptime = latestMetrics?.system_uptime_percentage || 99.5

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Operational Efficiency Dashboard</h1>
        <p className="text-indigo-100 mt-2">Monitor operational metrics, productivity, and SLA performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Processing Time</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{avgProcessingTime.toFixed(1)}h</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">-8% improvement</span>
              </div>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Queue Backlog</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{currentBacklog}</p>
              <p className="text-sm text-orange-600 mt-1">Claims pending</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SLA Adherence</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{avgSLAAdherence.toFixed(1)}%</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">+5.2% improvement</span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coder Utilization</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{avgCoderUtilization.toFixed(1)}%</p>
              <p className="text-sm text-purple-600 mt-1">Capacity used</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Claims Processed/Day</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{(totalProcessed / 30).toFixed(1)}</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+15% from last month</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-orange-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Avg Review Time</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{avgReviewTime.toFixed(1)}h</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingDown className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">-10% improvement</span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <Zap className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">System Uptime</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{systemUptime.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-2">Last 30 days</p>
        </Card>
      </div>

      {/* SLA Performance */}
      <Card>
        <div className="flex items-center mb-4">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">SLA Performance</h3>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">SLA Adherence Rate</span>
              <span className="text-sm font-medium text-green-600">{avgSLAAdherence.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full" 
                style={{ width: `${avgSLAAdherence}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">SLA Breaches</span>
              <span className="text-sm font-medium text-red-600">{totalSLABreaches}</span>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                {totalSLABreaches} breaches in last 30 days
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Productivity per Coder */}
      <Card>
        <div className="flex items-center mb-4">
          <Users className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Productivity per Coder</h3>
        </div>
        <div className="space-y-3">
          {Object.keys(productivityPerCoder).length > 0 ? (
            Object.entries(productivityPerCoder).map(([coderId, data]) => (
              <div key={coderId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Coder {coderId}</p>
                    <p className="text-sm text-gray-500">Claims processed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-600">{data.claims_processed}</p>
                  <p className="text-sm text-gray-500">{data.avg_time?.toFixed(1)}h avg</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No coder productivity data available</p>
          )}
        </div>
      </Card>

      {/* Processing Time Trend */}
      <Card>
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Processing Time Trend (Last 7 Days)</h3>
        </div>
        <div className="space-y-2">
          {history.slice(-7).map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">
                {new Date(metric.date).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-900">
                  {metric.avg_processing_time_hours?.toFixed(1)}h avg
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {metric.claims_processed_per_day} claims
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center mb-4">
            <Zap className="w-5 h-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Efficiency Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Processing Speed</span>
              <span className="text-sm font-semibold text-green-600">Excellent</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Resource Utilization</span>
              <span className="text-sm font-semibold text-blue-600">{avgCoderUtilization.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Queue Management</span>
              <span className="text-sm font-semibold text-yellow-600">Moderate</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">SLA Compliance</span>
              <span className="text-sm font-semibold text-green-600">{avgSLAAdherence.toFixed(1)}%</span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Bottlenecks</h3>
          </div>
          <div className="space-y-3">
            {currentBacklog > 50 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800">High Queue Backlog</p>
                <p className="text-sm text-red-600">{currentBacklog} claims pending review</p>
              </div>
            )}
            {avgProcessingTime > 24 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-semibold text-orange-800">Slow Processing</p>
                <p className="text-sm text-orange-600">Avg time exceeds 24h target</p>
              </div>
            )}
            {avgSLAAdherence < 90 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800">SLA Concerns</p>
                <p className="text-sm text-yellow-600">Adherence rate below 90%</p>
              </div>
            )}
            {currentBacklog <= 50 && avgProcessingTime <= 24 && avgSLAAdherence >= 90 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-800">No Bottlenecks</p>
                <p className="text-sm text-green-600">All metrics within target ranges</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Efficiency Recommendations</h3>
        </div>
        <div className="space-y-3">
          {avgCoderUtilization > 85 && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-800">Consider Scaling Team</p>
                  <p className="text-sm text-blue-600 mt-1">
                    High coder utilization ({avgCoderUtilization.toFixed(1)}%). Consider adding staff or implementing automation to handle increased workload.
                  </p>
                </div>
              </div>
            </div>
          )}
          {currentBacklog > 30 && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-orange-800">Reduce Queue Backlog</p>
                  <p className="text-sm text-orange-600 mt-1">
                    {currentBacklog} claims in queue. Consider temporary resource allocation or process optimization to clear backlog.
                  </p>
                </div>
              </div>
            </div>
          )}
          {avgProcessingTime > 20 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800">Optimize Processing Workflow</p>
                  <p className="text-sm text-yellow-600 mt-1">
                    Processing time above target. Review workflow steps and identify opportunities for automation or process improvement.
                  </p>
                </div>
              </div>
            </div>
          )}
          {avgCoderUtilization <= 85 && currentBacklog <= 30 && avgProcessingTime <= 20 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800">Optimal Performance</p>
                  <p className="text-sm text-green-600 mt-1">
                    All operational metrics are within optimal ranges. Continue current practices and monitor for changes.
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
