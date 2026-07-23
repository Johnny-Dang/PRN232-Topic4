"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";
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
  updateTeamName,
} from "@/lib/api";

type TeamMemberWithProfile = Awaited<ReturnType<typeof getTeamMembers>>[number];

type MyEventRow = {
  event: Event;
  team: Team;
  category?: Category;
  members: TeamMemberWithProfile[];
  isLeader: boolean;
};

type AvailableTeam = {
  team: Team;
  members: TeamMemberWithProfile[];
  isLeader: boolean;
  canRegister: boolean;
};

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
  const router = useRouter();
  const requestedEventId = searchParams.get("eventId") ?? "";
  const urlError = searchParams.get("error") || searchParams.get("message") || "";
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [rows, setRows] = useState<MyEventRow[]>([]);
  const [loadedAt, setLoadedAt] = useState(0);
  const [pendingRegistrationTeam, setPendingRegistrationTeam] =
    useState<AvailableTeam | null>(null);
  const [availableTeams, setAvailableTeams] = useState<AvailableTeam[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(() => requestedEventId);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [customTeamName, setCustomTeamName] = useState<string>('');
  const [registering, setRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [showTeamChoice, setShowTeamChoice] = useState(() =>
    Boolean(requestedEventId),
  );

  useEffect(() => {
    if (urlError) {
      toast.error(urlError);
      setRegistrationMessage(urlError);
    }
  }, [urlError]);

  const handleSelectTeam = useCallback((teamId: string) => {
    setSelectedTeamId(teamId);
    setAvailableTeams((currentTeams) => {
      const found = currentTeams.find((t) => t.team.TeamID === teamId);
      if (found) {
        setCustomTeamName(found.team.TeamName);
      } else {
        setCustomTeamName('');
      }
      return currentTeams;
    });
  }, []);

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

      setAllCategories(categories);

      const myRows: MyEventRow[] = [];
      const allAvailableTeams: AvailableTeam[] = [];
      let defaultPendingTeam: AvailableTeam | null = null;

      for (const team of teams) {
        const members = await getTeamMembers(team.TeamID);
        const isMember = members.some(
          (m) => (m.UserId || '').toLowerCase() === (userId || '').toLowerCase(),
        );
        const isLeader =
          (team.TeamLeaderId || '').toLowerCase() === (userId || '').toLowerCase();

        if (!isMember && !isLeader) continue;

        const isTeamPending = !team.CategoryID && !team.EventID;
        const canRegister = isLeader && (isTeamPending || team.EventID !== requestedEventId);

        if (canRegister) {
          const teamData: AvailableTeam = { team, members, isLeader, canRegister };
          allAvailableTeams.push(teamData);
          if (!defaultPendingTeam) {
            defaultPendingTeam = teamData;
          }
        }

        if (!team.CategoryID && !team.EventID) continue;

        const category = categories.find(
          (item) => item.CategoryID === team.CategoryID,
        ) || null;
        const eventId = team.EventID || category?.EventID || "";
        const event = events.find((item) => item.EventID === eventId);

        if (!event) continue;

        myRows.push({ event, team, category: category ?? undefined, members, isLeader });
      }

      const rowsByEvent = new Map<string, MyEventRow>();
      myRows.forEach((row) => {
        if (!rowsByEvent.has(row.event.EventID)) {
          rowsByEvent.set(row.event.EventID, row);
        }
      });

      setRows([...rowsByEvent.values()]);
      setAvailableTeams(allAvailableTeams);
      setPendingRegistrationTeam(defaultPendingTeam);
      setAvailableEvents(events);
      // Initialize selectedTeamId and customTeamName with the first team if available
      if (defaultPendingTeam && !selectedTeamId) {
        setSelectedTeamId(defaultPendingTeam.team.TeamID);
        setCustomTeamName(defaultPendingTeam.team.TeamName);
      }
      setLoadedAt(Date.now());
    } catch (error) {
      console.error(error);
      setErrorMessage("Không thể tải danh sách sự kiện của tôi từ API.");
    } finally {
      setLoading(false);
    }
  }, [selectedTeamId, requestedEventId]);

  const handleRegisterEvent = async () => {
    const teamToUse = availableTeams.find(t => t.team.TeamID === selectedTeamId) || pendingRegistrationTeam;
    if (!teamToUse || !selectedEventId) return;

    setRegistering(true);
    setRegistrationMessage("");
    try {
      // If Leader typed a new team name, update it via API
      const newName = customTeamName.trim();
      if (newName && newName !== teamToUse.team.TeamName) {
        await updateTeamName(teamToUse.team.TeamID, newName).catch((err) => {
          console.warn("Could not update team name via API:", err);
        });
      }

      const cat = allCategories.find((c) => c.EventID === selectedEventId);
      await setTeamCategory(
        teamToUse.team.TeamID,
        cat?.CategoryID || null,
        selectedEventId,
      );
      const successMsg = "Đăng ký sự kiện thành công.";
      setRegistrationMessage(successMsg);
      toast.success(successMsg);
      setSelectedEventId("");
      setSelectedTeamId("");
      setCustomTeamName("");
      await loadData();
    } catch (registrationError) {
      console.error(registrationError);
      const axiosError = registrationError as {
        response?: { data?: { message?: string } };
      };
      const message =
        axiosError.response?.data?.message ||
        (registrationError instanceof Error ? registrationError.message : "") ||
        "Không thể đăng ký sự kiện.";
      setRegistrationMessage(message);
      toast.error(message);
    } finally {
      setRegistering(false);
    }
  };

  const handleContinueWithOldTeam = async () => {
    const teamToUse = availableTeams.find(t => t.team.TeamID === selectedTeamId) || pendingRegistrationTeam;
    if (teamToUse && requestedEventId) {
      if (teamToUse.members.length >= 3) {
        setRegistering(true);
        setRegistrationMessage("");
        try {
          // If Leader typed a new team name, update it via API
          const newName = customTeamName.trim();
          if (newName && newName !== teamToUse.team.TeamName) {
            await updateTeamName(teamToUse.team.TeamID, newName).catch((err) => {
              console.warn("Could not update team name via API:", err);
            });
          }

          const cat = allCategories.find((c) => c.EventID === requestedEventId);
          await setTeamCategory(
            teamToUse.team.TeamID,
            cat?.CategoryID || null,
            requestedEventId,
          );
          const successMsg = "Đăng ký sự kiện thành công.";
          setRegistrationMessage(successMsg);
          toast.success(successMsg);
          setSelectedEventId("");
          setSelectedTeamId("");
          setCustomTeamName("");
          setShowTeamChoice(false);
          // Clear URL query parameters to avoid showing the choice dialog again
          router.replace("/my-events");
          await loadData();
        } catch (registrationError) {
          console.error(registrationError);
          const axiosError = registrationError as {
            response?: { data?: { message?: string } };
          };
          const message =
            axiosError.response?.data?.message ||
            (registrationError instanceof Error ? registrationError.message : "") ||
            "Không thể đăng ký sự kiện.";
          setRegistrationMessage(message);
          toast.error(message);
        } finally {
          setRegistering(false);
        }
        return;
      }
    }
    setShowTeamChoice(false);
  };

  useEffect(() => {
    void Promise.resolve().then(loadData);

    const handleRealtimeNotification = () => {
      void loadData();
    };
    window.addEventListener("seal:notification", handleRealtimeNotification);
    return () =>
      window.removeEventListener(
        "seal:notification",
        handleRealtimeNotification,
      );
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
          <Button
            type="button"
            onClick={() => setShowTeamChoice(true)}
            className="h-9 rounded-xl bg-indigo-600 px-3 text-xs font-bold text-white hover:bg-indigo-700"
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Tham gia sự kiện mới
          </Button>
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

      {showTeamChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <Card className="w-full max-w-md border-0 bg-white shadow-2xl dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                Chọn team để tham gia Event
              </CardTitle>
              <CardDescription className="text-xs font-medium">
                Bạn muốn tạo team mới cho Event này hay tiếp tục đăng ký bằng
                team cũ?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href={`/member?newTeam=1${requestedEventId ? `&eventId=${encodeURIComponent(requestedEventId)}` : ""}`}
                className="flex rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700"
              >
                Tạo team mới
              </Link>
              
              {availableTeams.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase block">
                      Chọn team cũ để tiếp tục:
                    </label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => handleSelectTeam(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <option value="">-- Chọn Đội thi --</option>
                      {availableTeams.map((t) => (
                        <option key={t.team.TeamID} value={t.team.TeamID}>
                          {t.team.TeamName} ({t.members.length} thành viên)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedTeamId && (() => {
                    const selectedTeam = availableTeams.find(t => t.team.TeamID === selectedTeamId);
                    if (!selectedTeam) return null;
                    if (selectedTeam.members.length < 3) {
                      return (
                        <div className="rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 space-y-2">
                          <p>Đội này hiện có {selectedTeam.members.length} thành viên. Cần đủ 3 người để đăng ký.</p>
                          <Link
                            href={`/member?teamId=${selectedTeam.team.TeamID}${requestedEventId ? `&eventId=${encodeURIComponent(requestedEventId)}` : ''}`}
                            className="inline-flex items-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                          >
                            + Thêm thành viên cho đội này ({selectedTeam.members.length}/3)
                          </Link>
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {/* Editable Team Name Input */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 uppercase">
                            <span>Tên đội thi (Sửa nếu muốn đổi tên mới):</span>
                            {customTeamName.trim() && customTeamName.trim() !== selectedTeam.team.TeamName && (
                              <span className="text-indigo-600 font-extrabold text-[9px] dark:text-indigo-400">
                                (Đã đổi tên)
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={customTeamName}
                            onChange={(e) => setCustomTeamName(e.target.value)}
                            placeholder="Nhập tên đội thi..."
                            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                          />
                        </div>

                        {/* Current Members & Add/Manage Link */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">
                              Thành viên hiện tại ({selectedTeam.members.length}):
                            </span>
                            <Link
                              href={`/member?teamId=${selectedTeam.team.TeamID}${requestedEventId ? `&eventId=${encodeURIComponent(requestedEventId)}` : ''}`}
                              className="text-[10px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              + Quản lý / Thêm thành viên mới
                            </Link>
                          </div>
                          <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-950/40">
                            {selectedTeam.members.map((m) => (
                              <Badge
                                key={m.User?.UserID || m.TeamMemberId}
                                className="border border-slate-200 bg-white text-slate-700 text-[10px] font-semibold dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                              >
                                {m.User?.FullName || 'Thành viên'}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          type="button"
                          onClick={handleContinueWithOldTeam}
                          disabled={registering || !customTeamName.trim()}
                          className="h-10 w-full rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white hover:bg-indigo-750"
                        >
                          {registering
                            ? "Đang đăng ký..."
                            : customTeamName.trim() !== selectedTeam.team.TeamName
                            ? `Đổi tên thành "${customTeamName.trim()}" & Đăng ký`
                            : `Giữ tên & Đăng ký bằng ${selectedTeam.team.TeamName}`}
                        </Button>
                      </div>
                    );
                  })()}
                </div>
              ) : !loading && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                  Bạn chưa có team cũ nào có thể đăng ký Event. Hãy tạo team mới để tiếp tục.
                </p>
              )}
              
              {registrationMessage && (
                <div
                  className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs font-semibold shadow-sm ${
                    registrationMessage.includes("thành công")
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
                  }`}
                >
                  {registrationMessage.includes("thành công") ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold">
                      {registrationMessage.includes("thành công")
                        ? "Thông báo hệ thống:"
                        : "Lỗi đăng ký sự kiện:"}
                    </p>
                    <p className="mt-0.5 leading-relaxed">{registrationMessage}</p>
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowTeamChoice(false)}
                className="h-8 w-full text-xs font-semibold text-slate-500"
              >
                Hủy
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-44 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <>
          {pendingRegistrationTeam && (
            <Card className="border-indigo-100 bg-indigo-50/30 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/10">
              <CardHeader>
                <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                  Đăng ký sự kiện cho đội
                </CardTitle>
                <CardDescription className="text-xs font-medium">
                  {availableTeams.length > 1 
                    ? `Bạn có ${availableTeams.length} đội có thể sử dụng để đăng ký sự kiện mới.`
                    : `Đội ${pendingRegistrationTeam.team.TeamName} có thể đăng ký sự kiện mới.`
                  } Chỉ trưởng nhóm mới có thể thực hiện thao tác này.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableTeams.every(t => t.members.length < 3) ? (
                  <p className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-medium text-amber-700">
                    Tất cả các đội của bạn chưa đủ 3 thành viên. Vui lòng thêm thành viên trước khi đăng ký sự kiện.
                  </p>
                ) : (
                  <>
                    {/* Team selection dropdown */}
                    {availableTeams.length > 1 && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">
                          Chọn đội
                        </label>
                        <select
                          value={selectedTeamId}
                          onChange={(event) => setSelectedTeamId(event.target.value)}
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
                        >
                          <option value="">Chọn đội</option>
                          {availableTeams
                            .filter(t => t.members.length >= 3)
                            .map((t) => (
                              <option key={t.team.TeamID} value={t.team.TeamID}>
                                {t.team.TeamName} ({t.members.length} thành viên)
                              </option>
                            ))}
                        </select>
                        {!selectedTeamId && availableTeams.filter(t => t.members.length >= 3).length > 0 && (
                          <p className="text-[10px] text-amber-600">Vui lòng chọn một đội để tiếp tục</p>
                        )}
                      </div>
                    )}
                    
                    {/* Event selection dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">
                        Chọn sự kiện
                      </label>
                      <select
                        value={selectedEventId}
                        onChange={(event) => setSelectedEventId(event.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
                        disabled={!selectedTeamId && availableTeams.length > 1}
                      >
                        <option value="">Chọn sự kiện</option>
                        {availableEvents
                          .filter((event) => {
                            return (
                              Boolean(
                                event?.IsPublished &&
                                event.Status === "Published" &&
                                new Date(event.EndDate) > new Date(),
                              )
                            );
                          })
                          .map((event) => (
                            <option
                              key={event.EventID}
                              value={event.EventID}
                            >
                              {event.EventName}
                            </option>
                          ))}
                      </select>
                    </div>
                    
                    <Button
                      type="button"
                      disabled={!selectedEventId || registering || (availableTeams.length > 1 && !selectedTeamId)}
                      onClick={() => void handleRegisterEvent()}
                      className="h-9 rounded-xl bg-indigo-600 text-xs font-bold hover:bg-indigo-700"
                    >
                      {registering ? "Đang đăng ký..." : "Đăng ký sự kiện"}
                    </Button>
                  </>
                )}
                {registrationMessage && (
                  <div
                    className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs font-semibold shadow-sm ${
                      registrationMessage.includes("thành công")
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200"
                        : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
                    }`}
                  >
                    {registrationMessage.includes("thành công") ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold">
                        {registrationMessage.includes("thành công")
                          ? "Thông báo hệ thống:"
                          : "Lỗi đăng ký sự kiện:"}
                      </p>
                      <p className="mt-0.5 leading-relaxed">{registrationMessage}</p>
                    </div>
                  </div>
                )}
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
                      className="group relative border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
                    >
                      {isLeader && (
                        <Link
                          href={`/leader?eventId=${encodeURIComponent(event.EventID)}`}
                          aria-label={`Mở cổng trưởng nhóm cho sự kiện ${event.EventName}`}
                          title={`Mở cổng trưởng nhóm cho sự kiện ${event.EventName}`}
                          className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      )}
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
                        {isLeader && (
                          <div className="relative z-20 flex items-center justify-end pt-1">
                            <Link
                              href={`/leader?eventId=${encodeURIComponent(event.EventID)}`}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:bg-indigo-700"
                            >
                              Mở cổng nộp bài
                            </Link>
                          </div>
                        )}
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
