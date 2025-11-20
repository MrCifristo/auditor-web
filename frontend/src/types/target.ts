export interface Target {
  id: string
  user_id: string
  url: string
  created_at: string
}

export interface CreateTargetPayload {
  url: string
}
