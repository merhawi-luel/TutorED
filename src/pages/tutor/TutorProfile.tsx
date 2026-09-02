import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { User, Mail, MapPin, Save, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

const subjects = [
  'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Computer Science', 'Music', 'Art', 'French',
  'Spanish', 'Economics', 'Psychology', 'Business Studies'
];

const levels = [
  'Primary', 'GCSE', 'A-Level', 'University', 'Professional'
];

interface SubjectTag {
  subject: string;
  level: string;
}

export default function TutorProfile() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { tutorProfile, updateProfile } = useData();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    headline: tutorProfile?.headline || '',
    email: user?.email || '',
    location: tutorProfile?.location || '',
    bio: tutorProfile?.bio || '',
  });
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectTag[]>(
    tutorProfile?.subjects?.map((s: string) => ({ subject: s.split(' - ')[0], level: s.split(' - ')[1] || '' })) || []
  );
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newLevel, setNewLevel] = useState('GCSE');

  useEffect(() => {
    if (tutorProfile) {
      setFormData({
        headline: tutorProfile.headline || '',
        email: user?.email || '',
        location: tutorProfile.location || '',
        bio: tutorProfile.bio || '',
      });
      setSelectedSubjects(
        tutorProfile.subjects?.map((s: string) => ({ subject: s.split(' - ')[0], level: s.split(' - ')[1] || '' })) || []
      );
    }
  }, [tutorProfile, user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const subjectsStr = selectedSubjects.map(s => `${s.subject} - ${s.level}`);
      await updateProfile({
        headline: formData.headline,
        location: formData.location,
        bio: formData.bio,
        subjects: subjectsStr,
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

  const addSubject = () => {
    if (newSubject && !selectedSubjects.some(s => s.subject === newSubject)) {
      setSelectedSubjects([...selectedSubjects, { subject: newSubject, level: newLevel }]);
      setNewSubject('');
    }
  };

  const removeSubject = (index: number) => {
    setSelectedSubjects(selectedSubjects.filter((_, i) => i !== index));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: colors.primaryText, 
          marginBottom: '8px',
          fontFamily: "'Inter', sans-serif"
        }}>
          Profile
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: colors.secondaryText 
        }}>
          Manage your personal information and subjects
        </p>
      </div>

      {/* Profile Card */}
      <div style={{
        backgroundColor: colors.card,
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: colors.primaryText }}>
            Personal Information
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            {editMode ? (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '12px', border: `1px solid ${colors.border}`,
                    backgroundColor: colors.background, color: colors.secondaryText,
                    fontSize: '14px', fontWeight: '500', cursor: 'pointer'
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
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px', borderRadius: '12px', border: 'none',
                  backgroundColor: colors.primary, color: '#fff',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                }}
              >
                <User size={16} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.secondaryText, marginBottom: '8px' }}>
              Headline
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. Experienced GCSE Mathematics Tutor"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: `1px solid ${colors.border}`, backgroundColor: colors.background,
                  color: colors.primaryText, fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            ) : (
              <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px' }}>
                {formData.headline || 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.secondaryText, marginBottom: '8px' }}>
              <Mail size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Email
            </label>
            <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {formData.email}
              <span style={{ 
                fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                backgroundColor: '#D4EDDA', color: '#155724', fontWeight: '500'
              }}>
                Verified
              </span>
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.secondaryText, marginBottom: '8px' }}>
              <MapPin size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Location
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: `1px solid ${colors.border}`, backgroundColor: colors.background,
                  color: colors.primaryText, fontSize: '15px', outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            ) : (
              <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px' }}>
                {formData.location || 'Not set'}
              </div>
            )}
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: colors.secondaryText, marginBottom: '8px' }}>
              Bio
            </label>
            {editMode ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  border: `1px solid ${colors.border}`, backgroundColor: colors.background,
                  color: colors.primaryText, fontSize: '15px', outline: 'none',
                  resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box'
                }}
              />
            ) : (
              <div style={{ padding: '12px 0', color: colors.primaryText, fontSize: '15px', lineHeight: '1.6' }}>
                {formData.bio || 'No bio added yet'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subjects Card */}
      <div style={{
        backgroundColor: colors.card,
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        border: `1px solid ${colors.border}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: colors.primaryText }}>
            Subjects & Levels
          </h2>
          {editMode && (
            <button
              onClick={() => setShowSubjectPicker(!showSubjectPicker)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '12px', border: 'none',
                backgroundColor: colors.primary, color: '#fff',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                minWidth: '180px', justifyContent: 'center'
              }}
            >
              <Plus size={16} /> Add Subject
            </button>
          )}
        </div>

        {showSubjectPicker && editMode && (
          <div style={{
            backgroundColor: colors.background, borderRadius: '12px', padding: '20px',
            marginBottom: '20px', border: `1px solid ${colors.border}`
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.secondaryText, marginBottom: '6px' }}>
                  Subject
                </label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    border: `1px solid ${colors.border}`, backgroundColor: colors.card,
                    color: colors.primaryText, fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Select subject...</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: colors.secondaryText, marginBottom: '6px' }}>
                  Level
                </label>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                    border: `1px solid ${colors.border}`, backgroundColor: colors.card,
                    color: colors.primaryText, fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box'
                  }}
                >
                  {levels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <button
                onClick={addSubject}
                disabled={!newSubject}
                style={{
                  padding: '10px 20px', borderRadius: '10px', border: 'none',
                  backgroundColor: newSubject ? colors.primary : colors.border,
                  color: '#fff', fontSize: '14px', fontWeight: '600',
                  cursor: newSubject ? 'pointer' : 'not-allowed'
                }}
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {selectedSubjects.length === 0 ? (
            <p style={{ color: colors.secondaryText, fontSize: '14px' }}>No subjects added yet</p>
          ) : (
            selectedSubjects.map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 16px', borderRadius: '10px',
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: '500', color: colors.primaryText }}>{s.subject}</span>
                <span style={{
                  fontSize: '12px', padding: '2px 8px', borderRadius: '6px',
                  backgroundColor: colors.primaryLight, color: colors.primary
                }}>
                  {s.level}
                </span>
                {editMode && (
                  <button
                    onClick={() => removeSubject(i)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: colors.secondaryText, padding: '2px'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
