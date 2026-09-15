import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "../features/auth/AuthContext";

export default function ProfileLayout() {
  const { user, isLoggedIn, authLoading, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();

  // If not logged in, open auth modal and redirect to home
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      openAuthModal();
      navigate("/");
    }
  }, [authLoading, isLoggedIn, openAuthModal, navigate]);

  if (authLoading || !isLoggedIn || !user) return null;

  const sidebarLinks = [
    { name: "Account Details", path: "/profile/details", icon: "user" },
    { name: "My Orders", path: "/profile/orders", icon: "list" },
    { name: "My Cart", path: "/cart", icon: "cart" },
    { name: "My Addresses", path: "/profile/addresses", icon: "map-pin" },
    { name: "My Payments", path: "/profile/payments", icon: "credit-card" },
    { name: "Notification Setting", path: "/profile/notifications", icon: "bell" },
    { name: "Refer Friends", path: "/profile/refer", icon: "gift" },
    { name: "Coupons", path: "/profile/coupons", icon: "tag" },
    { name: "Account Settings", path: "/profile/settings", icon: "settings" },
    { name: "Help Center", path: "/profile/help", icon: "help-circle" },
  ] as const;

  const renderIcon = (iconName: (typeof sidebarLinks)[number]["icon"] | "log-out") => {
    const icons = {
      "user": <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
      "list": <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
      "cart": <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>,
      "map-pin": <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
      "credit-card": <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
      "bell": <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
      "gift": <><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></>,
      "tag": <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
      "file-text": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
      "settings": <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
      "help-circle": <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
      "log-out": <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>
    } satisfies Record<string, ReactNode>;
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icons[iconName]}
      </svg>
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="mx-auto my-10 flex w-full max-w-[1200px] items-start gap-[30px] max-[992px]:flex-col">
      <div className="flex w-[280px] shrink-0 flex-col gap-4 max-[992px]:w-full">
        <div className="rounded-2xl border border-[#f0f0f0] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="mb-6 flex items-center gap-4 px-1">
            <img
              src={user.image || "https://i.pravatar.cc/150?img=11"}
              alt={user.firstName}
              className="h-14 w-14 rounded-full border-2 border-[#f0f0f0] object-cover"
            />
            <span className="text-lg font-bold text-[#111]">
              {user.firstName} {user.lastName}
            </span>
          </div>

          <nav className="flex flex-col gap-1.5">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `flex w-full items-center gap-[14px] rounded-[10px] bg-transparent px-[14px] py-3 text-left text-[15px] font-medium transition-all duration-300 hover:translate-x-1 hover:bg-[#f8f9fa] hover:text-[#b6349a] ${isActive ? "bg-[#b6349a]/[.08] font-semibold text-[#b6349a]" : "text-[#757575]"}`}
              >
                <span className="flex items-center justify-center">{renderIcon(link.icon)}</span>
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto rounded-2xl border border-[#f0f0f0] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <button className="flex w-full items-center gap-[14px] rounded-[10px] bg-transparent px-[14px] py-3 text-left text-[15px] font-medium text-[#757575] transition-all duration-300 hover:translate-x-1 hover:bg-[#f8f9fa] hover:text-[#b6349a]" onClick={handleLogout}>
            <span className="flex items-center justify-center">{renderIcon("log-out")}</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="min-w-0 flex-1 bg-transparent max-[992px]:py-2.5">
        <Outlet />
      </div>
    </div>
  );
}
