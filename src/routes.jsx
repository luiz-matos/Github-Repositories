import React from 'react'
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'

import Main from './pages/Main'
import Repository from './pages/Repository'

function RepositoryRoute() {
  const params = useParams()
  return <Repository match={{ params }} />
}

export default () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/repository/:repository" element={<RepositoryRoute />} />
      </Routes>
    </BrowserRouter>
  )
}
