'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AdvancementRule, Category, Round, getAdvancementRules, getCategories, getRounds, createAdvancementRule, deleteAdvancementRule } from '@/lib/api';

export default function AdvancementRuleConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [rules, setRules] = useState<AdvancementRule[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newRule, setNewRule] = useState({ roundId: '', categoryId: '', topN: 2 });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedRules, fetchedRounds, fetchedCategories] = await Promise.all([
          getAdvancementRules(),
          getRounds(),
          getCategories(),
        ]);
        setRules(fetchedRules);
        setRounds(fetchedRounds);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to load data:', error);
        setMessage('Khong the tai du lieu.');
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, []);

  const handleCreateRule = async () => {
    if (!newRule.roundId || !newRule.categoryId || newRule.topN < 1) {
      setMessage('Vui long dien day du thong tin.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await createAdvancementRule(newRule.roundId, newRule.categoryId, newRule.topN);
      setMessage('Da tao quy tac thanh cong!');
      const updatedRules = await getAdvancementRules();
      setRules(updatedRules);
      setNewRule({ roundId: '', categoryId: '', topN: 2 });
    } catch (error) {
      console.error('Failed to create rule:', error);
      setMessage('Khong the tao quy tac. Vui long thu lai.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Ban co chac chan muon xoa quy tac nay?')) return;

    setSaving(true);
    setMessage('');

    try {
      await deleteAdvancementRule(ruleId);
      setMessage('Da xoa quy tac thanh cong!');
      setRules((current) => current.filter((r) => r.RuleId !== ruleId));
    } catch (error) {
      console.error('Failed to delete rule:', error);
      setMessage('Khong the xoa quy tac. Vui long thu lai.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
        <Skeleton className="h-64 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base font-bold">Tao quy tac loai vao vong tiep theo</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400">
            Xac dinh so luong doi tuyen duoc vao vong tiep theo theo tung hang muc
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Vong thi</Label>
              <select
                value={newRule.roundId}
                onChange={(e) => setNewRule((r) => ({ ...r, roundId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">-- Chon vong --</option>
                {rounds.map((round) => (
                  <option key={round.RoundID} value={round.RoundID}>
                    {round.RoundName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hang muc</Label>
              <select
                value={newRule.categoryId}
                onChange={(e) => setNewRule((r) => ({ ...r, categoryId: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">-- Chon hang muc --</option>
                {categories.map((cat) => (
                  <option key={cat.CategoryID} value={cat.CategoryID}>
                    {cat.CategoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400">So doi vao vong tiep (Top N)</Label>
              <Input
                type="number"
                min={1}
                value={newRule.topN}
                onChange={(e) => setNewRule((r) => ({ ...r, topN: parseInt(e.target.value) || 1 }))}
                className="rounded-xl border-slate-200 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          <Button
            onClick={handleCreateRule}
            disabled={saving || !newRule.roundId || !newRule.categoryId}
            className="h-10 rounded-xl bg-emerald-600 text-xs font-semibold hover:bg-emerald-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Tao quy tac
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base font-bold">Danh sach quy tac hien tai</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400">
            {rules.length} quy tac da duoc cau hinh
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-500">Chua co quy tac nao duoc cau hinh.</p>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => {
                const round = rounds.find((r) => r.RoundID === rule.RoundId);
                const category = categories.find((c) => c.CategoryID === rule.CategoryId);

                return (
                  <div
                    key={rule.RuleId}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-4 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                        Top {rule.TopN}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {round?.RoundName || 'Unknown Round'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {category?.CategoryName || 'Unknown Category'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRule(rule.RuleId)}
                      className="h-8 w-8 rounded-lg p-0 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {message && (
        <div className={`rounded-xl border p-3 text-xs font-medium ${
          message.includes('thanh cong')
            ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
            : 'border-rose-100 bg-rose-50 text-rose-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
