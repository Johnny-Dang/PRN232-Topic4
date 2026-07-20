"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Category,
  Event,
  Team,
  getCategories,
  getEvents,
  getTeamMembers,
  getTeams,
  setTeamCategory,
} from "@/lib/api";

type TeamMemberWithProfile = Awaited<ReturnType<typeof getTeamMembers>>[number];

type MyEventRow = {
  event: Event;
  team: Team;
  category?: Category;
  members: TeamMemberWithProfile[];
  isLeader: boolean;
};

type PendingRegistrationTeam = {
  team: Team;
  members: TeamMemberWithProfile[];
  isLeader: boolean;
};

const MAX_EVENT_PARTICIPATIONS = 3;

const getStringProperty = (value: unknown, keys: string[]): string | null => {
  if (typeof value !== "object" || value === null) return null;

  const record = value as Record<string, unknown>;
  for (const key of keys) {
    const property = record[key];
    if (typeof property === "string" && property.trim()) return property;
  }

  return null;
};

const getStoredUserId = (): string | null => {
  if (typeof window === "undefined") return null;

  const storedUser = localStorage.getItem("seal_user");
  if (!storedUser) return null;

  try {
    return getStringProperty(JSON.parse(storedUser) as unknown, [
      "UserID",
      "UserId",
      "userId",
    ]);
  } catch (error) {
    console.error("Cannot parse seal_user from localStorage:", error);
    return null;
  }
};

