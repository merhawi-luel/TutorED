import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import {
  User, Mail, Phone, MapPin, Save, X, Check, Star, ShieldCheck,
  Briefcase, Clock, GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';
import { ALL_SUBJECTS, ALL_GRADES } from '../../data/constants';
import type { TeachingMode } from '../../types';

const VERIFICATION_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  verified: { label: 'Fully Verified', color: '#16A34A', bg: 'rgba(22,163,74,0.12)' },
  partial: { label: 'Partially Verified', color: '#D4A574', bg: 'rgba(212,165,116,0.15)' },
  unverified: { label: 'Unverified', color: '', bg: '' },
  suspended: { label: 'Suspended', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

export default function TutorProfile() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { tutorProfile, updateProfile } = useData();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    headline: tutorProfile?.headline || '',
    email: user?.email || '',
    phone: tutorProfile?.phone || '',
    location: tutorProfile?.location || '',
    bio: tutorProfile?.bio || '',
    experience: tutorProfile?.experience || 0,
    teachingMode: (tutorProfile?.teachingMode || 'in-person') as TeachingMode,
    availability: tutorProfile?.availability || '',
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(tutorProfile?.subjects || []);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(tutorProfile?.grades || []);

  useEffect(() => {
    if (tutorProfile) {
      setFormData({
        headline: tutorProfile.headline || '',
        email: user?.email || '',
        phone: tutorProfile.phone || '',
        location: tutorProfile.location || '',
        bio: tutorProfile.bio || '',
        experience: tutorProfile.experience || 0,
        teachingMode: (tutorProfile.teachingMode || 'in-person') as TeachingMode,
        availability: tutorProfile.availability || '',
      });
      setSelectedSubjects(tutorProfile.subjects || []);
      setSelectedGrades(tutorProfile.grades || []);
    }
  }, [tutorProfile, user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        headline: formData.headline,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        experience: Number(formData.experience),
        teachingMode: formData.teachingMode,
        availability: formData.availability,
        subjects: selectedSubjects,
        grades: selectedGrades,
      });
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (tutorProfile) {
      setFormData({
        headline: tutorProfile.headline || '',
        email: user?.email || '',
        phone: tutorProfile.phone || '',
        location: tutorProfile.location || '',
        bio: tutorProfile.bio || '',
        experience: tutorProfile.experience || 0,
        teachingMode: (tutorProfile.teachingMode || 'in-person') as TeachingMode,
        availability: tutorProfile.availability || '',
      });
      setSelectedSubjects(tutorProfile.subjects || []);
      setSelectedGrades(tutorProfile.grades || []);
    }
    setEditMode(false);
  };

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };
  const toggleGrade = (g: string) => {
    setSelectedGrades((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const initials = (formData.email || 'T').charAt(0).toUpperCase();
  const verification = VERIFICATION_CONFIG[tutorProfile?.verificationLevel || 'unverified'];
  const verificationColor = tutorProfile?.verificationLevel === 'unverified' ? colors.secondaryText : verification.color;
  const verificationBg = tutorProfile?.verificationLevel === 'unverified' ? colors.background : verification.bg;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: '12px',
    border: `1px solid ${colors.border}`, backgroundColor: colors.background,
    color: colors.primaryText, fontSize: '15px', outline: 'none',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    fontSize: '14px', fontWeight: '500', color: colors.secondaryText,
    marginBottom: '8px',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.card, borderRadius: '16px', padding: '32px',
    marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: `1px solid ${colors.border}`,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '20px', fontWeight: '600', color: colors.primaryText, marginBottom: '24px',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: colors.primaryText, marginBottom: '8px' }}>
          Profile
        </h1>
        <p style={{ fontSize: '16px', color: colors.secondaryText }}>
          Manage your personal information, subjects, and teaching details
        </p>
      </div>

      {/* Identity Card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '700', flexShrink: 0,
            backgroundColor: colors.primaryLight, color: colors.primary,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: colors.primaryText, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formData.headline || 'Your Profile'}
            </h2>
            <p style={{ fontSize: '14px', color: colors.secondaryText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {formData.email}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                backgroundColor: verificationBg, color: verificationColor,
              }}>
                <ShieldCheck size={12} /> {verification.label}
              </span>
              {Number(tutorProfile?.rating) > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
                  backgroundColor: colors.background, color: colors.primaryText,
                }}>
                  <Star size={12} fill={colors.primary} color={colors.primary} /> {tutorProfile?.rating}
                </span>
              )}
            </div>
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '12px', border: 'none',
                backgroundColor: colors.primary, color: '#fff',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}
            >
              <User size={16} /> Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCancel}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`,
                  backgroundColor: colors.background, color: colors.secondaryText,
                  fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                }}
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '12px', border: 'none',
                  backgroundColor: colors.primary, color: '#fff',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Personal Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Headline */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Headline</label>
            {editMode ? (
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. Experienced Grade 9-12 Mathematics Tutor"
                style={inputStyle}
              />
            ) : (
              <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px' }}>
                {formData.headline || 'Not set'}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>
              <Mail size={14} /> Email
            </label>
            <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {formData.email}
              <span style={{
                fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                backgroundColor: '#D4EDDA', color: '#155724', fontWeight: '500',
              }}>
                Verified
              </span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle}>
              <Phone size={14} /> Phone
            </label>
            {editMode ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. 0912345678"
                style={inputStyle}
              />
            ) : (
              <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px' }}>
                {formData.phone || 'Not set'}
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>
              <MapPin size={14} /> Location
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Addis Ababa"
                style={inputStyle}
              />
            ) : (
              <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px' }}>
                {formData.location || 'Not set'}
              </div>
            )}
          </div>

          {/* Bio */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Bio</label>
            {editMode ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                placeholder="Tell agencies and parents about your teaching style and background..."
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            ) : (
              <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px', lineHeight: '1.6' }}>
                {formData.bio || 'No bio added yet'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Teaching Details */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Teaching Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          {/* Experience */}
          <div>
            <label style={labelStyle}>
              <Briefcase size={14} /> Experience (years)
            </label>
            {editMode ? (
              <input
                type="number"
                min={0}
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                style={inputStyle}
              />
            ) : (
              <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px' }}>
                {formData.experience} years
              </div>
            )}
          </div>

          {/* Teaching Mode */}
          <div>
            <label style={labelStyle}>
              <GraduationCap size={14} /> Teaching Mode
            </label>
            {editMode ? (
              <select
                value={formData.teachingMode}
                onChange={(e) => setFormData({ ...formData, teachingMode: e.target.value as TeachingMode })}
                style={inputStyle}
              >
                <option value="in-person">In-person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            ) : (
              <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px', textTransform: 'capitalize' }}>
                {formData.teachingMode}
              </div>
            )}
          </div>

          {/* Availability */}
          <div>
            <label style={labelStyle}>
              <Clock size={14} /> Availability
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                placeholder="e.g. Weekends, Evenings"
                style={inputStyle}
              />
            ) : (
              <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px' }}>
                {formData.availability || 'Not set'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Subjects</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: editMode ? '20px' : 0 }}>
          {selectedSubjects.length === 0 ? (
            <p style={{ color: colors.secondaryText, fontSize: '14px' }}>No subjects added yet</p>
          ) : (
            selectedSubjects.map((s) => (
              <div
                key={s}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '10px',
                  backgroundColor: colors.primaryLight, color: colors.primary,
                  fontSize: '14px', fontWeight: '500',
                }}
              >
                {s}
                {editMode && (
                  <button
                    onClick={() => toggleSubject(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary, padding: '2px', display: 'flex' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        {editMode && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
            padding: '12px', borderRadius: '12px',
            backgroundColor: colors.background, border: `1px solid ${colors.border}`,
          }}>
            {ALL_SUBJECTS.map((s) => {
              const checked = selectedSubjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSubject(s)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 10px', borderRadius: '8px', border: 'none',
                    fontSize: '13px', textAlign: 'left', cursor: 'pointer',
                    backgroundColor: checked ? colors.primaryLight : 'transparent',
                    color: checked ? colors.primary : colors.secondaryText,
                  }}
                >
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    border: `1.5px solid ${checked ? colors.primary : colors.border}`,
                    backgroundColor: checked ? colors.primary : 'transparent',
                  }}>
                    {checked && <Check size={10} color="#fff" />}
                  </div>
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grades */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Grades Taught</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: editMode ? '20px' : 0 }}>
          {selectedGrades.length === 0 ? (
            <p style={{ color: colors.secondaryText, fontSize: '14px' }}>No grades added yet</p>
          ) : (
            selectedGrades.map((g) => (
              <div
                key={g}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '10px',
                  backgroundColor: colors.primaryLight, color: colors.primary,
                  fontSize: '14px', fontWeight: '500',
                }}
              >
                {g}
                {editMode && (
                  <button
                    onClick={() => toggleGrade(g)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.primary, padding: '2px', display: 'flex' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        {editMode && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px',
            padding: '12px', borderRadius: '12px',
            backgroundColor: colors.background, border: `1px solid ${colors.border}`,
          }}>
            {ALL_GRADES.map((g) => {
              const checked = selectedGrades.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGrade(g)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 10px', borderRadius: '8px', border: 'none',
                    fontSize: '13px', textAlign: 'left', cursor: 'pointer',
                    backgroundColor: checked ? colors.primaryLight : 'transparent',
                    color: checked ? colors.primary : colors.secondaryText,
                  }}
                >
                  <div style={{
                    width: '16px', height: '16px', borderRadius: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    border: `1.5px solid ${checked ? colors.primary : colors.border}`,
                    backgroundColor: checked ? colors.primary : 'transparent',
                  }}>
                    {checked && <Check size={10} color="#fff" />}
                  </div>
                  {g}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
