import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { tutorApi } from '../../lib/api';
import { GraduationCap, Plus, Trash2, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function TutorEducation() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { educationEntries, refreshData } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
  });

  const userEntries = educationEntries.filter(e => e.tutorId === user?.id);
  const approvedCount = userEntries.filter(e => e.status === 'approved').length;
  const isVerified = userEntries.length > 0 && userEntries.every(e => e.status === 'approved');

  const handleAdd = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await tutorApi.createEducationEntry({
        name: `${user?.firstName} ${user?.lastName}`,
        title: formData.title,
        description: formData.description,
      });
      await refreshData();
      setShowAddForm(false);
      setFormData({ name: '', title: '', description: '' });
      toast.success('Education entry submitted for review');
    } catch (error) {
      console.error('Error adding education entry:', error);
      toast.error('Failed to add education entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await tutorApi.deleteEducationEntry(id);
      await refreshData();
      toast.success('Education entry deleted');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { icon: <CheckCircle size={14} />, color: '#16A34A', bg: '#DCFCE7', text: 'Approved' };
      case 'pending':
        return { icon: <Clock size={14} />, color: '#D97706', bg: '#FEF3C7', text: 'Pending' };
      case 'rejected':
        return { icon: <XCircle size={14} />, color: '#DC2626', bg: '#FEE2E2', text: 'Rejected' };
      default:
        return { icon: <Clock size={14} />, color: colors.secondaryText, bg: colors.background, text: 'Unknown' };
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 640px) {
          .edu-form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', fontWeight: '700', color: colors.primaryText, 
            marginBottom: '8px', fontFamily: "'Inter', sans-serif"
          }}>
            Education
          </h1>
          <p style={{ fontSize: '16px', color: colors.secondaryText }}>
            Manage your education credentials and verification status
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '12px', border: 'none',
            backgroundColor: colors.primary, color: '#fff',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            minWidth: '180px', justifyContent: 'center'
          }}
        >
          <Plus size={16} /> Add Education
        </button>
      </div>

      {/* Verification Banner */}
      <div style={{
        backgroundColor: isVerified ? '#DCFCE7' : '#FEF3C7',
        border: `1px solid ${isVerified ? '#86EFAC' : '#FCD34D'}`,
        borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        {isVerified ? (
          <CheckCircle size={20} color="#16A34A" />
        ) : (
          <AlertTriangle size={20} color="#D97706" />
        )}
        <div>
          <p style={{ 
            fontSize: '14px', fontWeight: '600', 
            color: isVerified ? '#166534' : '#92400E', marginBottom: '2px'
          }}>
            {isVerified ? '✓ Verified — All entries approved' : `Verification: ${approvedCount}/${userEntries.length} entries approved`}
          </p>
          <p style={{ fontSize: '13px', color: isVerified ? '#166534' : '#92400E' }}>
            You are verified only when ALL submitted entries are approved by an admin.
          </p>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div style={{
          backgroundColor: colors.card, borderRadius: '16px', padding: '24px',
          marginBottom: '24px', border: `1px solid ${colors.border}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText }}>
              Add Education Entry
            </h3>
            <p style={{ fontSize: '13px', color: colors.secondaryText }}>
              Add your education details for verification
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="edu-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.secondaryText, marginBottom: '4px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., BSc Computer Science"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    border: `1px solid ${colors.border}`, backgroundColor: colors.background,
                    color: colors.primaryText, fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.secondaryText, marginBottom: '4px' }}>
                  Description * <span style={{ fontWeight: '400', fontSize: '12px' }}>(e.g., Matric: 464)</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Matric: 464"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    border: `1px solid ${colors.border}`, backgroundColor: colors.background,
                    color: colors.primaryText, fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  padding: '10px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`,
                  backgroundColor: colors.background, color: colors.secondaryText,
                  fontSize: '14px', fontWeight: '500', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '12px', border: 'none',
                  backgroundColor: colors.primary, color: '#fff',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  minWidth: '180px', justifyContent: 'center',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <GraduationCap size={16} /> {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {userEntries.length === 0 ? (
          <div style={{
            backgroundColor: colors.card, borderRadius: '16px', padding: '48px',
            textAlign: 'center', border: `1px solid ${colors.border}`
          }}>
            <GraduationCap size={48} color={colors.border} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText, marginBottom: '8px' }}>
              No Education Entries
            </h3>
            <p style={{ fontSize: '14px', color: colors.secondaryText, marginBottom: '20px' }}>
              Add your education credentials to get verified
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto',
                padding: '10px 20px', borderRadius: '12px', border: 'none',
                backgroundColor: colors.primary, color: '#fff',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                minWidth: '180px', justifyContent: 'center'
              }}
            >
              <Plus size={16} /> Add Education
            </button>
          </div>
        ) : (
          userEntries.map((entry) => {
            const badge = getStatusBadge(entry.status);
            return (
              <div
                key={entry.id}
                style={{
                  backgroundColor: colors.card, borderRadius: '16px', padding: '24px',
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.primaryText }}>
                        {entry.title}
                      </h3>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '12px', padding: '4px 10px', borderRadius: '8px',
                        backgroundColor: badge.bg, color: badge.color, fontWeight: '500'
                      }}>
                        {badge.icon} {badge.text}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: colors.secondaryText, lineHeight: '1.5', marginBottom: '8px' }}>
                      {entry.description}
                    </p>
                    <p style={{ fontSize: '12px', color: colors.secondaryText }}>
                      Submitted: {new Date(entry.submittedAt).toLocaleDateString()}
                      {entry.reviewedAt && ` • Reviewed: ${new Date(entry.reviewedAt).toLocaleDateString()}`}
                    </p>
                    {entry.reviewerNote && (
                      <p style={{ 
                        fontSize: '13px', color: entry.status === 'rejected' ? '#DC2626' : colors.secondaryText,
                        marginTop: '8px', fontStyle: 'italic'
                      }}>
                        Note: {entry.reviewerNote}
                      </p>
                    )}
                  </div>
                  {entry.status === 'pending' && (
                    <button
                      onClick={() => handleDelete(entry.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px', borderRadius: '10px',
                        border: `1px solid ${colors.border}`,
                        backgroundColor: colors.background,
                        color: colors.secondaryText,
                        fontSize: '13px', fontWeight: '500', cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}