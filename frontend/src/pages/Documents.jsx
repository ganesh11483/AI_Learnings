import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentAPI, patientAPI } from '../services/api'
import { Upload, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Card from '../components/Card'

export default function Documents() {
  const [selectedPatient, setSelectedPatient] = useState('')
  const [file, setFile] = useState(null)
  const [documentType, setDocumentType] = useState('clinical_note')
  const queryClient = useQueryClient()

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientAPI.list().then(res => res.data),
  })

  const { data: documents } = useQuery({
    queryKey: ['documents', selectedPatient],
    queryFn: () => selectedPatient 
      ? documentAPI.getByPatient(selectedPatient).then(res => res.data)
      : documentAPI.list().then(res => res.data),
  })

  const uploadMutation = useMutation({
    mutationFn: (data) => documentAPI.upload(data.patientId, data.file, data.documentType),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'])
      setFile(null)
    },
  })

  const handleUpload = () => {
    if (file && selectedPatient) {
      uploadMutation.mutate({ patientId: selectedPatient, file, documentType })
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="clinical_note">Clinical Note</option>
              <option value="discharge_summary">Discharge Summary</option>
              <option value="operative_report">Operative Report</option>
              <option value="lab_result">Lab Result</option>
              <option value="radiology_report">Radiology Report</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              accept=".pdf,.txt,.docx"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleUpload}
            disabled={!file || !selectedPatient || uploadMutation.isPending}
            className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </Card>

      {/* Documents List */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
        <div className="space-y-3">
          {documents?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No documents found</p>
          ) : (
            documents?.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:bg-gray-50">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                    <p className="text-xs text-gray-500">
                      {doc.document_type} • {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    {doc.status === 'processed' && (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    )}
                    {doc.status === 'processing' && (
                      <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                    )}
                    {doc.status === 'failed' && (
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className="text-sm text-gray-600 capitalize">{doc.status}</span>
                  </div>
                  <button className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
