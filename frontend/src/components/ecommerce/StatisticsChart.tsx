import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import API from "../../api/api";

export default function StatisticsChart() {
  const [series, setSeries] = useState([
    { name: "Terjual", data: [] as number[] },
  ]);

  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await API.get("/dashboard/statistics");
      // res.data diharapkan array 12 bulan: [{ bulan: "Jan", jumlah: 10 }, ...]
      const data = res.data;
      setCategories(data.map((d: any) => d.bulan));
      setSeries([{ name: "Terjual", data: data.map((d: any) => d.jumlah) }]);
    } catch (err) {
      console.error("Gagal load chart data", err);
    }
  };

  const options: ApexOptions = {
    chart: {
      type: "area",
      height: 310,
      toolbar: { show: false },
      fontFamily: "Outfit, sans-serif",
    },
    stroke: {
      curve: "straight",
      width: 2,
    },
    colors: ["#465FFF"],
    dataLabels: { enabled: false },
    markers: { size: 0, strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
    xaxis: { type: "category", categories, axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { style: { fontSize: "12px", colors: ["#6B7280"] } } },
    tooltip: { x: { format: "MMM" } },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
    grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistik Rumah Terjual
          </h3>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={310} />
        </div>
      </div>
    </div>
  );
}
