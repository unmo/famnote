import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { MonthlyPracticeStats } from '@/types/stats';

interface PracticeChartsProps {
  data: MonthlyPracticeStats[];
  isLoading: boolean;
}

/** カスタムツールチップ: 練習回数 + 体調 */
function CustomPracticeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const practiceEntry = payload.find((p) => p.name === '練習回数');
  const conditionEntry = payload.find((p) => p.name === '平均体調');
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/30">
      <p className="font-semibold text-zinc-200 mb-1">{label}</p>
      {practiceEntry && (
        <p className="text-green-400">練習回数: {practiceEntry.value}回</p>
      )}
      {conditionEntry && (
        <p className="text-amber-400">
          平均体調:{' '}
          {conditionEntry.value != null
            ? `${Number(conditionEntry.value).toFixed(1)}/5`
            : '-'}
        </p>
      )}
    </div>
  );
}

/** カスタムツールチップ: 練習時間 */
function CustomTimeTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const minutes = payload[0]?.value ?? 0;
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs shadow-lg shadow-black/30">
      <p className="font-semibold text-zinc-200 mb-1">{label}</p>
      <p className="text-blue-400">
        練習時間: {minutes}分 ({(minutes / 60).toFixed(1)}時間)
      </p>
    </div>
  );
}

/** 練習タブ用グラフ2本（練習回数+体調 / 合計練習時間） */
export function PracticeCharts({ data, isLoading }: PracticeChartsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-[200px] bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
        <div className="h-[180px] bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* グラフ1: 月別練習回数 + 体調スコア */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
          月別練習回数と体調
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={data} aria-label="月別練習回数グラフ">
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
                yAxisId="left"
                tick={{ fontSize: 10, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 5]}
                tick={{ fontSize: 10, fill: '#71717a' }}
                axisLine={false}
                tickLine={false}
                width={20}
              />
              <Tooltip content={<CustomPracticeTooltip />} />
              <Bar
                yAxisId="left"
                dataKey="practiceCount"
                name="練習回数"
                fill="#22c55e"
                fillOpacity={0.8}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
              <Line
                yAxisId="right"
                dataKey="avgCondition"
                name="平均体調"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ fill: '#f59e0b', r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={1000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* グラフ2: 月別合計練習時間 */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
          月別合計練習時間
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data} aria-label="月別練習時間グラフ">
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
                width={32}
                unit="分"
              />
              <Tooltip content={<CustomTimeTooltip />} />
              <Bar
                dataKey="totalMinutes"
                name="練習時間"
                fill="#60a5fa"
                fillOpacity={0.8}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
