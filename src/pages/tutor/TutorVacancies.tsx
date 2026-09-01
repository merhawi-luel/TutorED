import { useState, useMemo, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { tutorApi } from '../../lib/api';
import { MapPin, Clock, DollarSign, Search, Filter, ChevronDown, Send, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function TutorVacancies() {
  const { colors } = useTheme();
  const { vacancies, applications, loading } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [applying, setApplying] = useState<string | null>(null);
  
  // Fallback: fetch vacancies directly if context returns empty
  const [directVacancies, setDirectVacancies] = useState<any[]>([]);
  const [directLoading, setDirectLoading] = useState(false);

  useEffect(() => {
    // If DataContext vacancies are empty and not loading, fetch directly
    if (!loading && vacancies.length === 0 && directVacancies.length === 0) {
      setDirectLoading(true);
      const API_BASE = import.meta.env.VITE_API_URL || "/api";
      fetch(`${API_BASE}/tutor/vacancies`)
        .then(res => res.json())
        .then(data => {
          console.log("Direct fetch result:", data);
          setDirectVacancies(data);
        })
        .catch(err => console.error("Direct fetch error:", err))
        .finally(() => setDirectLoading(false));
    }
  }, [loading, vacancies.length, directVacancies.length]);

  // Use direct vacancies if context is empty
  const effectiveVacancies = vacancies.length > 0 ? vacancies : directVacancies;
  const effectiveLoading = loading || directLoading;

  const appliedVacancyIds = useMemo(() => {
    return new Set(applications.filter(a => a.tutorId === user?.id).map(a => a.vacancyId));
  }, [applications, user?.id]);

  const filteredVacancies = useMemo(() => {
    return effectiveVacancies.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.subjects || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        v.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || (v.subjects || []).includes(selectedSubject);
      const matchesType = selectedType === 'All' || v.teachingMode === selectedType;
      return matchesSearch && matchesSubject && matchesType;
    });
  }, [effectiveVacancies, searchTerm, selectedSubject, selectedType]);

  const uniqueSubjects = useMemo(() => {
    return ['All', ...new Set(effectiveVacancies.flatMap(v => v.subjects || []))];
  }, [effectiveVacancies]);

  const uniqueTypes = useMemo(() => {
    return ['All', ...new Set(effectiveVacancies.map(v => v.teachingMode))];
  }, [effectiveVacancies]);

  const handleApply = async (vacancyId: string) => {
    setApplying(vacancyId);
    try {
      await tutorApi.applyToVacancy(vacancyId);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying:', error);
      toast.error('Failed to submit application');
    } finally {
      setApplying(null);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', fontWeight: '700', color: colors.primaryText,
          marginBottom: '8px', fontFamily: "'Inter', sans-serif"
        }}>
          Available Vacancies
        </h1>
        <p style={{ fontSize: '16px', color: colors.secondaryText }}>
          Browse and apply to tutoring opportunities
        </p>
      </div>

      {/* Search & Filters */}
      <div style={{
        backgroundColor: colors.card, borderRadius: '16px', padding: '20px',
        marginBottom: '24px', border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} color={colors.secondaryText} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search vacancies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 42px', borderRadius: '12px',
                border: `1px solid ${colors.border}`, backgroundColor: colors.background,
                color: colors.primaryText, fontSize: '15px', outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              backgroundColor: showFilters ? colors.primaryLight : colors.background,
              color: showFilters ? colors.primary : colors.secondaryText,
              fontSize: '14px', fontWeight: '500', cursor: 'pointer'
            }}
          >
            <Filter size={16} /> Filters <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
        </div>

        {showFilters && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${colors.border}` }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.secondaryText, marginBottom: '6px' }}>
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  border: `1px solid ${colors.border}`, backgroundColor: colors.background,
                  color: colors.primaryText, fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {uniqueSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.secondaryText, marginBottom: '6px' }}>
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  border: `1px solid ${colors.border}`, backgroundColor: colors.background,
                  color: colors.primaryText, fontSize: '14px', outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <p style={{ fontSize: '14px', color: colors.secondaryText, marginBottom: '16px' }}>
        {effectiveLoading ? 'Loading...' : `${filteredVacancies.length} ${filteredVacancies.length === 1 ? 'vacancy' : 'vacancies'} found`}
      </p>

      {/* Loading State */}
      {effectiveLoading && (
        <div style={{
          backgroundColor: colors.card, borderRadius: '16px', padding: '48px',
          textAlign: 'center', border: `1px solid ${colors.border}`
        }}>
          <p style={{ fontSize: '16px', color: colors.secondaryText }}>Loading vacancies...</p>
        </div>
      )}

      {/* Vacancy Cards */}
      {!effectiveLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredVacancies.length === 0 ? (
          <div style={{
            backgroundColor: colors.card, borderRadius: '16px', padding: '48px',
            textAlign: 'center', border: `1px solid ${colors.border}`
          }}>
            <Search size={48} color={colors.border} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText, marginBottom: '8px' }}>
              No Vacancies Found
            </h3>
            <p style={{ fontSize: '14px', color: colors.secondaryText }}>
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          filteredVacancies.map((vacancy) => {
            const hasApplied = appliedVacancyIds.has(vacancy.id);
            return (
              <div
                key={vacancy.id}
                style={{
                  backgroundColor: colors.card, borderRadius: '16px', padding: '24px',
                  border: `1px solid ${colors.border}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText, marginBottom: '4px' }}>
                      {vacancy.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: colors.secondaryText }}>
                      Posted by {vacancy.organizationName || 'Parent'}
                    </p>
                  </div>
                  <span style={{
                    padding: '6px 12px', borderRadius: '8px',
                    backgroundColor: colors.primaryLight, color: colors.primary,
                    fontSize: '13px', fontWeight: '500'
                  }}>
                    {vacancy.teachingMode}
                  </span>
                </div>

                <p style={{ fontSize: '14px', color: colors.secondaryText, lineHeight: '1.6', marginBottom: '16px' }}>
                  {vacancy.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: colors.secondaryText }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '6px',
                      backgroundColor: colors.background, color: colors.primaryText, fontWeight: '500'
                    }}>
                      {vacancy.subjects?.join(', ') || vacancy.subject}
                    </span>
                  </div>
                  {vacancy.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: colors.secondaryText }}>
                      <MapPin size={14} /> {vacancy.location}
                    </div>
                  )}
                  {vacancy.salary && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: colors.secondaryText }}>
                      <DollarSign size={14} /> {vacancy.salary}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: colors.secondaryText }}>
                    <Clock size={14} /> Posted {new Date(vacancy.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {hasApplied ? (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '10px 20px', borderRadius: '12px',
                      backgroundColor: '#DCFCE7', color: '#16A34A',
                      fontSize: '14px', fontWeight: '600'
                    }}>
                      <CheckCircle size={16} /> Applied
                    </div>
                  ) : (
                    <button
                      onClick={() => handleApply(vacancy.id)}
                      disabled={applying === vacancy.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', borderRadius: '12px', border: 'none',
                        backgroundColor: colors.primary, color: '#fff',
                        fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                        minWidth: '180px', justifyContent: 'center',
                        opacity: applying === vacancy.id ? 0.7 : 1
                      }}
                    >
                      <Send size={16} /> {applying === vacancy.id ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      )}

      {/* Debug info - remove after testing */}
      {!effectiveLoading && (
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: colors.bgInput, borderRadius: '8px', fontSize: '12px', color: colors.textMuted }}>
          <strong>Debug Info:</strong><br />
          Total vacancies from context: {vacancies.length}<br />
          Total vacancies from direct fetch: {directVacancies.length}<br />
          Effective vacancies (used): {effectiveVacancies.length}<br />
          Filtered vacancies: {filteredVacancies.length}<br />
          Context loading: {loading ? 'true' : 'false'}<br />
          Direct loading: {directLoading ? 'true' : 'false'}
        </div>
      )}
    </div>
  );
}