// 凭据状态响应
export interface CredentialsStatusResponse {
  total: number
  available: number
  credentials: CredentialStatusItem[]
}

// 单个凭据状态
export interface CredentialStatusItem {
  id: number
  priority: number
  disabled: boolean
  failureCount: number
  expiresAt: string | null
  authMethod: string | null
  hasProfileArn: boolean
  successCount: number
  totalRequests: number
  lastUsedAt: string | null
}

// 余额响应
export interface BalanceResponse {
  id: number
  subscriptionTitle: string | null
  currentUsage: number
  usageLimit: number
  remaining: number
  usagePercentage: number
  nextResetAt: number | null
}

// 成功响应
export interface SuccessResponse {
  success: boolean
  message: string
}

// 错误响应
export interface AdminErrorResponse {
  error: {
    type: string
    message: string
  }
}

// 请求类型
export interface SetDisabledRequest {
  disabled: boolean
}

export interface SetPriorityRequest {
  priority: number
}

// 添加凭据请求
export interface AddCredentialRequest {
  refreshToken: string
  authMethod?: 'social' | 'idc' | 'builder-id'
  clientId?: string
  clientSecret?: string
  priority?: number
}

// 添加凭据响应
export interface AddCredentialResponse {
  success: boolean
  message: string
  credentialId: number
}

// 批量删除禁用凭据响应
export interface BatchDeleteDisabledResponse {
  deletedCount: number
  deletedIds: number[]
}

// Provider 类型
export type CredentialProvider = 'BuilderId' | 'Github' | 'Google'

// 批量添加凭据项
export interface BatchCredentialItem {
  refreshToken: string
  provider?: CredentialProvider
  clientId?: string
  clientSecret?: string
}

// 批量添加凭据请求（JSON 数组格式）
export interface BatchAddCredentialsJsonRequest {
  credentials: BatchCredentialItem[]
  priority: number
  region?: string
}

// 批量添加单个结果
export interface BatchAddResultItem {
  line: number
  success: boolean
  credentialId?: number
  error?: string
}

// 批量添加凭据响应
export interface BatchAddCredentialsResponse {
  total: number
  successCount: number
  failedCount: number
  results: BatchAddResultItem[]
}
