import { api } from '../../../lib/api'
import type { DummyCartResponse } from '../types'

/** Load the sample cart associated with the currently authenticated DummyJSON account. */
export async function getUserCarts(userId: number): Promise<DummyCartResponse> {
  const response = await api.get<DummyCartResponse>(`/carts/user/${userId}`)
  return response.data
}
