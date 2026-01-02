import { useEffect, useState } from "react";
import API from "../../api/api";
import {
  HouseIcon,
  MapIcon,
  StarIcon,
  RocketIcon
} from "../../icons";
import Badge from "../ui/badge/Badge";

interface Metrics {
  total_blok: number;
  total_rumah: number;
  tersedia: number;
  dipesan: number;
}

export default function EcommerceMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    // fungsi async di dalam useEffect
    const fetchMetrics = async () => {
      try {
        const res = await API.get("/dashboard/chart"); // ambil dari getperum
        setMetrics(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMetrics();
  }, []);

  if (!metrics) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">

      {/* Total Blok */}
      <div className="min-h-[150px] rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800">
          <MapIcon className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Blok</span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {metrics.total_blok}
            </h4>
          </div>
          <Badge color="primary">
             Blok Tersedia
          </Badge>
        </div>
      </div>

      {/* Total Rumah */}
      <div className="min-h-[150px] rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800">
          <HouseIcon className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Total Rumah</span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {metrics.total_rumah}
            </h4>
          </div>
          <Badge color="primary">
            Semua Rumah
          </Badge>
        </div>
      </div>

      {/* Total Rumah tersedia */}
      <div className="min-h-[150px] rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800">
          <StarIcon className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Rumah Tersedia</span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {metrics.tersedia}
            </h4>
          </div>
          <Badge color="success">
            Siap Dibooking
          </Badge>
        </div>
      </div>

      {/* Total rumah Dipesan */}
      <div className="min-h-[150px] rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800">
          <RocketIcon className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Rumah Dibooking</span>
            <h4 className="mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
              {metrics.dipesan}
            </h4>
          </div>
          <Badge color="success">
             Siap Dijual
          </Badge>
        </div>
      </div>

    </div>
  );
}
