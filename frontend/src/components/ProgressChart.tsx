import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
    { name: "קל", value: data.קל },
    { name: "בינוני", value: data.בינוני },
    { name: "קשה", value: data.קשה },
  ];

  return (
    <div style={{ height: 300 }}>
      <h2 style={{ textAlign: "center" }}>📊 התקדמות לפי רמת קושי</h2>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
