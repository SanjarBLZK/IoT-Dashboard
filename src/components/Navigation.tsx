import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/incidents", label: "Gebeurtenissen", icon: "📋" },
    { path: "/settings", label: "Instellingen", icon: "⚙️" },
  ];

  // Laatste login netjes weergeven (komt uit users.last_login).
  const lastLoginLabel = user?.lastLogin
    ? new Date(user.lastLogin).toLocaleString("nl-NL", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <nav className="bg-slate-800/40 border-b border-slate-700/50 mb-6">
      <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Logo/Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              IoT
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">
                Server Room Monitoring
              </h1>
              <p className="text-xs text-slate-400">Real-time monitoring actief</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Ingelogde gebruiker + uitloggen */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                {/* Avatar met initiaal */}
                <div
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-semibold uppercase"
                  aria-hidden="true"
                >
                  {user.username.charAt(0)}
                </div>
                <div className="leading-tight">
                  <div className="text-sm font-medium text-slate-100">
                    {user.username}
                  </div>
                  <div className="text-xs text-slate-500">
                    {lastLoginLabel
                      ? `Ingelogd sinds ${lastLoginLabel}`
                      : "Eerste login"}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-colors"
                title="Uitloggen"
              >
                <span aria-hidden="true">🚪</span>
                <span className="text-sm font-medium">Uitloggen</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
