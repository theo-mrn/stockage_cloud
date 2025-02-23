"use client"

import * as React from "react"
import {
  ChevronDown,
  Download,
  File,
  FileText,
  Folder,
  Grid,
  LayoutGrid,
  LayoutList,
  MoreVertical,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: string
  modified: string
  icon?: React.ReactNode
}

const DEMO_FILES: FileItem[] = [
  {
    id: "1",
    name: "Documents",
    type: "folder",
    modified: "2024-02-23",
    icon: <Folder className="h-6 w-6" />,
  },
  {
    id: "2",
    name: "Images",
    type: "folder",
    modified: "2024-02-22",
    icon: <Folder className="h-6 w-6" />,
  },
  {
    id: "3",
    name: "rapport.pdf",
    type: "file",
    size: "2.5 MB",
    modified: "2024-02-21",
    icon: <FileText className="h-6 w-6" />,
  },
  {
    id: "4",
    name: "presentation.pptx",
    type: "file",
    size: "5.1 MB",
    modified: "2024-02-20",
    icon: <File className="h-6 w-6" />,
  },
]

export function CloudStorage() {
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [files, setFiles] = React.useState<FileItem[]>(DEMO_FILES)
  const [currentPath] = React.useState<string[]>(["Mon Cloud"])

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // Simuler l'upload - Dans une vraie application, vous appelleriez votre API ici
      const newFiles: FileItem[] = Array.from(files).map((file) => ({
        id: Math.random().toString(),
        name: file.name,
        type: "file",
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        modified: new Date().toISOString().split("T")[0],
        icon: <File className="h-6 w-6" />,
      }))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button variant="outline" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            <span className="sr-only">Upload file</span>
          </Button>
          <Input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} multiple />
          <div className="flex items-center gap-1 text-sm">
            {currentPath.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronDown className="h-4 w-4" />}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setView(view === "grid" ? "list" : "grid")}>
              {view === "grid" ? <LayoutList className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
            </Button>
            <Select defaultValue="name">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nom</SelectItem>
                <SelectItem value="modified">Date de modification</SelectItem>
                <SelectItem value="size">Taille</SelectItem>
              </SelectContent>
            </Select>
            <div className="w-64">
              <Input placeholder="Rechercher..." className="w-full" type="search" />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4">
        <div
          className={
            view === "grid" ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" : "divide-y"
          }
        >
          {files.map((file) => (
            <FileItem key={file.id} file={file} view={view} />
          ))}
        </div>
      </main>
    </div>
  )
}

function FileItem({ file, view }: { file: FileItem; view: "grid" | "list" }) {
  if (view === "grid") {
    return (
      <div className="group relative rounded-lg border p-3 hover:bg-muted/50">
        <div className="flex flex-col items-center gap-2">
          {file.icon}
          <div className="w-full truncate text-center">{file.name}</div>
        </div>
        <FileActions className="absolute right-2 top-2 opacity-0 group-hover:opacity-100" />
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-4 px-4 py-2 hover:bg-muted/50">
      {file.icon}
      <div className="flex-1">
        <div>{file.name}</div>
        <div className="text-sm text-muted-foreground">
          {file.size && `${file.size} • `}Modifié le {file.modified}
        </div>
      </div>
      <FileActions />
    </div>
  )
}

function FileActions({ className = "" }: { className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`h-8 w-8 ${className}`}>
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Download className="mr-2 h-4 w-4" /> Télécharger
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Grid className="mr-2 h-4 w-4" /> Déplacer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

