
import { create } from 'zustand';
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllNotifications
} from '@/lib/api/notification';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  lastFetchTime: null,
  pagination: {
    page: 1,
    totalPages: 1,
    totalItems: 0
  },

  // Helper: rebuild unreadCount from notifications array
  _recalcUnreadFromNotifications: (notifications) => {
    return notifications.filter(n => !n.isRead).length;
  },

  // Lấy dữ liệu (merge, dedupe)
  fetchNotifications: async (page = 1, size = 20) => {
    const state = get();
    const now = Date.now();
    
    // Nếu đang loading hoặc vừa fetch trong vòng 1 giây, bỏ qua
    if (state.loading || (state.lastFetchTime && now - state.lastFetchTime < 1000)) {
      return;
    }
    
    set({ loading: true, lastFetchTime: now });
    try {
      const res = await getNotifications({ page, size });

      if (res.success) {
        const items = res.data?.result || [];
        const meta = res.data?.meta || {};

        if (typeof meta.totalUnread === 'number') {
          // Merge notifications but trust backend unread count
          set(state => {
            // Merge: use Map to dedupe by id, prefer the incoming item (newer)
            const map = new Map();
            state.notifications.forEach(n => map.set(n.id, n));
            items.forEach(n => map.set(n.id, n));

            // Convert back to array and optionally sort (newest first if createdAt exists)
            const merged = Array.from(map.values())
              .sort((a, b) => {
                if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
                return 0;
              });

            return {
              notifications: merged,
              unreadCount: meta.totalUnread,
              pagination: {
                page: page,
                totalPages: meta.pages ?? state.pagination.totalPages,
                totalItems: meta.total ?? state.pagination.totalItems
              },
              loading: false
            };
          });
        } else {
          // Nếu backend không trả về totalUnread, ta tự tính từ tập merged notifications
          set(state => {
            // Merge current notifications with fetched page (dedupe by id)
            const map = new Map();
            state.notifications.forEach(n => map.set(n.id, n));
            items.forEach(n => map.set(n.id, n)); // incoming replaces existing for same id

            const merged = Array.from(map.values())
              .sort((a, b) => {
                if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
                return 0;
              });

            const unread = merged.filter(n => !n.isRead).length;

            return {
              notifications: merged,
              unreadCount: unread,
              pagination: {
                page: page,
                totalPages: meta.pages ?? state.pagination.totalPages,
                totalItems: meta.total ?? state.pagination.totalItems
              },
              loading: false
            };
          });
        }
      } else {
        set({ loading: false });
      }
    } catch (error) {
      set({ loading: false });
    }
  },

  // Đánh dấu đã đọc 1 cái (optimistic + reconcile)
  markAsRead: async (id) => {
    // Optimistic UI
    set(state => {
      const updated = state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications: updated,
        unreadCount: Math.max(0, updated.filter(n => !n.isRead).length)
      };
    });

    try {
      await markRead(id);
      // Optionally, refetch that notification or trust optimistic result.
      // Nếu backend có trả updated notification, bạn có thể merge nó vào đây.
    } catch (err) {
      // Nếu API lỗi, revert: fetch current page or refetch notifications
      // Đơn giản nhất là refetch page 1 (hoặc toàn bộ) — nhưng tránh gọi tự động nếu bạn không muốn
      // Ở đây mình sẽ cố gắng rollback local: set isRead=false nếu call lỗi
      set(state => {
        const rolled = state.notifications.map(n =>
          n.id === id ? { ...n, isRead: false } : n
        );
        return {
          notifications: rolled,
          unreadCount: rolled.filter(n => !n.isRead).length
        };
      });
    }
  },

//   markAllAsRead: async () => {
//     set(state => {
//       const updated = state.notifications.map(n => ({ ...n, isRead: true }));
//       return { notifications: updated, unreadCount: 0 };
//     });

//     try {
//       await markAllRead();
//     } catch (err) {

//       // get().fetchNotifications(0);

//     }
//   },

//   removeNotification: async (id) => {
//     // Optimistic remove
//     set(state => {
//       const filtered = state.notifications.filter(n => n.id !== id);
//       return {
//         notifications: filtered,
//         unreadCount: filtered.filter(n => !n.isRead).length
//       };
//     });

//     try {
//       await deleteNotification(id);
//     } catch (err) {
//       // Nếu xóa thất bại, có thể refetch hoặc thông báo lỗi.
//       // get().fetchNotifications(0);
//     }
//   },

//   removeAll: async () => {
//     set({ notifications: [], unreadCount: 0 });
//     try {
//       await deleteAllNotifications();
//     } catch (err) {
//       // nếu lỗi, có thể refetch
//     }
//   }
// }));

  markAllAsRead: async () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    }));
    await markAllRead();
  },

  // Xóa 1 cái
  removeNotification: async (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
    await deleteNotification(id);
  },

  // Xóa hết
  removeAll: async () => {
    set({ notifications: [], unreadCount: 0 });
    await deleteAllNotifications();
  }
}));