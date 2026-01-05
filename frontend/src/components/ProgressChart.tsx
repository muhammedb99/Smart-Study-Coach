import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

type Props = {
  data: {
    קל: number;
    בינוני: number;
    קשה: number;
  };
};

export default function ProgressChart({ data }: Props) {
  const chartData = [
    { name: "קל", value: data.קל, color: "#34c759" }, // Apple Green
    { name: "בינוני", value: data.בינוני, color: "#ff9500" }, // Apple Orange
    { name: "קשה", value: data.קשה, color: "#ff3b30" }, // Apple Red
  ];

  return (
    <div style={{ height: "200px", width: "100%", marginTop: "10px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
          <defs>
            {chartData.map((entry, index) => (
              <linearGradient key={`gradient-${index}`} id={`colorBar-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={entry.color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={entry.color} stopOpacity={0.3} />
              </linearGradient>
            ))}
          </defs>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#86868b', fontSize: 12, fontWeight: 500 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#86868b', fontSize: 10 }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.02)' }}
            contentStyle={{
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={40}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#colorBar-${index})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div style={legendContainer}>
        <div style={legendItem}><span style={{ ...dot, background: '#34c759' }}></span> קל</div>
        <div style={legendItem}><span style={{ ...dot, background: '#ff9500' }}></span> בינוני</div>
        <div style={legendItem}><span style={{ ...dot, background: '#ff3b30' }}></span> קשה</div>
      </div>
    </div>
  );
}

const legendContainer: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginTop: '15px'
};

const legendItem: React.CSSProperties = {
  fontSize: '11px',
  color: '#86868b',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontWeight: 600 as any // Casting '600' helps if TS expects a specific string
};

const dot: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%'
};