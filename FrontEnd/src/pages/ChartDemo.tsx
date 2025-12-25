import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = Array.from({ length: 12 }).map((_, i) => ({
  month: i + 1,
  value: Math.round(50 + Math.random() * 50),
}));

export default function ChartDemo() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Recharts Demo</h2>
      <div className="h-64 rounded-[var(--radius)] border border-neutral-300 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#000" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

