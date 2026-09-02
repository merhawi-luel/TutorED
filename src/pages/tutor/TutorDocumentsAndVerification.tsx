import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { tutorApi } from '../../lib/api';
import { 
  FileText, Upload, CheckCircle, Clock, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, Eye, Download, Trash2, Shield
} from 'lucide-react';
import { toast } from 'sonner';

export default function TutorDocumentsAndVerification() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { documents, profile, refetchDocuments } = useData();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const userDocuments = documents.filter(d => d.tutorId === user?.id);
  
  const verificationChecklist = [
    { id: 'id', label: 'Government ID', required: true, uploaded: userDocuments.some(d => d.type === 'id') },
    { id: 'qualification', label: 'Teaching Qualification', required: true, uploaded: userDocuments.some(d => d.type === 'qualification') },
    { id: 'background_check', label: 'Background Check', required: true, uploaded: userDocuments.some(d => d.type === 'background_check') },
    { id: 'resume', label: 'Resume/CV', required: false, uploaded: userDocuments.some(d => d.type === 'resume') },
    { id: 'reference', label: 'Reference Letter', required: false, uploaded: userDocuments.some(d => d.type === 'reference') },
  ];

  const completedRequired = verificationChecklist.filter(c => c.required && c.uploaded).length;
  const totalRequired = verificationChecklist.filter(c => c.required).length;
  const verificationProgress = (completedRequired / totalRequired) * 100;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'document');
      formData.append('name', file.name);
      
      await tutorApi.uploadDocument({
        name: file.name,
        type: 'document',
        file: file,
      });
      
      await refetchDocuments();
      toast.success('Document uploaded successfully');
      setShowUploadForm(false);
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleRequestVerification = async () => {
    try {
      await tutorApi.requestVerification();
      await refetchDocuments();
      toast.success('Verification request submitted');
    } catch (error) {
      console.error('Error requesting verification:', error);
      toast.error('Failed to submit verification request');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} color="#16A34A" />;
      case 'pending': return <Clock size={16} color="#D97706" />;
      case 'rejected': return <XCircle size={16} color="#DC2626" />;
      default: return <FileText size={16} color={colors.secondaryText} />;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', fontWeight: '700', color: colors.primaryText,
          marginBottom: '8px', fontFamily: "'Inter', sans-serif"
        }}>
          Documents & Verification
        </h1>
        <p style={{ fontSize: '16px', color: colors.secondaryText }}>
          Upload documents and track your verification status
        </p>
      </div>

      {/* Verification Status Banner */}
      <div style={{
        backgroundColor: colors.card, borderRadius: '16px', padding: '24px',
        marginBottom: '24px', border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Shield size={24} color={colors.primary} />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText }}>
              Verification Status
            </h2>
            <p style={{ fontSize: '14px', color: colors.secondaryText }}>
              {profile?.verificationLevel === 'full' ? 'Fully Verified' : 
               profile?.verificationLevel === 'basic' ? 'Basic Verification' : 'Not Verified'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: colors.secondaryText }}>Required Documents</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: colors.primary }}>
              {completedRequired}/{totalRequired}
            </span>
          </div>
          <div style={{
            width: '100%', height: '8px', backgroundColor: colors.border,
            borderRadius: '4px', overflow: 'hidden'
          }}>
            <div style={{
              width: `${verificationProgress}%`, height: '100%',
              backgroundColor: verificationProgress === 100 ? '#16A34A' : colors.primary,
              borderRadius: '4px', transition: 'width 0.3s'
            }} />
          </div>
        </div>

        {/* Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {verificationChecklist.map((item) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {item.uploaded ? (
                <CheckCircle size={16} color="#16A34A" />
              ) : (
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  border: `2px solid ${colors.border}`
                }} />
              )}
              <span style={{ 
                fontSize: '14px', color: item.uploaded ? colors.primaryText : colors.secondaryText,
                textDecoration: item.uploaded ? 'none' : 'none'
              }}>
                {item.label}
                {item.required && <span style={{ color: '#DC2626', marginLeft: '4px' }}>*</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Request Verification Button */}
        {verificationProgress === 100 && profile?.verificationLevel !== 'full' && (
          <button
            onClick={handleRequestVerification}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '12px', border: 'none',
              backgroundColor: colors.primary, color: '#fff',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              minWidth: '180px', justifyContent: 'center'
            }}
          >
            <Shield size={16} /> Request Verification
          </button>
        )}
      </div>

      {/* Upload Section */}
      <div style={{
        backgroundColor: colors.card, borderRadius: '16px', padding: '24px',
        marginBottom: '24px', border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText }}>
            Upload Documents
          </h2>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '12px', border: 'none',
              backgroundColor: colors.primary, color: '#fff',
              fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              minWidth: '180px', justifyContent: 'center'
            }}
          >
            <Upload size={16} /> Upload File
          </button>
        </div>

        {showUploadForm && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragActive ? colors.primary : colors.border}`,
              borderRadius: '12px', padding: '40px', textAlign: 'center',
              backgroundColor: dragActive ? colors.primaryLight : colors.background,
              transition: 'all 0.2s'
            }}
          >
            <Upload size={48} color={colors.border} style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', fontWeight: '500', color: colors.primaryText, marginBottom: '8px' }}>
              Drag & drop your file here
            </p>
            <p style={{ fontSize: '14px', color: colors.secondaryText, marginBottom: '16px' }}>
              or click to browse
            </p>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '10px 20px', borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              backgroundColor: colors.card, color: colors.primaryText,
              fontSize: '14px', fontWeight: '500', cursor: 'pointer'
            }}>
              <FileText size={16} /> Choose File
              <input
                type="file"
                onChange={handleFileInput}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
              />
            </label>
            <p style={{ fontSize: '12px', color: colors.secondaryText, marginTop: '12px' }}>
              PDF, DOC, DOCX, JPG, PNG up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Documents List */}
      <div style={{
        backgroundColor: colors.card, borderRadius: '16px', padding: '24px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText, marginBottom: '20px' }}>
          Uploaded Documents
        </h2>

        {userDocuments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: colors.background, borderRadius: '12px' }}>
            <FileText size={48} color={colors.border} style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', fontWeight: '500', color: colors.primaryText, marginBottom: '8px' }}>
              No Documents Uploaded
            </p>
            <p style={{ fontSize: '14px', color: colors.secondaryText }}>
              Upload your first document to get started
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userDocuments.map((doc) => (
              <div
                key={doc.id}
                style={{
                  border: `1px solid ${colors.border}`, borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <div
                  onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px', cursor: 'pointer',
                    backgroundColor: expandedDoc === doc.id ? colors.background : colors.card
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getStatusIcon(doc.status)}
                    <div>
                      <p style={{ fontSize: '15px', fontWeight: '500', color: colors.primaryText }}>
                        {doc.name}
                      </p>
                      <p style={{ fontSize: '12px', color: colors.secondaryText }}>
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px',
                      backgroundColor: doc.status === 'approved' ? '#DCFCE7' : 
                                       doc.status === 'pending' ? '#FEF3C7' : '#FEE2E2',
                      color: doc.status === 'approved' ? '#16A34A' : 
                             doc.status === 'pending' ? '#D97706' : '#DC2626',
                      fontSize: '12px', fontWeight: '500', textTransform: 'capitalize'
                    }}>
                      {doc.status}
                    </span>
                    {expandedDoc === doc.id ? <ChevronUp size={16} color={colors.secondaryText} /> : <ChevronDown size={16} color={colors.secondaryText} />}
                  </div>
                </div>
                
                {expandedDoc === doc.id && (
                  <div style={{ padding: '16px', borderTop: `1px solid ${colors.border}`, backgroundColor: colors.background }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px', borderRadius: '8px',
                        border: `1px solid ${colors.border}`, backgroundColor: colors.card,
                        color: colors.primaryText, fontSize: '13px', fontWeight: '500',
                        cursor: 'pointer'
                      }}>
                        <Eye size={14} /> View
                      </button>
                      <button style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px', borderRadius: '8px',
                        border: `1px solid ${colors.border}`, backgroundColor: colors.card,
                        color: colors.primaryText, fontSize: '13px', fontWeight: '500',
                        cursor: 'pointer'
                      }}>
                        <Download size={14} /> Download
                      </button>
                    </div>
                    {doc.reviewerNote && (
                      <p style={{ fontSize: '13px', color: colors.secondaryText, marginTop: '12px', fontStyle: 'italic' }}>
                        Reviewer note: {doc.reviewerNote}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}