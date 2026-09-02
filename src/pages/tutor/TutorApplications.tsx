import { useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Filter, MapPin, DollarSign } from 'lucide-react';

type ApplicationStatus = 
  | 'applied' 
  | 'under_review' 
  | 'shortlisted' 
  | 'interview' 
  | 'accepted' 
  | 'completed' 
  | 'rejected' 
  | 'withdrawn';

export default function TutorApplications() {
  const { colors } = useTheme();
  const { applications, vacancies } = useData();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');

  const myApplications = useMemo(() => {
    return applications
      .filter(a => a.tutorId === user?.id)
      .map(a => {
        const vacancy = vacancies.find(v => v.id === a.vacancyId);
        return { ...a, vacancy };
      })
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  }, [applications, vacancies, user?.id]);

  const filteredApplications = useMemo(() => {
    if (statusFilter === 'all') return myApplications;
    return myApplications.filter(a => a.status === statusFilter);
  }, [myApplications, statusFilter]);

  const stats = useMemo(() => ({
    total: myApplications.length,
    inProgress: myApplications.filter(a => 
      a.status === 'applied' || a.status === 'under_review' || 
      a.status === 'shortlisted' || a.status === 'interview'
    ).length,
    accepted: myApplications.filter(a => a.status === 'accepted' || a.status === 'completed').length,
    rejected: myApplications.filter(a => a.status === 'rejected' || a.status === 'withdrawn').length,
  }), [myApplications]);

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return <CheckCircle size={16} color="#16A34A" />;
      case 'rejected':
      case 'withdrawn':
        return <XCircle size={16} color="#DC2626" />;
      case 'applied':
        return <Clock size={16} color="#D97706" />;
      case 'under_review':
        return <Clock size={16} color="#2563EB" />;
      case 'shortlisted':
        return <AlertCircle size={16} color="#7C3AED" />;
      case 'interview':
        return <AlertCircle size={16} color="#2563EB" />;
      default:
        return <AlertCircle size={16} color={colors.secondaryText} />;
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return { bg: '#DCFCE7', text: '#16A34A' };
      case 'rejected':
      case 'withdrawn':
        return { bg: '#FEE2E2', text: '#DC2626' };
      case 'applied':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'under_review':
        return { bg: '#DBEAFE', text: '#2563EB' };
      case 'shortlisted':
        return { bg: '#EDE9FE', text: '#7C3AED' };
      case 'interview':
        return { bg: '#DBEAFE', text: '#2563EB' };
      default:
        return { bg: colors.background, text: colors.secondaryText };
    }
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', fontWeight: '700', color: colors.primaryText,
          marginBottom: '8px', fontFamily: "'Inter', sans-serif"
        }}>
          My Applications
        </h1>
        <p style={{ fontSize: '16px', color: colors.secondaryText }}>
          Track your tutoring applications
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total', value: stats.total, color: colors.primary, bg: colors.primaryLight },
          { label: 'In Progress', value: stats.inProgress, bg: '#FEF3C7', text: '#D97706' },
          { label: 'Accepted', value: stats.accepted, bg: '#DCFCE7', text: '#16A34A' },
          { label: 'Rejected', value: stats.rejected, bg: '#FEE2E2', text: '#DC2626' },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: colors.card, borderRadius: '12px', padding: '16px',
              border: `1px solid ${colors.border}`
            }}
          >
            <p style={{ fontSize: '13px', color: colors.secondaryText, marginBottom: '4px' }}>{stat.label}</p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: stat.text || stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{
        backgroundColor: colors.card, borderRadius: '12px', padding: '12px',
        marginBottom: '20px', border: `1px solid ${colors.border}`,
        display: 'flex', gap: '8px', flexWrap: 'wrap'
      }}>
        {[
          { value: 'all', label: 'All' },
          { value: 'applied', label: 'Applied' },
          { value: 'under_review', label: 'Under Review' },
          { value: 'shortlisted', label: 'Shortlisted' },
          { value: 'interview', label: 'Interview' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'completed', label: 'Completed' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'withdrawn', label: 'Withdrawn' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: 'none',
              backgroundColor: statusFilter === filter.value ? colors.primary : 'transparent',
              color: statusFilter === filter.value ? '#fff' : colors.secondaryText,
              fontSize: '13px', fontWeight: '500', cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredApplications.length === 0 ? (
          <div style={{
            backgroundColor: colors.card, borderRadius: '16px', padding: '48px',
            textAlign: 'center', border: `1px solid ${colors.border}`
          }}>
            <FileText size={48} color={colors.border} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText, marginBottom: '8px' }}>
              No Applications Yet
            </h3>
            <p style={{ fontSize: '14px', color: colors.secondaryText }}>
              {statusFilter === 'all' ? 'Start applying to vacancies to see them here' : `No ${formatStatus(statusFilter)} applications`}
            </p>
          </div>
        ) : (
          filteredApplications.map((app) => {
            const statusColor = getStatusColor(app.status as ApplicationStatus);
            return (
              <div
                key={app.id}
                style={{
                  backgroundColor: colors.card, borderRadius: '12px', padding: '20px',
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.primaryText, marginBottom: '4px' }}>
                      {app.vacancy?.title || 'Vacancy'}
                    </h3>
                    <p style={{ fontSize: '13px', color: colors.secondaryText }}>
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 12px', borderRadius: '8px',
                    backgroundColor: statusColor.bg, color: statusColor.text,
                    fontSize: '13px', fontWeight: '500'
                  }}>
                    {getStatusIcon(app.status as ApplicationStatus)} {formatStatus(app.status)}
                  </div>
                </div>

                {app.vacancy && (
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px',
                      backgroundColor: colors.primaryLight, color: colors.primary,
                      fontSize: '12px', fontWeight: '500'
                    }}>
                      {app.vacancy.subjects?.join(', ') || ''}
                    </span>
                    {app.vacancy.location && (
                      <span style={{ fontSize: '13px', color: colors.secondaryText, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {app.vacancy.location}
                      </span>
                    )}
                    {app.vacancy.salary && (
                      <span style={{ fontSize: '13px', color: colors.secondaryText, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={12} /> {app.vacancy.salary}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
