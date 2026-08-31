import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { tutorApi } from '../../lib/api';
import { User, Bell, Shield, Save, Sun, Moon, Monitor } from 'lucide-react';
import { toast } from 'sonner';

export default function TutorSettings() {
  const { user, logout } = useAuth();
  const { colors, theme, setTheme } = useTheme();
  const { profile, refreshData } = useData();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    showProfile: true,
    allowMessages: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save settings (placeholder for now)
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
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
          Settings
        </h1>
        <p style={{ fontSize: '16px', color: colors.secondaryText }}>
          Manage your account preferences
        </p>
      </div>

      {/* Appearance */}
      <div style={{
        backgroundColor: colors.card, borderRadius: '16px', padding: '24px',
        marginBottom: '24px', border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Monitor size={20} color={colors.primary} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText }}>Appearance</h2>
        </div>
        
        <p style={{ fontSize: '14px', color: colors.secondaryText, marginBottom: '16px' }}>
          Choose your preferred theme
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { value: 'light', label: 'Light', icon: <Sun size={20} /> },
            { value: 'dark', label: 'Dark', icon: <Moon size={20} /> },
            { value: 'system', label: 'System', icon: <Monitor size={20} /> },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: '16px 24px', borderRadius: '12px',
                border: `2px solid ${theme === option.value ? colors.primary : colors.border}`,
                backgroundColor: theme === option.value ? colors.primaryLight : colors.background,
                color: theme === option.value ? colors.primary : colors.secondaryText,
                cursor: 'pointer', transition: 'all 0.2s',
                minWidth: '100px'
              }}
            >
              {option.icon}
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div style={{
        backgroundColor: colors.card, borderRadius: '16px', padding: '24px',
        marginBottom: '24px', border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Bell size={20} color={colors.primary} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText }}>Notifications</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates about applications and vacancies' },
            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get notified about new messages and updates' },
            { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary of your activity' },
          ].map((item) => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${colors.border}` }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '500', color: colors.primaryText, marginBottom: '2px' }}>{item.label}</p>
                <p style={{ fontSize: '13px', color: colors.secondaryText }}>{item.desc}</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                <input
                  type="checkbox"
                  checked={(settings as any)[item.key]}
                  onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: (settings as any)[item.key] ? colors.primary : colors.border,
                  borderRadius: '13px', transition: '0.3s',
                }}>
                  <span style={{
                    position: 'absolute', content: '""', height: '20px', width: '20px',
                    left: (settings as any)[item.key] ? '24px' : '3px',
                    bottom: '3px', backgroundColor: '#fff', borderRadius: '50%',
                    transition: '0.3s',
                  }} />
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div style={{
        backgroundColor: colors.card, borderRadius: '16px', padding: '24px',
        marginBottom: '24px', border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <Shield size={20} color={colors.primary} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText }}>Privacy</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { key: 'showProfile', label: 'Show Profile', desc: 'Make your profile visible to parents and agencies' },
            { key: 'allowMessages', label: 'Allow Messages', desc: 'Allow parents and agencies to message you directly' },
          ].map((item) => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${colors.border}` }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: '500', color: colors.primaryText, marginBottom: '2px' }}>{item.label}</p>
                <p style={{ fontSize: '13px', color: colors.secondaryText }}>{item.desc}</p>
              </div>
              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                <input
                  type="checkbox"
                  checked={(settings as any)[item.key]}
                  onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: (settings as any)[item.key] ? colors.primary : colors.border,
                  borderRadius: '13px', transition: '0.3s',
                }}>
                  <span style={{
                    position: 'absolute', content: '""', height: '20px', width: '20px',
                    left: (settings as any)[item.key] ? '24px' : '3px',
                    bottom: '3px', backgroundColor: '#fff', borderRadius: '50%',
                    transition: '0.3s',
                  }} />
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Account */}
      <div style={{
        backgroundColor: colors.card, borderRadius: '16px', padding: '24px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <User size={20} color={colors.primary} />
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: colors.primaryText }}>Account</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '12px 0', borderBottom: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: '13px', color: colors.secondaryText, marginBottom: '4px' }}>Email</p>
            <p style={{ fontSize: '15px', color: colors.primaryText }}>{user?.email}</p>
          </div>
          <div style={{ padding: '12px 0', borderBottom: `1px solid ${colors.border}` }}>
            <p style={{ fontSize: '13px', color: colors.secondaryText, marginBottom: '4px' }}>Role</p>
            <p style={{ fontSize: '15px', color: colors.primaryText, textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
          <button
            onClick={logout}
            style={{
              marginTop: '12px', padding: '12px 20px', borderRadius: '12px',
              border: '1px solid #DC2626', backgroundColor: '#FEE2E2',
              color: '#DC2626', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', alignSelf: 'flex-start'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '12px', border: 'none',
            backgroundColor: colors.primary, color: '#fff',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            minWidth: '180px', justifyContent: 'center',
            opacity: loading ? 0.7 : 1
          }}
        >
          <Save size={16} /> {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}