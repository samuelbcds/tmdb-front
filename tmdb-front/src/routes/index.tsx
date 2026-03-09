import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import RatedMovies from '../pages/RatedMovies';
import MovieDetails from '../pages/MovieDetails';

export function ApplicationRoutes() {
  return (
    <Routes>
      {}
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {}
      
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/rated-movies"
        element={
          <ProtectedRoute>
            <RatedMovies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/movies/:movieId"
        element={
          <ProtectedRoute>
            <MovieDetails />
          </ProtectedRoute>
        }
      />

      {}
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
