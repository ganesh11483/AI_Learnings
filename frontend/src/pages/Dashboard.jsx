import { useQuery } from '@tanstack/react-query'
import { documentAPI, claimAPI, patientAPI } from '../services/api'
import { 
  FileText, 
  Receipt, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react'
import Card from '../components/Card'

export default function Dashboard() {
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentAPI.list().then(res => res.data),
  })

  const { data: claims } = useQuery({
    queryKey: ['claims'],
    queryFn: () => claimAPI.list().then(res => res.data),
  })

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientAPI.list().then(res => res.data),
  })

  const stats = [
    {
      name: 'Total Patients',
      value: patients?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Documents Processed',
      value: documents?.length || 0,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      name: 'Claims Submitted',
      value: claims?.length || 0,
      icon: Receipt,
      color: 'bg-purple-500',
    },
    {
      name: 'Approved Claims',
      value: claims?.filter(c => c.status === 'approved').length || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
    },
  ]

  const recentActivity = [
    { type: 'document', message: 'Document uploaded for patient #12345', time: '2 hours ago' },
    { type: 'claim', message: 'Claim #CLM-001 submitted', time: '4 hours ago' },
    { type: 'coding', message: 'ICD-10 code E11.9 suggested', time: '5 hours ago' },
    { type: 'validation', message: 'Claim validation completed', time: '6 hours ago' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold dark:text-white">Welcome to MedCoding AI</h1>
        <p className="text-primary-100 mt-2 dark:text-primary-200">Medical Coding & Claims Automation System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={stat.name} className="hover:shadow-lg transition-all hover:scale-105">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                <div className="flex items-center mt-2 text-xs">
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  <span className="text-green-600 dark:text-green-400">+12% from last month</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  {activity.type === 'document' && <FileText className="w-5 h-5 text-blue-500" />}
                  {activity.type === 'claim' && <Receipt className="w-5 h-5 text-purple-500" />}
                  {activity.type === 'coding' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {activity.type === 'validation' && <Clock className="w-5 h-5 text-orange-500" />}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-medium flex items-center justify-center">
              <FileText className="w-4 h-4 mr-2" />
              Upload New Document
            </button>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-medium flex items-center justify-center">
              <Receipt className="w-4 h-4 mr-2" />
              Create New Claim
            </button>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 font-medium flex items-center justify-center">
              <Users className="w-4 h-4 mr-2" />
              Add New Patient
            </button>
          </div>
        </Card>
      </div>

      {/* Pending Items */}
      <Card>
        <div className="flex items-center mb-4">
          <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Action Required</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 dark:from-yellow-900/20 to-orange-50 dark:to-orange-900/20 rounded-lg border border-yellow-100 dark:border-yellow-700 hover:shadow-md transition-shadow">
            <div className="flex items-center flex-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">3 documents awaiting coding review</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Review suggested codes before approval</p>
              </div>
            </div>
            <button className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 text-sm font-semibold px-3 py-1 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded transition-colors">
              Review Now
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 dark:from-blue-900/20 to-cyan-50 dark:to-cyan-900/20 rounded-lg border border-blue-100 dark:border-blue-700 hover:shadow-md transition-shadow">
            <div className="flex items-center flex-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">2 claims ready for submission</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Validate and submit for processing</p>
              </div>
            </div>
            <button className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 text-sm font-semibold px-3 py-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors">
              Submit Now
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
