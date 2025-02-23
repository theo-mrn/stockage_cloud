import type { FileItem } from "@/types/files"

export const INITIAL_FILES: FileItem[] = [
  {
    id: "1",
    name: "Photos vacances",
    type: "folder",
    modified: "Il y a 2 heures",
    color: "bg-blue-500",
    favorite: false,
  },
  {
    id: "2",
    name: "Documents importants",
    type: "folder",
    modified: "Il y a 3 heures",
    color: "bg-green-500",
    favorite: false,
  },
  {
    id: "3",
    name: "Présentation.pdf",
    type: "document",
    size: "12.5 MB",
    modified: "Il y a 3 heures",
    favorite: true,
    preview: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "4",
    name: "Plage.jpg",
    type: "image",
    size: "3.2 MB",
    modified: "Hier",
    preview: "/placeholder.svg?height=100&width=100",
    favorite: false,
  },
  {
    id: "5",
    name: "Musique.mp3",
    type: "audio",
    size: "8.1 MB",
    modified: "Il y a 2 jours",
    favorite: false,
  },
  {
    id: "6",
    name: "Video.mp4",
    type: "video",
    size: "25.8 MB",
    modified: "Il y a 3 jours",
    preview: "/placeholder.svg?height=100&width=100",
    favorite: false,
  },
  // Fichiers dans le dossier "Photos vacances"
  {
    id: "7",
    name: "Plage-2.jpg",
    type: "image",
    size: "4.2 MB",
    modified: "Hier",
    preview: "/placeholder.svg?height=100&width=100",
    favorite: false,
    parentId: "1",
  },
  {
    id: "8",
    name: "Montagne.jpg",
    type: "image",
    size: "5.1 MB",
    modified: "Hier",
    preview: "/placeholder.svg?height=100&width=100",
    favorite: false,
    parentId: "1",
  },
  // Fichiers dans le dossier "Documents importants"
  {
    id: "9",
    name: "Contrat.pdf",
    type: "document",
    size: "1.2 MB",
    modified: "Il y a 1 jour",
    favorite: false,
    parentId: "2",
  },
  {
    id: "10",
    name: "Factures.pdf",
    type: "document",
    size: "2.8 MB",
    modified: "Il y a 2 jours",
    favorite: false,
    parentId: "2",
  },
]

export const STORAGE_USED = 75.5
export const STORAGE_TOTAL = 100