const getEventState = (
  event: Event,
  now: number,
): { label: string; tone: string; icon: React.ElementType } => {
  const start = new Date(event.StartDate).getTime();
  const end = new Date(event.EndDate).getTime();

  if (Number.isFinite(end) && now > end) {
    return {
      label: "Đã tham gia",
      tone: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
      icon: CheckCircle2,
    };
  }

  if (Number.isFinite(start) && now >= start) {
    return {
      label: "Đang tham gia",
      tone: "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-300",
      icon: Clock3,
    };
  }

  return {
    label: "Đã đăng ký",
    tone: "border-indigo-100 bg-indigo-50 text-indigo-700 dark:border-indigo-900/30 dark:bg-indigo-950/20 dark:text-indigo-300",
    icon: CalendarDays,
  };
};

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function MyEventsPage() {
  const searchParams = useSearchParams();
  const requestedEventId = searchParams.get("eventId") ?? "";
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [rows, setRows] = useState<MyEventRow[]>([]);
  const [loadedAt, setLoadedAt] = useState(0);
  const [pendingRegistrationTeam, setPendingRegistrationTeam] = useState<PendingRegistrationTeam | null>(null);
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [registering, setRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const userId = getStoredUserId();
      if (!userId) {
        setRows([]);
        setLoadedAt(Date.now());
        return;
      }

      const [teams, events, categories] = await Promise.all([
        getTeams(),
        getEvents(),
        getCategories(),
      ]);

      const myRows: MyEventRow[] = [];
      let unregisteredTeam: PendingRegistrationTeam | null = null;

      for (const team of teams) {
        const members = await getTeamMembers(team.TeamID);
        const isLeader =
          team.TeamLeaderId.toLowerCase() === userId.toLowerCase();
        const isMember = members.some(
          (member) => member.UserId.toLowerCase() === userId.toLowerCase(),
        );

        if (!isLeader && !isMember) continue;

        if (!team.CategoryID && !unregisteredTeam) {
          unregisteredTeam = { team, members, isLeader };
          continue;
        }

        const category = categories.find(
          (item) => item.CategoryID === team.CategoryID,
        );
        const eventId = team.EventID || category?.EventID || "";
        const event = events.find((item) => item.EventID === eventId);

        if (!event) continue;

        myRows.push({ event, team, category, members, isLeader });
      }

      const rowsByEvent = new Map<string, MyEventRow>();
      myRows.forEach((row) => {
        if (!rowsByEvent.has(row.event.EventID)) {
          rowsByEvent.set(row.event.EventID, row);
        }
      });

      setRows([...rowsByEvent.values()]);
      setPendingRegistrationTeam(unregisteredTeam);
      setAvailableCategories(categories);
      setAvailableEvents(events);
      setLoadedAt(Date.now());
    } catch (error) {
      console.error(error);
      setErrorMessage("Không thể tải danh sách sự kiện của tôi từ API.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegisterEvent = async () => {
    if (!pendingRegistrationTeam || !selectedCategoryId) return;

    const selectedCategory = availableCategories.find((category) => category.CategoryID === selectedCategoryId);
    if (!selectedCategory) return;

    setRegistering(true);
    setRegistrationMessage("");
    try {
      await setTeamCategory(pendingRegistrationTeam.team.TeamID, selectedCategory.CategoryID, selectedCategory.EventID);
      setRegistrationMessage("Đăng ký sự kiện thành công.");
      await loadData();
    } catch (registrationError) {
      const message = registrationError instanceof Error ? registrationError.message : "Không thể đăng ký sự kiện.";
      setRegistrationMessage(message);
    } finally {
      setRegistering(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);

    const handleRealtimeNotification = () => {
      void loadData();
    };
    window.addEventListener("seal:notification", handleRealtimeNotification);
    return () => window.removeEventListener("seal:notification", handleRealtimeNotification);
  }, [loadData]);

  const activeRows = useMemo(() => {
    return rows.filter((row) => {
      const end = new Date(row.event.EndDate).getTime();
      return !Number.isFinite(end) || loadedAt <= end;
    });
  }, [loadedAt, rows]);

  const completedCount = rows.length - activeRows.length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Sự kiện của tôi
          </h2>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            Danh sách các sự kiện bạn đang tham gia hoặc đã từng tham gia theo
            dữ liệu đội.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/member"
            className="inline-flex h-9 items-center rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Tham gia sự kiện mới
          </Link>
          <Button
            onClick={() => void loadData()}
            variant="outline"
            className="h-9 rounded-xl border-slate-200 bg-white px-3 text-xs font-bold dark:border-slate-800 dark:bg-slate-900"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Tải lại
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <>
          <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">
                  Bạn đang tham gia: {activeRows.length}/
                  {MAX_EVENT_PARTICIPATIONS} sự kiện
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Bao gồm các sự kiện đang diễn ra hoặc đã đăng ký nhưng chưa
                  kết thúc.
                </p>
              </div>
              <Link
                href="/member"
                className="inline-flex h-9 items-center rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white hover:bg-indigo-700"
              >
                <Plus className="mr-2 h-3.5 w-3.5" />
                Tham gia sự kiện mới
              </Link>
            </CardContent>
          </Card>

          {pendingRegistrationTeam && (
            <Card className="border-indigo-100 bg-indigo-50/30 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/10">
              <CardHeader>
                <CardTitle className="text-base font-black text-slate-900 dark:text-white">Đăng ký sự kiện cho đội</CardTitle>
                <CardDescription className="text-xs font-medium">
                  Đội {pendingRegistrationTeam.team.TeamName} chưa đăng ký sự kiện. Chỉ trưởng nhóm có thể thực hiện thao tác này.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingRegistrationTeam.members.length < 3 ? (
                  <p className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-medium text-amber-700">
                    Đội cần tối thiểu 3 thành viên trước khi đăng ký sự kiện. Hiện có {pendingRegistrationTeam.members.length} thành viên.
                  </p>
                ) : !pendingRegistrationTeam.isLeader ? (
                  <p className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900">
                    Chỉ trưởng nhóm mới có quyền đăng ký sự kiện cho đội.
                  </p>
                ) : (
                  <>
                    <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900">
                      <option value="">Chọn hạng mục và sự kiện</option>
                      {availableCategories.filter((category) => {
                        const event = availableEvents.find((item) => item.EventID === category.EventID);
                        return (!requestedEventId || category.EventID === requestedEventId)
                          && Boolean(event?.IsPublished && event.Status === "Published" && new Date(event.StartDate) > new Date());
                      }).map((category) => {
                        const event = availableEvents.find((item) => item.EventID === category.EventID);
                        return <option key={category.CategoryID} value={category.CategoryID}>{event?.EventName} — {category.CategoryName}</option>;
                      })}
                    </select>
                    <Button type="button" disabled={!selectedCategoryId || registering} onClick={() => void handleRegisterEvent()} className="h-9 rounded-xl bg-indigo-600 text-xs font-bold hover:bg-indigo-700">
                      {registering ? "Đang đăng ký..." : "Đăng ký sự kiện"}
                    </Button>
                  </>
                )}
                {registrationMessage && <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{registrationMessage}</p>}
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Tổng sự kiện
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {rows.length}
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-indigo-500" />
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Đang tham gia
                  </p>
                  <p className="mt-1 text-2xl font-black text-emerald-600">
                    {activeRows.length}
                  </p>
                </div>
                <Clock3 className="h-8 w-8 text-emerald-500" />
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Đã kết thúc
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-700 dark:text-slate-200">
                    {completedCount}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-slate-500" />
              </CardContent>
            </Card>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {errorMessage}
            </div>
          )}

          {rows.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="p-8 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-3 text-sm font-black text-slate-800 dark:text-slate-100">
                  Chưa có sự kiện tham gia
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Khi bạn là thành viên của một đội đã đăng ký sự kiện, sự kiện
                  đó sẽ hiển thị tại đây.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                {rows.map(({ event, team, category, members, isLeader }) => {
                  const state = getEventState(event, loadedAt);
                  const StateIcon = state.icon;

                  return (
                    <Card
                      key={`${team.TeamID}-${event.EventID}`}
                      className="border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <CardHeader className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                              {event.EventName}
                            </CardTitle>
                            <CardDescription className="mt-1 text-xs font-semibold text-slate-500">
                              {event.Season} {event.Year} -{" "}
                              {event.Format || "Online"}
                            </CardDescription>
                          </div>
                          <Badge
                            className={`border text-[10px] font-extrabold ${state.tone}`}
                          >
                            <StateIcon className="mr-1 h-3 w-3" />
                            {state.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 px-6 pb-6">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Đội tham gia
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">
                              {team.TeamName}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Vai trò
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">
                              {isLeader ? "Trưởng nhóm" : "Thành viên"}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Hạng mục
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-800 dark:text-slate-100">
                              {category?.CategoryName || "Chưa xác định"}
                            </p>
                          </div>
                          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Thành viên đội
                            </p>
                            <p className="mt-1 flex items-center gap-1.5 text-sm font-black text-slate-800 dark:text-slate-100">
                              <Users className="h-4 w-4 text-indigo-500" />
                              {members.length}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                          <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-800">
                            Bắt đầu: {formatDate(event.StartDate)}
                          </span>
                          <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-800">
                            Kết thúc: {formatDate(event.EndDate)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
