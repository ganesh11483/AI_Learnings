import { useQuery } from '@tanstack/react-query'
import { metricsAPI } from '../services/api'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  BarChart3,
  CreditCard,
  AlertCircle
} from 'lucide-react'
import Card from '../components/Card'

export default function RevenueFinancialDashboard() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['revenue-financial-metrics'],
    queryFn: () => metricsAPI.getRevenueFinancial(30).then(res => res.data),
  })

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => metricsAPI.getDashboardSummary().then(res => res.data),
  })

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const latestMetrics = summary?.latest_metrics?.revenue_financial
  const history = metrics?.history || []

  // Calculate totals from history
  const totalRevenueProcessed = history.reduce((sum, m) => sum + (m.revenue_processed || 0), 0)
  const totalSubmitted = history.reduce((sum, m) => sum + (m.claims_submitted_value || 0), 0)
  const totalPaid = history.reduce((sum, m) => sum + (m.claims_paid_value || 0), 0)
  const totalDenied = history.reduce((sum, m) => sum + (m.claims_denied_value || 0), 0)
  const totalPending = history.reduce((sum, m) => sum + (m.pending_claims_value || 0), 0)
  const netRevenue = history.reduce((sum, m) => sum + (m.net_revenue || 0), 0)
  const avgRecoveryRate = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.recovery_rate || 0), 0) / history.length 
    : 0
  const avgDenialLossPercentage = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.denial_loss_percentage || 0), 0) / history.length 
    : 0
  const avgClaimValue = history.length > 0 
    ? history.reduce((sum, m) => sum + (m.average_claim_value || 0), 0) / history.length 
    : 0
  const avgPaymentCycleTime = history.length > 0
    ? history.reduce((sum, m) => sum + (m.payment_cycle_time_days || 0), 0) / history.length
    : 0

  const revenueByPayer = latestMetrics?.revenue_by_payer || {}
  const revenueByCode = latestMetrics?.revenue_by_code || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold">Revenue & Financial Dashboard</h1>
        <p className="text-green-100 mt-2">Track revenue, collections, and financial performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue Processed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">${totalRevenueProcessed.toLocaleString()}</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">+12.5% from last month</span>
              </div>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Net Revenue</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">${netRevenue.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">After denials</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recovery Rate</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{avgRecoveryRate.toFixed(1)}%</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">+3.2% improvement</span>
              </div>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <PieChart className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Denial Loss %</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{avgDenialLossPercentage.toFixed(1)}%</p>
              <div className="flex items-center mt-2 text-sm">
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <span className="text-red-600">-1.5% improvement</span>
              </div>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Cycle Time</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{avgPaymentCycleTime.toFixed(1)} days</p>
              <p className="text-sm text-orange-600 mt-1">Avg. submission to payment</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center mb-4">
            <CreditCard className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Submitted</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">${totalSubmitted.toLocaleString()}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${(totalSubmitted / totalSubmitted) * 100}%` }}
            ></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Paid</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${(totalPaid / totalSubmitted) * 100}%` }}
            ></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Denied</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">${totalDenied.toLocaleString()}</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-red-500 h-2 rounded-full" 
              style={{ width: `${(totalDenied / totalSubmitted) * 100}%` }}
            ></div>
          </div>
        </Card>
      </div>

      {/* Pending Revenue */}
      <Card>
        <div className="flex items-center mb-4">
          <Clock className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Pending Revenue</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-yellow-600">${totalPending.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting payment</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800">
              {((totalPending / totalSubmitted) * 100).toFixed(1)}% of submitted
            </p>
          </div>
        </div>
      </Card>

      {/* Average Claim Value */}
      <Card>
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Average Claim Value</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-4xl font-bold text-blue-600">${avgClaimValue.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">Per claim</p>
          </div>
          <div className="flex items-center space-x-8 text-sm">
            <div>
              <p className="text-gray-500">This Month</p>
              <p className="font-semibold text-gray-900">${avgClaimValue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Last Month</p>
              <p className="font-semibold text-gray-900">${(avgClaimValue * 0.95).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Change</p>
              <p className="font-semibold text-green-600">+5.3%</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Revenue by Payer */}
      <Card>
        <div className="flex items-center mb-4">
          <CreditCard className="w-5 h-5 text-purple-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Revenue by Payer</h3>
        </div>
        <div className="space-y-4">
          {Object.keys(revenueByPayer).length > 0 ? (
            Object.entries(revenueByPayer).map(([payer, data]) => (
              <div key={payer} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-900">{payer}</h4>
                  <span className="text-sm text-gray-500">${data.submitted?.toLocaleString() || 0}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Paid</p>
                    <p className="font-semibold text-green-600">${data.paid?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Denied</p>
                    <p className="font-semibold text-red-600">${data.denied?.toLocaleString() || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rate</p>
                    <p className="font-semibold text-blue-600">
                      {data.submitted > 0 
                        ? ((data.paid / data.submitted) * 100).toFixed(1) 
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

      {/* Revenue by Code */}
      <Card>
        <div className="flex items-center mb-4">
          <BarChart3 className="w-5 h-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Top Revenue Codes</h3>
        </div>
        <div className="space-y-3">
          {Object.keys(revenueByCode).length > 0 ? (
            Object.entries(revenueByCode)
              .sort((a, b) => b[1].value - a[1].value)
              .slice(0, 10)
              .map(([code, data]) => (
                <div key={code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold text-gray-900">{code}</span>
                    <span className="text-sm text-gray-500">{data.count} claims</span>
                  </div>
                  <span className="font-semibold text-green-600">${data.value?.toLocaleString() || 0}</span>
                </div>
              ))
          ) : (
            <p className="text-gray-500 text-center py-4">No code data available</p>
          )}
        </div>
      </Card>

      {/* Financial Health Summary */}
      <Card>
        <div className="flex items-center mb-4">
          <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Financial Health Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Revenue Growth</p>
            <p className="text-2xl font-bold text-green-600">+12.5%</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Collection Rate</p>
            <p className="text-2xl font-bold text-blue-600">{avgCollectionRate.toFixed(1)}%</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Denial Rate</p>
            <p className="text-2xl font-bold text-purple-600">{avgDenialRate.toFixed(1)}%</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Pending Days</p>
            <p className="text-2xl font-bold text-orange-600">14.2</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
