import { useQuery } from '@tanstack/react-query'
import { metricsAPI } from '../services/api'
import { 
  Bot, 
  User, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart
} from 'lucide-react'
import Card from '../components/Card'

export default function AIAutomationDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['ai-automation-metrics'],
    queryFn: () => metricsAPI.getAIAutomation(30).then(res => res.data),
  })

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => metricsAPI.getDashboardSummary().then(res => res.data),
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center dark:text-white">Loading...</div>
  }

  const latestMetrics = summary?.latest_metrics?.ai_automation
  const history = metrics?.history || []

  // Calculate totals from history
  const totalProcessed = history.reduce((sum, m) => sum + (m.total_claims_processed || 0), 0)
  const totalAutoCoded = history.reduce((sum, m) => sum + (m.auto_coded_claims || 0), 0)
  const totalManualReview = history.reduce((sum, m) => sum + (m.manual_review_claims || 0), 0)
  const avgAutoCoded = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.auto_coded_percentage || 0), 0) / history.length 
    : 0
  const avgAIAccuracy = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.ai_accuracy_score || 0), 0) / history.length 
    : 0
  const avgConfidence = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.avg_confidence_score || 0), 0) / history.length 
    : 0

  const humanAccuracy = latestMetrics?.human_accuracy_score || 95.0

  // Rejection reasons data
  const rejectionReasons = latestMetrics?.rejection_reasons || {}
  const confidenceDistribution = latestMetrics?.confidence_distribution || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold dark:text-white">AI Automation Dashboard</h1>
        <p className="text-purple-100 dark:text-purple-200 mt-2">Monitor AI-powered coding automation performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Auto-coded</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{totalAutoCoded}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{avgAutoCoded.toFixed(1)}% of total</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Manual Review</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">{totalManualReview}</p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{(100 - avgAutoCoded).toFixed(1)}% of total</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">AI Accuracy</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{avgAIAccuracy.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">vs {humanAccuracy.toFixed(1)}% human</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg Confidence</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{(avgConfidence * 100).toFixed(1)}%</p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">Overall score</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* AI vs Human Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI vs Human Accuracy</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Accuracy</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{avgAIAccuracy.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full" 
                  style={{ width: `${avgAIAccuracy}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Human Accuracy</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">{humanAccuracy.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full" 
                  style={{ width: `${humanAccuracy}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2 border-t dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Gap:</span> {(humanAccuracy - avgAIAccuracy).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <PieChart className="w-5 h-5 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Auto-coding Distribution</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-coded</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{avgAutoCoded.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full" 
                  style={{ width: `${avgAutoCoded}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manual Review</span>
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">{(100 - avgAutoCoded).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-orange-500 h-3 rounded-full" 
                  style={{ width: `${100 - avgAutoCoded}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Rejection Reasons */}
      <Card>
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Rejection Reasons</h3>
        </div>
        <div className="space-y-3">
          {Object.keys(rejectionReasons).length > 0 ? (
            Object.entries(rejectionReasons).map(([reason, data]) => (
              <div key={reason} className="border dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                    {reason.replace(/_/g, ' ')}
                  </h4>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">{data.count} ({data.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No rejection data available</p>
          )}
        </div>
      </Card>

      {/* Confidence Score Distribution */}
      <Card>
        <div className="flex items-center mb-4">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confidence Score Distribution</h3>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(confidenceDistribution).length > 0 ? (
            Object.entries(confidenceDistribution).map(([range, count]) => (
              <div key={range} className="text-center">
                <div className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-purple-50 dark:to-purple-900/20 rounded-lg p-4 border dark:border-gray-700">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{range}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 col-span-5">No confidence data available</p>
          )}
        </div>
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Insight:</strong> Codes with confidence scores above 0.8 are typically auto-approved without human review.
          </p>
        </div>
      </Card>

      {/* Automation Trends */}
      <Card>
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Automation Trends (Last 30 Days)</h3>
        </div>
        <div className="space-y-2">
          {history.slice(-7).map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(metric.date).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {metric.auto_coded_percentage?.toFixed(1)}% auto
                </span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {metric.ai_accuracy_score?.toFixed(1)}% accuracy
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
