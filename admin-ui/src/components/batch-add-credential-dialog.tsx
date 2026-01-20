import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useBatchAddCredentials } from '@/hooks/use-credentials'
import { extractErrorMessage } from '@/lib/utils'
import type { BatchCredentialItem } from '@/types/api'

interface BatchAddCredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BatchAddCredentialDialog({ open, onOpenChange }: BatchAddCredentialDialogProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [priority, setPriority] = useState('0')
  const [parseError, setParseError] = useState<string | null>(null)

  const { mutate, isPending } = useBatchAddCredentials()

  const resetForm = () => {
    setJsonInput('')
    setPriority('0')
    setParseError(null)
  }

  // 验证并解析 JSON 输入
  const parseCredentials = (): BatchCredentialItem[] | null => {
    try {
      const parsed = JSON.parse(jsonInput)

      // 验证是数组
      if (!Array.isArray(parsed)) {
        setParseError('输入必须是 JSON 数组格式')
        return null
      }

      // 验证每个元素
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i]
        if (!item.refreshToken || typeof item.refreshToken !== 'string') {
          setParseError(`第 ${i + 1} 项缺少必填字段 refreshToken`)
          return null
        }

        // 验证 provider 值
        if (item.provider && !['BuilderId', 'Github', 'Google'].includes(item.provider)) {
          setParseError(`第 ${i + 1} 项的 provider 值无效，可选值: BuilderId, Github, Google`)
          return null
        }

        // BuilderId 需要 clientId 和 clientSecret
        const provider = item.provider || 'BuilderId'
        if (provider === 'BuilderId' && (!item.clientId || !item.clientSecret)) {
          setParseError(`第 ${i + 1} 项: BuilderId 类型需要提供 clientId 和 clientSecret`)
          return null
        }
      }

      setParseError(null)
      return parsed as BatchCredentialItem[]
    } catch (e) {
      setParseError(`JSON 解析失败: ${(e as Error).message}`)
      return null
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const credentials = parseCredentials()
    if (!credentials) {
      return
    }

    if (credentials.length === 0) {
      toast.error('请至少添加一个凭据')
      return
    }

    mutate(
      {
        credentials,
        priority: parseInt(priority) || 0,
      },
      {
        onSuccess: (data) => {
          if (data.failedCount === 0) {
            toast.success(`成功添加 ${data.successCount} 个凭据`)
          } else {
            toast.warning(
              `添加完成: ${data.successCount} 成功, ${data.failedCount} 失败`,
              {
                description: data.results
                  .filter(r => !r.success)
                  .map(r => `第 ${r.line} 项: ${r.error}`)
                  .join('\n'),
                duration: 10000,
              }
            )
          }
          onOpenChange(false)
          resetForm()
        },
        onError: (error: unknown) => {
          toast.error(`批量添加失败: ${extractErrorMessage(error)}`)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>批量添加凭据</DialogTitle>
          <DialogDescription>
            输入 JSON 数组格式的凭据列表
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* JSON 输入区域 */}
            <div className="space-y-2">
              <label htmlFor="jsonInput" className="text-sm font-medium">
                凭据 JSON <span className="text-red-500">*</span>
              </label>
              <textarea
                id="jsonInput"
                placeholder={`[
  {
    "refreshToken": "aorAAAAAGnSbUI4...",
    "provider": "BuilderId",
    "clientId": "BsV6HMJyIAIb1pCxuApfynVzLWVhc3QtMQ",
    "clientSecret": "eyJraWQiOiJrZXktMTU2NDAyODA5OSIsImFsZyI6IkhTMzg0In0..."
  },
  {
    "refreshToken": "aorAAAAAGniZhQj...",
    "provider": "Github"
  }
]`}
                value={jsonInput}
                onChange={(e) => {
                  setJsonInput(e.target.value)
                  setParseError(null)
                }}
                disabled={isPending}
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
              />
              {parseError && (
                <p className="text-sm text-red-500">{parseError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                字段说明: refreshToken (必填), provider (可选: BuilderId/Github/Google, 默认 BuilderId),
                clientId/clientSecret (BuilderId 必填)
              </p>
            </div>

            {/* 统一优先级 */}
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                统一优先级
              </label>
              <Input
                id="priority"
                type="number"
                min="0"
                placeholder="数字越小优先级越高"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                此优先级将应用于所有批量添加的凭据，数字越小优先级越高
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              取消
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? '添加中...' : '批量添加'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
