import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.font.family = "'Inter', 'Segoe UI', system-ui, sans-serif";

// draws a dashed horizontal line at the target percentage
const targetLine = {
  id: 'targetLine',
  afterDatasetsDraw(chart, _, opts) {
    const { ctx, chartArea, scales } = chart;
    const y = scales.y.getPixelForValue(opts.value);
    ctx.save();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(239, 68, 68, .8)';
    ctx.beginPath();
    ctx.moveTo(chartArea.left, y);
    ctx.lineTo(chartArea.right, y);
    ctx.stroke();
    ctx.fillStyle = '#fca5a5';
    ctx.fillText(`Target ${opts.value}%`, chartArea.right - 70, y - 6);
    ctx.restore();
  },
};

export default function AttendanceCharts({ subjects, overall, target }) {
  const bar = {
    labels: subjects.map((s) => s.code || s.name),
    datasets: [
      {
        label: 'Attendance %',
        data: subjects.map((s) => s.percentage),
        backgroundColor: subjects.map((s) => `${s.color}cc`),
        borderRadius: 8,
        maxBarThickness: 48,
      },
    ],
  };

  const doughnut = {
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [overall.present, overall.absent],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  return (
    <section className="charts-grid">
      <div className="card">
        <h3 className="chart-title">Subject comparison</h3>
        <div className="chart-box">
          <Bar
            data={bar}
            plugins={[targetLine]}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { display: false }, targetLine: { value: target } },
              scales: {
                y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` }, grid: { color: 'rgba(255,255,255,.06)' } },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>
      </div>
      <div className="card">
        <h3 className="chart-title">Present vs absent</h3>
        <div className="chart-box">
          <Doughnut
            data={doughnut}
            options={{ maintainAspectRatio: false, cutout: '68%', plugins: { legend: { position: 'bottom' } } }}
          />
        </div>
      </div>
    </section>
  );
}
