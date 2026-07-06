'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { exportCalibrationCSV } from '@/lib/api';

interface CalibrationExportButtonProps {
  calibrationId: string;
  calibrationTitle: string;
  trigger?: React.ReactNode;
  onSuccess?: (filename: string) => void;
}

export default function CalibrationExportButton({
  calibrationId,
  calibrationTitle,
  trigger,
  onSuccess,
}: CalibrationExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      const blob = await exportCalibrationCSV(calibrationId);

      if (!blob) {
        toast.error('Không thể xuất file. Vui lòng thử lại.');
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const safeTitle = calibrationTitle
        .replace(/[^a-zA-Z0-9\u00C0-\u024F\u1EA0-\u1EF9\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);

      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `calibration_${safeTitle}_${timestamp}.csv`;

      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Đã xuất file: ${filename}`);
      onSuccess?.(filename);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Đã xảy ra lỗi khi xuất file. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (trigger) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        {loading ? (
          <Button
            variant="ghost"
            size="sm"
            disabled
            className="w-full justify-start"
          >
            <Loader2 className="size-4 animate-spin" />
            Đang xuất...
          </Button>
        ) : (
          <div onClick={handleExport}>{trigger}</div>
        )}
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Đang xuất...
        </>
      ) : (
        <>
          <Download className="size-4" />
          Export CSV
        </>
      )}
    </Button>
  );
}
