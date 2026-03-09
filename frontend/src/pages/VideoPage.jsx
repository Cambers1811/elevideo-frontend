import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi } from '@/api/videos';
import { processingApi } from '@/api/processing';
import { Layout } from '@/components/Layout';
import { VideoPreviewModal } from '@/components/VideoPreviewModal';
import { notifyProcessingComplete, requestNotificationPermission } from '@/lib/notifications';
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
  XCircle,
  Play,
  Film,
  Smartphone,
  Settings2,
  Sparkles,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
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
  { value: 'tiktok', label: 'TikTok', color: 'text-pink-500' },
  { value: 'instagram', label: 'Instagram Reels', color: 'text-purple-500' },
  { value: 'youtube_shorts', label: 'YouTube Shorts', color: 'text-red-500' },
];

const qualityOptions = [
  { value: 'fast', label: 'Rápido', desc: 'Menor calidad, más rápido' },
  { value: 'normal', label: 'Normal', desc: 'Balance óptimo' },
  { value: 'high', label: 'Alta calidad', desc: 'Mejor calidad, más lento' },
];

const backgroundModeOptions = [
  { value: 'smart_crop', label: 'Recorte inteligente', desc: 'IA detecta el sujeto principal' },
  { value: 'blurred', label: 'Fondo difuminado', desc: 'Video original como fondo blur' },
  { value: 'black', label: 'Barras negras', desc: 'Fondo negro simple' },
];

