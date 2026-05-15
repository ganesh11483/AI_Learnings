import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { claimAPI, patientAPI } from '../services/api'
import { Receipt, CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react'
import Card from '../components/Card'

export default function Claims() {
  const [selectedPatient, setSelectedPatient] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const queryClient = useQueryClient()

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientAPI.list().then(res => res.data),
  })

  const { data: claims } = useQuery({
    queryKey: ['claims', selectedPatient],
    queryFn: () => selectedPatient
      ? claimAPI.getByPatient(selectedPatient).then(res => res.data)
      : claimAPI.list().then(res => res.data),
    enabled: !!selectedPatient || selectedPatient === '',
  })

  const submitMutation = useMutation({
    mutationFn: (claimId) => claimAPI.submit(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries(['claims'])
    },
  })

  const validateMutation = useMutation({
    mutationFn: (claimId) => claimAPI.validate(claimId),
    onSuccess: () => {
      queryClient.invalidateQueries(['claims'])
    },
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50'
      case 'submitted': return 'text-blue-600 bg-blue-50'
      case 'rejected': return 'text-red-600 bg-red-50'
      case 'processing': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Claims Management</h2>
          <p className="text-gray-600 mt-1">Create, validate, and submit medical claims</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Claim
        </button>
      </div>

      {/* Create Claim Form */}
      {showCreateForm && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Claim</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient</label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Patient</option>
                {patients?.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name} ({patient.patient_id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Claim Number</label>
              <input
                type="text"
                placeholder="CLM-XXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
              <input
                type="text"
                placeholder="Insurance Company"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
              <input
                type="text"
                placeholder="POL-XXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors">
              Create Claim
            </button>
          </div>
        </Card>
      )}

      {/* Claims List */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Claims</h3>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Patients</option>
            {patients?.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.first_name} {patient.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {claims?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No claims found</p>
          ) : (
            claims?.map((claim) => (
              <div key={claim.id} className="p-4 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Receipt className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{claim.claim_number}</p>
                      <p className="text-xs text-gray-500">
                        {claim.insurance_provider} • Total: ${claim.total_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                    {claim.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    {claim.validations?.length > 0 && (
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-gray-600">{claim.validations.length} validation issues</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Receipt className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-gray-600">{claim.claim_items?.length || 0} items</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {claim.status === 'draft' && (
                      <>
                        <button
                          onClick={() => validateMutation.mutate(claim.id)}
                          disabled={validateMutation.isPending}
                          className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                        >
                          Validate
                        </button>
                        <button
                          onClick={() => submitMutation.mutate(claim.id)}
                          disabled={submitMutation.isPending}
                          className="bg-primary-500 text-white px-3 py-1 rounded-md hover:bg-primary-600 text-sm"
                        >
                          Submit
                        </button>
                      </>
                    )}
                    <button className="text-gray-500 hover:text-gray-600 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
