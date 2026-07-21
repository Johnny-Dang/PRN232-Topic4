'use client';

import { useEffect, useState } from 'react';
import { Loader2, Plus, Target, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CalibrationSubmission,
  createCalibrationSubmission,
  getEvents,
  getRounds,
  Event,
  Round,
} from '@/lib/api';

interface CreateCalibrationDialogProps {
  onSuccess?: (submission: CalibrationSubmission) => void;
}

export default function CreateCalibrationDialog({
  onSuccess,
}: CreateCalibrationDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);

  const [formData, setFormData] = useState({
    eventId: '',
    roundId: '',
    calibrationTitle: '',
    repositoryURL: '',
    demoURL: '',
    slideURL: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      eventId: '',
      roundId: '',
      calibrationTitle: '',
      repositoryURL: '',
      demoURL: '',
      slideURL: '',
    });
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      resetForm();
    }
  };

  useEffect(() => {
    if (!open) return;
    let isSubscribed = true;
    queueMicrotask(() => {
      if (isSubscribed) setLoadingEvents(true);
    });
    getEvents()
      .then((fetchedEvents) => {
        if (isSubscribed) setEvents(fetchedEvents);
      })
      .catch((error) => {
        console.error('Failed to load events:', error);
        toast.error('Không thể tải danh sách sự kiện');
      })
      .finally(() => {
        if (isSubscribed) setLoadingEvents(false);
      });
    return () => {
      isSubscribed = false;
    };
  }, [open]);

  useEffect(() => {
    if (!formData.eventId) {
      return;
    }
    let isSubscribed = true;
    queueMicrotask(() => {
      if (isSubscribed) setLoadingRounds(true);
    });
    getRounds(formData.eventId)
      .then((fetchedRounds) => {
        if (isSubscribed) setRounds(fetchedRounds);
      })
      .catch((error) => {
        console.error('Failed to load rounds:', error);
        toast.error('Không thể tải danh sách vòng');
      })
      .finally(() => {
        if (isSubscribed) setLoadingRounds(false);
      });
    return () => {
      isSubscribed = false;
    };
  }, [formData.eventId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.roundId) {
      newErrors.roundId = 'Vui lòng chọn vòng thi';
    }

    if (!formData.calibrationTitle.trim()) {
      newErrors.calibrationTitle = 'Vui lòng nhập tiêu đề bài mẫu';
    } else if (formData.calibrationTitle.length > 200) {
      newErrors.calibrationTitle = 'Tiêu đề không được vượt quá 200 ký tự';
    }

    const hasAtLeastOneUrl = Boolean(
      formData.repositoryURL.trim() ||
        formData.demoURL.trim() ||
        formData.slideURL.trim()
    );

    if (!hasAtLeastOneUrl) {
      newErrors.urls =
        'Vui lòng nhập ít nhất 1 trong 3 liên kết (Repository URL, Demo URL, hoặc Slide URL)';
    }

    if (formData.repositoryURL.trim() && !isValidURL(formData.repositoryURL.trim())) {
      newErrors.repositoryURL = 'URL repository không hợp lệ';
    }

    if (formData.demoURL.trim() && !isValidURL(formData.demoURL.trim())) {
      newErrors.demoURL = 'URL demo không hợp lệ';
    }

    if (formData.slideURL.trim() && !isValidURL(formData.slideURL.trim())) {
      newErrors.slideURL = 'URL slide không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidURL = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submission = await createCalibrationSubmission({
        roundId: formData.roundId,
        calibrationTitle: formData.calibrationTitle.trim(),
        repositoryURL: formData.repositoryURL.trim() || undefined,
        demoURL: formData.demoURL.trim() || undefined,
        slideURL: formData.slideURL.trim() || undefined,
      });

      if (submission) {
        toast.success('Đã tạo bài mẫu calibration thành công!');
        setOpen(false);
        onSuccess?.(submission);
      }
    } catch (error) {
      console.error('Failed to create calibration:', error);
      toast.error('Không thể tạo bài mẫu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const selectedEvent = events.find((e) => e.EventID === formData.eventId);
  const selectedRound = rounds.find((r) => r.RoundID === formData.roundId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm">
        <Plus className="size-4" />
        Tạo bài mẫu mới
      </Button>} />

      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="size-5 text-primary" />
              Tạo bài mẫu Calibration
            </DialogTitle>
            <DialogDescription>
              Tạo bài mẫu để các Judge chấm điểm nhằm kiểm tra sự nhất quán.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Event Selection */}
            <div className="grid gap-2">
              <Label htmlFor="event">
                Sự kiện <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.eventId}
                onValueChange={(value) => {
                  setRounds([]);
                  setFormData((prev) => ({
                    ...prev,
                    eventId: value || '',
                    roundId: '',
                  }));
                }}
              >
                <SelectTrigger id="event" disabled={loadingEvents}>
                  <SelectValue placeholder="Chọn sự kiện">
                    {selectedEvent?.EventName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.EventID} value={event.EventID}>
                      {event.EventName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Round Selection */}
            <div className="grid gap-2">
              <Label htmlFor="round">
                Vòng thi <span className="text-destructive">*</span>
              </Label>
              {loadingRounds ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Đang tải vòng thi...
                </div>
              ) : (
                <Select
                  value={formData.roundId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, roundId: value || '' }))}
                  disabled={!formData.eventId || loadingRounds}
                >
                  <SelectTrigger id="round">
                    <SelectValue placeholder="Chọn vòng thi">
                      {selectedRound?.RoundName}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {rounds.map((round) => (
                      <SelectItem key={round.RoundID} value={round.RoundID}>
                        {round.RoundName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.roundId && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" />
                  {errors.roundId}
                </p>
              )}
            </div>

            {/* Calibration Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">
                Tiêu đề bài mẫu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="VD: Sample AI Project - Round 1"
                value={formData.calibrationTitle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    calibrationTitle: e.target.value,
                  }))
                }
                maxLength={200}
              />
              {errors.calibrationTitle && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" />
                  {errors.calibrationTitle}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formData.calibrationTitle.length}/200 ký tự
              </p>
            </div>

            {/* URLs Section */}
            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Liên kết <span className="text-destructive">*</span>
                </p>
                <span className="text-xs text-muted-foreground">(Cần nhập ít nhất 1 đường dẫn)</span>
              </div>

              {errors.urls && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="size-3" />
                  {errors.urls}
                </p>
              )}

              <div className="grid gap-2">
                <Label htmlFor="repo" className="text-xs">
                  Repository URL
                </Label>
                <Input
                  id="repo"
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.repositoryURL}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      repositoryURL: e.target.value,
                    }))
                  }
                />
                {errors.repositoryURL && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3" />
                    {errors.repositoryURL}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="demo" className="text-xs">
                  Demo URL
                </Label>
                <Input
                  id="demo"
                  type="url"
                  placeholder="https://demo.example.com"
                  value={formData.demoURL}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      demoURL: e.target.value,
                    }))
                  }
                />
                {errors.demoURL && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3" />
                    {errors.demoURL}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="slide" className="text-xs">
                  Slide URL
                </Label>
                <Input
                  id="slide"
                  type="url"
                  placeholder="https://slides.example.com"
                  value={formData.slideURL}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slideURL: e.target.value,
                    }))
                  }
                />
                {errors.slideURL && (
                  <p className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="size-3" />
                    {errors.slideURL}
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  Tạo bài mẫu
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
