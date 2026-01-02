import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface Booking {
  user_name: string;
  rumah: string;
  tanggal: string;
  status: "menunggu" | "dikonfirmasi" | "dibatalkan" | "terjual";
}

export default function RecentOrders() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await API.get("/dashboard/latest"); 
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); 
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Booking Akhir Ini
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/booking")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Lihat Semua
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 px-4 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                #
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Pemesan
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Rumah
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-4 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Tanggal Kunjungan
              </TableCell>
              <TableCell
                isHeader
                className="py-3 px-4 font-medium text-gray-500 text-center text-theme-xs dark:text-gray-400"
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell className="px-5 py-6 text-center text-theme-sm text-gray-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : bookings.length === 0 ? (
              <TableRow>
                <TableCell className="px-5 py-6 text-center text-theme-sm text-gray-500">
                  Data tidak tersedia
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking, index) => (
                <TableRow key={index}>
                  <TableCell className="py-3 px-4 text-gray-500 text-center text-theme-sm dark:text-white/90">
                    {index + 1}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-gray-500 text-theme-sm dark:text-white/90">
                    {booking.user_name}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-gray-500 text-theme-sm dark:text-gray-400">
                    {booking.rumah}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-gray-500 text-theme-sm dark:text-gray-400">
                    {booking.tanggal}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-gray-500 text-center text-theme-sm dark:text-gray-400">
                    <Badge size="md" color={
                          booking.status === "terjual" ? "success"
                          : booking.status === "menunggu" ? "warning"
                          : booking.status === "dikonfirmasi" ? "primary"
                          : "error"}
                    >
                      {booking.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
