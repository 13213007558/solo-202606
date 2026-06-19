import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ActivityList from './pages/ActivityList'
import ActivityDetail from './pages/ActivityDetail'
import CreateActivity from './pages/CreateActivity'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/list" replace />} />
        <Route path="/list" element={<ActivityList />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/create" element={<CreateActivity />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
