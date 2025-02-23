export interface FileItem {
  id: string
  name: string
  type: "image" | "video" | "audio" | "document" | "folder"
  size?: string
  modified: string
  favorite: boolean
  color?: string
  preview?: string
  parentId?: string | null
}

