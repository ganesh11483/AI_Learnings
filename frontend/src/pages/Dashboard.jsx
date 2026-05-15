import { useQuery } from '@tanstack/react-query'
import { documentAPI, claimAPI, patientAPI } from '../services/api'
import { 
  FileText, 
  Receipt, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle 
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
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  {activity.type === 'document' && <FileText className="w-5 h-5 text-blue-500" />}
                  {activity.type === 'claim' && <Receipt className="w-5 h-5 text-purple-500" />}
                  {activity.type === 'coding' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {activity.type === 'validation' && <Clock className="w-5 h-5 text-orange-500" />}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-primary-500 text-white py-2 rounded-md hover:bg-primary-600 transition-colors">
              Upload New Document
            </button>
            <button className="w-full bg-white text-gray-700 border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-colors">
              Create New Claim
            </button>
            <button className="w-full bg-white text-gray-700 border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition-colors">
              Add New Patient
            </button>
          </div>
        </Card>
      </div>

      {/* Pending Items */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Items</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">3 documents awaiting coding review</p>
                <p className="text-xs text-gray-500">Review suggested codes before approval</p>
              </div>
            </div>
            <button className="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Review
            </button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">2 claims ready for submission</p>
                <p className="text-xs text-gray-500">Validate and submit for processing</p>
              </div>
            </div>
            <button className="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Submit
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
