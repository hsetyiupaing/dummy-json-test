import axios from 'axios'

/** Shared HTTP client keeps the API host and request behavior in one place. */
export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})
