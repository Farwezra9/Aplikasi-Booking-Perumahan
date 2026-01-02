import { useEffect, useState } from "react";
import API from "../../api/api";
import type { AxiosError } from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Alert from "../../components/ui/alert/Alert";

/* ===================== TYPE ===================== */
interface Booking {
  id: number;
  nomor_rumah: string;
  nama_blok: string;
  user_name: string;
  tanggal_kunjungan: string | null;
  kontak: string;
  catatan: string;
  status: "menunggu" | "dikonfirmasi" | "dibatalkan" | "terjual";
}

interface AlertState {
  show: boolean;
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export default function BookingAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const { isOpen: isStatusOpen, openModal: openStatusModal, closeModal: closeStatusModal } = useModal();
  const [statusToUpdate, setStatusToUpdate] = useState<{
    id: number;
    status: Booking["status"];
    nomor_rumah: string;
    nama_blok: string;
    user_name: string;
  } | null>(null);

  const [alert, setAlert] = useState<AlertState>({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  const showAlert = (variant: AlertState["variant"], title: string, message: string) => {
    setAlert({ show: true, variant, title, message });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get<Booking[]>("/booking");
      setBookings(res.data);
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error(error.response || error);
      showAlert("error", "Gagal Load", error.response?.data?.message || "Gagal load data booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleOpenStatusModal = (r: Booking, newStatus: Booking["status"]) => {
    setStatusToUpdate({ id: r.id, status: newStatus, nomor_rumah: r.nomor_rumah, nama_blok: r.nama_blok, user_name: r.user_name  });
    openStatusModal();
  };

  const confirmUpdateStatus = async () => {
    if (!statusToUpdate) return;
    try {
      await API.put(`/booking/${statusToUpdate.id}`, { status: statusToUpdate.status });
      loadBookings();
      showAlert("success", "Berhasil", `Status berhasil diubah menjadi "${statusToUpdate.status}"`);
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error(error.response || error);
      showAlert("error", "Gagal", error.response?.data?.message || "Gagal update status booking");
    } finally {
      closeStatusModal();
      setStatusToUpdate(null);
    }
  };

  const exportToExcel = () => {
    const filtered = filteredBookings;
    if (filtered.length === 0) return;

    const data = filtered.map((b, index) => ({
      No: index + 1,
      Rumah: `${b.nama_blok} - ${b.nomor_rumah}`,
      Pemesan: b.user_name,
      TanggalKunjungan: b.tanggal_kunjungan ? new Date(b.tanggal_kunjungan).toLocaleDateString('id-ID') : '-',
      Kontak: b.kontak,
      Catatan: b.catatan,
      Status: b.status.toUpperCase()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "BookingList.xlsx");
  };

  const filteredBookings = bookings.filter(b =>
    b.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${b.nama_blok} - ${b.nomor_rumah}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBookings.length / rowsPerPage);

  return (
    <>
      <PageMeta title="Data Booking | Dashboard" description="Manajemen Booking" />
      <PageBreadcrumb pageTitle="Data Booking" />

      <ComponentCard>
        <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
          <input
            type="text"
            placeholder="Search by pemesan atau rumah..."
            className="border rounded px-2 py-1 dark:bg-gray-900 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex gap-2 items-center">
            <select
              className="border rounded px-2 py-1 dark:bg-gray-900 dark:text-white"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1); // reset page
              }}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
            </select>

            <Button size="sm" variant="success" onClick={exportToExcel}>Export Excel</Button>
          </div>
        </div>

        {alert.show && (
          <div className="mb-4">
            <Alert variant={alert.variant} title={alert.title} message={alert.message} />
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">#</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Rumah</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Pemesan</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Tanggal Kunjungan</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Kontak</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Catatan</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 flex justify-center gap-2 text-gray-500 dark:text-gray-400"
                  ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                    <path fillRule="evenodd" d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.262.125l.962.962a1 1 0 0 1 .125 1.262l-.834 1.25c.245.445.443.919.587 1.416l1.473.294a1 1 0 0 1 .804.98v1.361a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.125 1.262l-.962.962a1 1 0 0 1-1.262.125l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.294 1.473a1 1 0 0 1-.98.804H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.262-.125l-.962-.962a1 1 0 0 1-.125-1.262l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.294A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .125-1.262l.962-.962A1 1 0 0 1 5.38 3.03l1.25.834a6.957 6.957 0 0 1 1.416-.587l.294-1.473ZM13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" clipRule="evenodd" />
                  </svg></TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-theme-sm text-gray-500">Loading...</TableCell>
                  </TableRow>
                ) : currentBookings.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-theme-sm text-gray-500">Data tidak tersedia</TableCell>
                  </TableRow>
                ) : (
                 currentBookings.map((r, index) => (
                    <TableRow key={r.id}>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{index + 1}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.nama_blok} - {r.nomor_rumah}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.user_name}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.tanggal_kunjungan ? new Date(r.tanggal_kunjungan).toLocaleDateString('id-ID') : '-'}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.kontak}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.catatan}</TableCell>
                      <TableCell className="px-5 py-4 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                        <Badge size="sm" color={
                          r.status === "terjual" ? "success"
                          : r.status === "menunggu" ? "warning"
                          : r.status === "dikonfirmasi" ? "primary"
                          : "error"}
                          > {r.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                      <TableCell className="px-5 py-4 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                        <div className="flex justify-center gap-2">
                          {r.status === 'menunggu' && (
                            <>
                              <Button size="sm" variant="info" onClick={() => handleOpenStatusModal(r, 'dikonfirmasi')}>Konfirmasi</Button>
                              <Button size="sm" variant="danger" onClick={() => handleOpenStatusModal(r, 'dibatalkan')}>Batalkan</Button>
                            </>
                          )}
                          {r.status === 'dikonfirmasi' && (
                            <>
                              <Button size="sm" variant="success" onClick={() => handleOpenStatusModal(r, 'terjual')}>Jual</Button>
                              <Button size="sm" variant="danger" onClick={() => handleOpenStatusModal(r, 'dibatalkan')}>Batalkan</Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4">
            <div>
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Prev</Button>
              <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next</Button>
            </div>
          </div>
        </div>
      </ComponentCard>

      <Modal isOpen={isStatusOpen} onClose={closeStatusModal} className="max-w-[400px] m-4">
        <div className="relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Konfirmasi Ubah Status
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Apakah Anda yakin ingin mengubah status booking rumah <span className="font-medium">
              {statusToUpdate?.nama_blok} {statusToUpdate?.nomor_rumah} - {statusToUpdate?.user_name}
            </span>{" "}
            menjadi <span className="font-medium">{statusToUpdate?.status}</span>?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button size="sm" variant="outline" onClick={closeStatusModal}>Batal</Button>
            <Button size="sm" variant={statusToUpdate?.status === "dibatalkan" ? "danger" : "primary"} onClick={confirmUpdateStatus}>
              {statusToUpdate?.status === "dibatalkan" ? "Ya, Batalkan" : "Ya, Ubah"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
