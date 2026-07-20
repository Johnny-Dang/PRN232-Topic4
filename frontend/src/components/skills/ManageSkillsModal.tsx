'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Award, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMySkillsApi, updateUserSkillsApi } from '@/services/api/skill';
import { UserSkillItemRequest, UserSkill } from '@/services/types/skill';

interface ManageSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ManageSkillsModal({
  isOpen,
  onClose,
  onSuccess,
}: ManageSkillsModalProps) {
  const [skills, setSkills] = useState<UserSkillItemRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: UserSkill[] = await getMySkillsApi();
        if (isMounted) {
          setSkills(
            data.map((item) => ({
              Role: item.Role,
              SkillName: item.SkillName,
              ExperienceLevel: item.ExperienceLevel ?? 'Junior',
            }))
          );
        }
      } catch (err: unknown) {
        console.error('Lỗi lấy danh sách kỹ năng:', err);
        if (isMounted) setSkills([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleAddSkill = () => {
    setSkills([
      ...skills,
      { Role: 'Developer', SkillName: '', ExperienceLevel: 'Junior' },
    ]);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleChangeSkill = (
    index: number,
    field: keyof UserSkillItemRequest,
    value: string
  ) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const handleSave = async () => {
    // Validate non-empty skill name & role
    const invalid = skills.some(
      (s) => !s.SkillName.trim() || !s.Role.trim()
    );
    if (invalid) {
      setError('Vui lòng điền đầy đủ Tên kỹ năng và Vai trò cho tất cả mục.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateUserSkillsApi({ Skills: skills });
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Cập nhật kỹ năng thất bại.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 dark:text-slate-100">
            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Cập nhật Hồ sơ Kỹ năng
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Kỹ năng của bạn giúp các đội thi dễ dàng tìm kiếm và mời bạn tham gia nhóm.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 text-sm rounded-lg bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {skills.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                Chưa có kỹ năng nào. Nhấn &quot;Thêm kỹ năng&quot; để bắt đầu.
              </div>
            ) : (
              skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="flex items-end gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Vai trò (Role)
                    </Label>
                    <Input
                      value={skill.Role}
                      onChange={(e) =>
                        handleChangeSkill(idx, 'Role', e.target.value)
                      }
                      placeholder="VD: Frontend, Backend, UI/UX..."
                      className="bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tên Kỹ năng
                    </Label>
                    <Input
                      value={skill.SkillName}
                      onChange={(e) =>
                        handleChangeSkill(idx, 'SkillName', e.target.value)
                      }
                      placeholder="VD: React, C#, Figma..."
                      className="bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="w-36 space-y-1">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Trình độ
                    </Label>
                    <Select
                      value={skill.ExperienceLevel ?? 'Junior'}
                      onValueChange={(val) =>
                        handleChangeSkill(idx, 'ExperienceLevel', val)
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Middle">Middle</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddSkill}
              className="w-full border-dashed border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm kỹ năng
            </Button>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
