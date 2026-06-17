import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function StakeholderRoute({ children }) {
  const { user, isStakeholder, loading } = useAuth()
  if (loading)        return <p>Loading...</p>
  if (!user)          return <Navigate to="/login" replace />
  if (!isStakeholder) return <Navigate to="/" replace />
  return children
}
