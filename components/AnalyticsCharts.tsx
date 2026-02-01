"use client";

import { useRef, useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

interface AnalyticsChartsProps {
    users: any[];
    secondaryUsers?: any[];
    primaryLabel?: string;
    secondaryLabel?: string;
}

export default function AnalyticsCharts({
    users,
    secondaryUsers,
    primaryLabel = "Academy Users",
    secondaryLabel = "Zestfolio Users"
}: AnalyticsChartsProps) {
    const [chartData, setChartData] = useState<any>(null);

    const lineChartRef = useRef<any>(null);
    const pieChartRef = useRef<any>(null);
    const barChartRef = useRef<any>(null);

    const totalPrimary = users?.length || 0;
    const totalSecondary = secondaryUsers?.length || 0;

    const downloadChart = (ref: any, name: string) => {
        if (ref.current) {
            const url = ref.current.toBase64Image();
            const link = document.createElement('a');
            link.download = `${name}.png`;
            link.href = url;
            link.click();
        }
    };

    useEffect(() => {
        if (!users || users.length === 0) return;

        const processGrowth = (userList: any[]) => {
            const sorted = [...userList].sort((a, b) => {
                const dateA = new Date(a.metadata?.creationTime || 0).getTime();
                const dateB = new Date(b.metadata?.creationTime || 0).getTime();
                return dateA - dateB;
            });

            const map = new Map<string, number>();
            let count = 0;
            sorted.forEach(u => {
                if (!u.metadata?.creationTime) return;
                const date = new Date(u.metadata.creationTime).toISOString().split('T')[0];
                count++;
                map.set(date, count);
            });
            return map;
        };

        const primaryMap = processGrowth(users);
        const secondaryMap = secondaryUsers ? processGrowth(secondaryUsers) : null;

        // Get all unique dates
        const allDates = new Set([...primaryMap.keys()]);
        if (secondaryMap) {
            secondaryMap.forEach((_, date) => allDates.add(date));
        }

        const sortedLabels = Array.from(allDates).sort();

        // Build data arrays with fill-forward logic
        const primaryData: number[] = [];
        const secondaryData: number[] = [];

        let lastPrimary = 0;
        let lastSecondary = 0;

        sortedLabels.forEach(date => {
            if (primaryMap.has(date)) lastPrimary = primaryMap.get(date)!;
            primaryData.push(lastPrimary);

            if (secondaryMap) {
                if (secondaryMap.has(date)) lastSecondary = secondaryMap.get(date)!;
                secondaryData.push(lastSecondary);
            }
        });

        const datasets = [
            {
                label: primaryLabel,
                data: primaryData,
                borderColor: "rgb(59, 130, 246)", // Blue-500
                backgroundColor: "rgba(59, 130, 246, 0.2)",
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "rgb(59, 130, 246)",
                pointBorderColor: "#fff",
            }
        ];

        if (secondaryUsers && secondaryUsers.length > 0) {
            datasets.push({
                label: secondaryLabel,
                data: secondaryData,
                borderColor: "rgb(147, 51, 234)", // Purple-600
                backgroundColor: "rgba(147, 51, 234, 0.2)",
                tension: 0.4,
                fill: true,
                pointBackgroundColor: "rgb(147, 51, 234)",
                pointBorderColor: "#fff",
            });
        }

        setChartData({
            labels: sortedLabels,
            datasets
        });
    }, [users, secondaryUsers, primaryLabel, secondaryLabel]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    color: "#9ca3af", // gray-400
                },
            },
            tooltip: {
                mode: "index" as const,
                intersect: false,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: {
                    color: "rgba(255, 255, 255, 0.05)",
                },
                ticks: {
                    color: "#9ca3af",
                },
            },
            y: {
                grid: {
                    color: "rgba(255, 255, 255, 0.05)",
                },
                ticks: {
                    color: "#9ca3af",
                    precision: 0,
                },
                beginAtZero: true,
            },
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        }
    };

    if (!chartData) {
        return <div className="h-64 flex items-center justify-center text-gray-500">Loading chart data...</div>;
    }

    const pieData = {
        labels: [primaryLabel, secondaryLabel],
        datasets: [
            {
                data: [totalPrimary, totalSecondary],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(147, 51, 234, 0.8)',
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(147, 51, 234, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Main Line Chart */}
            <div className="w-full relative group">
                <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-400 text-xs uppercase">Growth Trend</h4>
                    <button
                        onClick={() => downloadChart(lineChartRef, 'growth-trend')}
                        className="text-xs text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        Export as PNG
                    </button>
                </div>
                <div className="h-80">
                    <Line ref={lineChartRef} options={options} data={chartData} />
                </div>
            </div>

            {/* Secondary Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pie Chart */}
                <div className="w-full p-4 border border-white/5 rounded-lg bg-black/20 relative group">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-gray-400 text-xs uppercase">User Distribution</h4>
                        <button
                            onClick={() => downloadChart(pieChartRef, 'user-distribution')}
                            className="text-xs text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Export
                        </button>
                    </div>
                    <div className="h-64 flex justify-center pb-2">
                        <Pie ref={pieChartRef} data={pieData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="w-full p-4 border border-white/5 rounded-lg bg-black/20 relative group">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-gray-400 text-xs uppercase">Comparitive Volume</h4>
                        <button
                            onClick={() => downloadChart(barChartRef, 'comparitive-volume')}
                            className="text-xs text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            Export
                        </button>
                    </div>
                    <div className="h-64">
                        <Bar ref={barChartRef} options={options} data={chartData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
