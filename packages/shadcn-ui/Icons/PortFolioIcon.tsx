import * as React from "react";
const PortFolioIcon = (props: any) => (
  <svg
    width={props.width || 200}
    height={props.height || 200}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop
          offset="0%"
          style={{
            stopColor: "#4DB6AC",
            stopOpacity: 1,
          }}
        />
        <stop
          offset="100%"
          style={{
            stopColor: "#00695C",
            stopOpacity: 1,
          }}
        />
      </linearGradient>
      <radialGradient id="radial" cx="50%" cy="50%" r="50%">
        <stop
          offset="0%"
          style={{
            stopColor: "#263238",
            stopOpacity: 1,
          }}
        />
        <stop
          offset="100%"
          style={{
            stopColor: "#000A12",
            stopOpacity: 1,
          }}
        />
      </radialGradient>
      <filter id="shadow" x="-20%" y="-20%" width="150%" height="150%">
        <feDropShadow
          dx={0}
          dy={2}
          stdDeviation={3}
          floodColor="rgba(0, 0, 0, 0.6)"
        />
      </filter>
    </defs>
    <circle
      cx={100}
      cy={100}
      r={85}
      fill="url(#radial)"
      stroke="#37474F"
      strokeWidth={4}
      filter="url(#shadow)"
    />
    <circle
      cx={100}
      cy={100}
      r={70}
      fill="none"
      stroke="url(#grad)"
      strokeWidth={2}
      strokeDasharray="6 4"
    />
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dy="0.3em"
      fontFamily="Arial, Helvetica, sans-serif"
      fontSize={80}
      fontWeight="bold"
      fill="#80CBC4"
      letterSpacing={2}
    >
      <tspan>{"R"}</tspan>
      <tspan dx={-15}>{"V"}</tspan>
    </text>
    <line
      x1={40}
      y1={137}
      x2={160}
      y2={137}
      stroke="#B2DFDB"
      strokeWidth={2}
      strokeLinecap="round"
    />
    <text
      x="50%"
      y={152}
      textAnchor="middle"
      fontFamily="Verdana, sans-serif"
      fontSize={8}
      fill="#80CBC4"
      letterSpacing={1.2}
    >
      {"\n    Full Stack Developer\n  "}
    </text>
    <circle cx={100} cy={180} r={6} fill="#4DB6AC" filter="url(#shadow)" />
  </svg>
);
export default PortFolioIcon;
