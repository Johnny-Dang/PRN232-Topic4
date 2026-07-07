'use client';

import { useState } from 'react';
import { FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { exportCalibrationCSV } from '@/lib/api';

interface CalibrationExportButtonProps {
  calibrationId: string;
  calibrationTitle: string;
  disabled?: boolean;
  onSuccess?: (filename: string) => void;
}

export default function CalibrationExportButton({
  calibrationId,
  calibrationTitle,
  disabled,
  onSuccess,
}: CalibrationExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (disabled || loading) return;
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

  if (disabled) {
    return (
      <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
        <FileSpreadsheet className="size-4" />
        Export CSV
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem onClick={handleExport} disabled={loading} className="cursor-pointer">
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Đang xuất...
        </>
      ) : (
        <>
          <FileSpreadsheet className="size-4" />
          Export CSV
        </>
      )}
    </DropdownMenuItem>
  );
}
