import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { videosApi } from '@/api/videos';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft,
  UploadCloud,
  Film,
  MoreVertical,
  Trash2,
  Loader2,
  Play,
  Clock,
  FileVideo,
  Wand2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const statusStyles = {
  UPLOADED: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  PROCESSING: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  READY: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  FAILED: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
};

const statusLabels = {
  UPLOADED: 'Subido',
  PROCESSING: 'Procesando',
  READY: 'Listo',
  FAILED: 'Error',
};

function formatDuration(ms) {
  if (!ms) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
  if (!bytes) return '--';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export function ProjectPage() {
  const { projectId } = useParams();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getById(projectId),
  });

  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: ['videos', projectId],
    queryFn: () => videosApi.getByProject(projectId, { page: 0, size: 50 }),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => videosApi.create(projectId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', projectId] });
      setIsUploadOpen(false);
      setVideoTitle('');
      setVideoFile(null);
      setUploadProgress(0);
      toast.success('Video subido exitosamente');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al subir video');
      setUploadProgress(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (videoId) => videosApi.delete(projectId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos', projectId] });
      setIsDeleteOpen(false);
      setSelectedVideo(null);
      toast.success('Video eliminado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar video');
    },
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoFile || !videoTitle) return;

    const formData = new FormData();
    formData.append('title', videoTitle);
    formData.append('video', videoFile);

    // Simular progreso
    setUploadProgress(10);
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 500);

    try {
      await uploadMutation.mutateAsync(formData);
      setUploadProgress(100);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const project = projectData?.data || projectData;
  const videos = videosData?.data?.content || videosData?.content || [];

  return (
    <Layout>
      <div className="space-y-8" data-testid="project-page">
        {/* Header */}
        <div className="space-y-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a proyectos
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {projectLoading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <>
                  <h1 className="font-outfit text-3xl font-semibold tracking-tight">
                    {project?.name}
                  </h1>
                  {project?.description && (
                    <p className="text-muted-foreground mt-1">{project.description}</p>
                  )}
                </>
              )}
            </div>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-accent hover:bg-accent/90" data-testid="upload-video-button">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Subir video
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleUpload}>
                  <DialogHeader>
                    <DialogTitle className="font-outfit">Subir video</DialogTitle>
                    <DialogDescription>
                      Sube un video horizontal para convertirlo a formato vertical
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título</Label>
                      <Input
                        id="title"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="Título del video"
                        data-testid="video-title-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Video</Label>
                      <div
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*"
                          onChange={handleFileChange}
                          className="hidden"
                          data-testid="video-file-input"
                        />
                        {videoFile ? (
                          <div className="space-y-2">
                            <FileVideo className="h-10 w-10 mx-auto text-accent" />
                            <p className="font-medium">{videoFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(videoFile.size)}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground" />
                            <p className="text-muted-foreground">
                              Haz clic para seleccionar un video
                            </p>
                            <p className="text-sm text-muted-foreground">
                              MP4, MOV, AVI (máx. 200MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {uploadProgress > 0 && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} />
                        <p className="text-sm text-center text-muted-foreground">
                          Subiendo... {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-accent hover:bg-accent/90"
                      disabled={!videoFile || !videoTitle || uploadMutation.isPending}
                      data-testid="upload-video-submit"
                    >
                      {uploadMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Subir
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Videos Grid */}
        {videosLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-video w-full" />
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-muted">
                  <Film className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <h3 className="font-outfit text-xl font-medium">No hay videos</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Sube tu primer video horizontal para convertirlo a formato vertical
              </p>
              <Button className="bg-accent hover:bg-accent/90" onClick={() => setIsUploadOpen(true)}>
                <UploadCloud className="mr-2 h-4 w-4" />
                Subir video
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="group overflow-hidden" data-testid={`video-card-${video.id}`}>
                {/* Thumbnail */}
                <div className="relative aspect-video bg-muted">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Link
                      to={`/projects/${projectId}/videos/${video.id}`}
                      className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors"
                    >
                      <Play className="h-6 w-6 text-black fill-black" />
                    </Link>
                  </div>
                  {video.durationInMillis && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
                      {formatDuration(video.durationInMillis)}
                    </div>
                  )}
                </div>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex-1 min-w-0">
                    <Link to={`/projects/${projectId}/videos/${video.id}`}>
                      <CardTitle className="font-outfit text-base group-hover:text-accent transition-colors truncate">
                        {video.title}
                      </CardTitle>
                    </Link>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className={statusStyles[video.status] || statusStyles.UPLOADED}>
                        {statusLabels[video.status] || video.status}
                      </Badge>
                      {video.sizeInBytes && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(video.sizeInBytes)}
                        </span>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/projects/${projectId}/videos/${video.id}`}>
                          <Wand2 className="mr-2 h-4 w-4" />
                          Procesar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedVideo(video);
                          setIsDeleteOpen(true);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Alert */}
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar video?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará el video y todos sus procesamientos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteMutation.mutate(selectedVideo?.id)}
                className="bg-destructive hover:bg-destructive/90"
                data-testid="confirm-delete-video"
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
