import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useAuth } from './hooks/useAuth.js'
import { useGroupSelection } from './hooks/useGroupSelection.js'
import { AuthScreen } from './components/AuthScreen.jsx'
import { GroupScreen } from './components/GroupScreen.jsx'

export default function Root() {
  const { session, profile, loading: authLoading, signOut,updateProfile } = useAuth()
  const {
    groups, currentGroupId, loading: groupLoading,
    selectGroup, createGroup, joinGroup,
  } = useGroupSelection(session?.user?.id)

  if (authLoading) return <Spinner />;

  // Session confirmed absent — show auth
  if (!session) return <AuthScreen />;

  // Session present but groups still loading
  if (groupLoading) return <Spinner />;

  // Authenticated but not in any group yet
  if (!currentGroupId)
      return <GroupScreen onCreate={createGroup} onJoin={joinGroup} />;

  return (
    <App
      currentGroupId={currentGroupId}
      profile={profile}
      groups={groups}
      onSelectGroup={selectGroup}
      onCreateGroup={createGroup}
      onJoinGroup={joinGroup}
      onSignOut={signOut}
      updateProfile={updateProfile}
    />
  )
}

function Spinner() {
  return (
    <div style={{
      minHeight: '100vh', background: '#141416',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#6e6c65', fontFamily: 'sans-serif', fontSize: 14,
    }}>Loading…</div>
  )
}
createRoot(document.getElementById('root')).render(<Root/>);
