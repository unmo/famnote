import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { MonthlyMatchStats } from '@/types/stats';

interface MatchChartsProps {
  data: MonthlyMatchStats[];
  isLoading: boolean;
}

/** カスタムツールチップ: 試合勝敗 */
function CustomMatchTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const win = payload.find((p) => p.name === '勝')?.value ?? 0;
  const draw = payload.find((p) => p.name === '分')?.value ?? 0;
  const loss = payload.find((p) => p.name === '負')?.value ?? 0;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/30">
      <p className="font-semibold text-zinc-200 mb-1">{label}</p>
      <p className="text-green-400">勝: {win}回</p>
      <p className="text-amber-400">分: {draw}回</p>
      <p className="text-zinc-400">負: {loss}回</p>
    </div>
  );
}

/** カスタムツールチップ: 勝率 */
function CustomWinRateTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number | null }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const value = payload[0]?.value;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/30">
      <p className="font-semibold text-zinc-200 mb-1">{label}</p>
      <p className="text-green-400">
        勝率: {value != null ? `${Number(value).toFixed(1)}%` : '-'}
      </p>
    </div>
  );
}

/** 試合タブ用グラフ2本（stacked勝敗 / 勝率折れ線） */
export function MatchCharts({ data, isLoading }: MatchChartsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-[200px] bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
        <div className="h-[160px] bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* グラフ1: 月別試合数（Stacked Bar） */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
          月別試合結果
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} aria-label="月別試合結果グラフ">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 10, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
                width={20}
              />
              <Tooltip content={<CustomMatchTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(value) => (
                  <span style={{ color: '#a1a1aa' }}>{value}</span>
                )}
              />
              <Bar
                dataKey="winCount"
                name="勝"
                stackId="a"
                fill="#22c55e"
                fillOpacity={0.85}
                isAnimationActive={true}
                animationDuration={800}
              />
              <Bar
                dataKey="drawCount"
                name="分"
                stackId="a"
                fill="#f59e0b"
                fillOpacity={0.85}
                isAnimationActive={true}
                animationDuration={800}
              />
              {/* スタック最上部の Bar にのみ角丸を付与 */}
              <Bar
                dataKey="lossCount"
                name="負"
                stackId="a"
                fill="#71717a"
                fillOpacity={0.85}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* グラフ2: 月別勝率（折れ線） */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
          月別勝率
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={data} aria-label="月別勝率グラフ">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#27272a"
                vertical={false}
              />
              <XAxis
                dataKey="monthLabel"
                tick={{ fontSize: 10, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
                width={28}
                unit="%"
              />
              <Tooltip content={<CustomWinRateTooltip />} />
              <Line
                dataKey="winRate"
                name="勝率"
                stroke="#4ade80"
                strokeWidth={2.5}
                dot={{ fill: '#4ade80', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#22c55e' }}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
