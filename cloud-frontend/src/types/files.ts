export interface FileItem {
  id: string
  name: string
  type: "file" | "folder" | "image" | "video" | "audio" | "document"
  size?: string
  modified: string
  icon?: React.ReactNode
  filepath?: string
  favorite?: boolean
  color?: string
  parentId?: string | null
  preview?: string
} 