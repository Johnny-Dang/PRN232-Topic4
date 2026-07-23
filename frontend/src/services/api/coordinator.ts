import { z } from "zod";
import { apiClient } from "./apiClient";
import {
  advancementRuleSchema,
  eliminationSchema,
  type Notification,
} from "../types/coordinator";

export async function getAdvancementRulesApi() {
  const response = await apiClient.get("/AdvancementRule");
  return z.array(advancementRuleSchema).parse(response.data);
}

export async function getEliminationsApi() {
  const response = await apiClient.get("/Elimination");
  return z.array(eliminationSchema).parse(response.data);
}

export async function getNotificationsApi(): Promise<Notification[]> {
  try {
    const response = await apiClient.get("/Notification");
    const data = response.data;
    
    // Support both array directly or wrapped in {items: []}
    const items = Array.isArray(data) ? data : data?.items;
    
    if (!items || !Array.isArray(items)) {
      console.log("[Notifications API] No items found, raw data:", data);
      return [];
    }
    
    // Log for debugging
    console.log("[Notifications API] Raw data:", items);
    console.log("[Notifications API] Count:", items.length);
    
    // Parse với optional fields để tránh lỗi
    const result: Notification[] = items.map((item: Record<string, unknown>) => ({
      NotificationId: String(item.NotificationId || item.notificationId || ""),
      UserId: String(item.UserId || item.userId || ""),
      Message: String(item.Message || item.message || ""),
      IsRead: Boolean(item.IsRead ?? item.isRead ?? false),
      CreatedAt: String(item.CreatedAt || item.createdAt || new Date().toISOString()),
    }));
    
    console.log("[Notifications API] Parsed:", result);
    return result;
  } catch (error) {
    console.warn("[Notifications API] Could not fetch notifications (401 or network error):", error);
    return [];
  }
}

export async function markNotificationAsReadApi(
  notificationId: string | number,
) {
  const response = await apiClient.put(`/Notification/${notificationId}/read`);
  return response.data;
}

export async function markAllNotificationsAsReadApi() {
  const response = await apiClient.put("/Notification/read-all");
  return response.data;
}

export async function createTestNotificationApi(message?: string) {
  const response = await apiClient.post('/Notification/test', { message });
  return response.data;
}
