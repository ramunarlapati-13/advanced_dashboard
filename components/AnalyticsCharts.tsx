"use client";

import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface AnalyticsChartsProps {
    users: any[];
}

export default function AnalyticsCharts({ users }: AnalyticsChartsProps) {
    const [chartData, setChartData] = useState<any>(null);

    useEffect(() => {
        if (!users || users.length === 0) return;

        // Process data: Group users by creation date
        const usersByDate: Record<string, number> = {};

        // Sort users by creation time
        const sortedUsers = [...users].sort((a, b) => {
            const dateA = new Date(a.metadata?.creationTime || 0).getTime();
            const dateB = new Date(b.metadata?.creationTime || 0).getTime();
            return dateA - dateB;
        });

        // Calculate cumulative count
        let cumulativeCount = 0;
        const dateMap = new Map<string, number>();

        sortedUsers.forEach(user => {
            if (!user.metadata?.creationTime) return;

            const date = new Date(user.metadata.creationTime).toLocaleDateString(); // e.g., "1/31/2026" or locale specific
            // Standardize date format for sorting/labels logic if needed, but local string is fine for display
            // Let's use ISO date string YYYY-MM-DD for cleaner keys/sorting
            const isoDate = new Date(user.metadata.creationTime).toISOString().split('T')[0];

            cumulativeCount++;
            dateMap.set(isoDate, cumulativeCount);
        });

        // Fill in gaps if we strictly wanted a day-by-day line, but for "growth" seeing just changes is also fine.
        // Let's stick to the points we have to assume a step function or direct line between data points.

        const labels = Array.from(dateMap.keys());
        const dataPoints = Array.from(dateMap.values());

        setChartData({
            labels,
            datasets: [
                {
                    label: "Total Users",
                    data: dataPoints,
                    borderColor: "rgb(147, 51, 234)", // Purple-600
                    backgroundColor: "rgba(147, 51, 234, 0.2)",
                    tension: 0.4, // Smooth curve
                    fill: true,
                    pointBackgroundColor: "rgb(147, 51, 234)",
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: "rgb(147, 51, 234)",
                },
            ],
        });
    }, [users]);

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

    return (
        <div className="w-full h-80">
            <Line options={options} data={chartData} />
        </div>
    );
}
