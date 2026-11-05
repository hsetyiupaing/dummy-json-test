import axios from 'axios'
import { getStoredAccessToken } from '../features/auth/authStorage'

/** Shared HTTP client keeps the API host and request behavior in one place. */
export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// Read the current persisted token at request time so login and logout need no client recreation.
api.interceptors.request.use(config => {
  const token = getStoredAccessToken()
  if (token && config.url !== '/auth/login') config.headers.set('Authorization', `Bearer ${token}`)
  return config
})
