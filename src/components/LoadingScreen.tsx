import { useEffect, useState } from "react";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "Bismillah...",
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative flex flex-col items-center justify-center h-screen overflow-hidden"
      style={{ backgroundColor: "#fdf6ec" }}
    >
      {/* Mosque silhouette background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="#e8d9c4" opacity="0.5">
          {/* Left mosque dome + body */}
          <ellipse cx="150" cy="520" rx="110" ry="130" />
          <rect x="40" y="520" width="220" height="380" />
          {/* Left minaret */}
          <rect x="15" y="480" width="35" height="420" />
          <ellipse cx="32" cy="480" rx="18" ry="28" />
          <rect x="24" y="410" width="16" height="75" />
          {/* Right small minaret */}
          <rect x="230" y="500" width="35" height="400" />
          <ellipse cx="247" cy="500" rx="18" ry="28" />
          <rect x="239" y="430" width="16" height="75" />
        </g>
        <g fill="#e8d9c4" opacity="0.5">
          {/* Right mosque dome + body */}
          <ellipse cx="1290" cy="500" rx="120" ry="140" />
          <rect x="1170" y="500" width="240" height="400" />
          {/* Right minaret */}
          <rect x="1150" y="460" width="38" height="440" />
          <ellipse cx="1169" cy="460" rx="20" ry="30" />
          <rect x="1159" y="385" width="18" height="80" />
          {/* Left small minaret */}
          <rect x="1390" y="475" width="38" height="425" />
          <ellipse cx="1409" cy="475" rx="20" ry="30" />
          <rect x="1399" y="400" width="18" height="80" />
        </g>
        {/* Sandy ground */}
        <ellipse cx="720" cy="970" rx="960" ry="220" fill="#e8d4a0" opacity="0.45" />
      </svg>

      {/* Crescent + stars */}
      <div className="absolute top-10 left-14 select-none" style={{ fontSize: 48 }}>🌙</div>
      <div className="absolute top-8  left-48  select-none text-yellow-300" style={{ fontSize: 16 }}>✦</div>
      <div className="absolute top-14 right-40 select-none text-blue-300"   style={{ fontSize: 13 }}>✦</div>
      <div className="absolute top-6  right-20 select-none text-green-400"  style={{ fontSize: 11 }}>✦</div>

      {/* Plants */}
      <div className="absolute bottom-0 left-0  select-none leading-none" style={{ fontSize: 80 }}>🌿</div>
      <div className="absolute bottom-0 left-16 select-none leading-none" style={{ fontSize: 56 }}>🌱</div>
      <div className="absolute bottom-0 right-0 select-none leading-none" style={{ fontSize: 80, transform: "scaleX(-1)" }}>🌿</div>
      <div className="absolute bottom-2 right-20 select-none leading-none" style={{ fontSize: 48 }}>🌾</div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full px-8">

        {/* Progress bar */}
        <div className="w-full max-w-2xl">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{
              height: 52,
              backgroundColor: "#e8d9c4",
              border: "3px solid #c8b89a",
              boxShadow: "inset 0 3px 6px rgba(0,0,0,0.12)",
            }}
          >
            <div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(135deg, #43a047 25%, #66bb6a 50%, #43a047 75%)",
                backgroundSize: "40px 40px",
                animation: "moveStripes 0.7s linear infinite",
                transition: "width 80ms linear",
              }}
            >
              {/* Shine */}
              <div
                className="absolute inset-x-0 top-0 rounded-t-full"
                style={{
                  height: "45%",
                  background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)",
                }}
              />
            </div>
          </div>

          {/* Percentage */}
          <p
            className="text-right mt-2 font-semibold"
            style={{ color: "#5a7a3a", fontSize: 14 }}
          >
            {progress}%
          </p>
        </div>

        {/* Text */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <h1
            className="font-extrabold tracking-wide"
            style={{ color: "#1a3a6b", fontSize: 52, lineHeight: 1.1 }}
          >
            {message}
          </h1>
          <p style={{ color: "#4a6fa5", fontSize: 17 }}>
            💙 Loading, please wait 💙
          </p>
        </div>
      </div>

      <style>{`
        @keyframes moveStripes {
          from { background-position: 0 0; }
          to   { background-position: 40px 0; }
        }
      `}</style>
    </div>
  );
}