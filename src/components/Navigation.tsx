import { Link, useLocation } from "react-router-dom";

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/incidents", label: "Gebeurtenissen", icon: "📋" },
  ];

  return (
    <nav className="bg-slate-800/40 border-b border-slate-700/50 mb-6">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
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
        </div>
      </div>
    </nav>
  );
}
