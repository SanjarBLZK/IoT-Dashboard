import { useState, useEffect } from "react";

interface CameraViewProps {
  isMonitoring?: boolean;
}

export function CameraView({
  isMonitoring = true,
}: CameraViewProps) {
  const [motionDetected, setMotionDetected] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Visuele feedback voor bewegingsdetectie
  useEffect(() => {
    if (motionDetected) {
      const timer = setTimeout(() => setMotionDetected(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [motionDetected]);

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">📷</div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Bewegingsdetectie Camera
            </h3>
            <p className="text-sm text-slate-400">Serverruimte monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isMonitoring && (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-red-400 font-medium">LIVE</span>
            </>
          )}
        </div>
      </div>

      {/* Camera Feed - Serverruimte foto als template */}
      <div className="relative rounded-lg overflow-hidden border-2 border-slate-700 bg-slate-900">
        {imageError ? (
          <div className="w-full aspect-video flex items-center justify-center bg-slate-800">
            <div className="text-center p-8">
              <div className="text-4xl mb-3">📷</div>
              <div className="text-slate-300 font-medium mb-2">
                Camera Feed - Wachtend op foto
              </div>
              <div className="text-slate-500 text-sm">
                Plaats serverroom.jpg in de public/ folder
              </div>
              <div className="text-slate-600 text-xs mt-2">
                Zie FOTO_VERVANGEN.md voor instructies
              </div>
            </div>
          </div>
        ) : (
          <img
            src="/serverroom.jpg"
            alt="Serverruimte camera feed"
            className="w-full h-auto object-cover"
            onError={() => setImageError(true)}
          />
        )}

        {/* Motion detection overlay */}
        {motionDetected && (
          <div className="absolute inset-0 bg-red-500/20 border-4 border-red-500 animate-pulse">
            <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg">
              🚨 BEWEGING GEDETECTEERD
            </div>
          </div>
        )}

        {/* Camera info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-4">
              <span className="font-mono">CAM-01</span>
              <span>Serverruimte Noord</span>
            </div>
            <span className="font-mono">
              {new Date().toLocaleTimeString("nl-NL")}
            </span>
          </div>
        </div>
      </div>

      {/* Camera Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Status</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? "bg-green-500" : "bg-slate-600"}`} />
            <span className="text-sm font-medium text-slate-200">
              {isMonitoring ? "Actief" : "Offline"}
            </span>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Resolutie</div>
          <div className="text-sm font-medium text-slate-200">1920×1080</div>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="text-blue-400 text-lg">ℹ️</div>
          <div className="text-xs text-blue-200">
            <strong>Camera functioneel:</strong> Bij bewegingsdetectie wordt
            automatisch een foto gemaakt en opgeslagen in het incidentenlogboek.
            De camera hoeft niet per se een high-end professionele camera te
            zijn - standaard bewakingscamera is voldoende.
          </div>
        </div>
      </div>
    </div>
  );
}
