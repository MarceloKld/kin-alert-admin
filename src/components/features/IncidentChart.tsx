"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartProps {
    data: { month: string; total: number }[];
}

export const IncidentChart = ({ data }: ChartProps) => {
    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            backgroundColor: '#0f172a',
                            color: '#fff',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)'
                        }}
                        itemStyle={{ color: '#ef4444' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#ef4444"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};