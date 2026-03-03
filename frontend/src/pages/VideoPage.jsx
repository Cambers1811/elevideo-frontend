import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi } from '@/api/videos';
import { processingApi } from '@/api/processing';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Wand2,
  Loader2,
  Download,
  Trash2,
  Clock,
  RefreshCw,
  XCircle,
  CheckCircle,
  Play,
  Film,
  Smartphone,
} from 'lucide-react';
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

const platformOptions = [
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram Reels' },
  { value: 'youtube_shorts', label: 'YouTube Shorts' },
];

const qualityOptions = [
  { value: 'fast', label: 'Rápido' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Alta calidad' },
];

const backgroundModeOptions = [
  { value: 'smart_crop', label: 'Recorte inteligente' },
  { value: 'blurred', label: 'Fondo difuminado' },
  { value: 'black', label: 'Barras negras' },
];

const jobStatusStyles = {
  pending: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  processing: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  completed: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  failed: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  cancelled: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400',
};

const jobStatusLabels = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Completado',
  failed: 'Error',
  cancelled: 'Cancelado',
};

function formatDuration(ms) {
  if (!ms) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function VideoPage() {
  const { projectId, videoId } = useParams();
  const queryClient = useQueryClient();
  
  // Processing form state
  const [processingMode, setProcessingMode] = useState('vertical');
  const [platform, setPlatform] = useState('tiktok');
  const [quality, setQuality] = useState('normal');
  const [backgroundMode, setBackgroundMode] = useState('smart_crop');
  const [shortAutoDuration, setShortAutoDuration] = useState(30);
  const [shortStartTime, setShortStartTime] = useState(0);
  const [shortDuration, setShortDuration] = useState(30);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [headroomRatio, setHeadroomRatio] = useState(0.15);
  const [smoothingStrength, setSmoothingStrength] = useState(0.75);
  
  const [isDeleteRenditionOpen, setIsDeleteRenditionOpen] = useState(false);
  const [selectedRendition, setSelectedRendition] = useState(null);

  const { data: videoData, isLoading: videoLoading } = useQuery({
    queryKey: ['video', projectId, videoId],
    queryFn: () => videosApi.getById(projectId, videoId),
  });

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', videoId],
    queryFn: () => processingApi.getJobs(videoId, { page: 0, size: 20 }),
    refetchInterval: 5000, // Poll every 5 seconds for job updates
  });

  const { data: renditionsData, isLoading: renditionsLoading } = useQuery({
    queryKey: ['renditions', videoId],
    queryFn: () => processingApi.getRenditions(videoId, { page: 0, size: 20 }),
  });

  const processMutation = useMutation({
    mutationFn: (data) => processingApi.processVideo(videoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', videoId] });
      toast.success('Procesamiento iniciado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al iniciar procesamiento');
    },
  });

  const cancelJobMutation = useMutation({
    mutationFn: (jobId) => processingApi.cancelJob(videoId, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', videoId] });
      toast.success('Job cancelado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cancelar job');
    },
  });

  const deleteRenditionMutation = useMutation({
    mutationFn: (renditionId) => processingApi.deleteRendition(videoId, renditionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renditions', videoId] });
      setIsDeleteRenditionOpen(false);
      toast.success('Rendición eliminada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar rendición');
    },
  });

  const handleProcess = () => {
    const data = {
      processingMode,
      platform,
      quality,
      backgroundMode,
    };

    if (processingMode === 'short_auto') {
      data.shortAutoDuration = shortAutoDuration;
    } else if (processingMode === 'short_manual') {
      data.shortOptions = {
        startTime: shortStartTime,
        duration: shortDuration,
      };
    }

    if (showAdvanced) {
      data.advancedOptions = {
        headroomRatio,
        smoothingStrength,
      };
    }

    processMutation.mutate(data);
  };

  const video = videoData?.data || videoData;
  const jobs = jobsData?.data?.content || jobsData?.content || [];
  const renditions = renditionsData?.data?.content || renditionsData?.content || [];

  return (
    <Layout>
      <div className="space-y-8" data-testid="video-page">
        {/* Header */}
        <div className="space-y-4">
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al proyecto
          </Link>
          {videoLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <h1 className="font-outfit text-3xl font-semibold tracking-tight">
              {video?.title}
            </h1>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {videoLoading ? (
              <Skeleton className="aspect-video w-full rounded-lg" />
            ) : video?.secureUrl ? (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={video.secureUrl}
                  controls
                  className="w-full h-full"
                  data-testid="video-player"
                />
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Film className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            {/* Video Info */}
            {video && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Duración</p>
                  <p className="font-medium">{formatDuration(video.durationInMillis)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Resolución</p>
                  <p className="font-medium">{video.width}x{video.height}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Formato</p>
                  <p className="font-medium uppercase">{video.format || 'MP4'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">{video.status}</p>
                </div>
              </div>
            )}

            {/* Tabs: Jobs & Renditions */}
            <Tabs defaultValue="renditions" className="space-y-4">
              <TabsList>
                <TabsTrigger value="renditions" data-testid="renditions-tab">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Videos procesados ({renditions.length})
                </TabsTrigger>
                <TabsTrigger value="jobs" data-testid="jobs-tab">
                  <Clock className="mr-2 h-4 w-4" />
                  Jobs ({jobs.length})
                </TabsTrigger>
              </TabsList>

              {/* Renditions Tab */}
              <TabsContent value="renditions" className="space-y-4">
                {renditionsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-40" />
                    ))}
                  </div>
                ) : renditions.length === 0 ? (
                  <Card className="text-center py-8">
                    <CardContent>
                      <Smartphone className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay videos procesados aún</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renditions.map((rendition) => (
                      <Card key={rendition.id} data-testid={`rendition-${rendition.id}`}>
                        <div className="relative aspect-[9/16] bg-muted rounded-t-lg overflow-hidden max-h-40">
                          {rendition.thumbnailUrl ? (
                            <img
                              src={rendition.thumbnailUrl}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Smartphone className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{rendition.platform}</Badge>
                            <Badge variant="outline">{rendition.processingMode}</Badge>
                          </div>
                          <div className="flex gap-2">
                            {rendition.outputUrl && (
                              <Button asChild size="sm" className="flex-1 bg-accent hover:bg-accent/90">
                                <a href={rendition.outputUrl} download target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" />
                                  Descargar
                                </a>
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRendition(rendition);
                                setIsDeleteRenditionOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Jobs Tab */}
              <TabsContent value="jobs" className="space-y-4">
                {jobsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <Card className="text-center py-8">
                    <CardContent>
                      <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No hay jobs de procesamiento</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <Card key={job.id || job.jobId} data-testid={`job-${job.id || job.jobId}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge className={jobStatusStyles[job.status?.toLowerCase()] || jobStatusStyles.pending}>
                                  {jobStatusLabels[job.status?.toLowerCase()] || job.status}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {job.processingMode}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                ID: {job.id || job.jobId}
                              </p>
                            </div>
                            {(job.status === 'pending' || job.status === 'processing') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelJobMutation.mutate(job.id || job.jobId)}
                                disabled={cancelJobMutation.isPending}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                          {job.status === 'processing' && (
                            <Progress value={job.progress || 50} className="mt-4" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Processing Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-outfit flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-accent" />
                  Procesar video
                </CardTitle>
                <CardDescription>
                  Convierte tu video a formato vertical para redes sociales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Processing Mode */}
                <div className="space-y-2">
                  <Label>Modo de procesamiento</Label>
                  <Select value={processingMode} onValueChange={setProcessingMode}>
                    <SelectTrigger data-testid="processing-mode-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vertical">Video completo vertical</SelectItem>
                      <SelectItem value="short_auto">Short automático</SelectItem>
                      <SelectItem value="short_manual">Short manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Platform */}
                <div className="space-y-2">
                  <Label>Plataforma</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger data-testid="platform-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platformOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <Label>Calidad</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger data-testid="quality-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {qualityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Background Mode */}
                <div className="space-y-2">
                  <Label>Modo de fondo</Label>
                  <Select value={backgroundMode} onValueChange={setBackgroundMode}>
                    <SelectTrigger data-testid="background-mode-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backgroundModeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Short Auto Duration */}
                {processingMode === 'short_auto' && (
                  <div className="space-y-3">
                    <Label>Duración del short: {shortAutoDuration}s</Label>
                    <Slider
                      value={[shortAutoDuration]}
                      onValueChange={([v]) => setShortAutoDuration(v)}
                      min={5}
                      max={60}
                      step={5}
                      data-testid="short-duration-slider"
                    />
                  </div>
                )}

                {/* Short Manual Options */}
                {processingMode === 'short_manual' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tiempo de inicio (segundos)</Label>
                      <Input
                        type="number"
                        value={shortStartTime}
                        onChange={(e) => setShortStartTime(Number(e.target.value))}
                        min={0}
                        data-testid="short-start-time-input"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Duración: {shortDuration}s</Label>
                      <Slider
                        value={[shortDuration]}
                        onValueChange={([v]) => setShortDuration(v)}
                        min={5}
                        max={60}
                        step={5}
                        data-testid="short-manual-duration-slider"
                      />
                    </div>
                  </div>
                )}

                {/* Advanced Options Toggle */}
                <div className="flex items-center justify-between">
                  <Label>Opciones avanzadas</Label>
                  <Switch
                    checked={showAdvanced}
                    onCheckedChange={setShowAdvanced}
                    data-testid="advanced-options-toggle"
                  />
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                  <div className="space-y-4 p-4 rounded-lg bg-muted">
                    <div className="space-y-3">
                      <Label>Espacio sobre cabeza: {(headroomRatio * 100).toFixed(0)}%</Label>
                      <Slider
                        value={[headroomRatio]}
                        onValueChange={([v]) => setHeadroomRatio(v)}
                        min={0}
                        max={0.3}
                        step={0.05}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Suavizado: {(smoothingStrength * 100).toFixed(0)}%</Label>
                      <Slider
                        value={[smoothingStrength]}
                        onValueChange={([v]) => setSmoothingStrength(v)}
                        min={0}
                        max={1}
                        step={0.1}
                      />
                    </div>
                  </div>
                )}

                {/* Process Button */}
                <Button
                  className="w-full bg-accent hover:bg-accent/90"
                  onClick={handleProcess}
                  disabled={processMutation.isPending}
                  data-testid="process-video-button"
                >
                  {processMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Procesar video
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Rendition Alert */}
        <AlertDialog open={isDeleteRenditionOpen} onOpenChange={setIsDeleteRenditionOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar rendición?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteRenditionMutation.mutate(selectedRendition?.id)}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteRenditionMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
