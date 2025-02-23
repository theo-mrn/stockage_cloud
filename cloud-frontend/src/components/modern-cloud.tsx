"use client"

import * as React from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  ChevronRight,
  Cloud,
  Download,
  FileIcon,
  FolderIcon,
  FolderPlus,
  Grid2X2,
  Heart,
  ImageIcon,
  List,
  Menu,
  MoreHorizontal,
  Music,
  Plus,
  Settings,
  Star,
  Upload,
  Video,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import { fileService, FileInfo } from "@/lib/fileService"
import { STORAGE_TOTAL, STORAGE_USED } from "@/lib/data"

export function ModernCloud() {
  const [view, setView] = React.useState<"grid" | "list">("grid")
  const [files, setFiles] = React.useState<FileInfo[]>([])
  const [activeTab, setActiveTab] = React.useState("all")
  const [showNewFolderDialog, setShowNewFolderDialog] = React.useState(false)
  const [newFolderName, setNewFolderName] = React.useState("")
  const [draggedFile, setDraggedFile] = React.useState<string | null>(null)
  const [currentFolder, setCurrentFolder] = React.useState<string | null>(null)
  const [folderPath, setFolderPath] = React.useState<Array<{ id: string; name: string }>>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [currentMedia, setCurrentMedia] = React.useState<{ type: string; url: string; filename: string } | null>(null)
  const [showMediaModal, setShowMediaModal] = React.useState(false)

  const loadFiles = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fileService.getFiles()
      setFiles(response.data)
    } catch (err) {
      console.error("Erreur lors du chargement des fichiers:", err)
      setError("Impossible de charger les fichiers")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadFiles()
  }, [loadFiles])

  const toggleFavorite = async (fileId: string) => {
    try {
      const file = files.find(f => f.id === fileId)
      if (!file) return

      const response = await fileService.updateFile(fileId, {
        favorite: !file.favorite
      })

      setFiles(files.map(f => f.id === fileId ? response.data : f))
    } catch (err) {
      console.error("Erreur lors de la mise à jour du favori:", err)
      setError("Impossible de mettre à jour le favori")
    }
  }

  const createNewFolder = async () => {
    if (newFolderName.trim()) {
      try {
        const formData = new FormData()
        formData.append("type", "folder")
        formData.append("name", newFolderName)
        if (currentFolder) {
          formData.append("parentId", currentFolder)
        }

        const response = await fileService.uploadFile(formData)
        setFiles([response.data, ...files])
        setNewFolderName("")
        setShowNewFolderDialog(false)
      } catch (err) {
        console.error("Erreur lors de la création du dossier:", err)
        setError("Impossible de créer le dossier")
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (!uploadedFiles) return

    try {
      setIsLoading(true)
      setError(null)

      for (const file of Array.from(uploadedFiles)) {
        const formData = new FormData()
        formData.append("file", file)
        if (currentFolder) {
          formData.append("parentId", currentFolder)
        }

        const response = await fileService.uploadFile(formData)
        setFiles(prev => [response.data, ...prev])
      }
    } catch (err) {
      console.error("Erreur lors de l'upload:", err)
      setError("Erreur lors de l'upload des fichiers")
    } finally {
      setIsLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const moveFileToFolder = async (fileId: string, folderId: string | null) => {
    try {
      const response = await fileService.updateFile(fileId, {
        parentId: folderId
      })
      setFiles(files.map(f => f.id === fileId ? response.data : f))
    } catch (err) {
      console.error("Erreur lors du déplacement du fichier:", err)
      setError("Impossible de déplacer le fichier")
    }
  }

  const deleteFile = async (fileId: string) => {
    try {
      await fileService.deleteFile(fileId)
      setFiles(files.filter(f => f.id !== fileId))
    } catch (err) {
      console.error("Erreur lors de la suppression:", err)
      setError("Impossible de supprimer le fichier")
    }
  }

  const downloadFile = async (filepath: string, filename: string) => {
    try {
      const blob = await fileService.downloadFile(filepath)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error("Erreur lors du téléchargement:", err)
      setError("Impossible de télécharger le fichier")
    }
  }

  const enterFolder = (folderId: string, folderName: string) => {
    setCurrentFolder(folderId)
    setFolderPath([...folderPath, { id: folderId, name: folderName }])
  }

  const navigateToFolder = (folderId: string | null, index: number) => {
    setCurrentFolder(folderId)
    setFolderPath(folderPath.slice(0, index + 1))
  }

  const goBack = () => {
    if (folderPath.length > 0) {
      const newPath = folderPath.slice(0, -1)
      setFolderPath(newPath)
      setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1].id : null)
    }
  }

  const filteredFiles = React.useMemo(() => {
    let filtered = files

    if (activeTab === "favorites") {
      filtered = filtered.filter(file => file.favorite)
    } else if (activeTab !== "all") {
      filtered = filtered.filter(file => file.type === activeTab)
    }

    filtered = filtered.filter(file => {
      const isInRoot = !file.parentId
      const isInCurrentFolder = file.parentId === currentFolder
      return currentFolder === null ? isInRoot : isInCurrentFolder
    })

    return filtered
  }, [files, currentFolder, activeTab])

  const containerVariants = {
    grid: {
      transition: { duration: 0.3 },
    },
    list: {
      transition: { duration: 0.3 },
    },
  }

  const itemVariants = {
    grid: {
      width: "100%",
      height: "auto",
      transition: { duration: 0.3 },
    },
    list: {
      width: "100%",
      height: "auto",
      transition: { duration: 0.3 },
    },
  }

  const openFile = (file: FileInfo) => {
    if (file.type === "folder") {
      enterFolder(file.id, file.filename);
      return;
    }

    const fileUrl = `${process.env.NEXT_PUBLIC_API_URL}${file.filepath}`;
    
    // Pour les images, PDFs et textes, ouvrir dans un nouvel onglet
    if (["image", "document"].includes(file.type)) {
      window.open(fileUrl, '_blank');
      return;
    }

    // Pour les fichiers audio et vidéo, ouvrir dans une modal
    if (["audio", "video"].includes(file.type)) {
      setCurrentMedia({ type: file.type, url: fileUrl, filename: file.filename });
      setShowMediaModal(true);
      return;
    }

    // Pour les autres types de fichiers, télécharger
    downloadFile(file.filepath, file.filename);
  };

  if (isLoading && files.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute left-4 top-4">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </SheetContent>
      </Sheet>

      <div className="hidden md:flex w-72 flex-col gap-2 border-r p-6">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b p-4">
          <div className="flex items-center gap-4 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-2 flex-1">
              {currentFolder && (
                <Button variant="ghost" size="icon" onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex items-center gap-1 text-sm">
                <div
                  className={`rounded-lg transition-colors ${
                    draggedFile ? "hover:bg-accent hover:border-primary" : ""
                  }`}
                  onDragOver={(e) => {
                    if (draggedFile) {
                      e.preventDefault()
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (draggedFile) {
                      moveFileToFolder(draggedFile, null)
                      setDraggedFile(null)
                    }
                  }}
                >
                  <Button variant="ghost" onClick={() => navigateToFolder(null, -1)}>
                    Mon Cloud
                  </Button>
                </div>
                {folderPath.map((folder, index) => (
                  <React.Fragment key={folder.id}>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <div
                      className={`rounded-lg transition-colors ${
                        draggedFile ? "hover:bg-accent hover:border-primary" : ""
                      }`}
                      onDragOver={(e) => {
                        if (draggedFile) {
                          e.preventDefault()
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        if (draggedFile) {
                          moveFileToFolder(draggedFile, folder.id)
                          setDraggedFile(null)
                        }
                      }}
                    >
                      <Button variant="ghost" onClick={() => navigateToFolder(folder.id, index)}>
                        {folder.name}
                      </Button>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setView(view === "grid" ? "list" : "grid")}>
                {view === "grid" ? <List className="h-5 w-5" /> : <Grid2X2 className="h-5 w-5" />}
              </Button>
              <Button variant="outline" onClick={() => setShowNewFolderDialog(true)} className="hidden sm:flex">
                <FolderPlus className="mr-2 h-4 w-4" /> Nouveau dossier
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} className="hidden sm:flex">
                <Upload className="mr-2 h-4 w-4" /> Upload
              </Button>
              <Button size="icon" onClick={() => fileInputRef.current?.click()} className="sm:hidden">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} multiple />
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  {activeTab === "favorites" ? (
                    <Star className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <FolderIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <h3 className="text-lg font-medium">Aucun fichier trouvé</h3>
                <p className="text-muted-foreground">
                  {activeTab === "favorites"
                    ? "Ajoutez des fichiers à vos favoris pour les retrouver ici"
                    : currentFolder
                      ? "Ce dossier est vide"
                      : "Commencez par uploader des fichiers"}
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                animate={view}
                className={view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}
              >
                <AnimatePresence>
                  {filteredFiles.map((file) => (
                    <motion.div
                      key={file.id}
                      layout
                      variants={itemVariants}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FileCard
                        file={file}
                        view={view}
                        onToggleFavorite={() => toggleFavorite(file.id)}
                        onDragStart={() => setDraggedFile(file.id)}
                        onDragEnd={() => setDraggedFile(null)}
                        onDrop={(folderId) => {
                          if (draggedFile && draggedFile !== file.id) {
                            moveFileToFolder(draggedFile, folderId)
                          }
                        }}
                        onDelete={() => deleteFile(file.id)}
                        onDownload={() => downloadFile(file.filepath, file.filename)}
                        isDragging={draggedFile === file.id}
                        onOpenFile={openFile}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau dossier</DialogTitle>
            <DialogDescription>Créez un nouveau dossier pour organiser vos fichiers</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Nom du dossier"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>
              Annuler
            </Button>
            <Button onClick={createNewFolder}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Media Modal */}
      <Dialog open={showMediaModal} onOpenChange={setShowMediaModal}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{currentMedia?.filename}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
            {currentMedia?.type === "video" && (
              <video 
                src={currentMedia.url} 
                controls 
                className="w-full h-full"
                autoPlay
              />
            )}
            {currentMedia?.type === "audio" && (
              <div className="flex items-center justify-center h-full">
                <audio 
                  src={currentMedia.url} 
                  controls 
                  className="w-full max-w-md"
                  autoPlay
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <style jsx global>{`
        .hover\:border-primary:hover {
          box-shadow: 0 0 0 2px var(--primary);
        }
      `}</style>
    </div>
  )
}

function Sidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <>
      <div className="flex items-center gap-2 px-2">
        <Cloud className="h-6 w-6" />
        <h1 className="text-xl font-semibold">Cloud Storage</h1>
      </div>
      <div className="mt-2 px-2">
        <Progress value={STORAGE_USED} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {STORAGE_USED} GB utilisés sur {STORAGE_TOTAL} GB
        </p>
      </div>
      <nav className="space-y-1 mt-6">
        <NavItem icon={Grid2X2} active={activeTab === "all"} onClick={() => onTabChange("all")}>
          Tous les fichiers
        </NavItem>
        <NavItem icon={Star} active={activeTab === "favorites"} onClick={() => onTabChange("favorites")}>
          Favoris
        </NavItem>
        <NavItem icon={ImageIcon} active={activeTab === "images"} onClick={() => onTabChange("images")}>
          Images
        </NavItem>
        <NavItem icon={Video} active={activeTab === "videos"} onClick={() => onTabChange("videos")}>
          Vidéos
        </NavItem>
        <NavItem icon={Music} active={activeTab === "audio"} onClick={() => onTabChange("audio")}>
          Audio
        </NavItem>
        <NavItem icon={FileIcon} active={activeTab === "documents"} onClick={() => onTabChange("documents")}>
          Documents
        </NavItem>
        <Separator className="my-4" />
        <NavItem icon={Settings}>Paramètres</NavItem>
      </nav>
    </>
  )
}

function NavItem({
  icon: Icon,
  children,
  active,
  onClick,
}: {
  icon: React.ElementType
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <Button variant="ghost" className={`w-full justify-start ${active ? "bg-accent" : ""}`} onClick={onClick}>
      <Icon className="mr-2 h-4 w-4" />
      {children}
    </Button>
  )
}

function FileCard({
  file,
  view,
  onToggleFavorite,
  onDragStart,
  onDragEnd,
  onDrop,
  onDelete,
  onDownload,
  isDragging,
  onOpenFile,
}: {
  file: FileInfo
  view: "grid" | "list"
  onToggleFavorite: () => void
  onDragStart: () => void
  onDragEnd: () => void
  onDrop: (folderId: string) => void
  onDelete: () => void
  onDownload: () => void
  isDragging: boolean
  onOpenFile: (file: FileInfo) => void
}) {
  const [isOver, setIsOver] = React.useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    if (file.type === "folder") {
      e.preventDefault()
      setIsOver(true)
    }
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    if (file.type === "folder") {
      onDrop(file.id)
    }
  }

  const handleClick = () => {
    onOpenFile(file);
  };

  const renderPreview = () => {
    switch (file.type) {
      case "image":
        return (
          <div className="aspect-video rounded-t-lg overflow-hidden bg-black relative">
            <Image 
              src={`${process.env.NEXT_PUBLIC_API_URL}${file.filepath}`} 
              alt={file.filename} 
              fill
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
          </div>
        )
      case "video":
        return (
          <div className="aspect-video rounded-t-lg bg-black flex items-center justify-center">
            <Video className="h-8 w-8 text-white" />
          </div>
        )
      case "audio":
        return (
          <div className="aspect-video rounded-t-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Music className="h-8 w-8 text-white" />
          </div>
        )
      case "folder":
        return (
          <div className={`aspect-video rounded-t-lg ${file.color || "bg-accent"} flex items-center justify-center`}>
            <FolderIcon className="h-8 w-8 text-white" />
          </div>
        )
      default:
        return (
          <div className="aspect-video rounded-t-lg bg-accent flex items-center justify-center">
            <FileIcon className="h-8 w-8" />
          </div>
        )
    }
  }

  if (view === "list") {
    return (
      <div
        draggable={file.type !== "folder"}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          flex items-center gap-4 p-3 rounded-lg border cursor-pointer
          ${isDragging ? "opacity-50" : ""}
          ${isOver ? "border-primary bg-accent" : "hover:bg-accent"}
          transition-colors duration-200
        `}
      >
        <div className="h-10 w-10 rounded overflow-hidden flex items-center justify-center shrink-0">
          {file.type === "folder" ? (
            <div className={`h-full w-full ${file.color || "bg-accent"} flex items-center justify-center`}>
              <FolderIcon className="h-6 w-6 text-white" />
            </div>
          ) : file.type === "image" ? (
            <div className="h-10 w-10 relative">
              <Image 
                src={`${process.env.NEXT_PUBLIC_API_URL}${file.filepath}`} 
                alt={file.filename} 
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder.svg";
                }}
              />
            </div>
          ) : (
            renderPreview()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{file.filename}</p>
          <p className="text-sm text-muted-foreground truncate">
            {file.size && `${file.size} • `}
            {file.modified}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
          >
            <Heart className={`h-4 w-4 ${file.favorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <FileActions onDelete={onDelete} onDownload={onDownload} />
        </div>
      </div>
    )
  }

  return (
    <div
      draggable={file.type !== "folder"}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        group relative rounded-lg border cursor-pointer
        ${isDragging ? "opacity-50" : ""}
        ${isOver ? "border-primary bg-accent" : "hover:bg-accent"}
        transition-colors duration-200
      `}
    >
      {renderPreview()}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium truncate">{file.filename}</p>
            <p className="text-sm text-muted-foreground truncate">
              {file.size && `${file.size} • `}
              {file.modified}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
          >
            <Heart className={`h-4 w-4 ${file.favorite ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
        </div>
      </div>
      <FileActions
        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onDelete={onDelete}
        onDownload={onDownload}
        onClick={(e) => e.stopPropagation()}
      />
      {isOver && (
        <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center">
          <div className="bg-background/90 px-4 py-2 rounded-full text-sm font-medium">Déposer ici</div>
        </div>
      )}
    </div>
  )
}

function FileActions({
  className = "",
  onDelete,
  onDownload,
  onClick,
}: {
  className?: string
  onDelete: () => void
  onDownload: () => void
  onClick?: (e: React.MouseEvent) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className={`h-8 w-8 ${className}`} onClick={onClick}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" /> Télécharger
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Plus className="mr-2 h-4 w-4" /> Déplacer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={onDelete}>
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