const jobStatusConfig = {
  pending: { label: 'En cola', icon: Clock, className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  processing: { label: 'Procesando', icon: RefreshCw, className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  completed: { label: 'Completado', icon: CheckCircle, className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  failed: { label: 'Error', icon: AlertCircle, className: 'bg-red-500/10 text-red-600 border-red-500/20' },
  cancelled: { label: 'Cancelado', icon: XCircle, className: 'bg-gray-500/10 text-gray-600 border-gray-500/20' },
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
  const prevJobsRef = useRef([]);
  
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [previewRendition, setPreviewRendition] = useState(null);

  const { data: videoData, isLoading: videoLoading } = useQuery({
    queryKey: ['video', projectId, videoId],
    queryFn: () => videosApi.getById(projectId, videoId),
  });

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs', projectId, videoId],
    queryFn: () => processingApi.getJobs(projectId, videoId, { page: 0, size: 20 }),
    refetchInterval: 5000,
  });

  const { data: renditionsData, isLoading: renditionsLoading, refetch: refetchRenditions } = useQuery({
    queryKey: ['renditions', projectId, videoId],
    queryFn: () => processingApi.getRenditions(projectId, videoId, { page: 0, size: 20 }),
  });

  // Check for completed jobs and notify
  useEffect(() => {
    const jobs = jobsData?.data?.content || jobsData?.content || [];
    const prevJobs = prevJobsRef.current;
    
    jobs.forEach((job) => {
      const prevJob = prevJobs.find((p) => (p.id || p.jobId) === (job.id || job.jobId));
      if (prevJob && prevJob.status !== job.status) {
        if (job.status === 'completed' || job.status === 'failed') {
          notifyProcessingComplete(videoData?.data?.title || 'Video', job.status);
          if (job.status === 'completed') {
            refetchRenditions();
          }
        }
      }
    });
    
    prevJobsRef.current = jobs;
  }, [jobsData, videoData, refetchRenditions]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const processMutation = useMutation({
    mutationFn: (data) => processingApi.createJob(projectId, videoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', projectId, videoId] });
      toast.success('¡Procesamiento iniciado! Te notificaremos cuando termine.');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al iniciar procesamiento');
    },
  });

  const cancelJobMutation = useMutation({
    mutationFn: (jobId) => processingApi.cancelJob(projectId, videoId, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', projectId, videoId] });
      toast.success('Job cancelado');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al cancelar');
    },
  });

  const deleteRenditionMutation = useMutation({
    mutationFn: (renditionId) => processingApi.deleteRendition(projectId, videoId, renditionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['renditions', projectId, videoId] });
      setIsDeleteRenditionOpen(false);
      toast.success('Rendición eliminada');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
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
  const activeJobs = jobs.filter((j) => j.status === 'pending' || j.status === 'processing');

  return (
    <Layout>
      <div className="space-y-8" data-testid="video-page">
        {/* Header */}
        <div className="space-y-4">
          <Link
            to={`/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver al proyecto
          </Link>
          {videoLoading ? (
            <Skeleton className="h-10 w-64" />
          ) : (
            <h1 className="font-outfit text-4xl font-bold tracking-tight">
              {video?.title}
            </h1>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {videoLoading ? (
              <Skeleton className="aspect-video w-full rounded-2xl" />
            ) : video?.secureUrl ? (
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                <video
                  src={video.secureUrl}
                  controls
                  className="w-full h-full"
                  data-testid="video-player"
                  poster={video.thumbnailUrl}
                />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
                <Film className="h-20 w-20 text-white/20" />
              </div>
            )}

            {/* Video Info */}
            {video && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Duración', value: formatDuration(video.durationInMillis) },
                  { label: 'Resolución', value: `${video.width}×${video.height}` },
                  { label: 'Formato', value: (video.format || 'MP4').toUpperCase() },
                  { label: 'Estado', value: video.status, isStatus: true },
                ].map((item) => (
                  <div key={item.label} className="stat-card rounded-xl p-4">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className={`font-semibold font-outfit ${item.isStatus ? 'text-green-500' : ''}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <Tabs defaultValue="renditions" className="space-y-6">
              <TabsList className="w-full grid grid-cols-2 h-12 p-1 bg-muted/50">
                <TabsTrigger value="renditions" className="data-[state=active]:bg-background" data-testid="renditions-tab">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Videos procesados ({renditions.length})
                </TabsTrigger>
                <TabsTrigger value="jobs" className="data-[state=active]:bg-background" data-testid="jobs-tab">
                  <Clock className="mr-2 h-4 w-4" />
                  Jobs {activeJobs.length > 0 && `(${activeJobs.length} activos)`}
                </TabsTrigger>
              </TabsList>

              {/* Renditions Tab */}
              <TabsContent value="renditions" className="space-y-4">
                {renditionsLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="aspect-[9/16] rounded-xl" />
                    ))}
                  </div>
                ) : renditions.length === 0 ? (
                  <Card className="text-center py-12 border-dashed border-2">
                    <CardContent className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Smartphone className="h-8 w-8 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-outfit font-semibold text-lg">No hay videos procesados</h3>
                        <p className="text-muted-foreground text-sm">
                          Usa el panel de la derecha para convertir tu video
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {renditions.map((rendition) => (
                      <Card 
                        key={rendition.id} 
                        className="card-3d overflow-hidden border-border/50 group"
                        data-testid={`rendition-${rendition.id}`}
                      >
                        <div className="relative aspect-[9/16] bg-gradient-to-br from-slate-800 to-slate-900">
                          {rendition.thumbnailUrl ? (
                            <img
                              src={rendition.thumbnailUrl}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : rendition.outputUrl || rendition.previewUrl ? (
                            <video
                              src={rendition.outputUrl || rendition.previewUrl}
                              className="w-full h-full object-cover"
                              muted
                              preload="metadata"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Smartphone className="h-12 w-12 text-white/20" />
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          {/* Play button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <Button
                              size="icon"
                              className="w-12 h-12 rounded-full bg-white/90 hover:bg-white text-black"
                              onClick={() => {
                                setPreviewVideo(video);
                                setPreviewRendition(rendition);
                                setIsPreviewOpen(true);
                              }}
                            >
                              <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
                            </Button>
                          </div>

                          {/* Platform badge */}
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-black/50 text-white border-0 backdrop-blur-sm">
                              {rendition.platform}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {rendition.processingMode}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {rendition.quality || 'Normal'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                              onClick={() => {
                                setPreviewVideo(video);
                                setPreviewRendition(rendition);
                                setIsPreviewOpen(true);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                            {rendition.outputUrl && (
                              <Button asChild size="sm" variant="outline">
                                <a href={rendition.outputUrl} download target="_blank" rel="noopener noreferrer">
                                  <Download className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRendition(rendition);
                                setIsDeleteRenditionOpen(true);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
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
                      <Skeleton key={i} className="h-20 rounded-xl" />
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <Card className="text-center py-12 border-dashed border-2">
                    <CardContent className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-outfit font-semibold text-lg">No hay jobs</h3>
                        <p className="text-muted-foreground text-sm">
                          Los jobs aparecerán aquí cuando proceses un video
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job) => {
                      const status = jobStatusConfig[job.status?.toLowerCase()] || jobStatusConfig.pending;
                      const StatusIcon = status.icon;
                      
                      return (
                        <Card key={job.id || job.jobId} className="border-border/50" data-testid={`job-${job.id || job.jobId}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-lg ${status.className}`}>
                                  <StatusIcon className={`h-5 w-5 ${job.status === 'processing' ? 'animate-spin' : ''}`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={`${status.className} border font-medium`}>
                                      {status.label}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                      {job.processingMode}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    ID: {(job.id || job.jobId).slice(0, 8)}...
                                  </p>
                                </div>
                              </div>
                              {(job.status === 'pending' || job.status === 'processing') && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => cancelJobMutation.mutate(job.id || job.jobId)}
                                  disabled={cancelJobMutation.isPending}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancelar
                                </Button>
                              )}
                            </div>
                            {job.status === 'processing' && (
                              <Progress value={job.progress || 50} className="mt-4 h-2" />
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Processing Panel */}
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="font-outfit flex items-center gap-2 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <Wand2 className="h-5 w-5 text-purple-500" />
                  </div>
                  Procesar video
                </CardTitle>
                <CardDescription>
                  Convierte a formato vertical 9:16 para redes sociales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Processing Mode */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Modo de procesamiento</Label>
                  <div className="grid gap-2">
                    {[
                      { value: 'vertical', label: 'Video completo', desc: 'Convierte todo el video' },
                      { value: 'short_auto', label: 'Short automático', desc: 'IA selecciona el mejor momento' },
                      { value: 'short_manual', label: 'Short manual', desc: 'Tú eliges inicio y duración' },
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setProcessingMode(mode.value)}
                        className={`w-full p-3 rounded-lg border text-left transition-all ${
                          processingMode === mode.value
                            ? 'border-purple-500 bg-purple-500/10'
                            : 'border-border hover:border-purple-500/50'
                        }`}
                      >
                        <p className="font-medium text-sm">{mode.label}</p>
                        <p className="text-xs text-muted-foreground">{mode.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform */}
                <div className="space-y-2">
                  <Label>Plataforma destino</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="h-11" data-testid="platform-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platformOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={opt.color}>{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <Label>Calidad</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="h-11" data-testid="quality-select">
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
                    <SelectTrigger className="h-11" data-testid="background-mode-select">
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
                  <div className="space-y-3 p-4 rounded-lg bg-muted/50">
                    <div className="flex justify-between">
                      <Label>Duración del short</Label>
                      <span className="text-sm font-medium text-purple-500">{shortAutoDuration}s</span>
                    </div>
                    <Slider
                      value={[shortAutoDuration]}
                      onValueChange={([v]) => setShortAutoDuration(v)}
                      min={5}
                      max={60}
                      step={5}
                      className="py-2"
                      data-testid="short-duration-slider"
                    />
                  </div>
                )}

                {/* Short Manual Options */}
                {processingMode === 'short_manual' && (
                  <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label>Tiempo de inicio (segundos)</Label>
                      <Input
                        type="number"
                        value={shortStartTime}
                        onChange={(e) => setShortStartTime(Number(e.target.value))}
                        min={0}
                        className="h-11"
                        data-testid="short-start-time-input"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Duración</Label>
                        <span className="text-sm font-medium text-purple-500">{shortDuration}s</span>
                      </div>
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
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-muted-foreground" />
                    <Label className="cursor-pointer">Opciones avanzadas</Label>
                  </div>
                  <Switch
                    checked={showAdvanced}
                    onCheckedChange={setShowAdvanced}
                    data-testid="advanced-options-toggle"
                  />
                </div>

                {/* Advanced Options */}
                {showAdvanced && (
                  <div className="space-y-4 p-4 rounded-lg border border-dashed">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Espacio superior</Label>
                        <span className="text-sm">{(headroomRatio * 100).toFixed(0)}%</span>
                      </div>
                      <Slider
                        value={[headroomRatio]}
                        onValueChange={([v]) => setHeadroomRatio(v)}
                        min={0}
                        max={0.3}
                        step={0.05}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Suavizado de cámara</Label>
                        <span className="text-sm">{(smoothingStrength * 100).toFixed(0)}%</span>
                      </div>
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
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all text-base font-medium"
                  onClick={handleProcess}
                  disabled={processMutation.isPending}
                  data-testid="process-video-button"
                >
                  {processMutation.isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-5 w-5" />
                  )}
                  Convertir a vertical
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Video Preview Modal */}
        <VideoPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewRendition(null);
          }}
          video={previewVideo}
          rendition={previewRendition}
        />

        {/* Delete Rendition Alert */}
        <AlertDialog open={isDeleteRenditionOpen} onOpenChange={setIsDeleteRenditionOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar video procesado?</AlertDialogTitle>
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
