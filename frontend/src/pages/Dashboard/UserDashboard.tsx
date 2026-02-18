import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../../api/api";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import DatePicker from "../../components/form/date-picker";
import TextArea from "../../components/form/input/TextArea";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Alert from "../../components/ui/alert/Alert";

interface Rumah {
  id: number;
  nomor_rumah: string;
  nama_blok: string;
  status: string;
  gambar?: string;
  luas_tanah?: number;
  luas_bangunan?: number;
  deskripsi?: string;
}

interface Booking {
  id: number;
  nomor_rumah: string;
  nama_blok: string;
  tanggal_kunjungan: string | null;
  kontak: string;
  catatan: string;
  status: string;
}

interface AlertState {
  show: boolean;
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

export default function UserDashboard() {
  const nama = localStorage.getItem("name") || "";
  const location = useLocation();

  const [rumah, setRumah] = useState<Rumah[]>([]);
  const [booking, setBooking] = useState<Booking[]>([]);
  const [selectedCard, setSelectedCard] = useState<"rumah" | "booking">("rumah");

  const [selectedRumah, setSelectedRumah] = useState<Rumah | null>(null);
  const { isOpen: isBookingOpen, openModal: openBookingModal, closeModal: closeBookingModal } = useModal();

  const { isOpen: isStatusOpen, openModal: openStatusModal, closeModal: closeStatusModal } = useModal();
  const [statusToUpdate, setStatusToUpdate] = useState<{
    id: number;
    status: string;
    nomor_rumah: string;
    nama_blok: string;
  } | null>(null);

  const [tanggal, setTanggal] = useState("");
  const [kontak, setKontak] = useState("");
  const [catatan, setCatatan] = useState("");

  const [loading, setLoading] = useState(true);

  const [alert, setAlert] = useState<AlertState>({
    show: false,
    variant: "success",
    title: "",
    message: "",
  });

  const [blokRumah, setBlokRumah] = useState<[string, Rumah[]][]>([]);
  const [currentBlokIndex, setCurrentBlokIndex] = useState(0);

  const showAlert = (variant: AlertState["variant"], title: string, message: string) => {
    setAlert({ show: true, variant, title, message });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
  };

  useEffect(() => {
    loadRumahTersedia();
    loadUserBookings();
  }, []);

  useEffect(() => {
    if (location.state?.tab === "booking" && location.state?.rumahId) {
      setSelectedCard("booking");
      showAlert("info", "Sudah Dibooking", `Anda sudah booking rumah tersebut`);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadRumahTersedia = async () => {
    try {
      setLoading(true);
      const res = await API.get<Rumah[]>("/rumah/available");
      setRumah(res.data);

      const blokMap: { [key: string]: Rumah[] } = {};
      res.data.forEach(r => {
        if (!blokMap[r.nama_blok]) blokMap[r.nama_blok] = [];
        blokMap[r.nama_blok].push(r);
      });
      setBlokRumah(Object.entries(blokMap));
    } catch (err) {
      console.error(err);
      showAlert("error", "Gagal", "Gagal load rumah tersedia");
    } finally {
      setLoading(false);
    }
  };

  const loadUserBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get<Booking[]>("/booking/user");
      setBooking(res.data);
    } catch (err) {
      console.error(err);
      showAlert("error", "Gagal", "Gagal load booking Anda");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBookingModal = (rumahItem: Rumah) => {
    const alreadyBooked = booking.find(
      (b) =>
        b.nomor_rumah === rumahItem.nomor_rumah &&
        (b.status === "menunggu" || b.status === "dikonfirmasi")
    );

    if (alreadyBooked) {
      showAlert("info", "Sudah Dibooking", `Rumah NO ${rumahItem.nomor_rumah} sudah dibooking.`);
      setSelectedCard("booking");
      return;
    }

    setSelectedRumah(rumahItem);
    openBookingModal();
  };

  const handleCloseBookingModal = () => {
    setSelectedRumah(null);
    setTanggal("");
    setKontak("");
    setCatatan("");
    closeBookingModal();
  };

  const handleBookingSubmit = async () => {
    if (!tanggal || !kontak) {
      return showAlert("warning", "Validasi", "Tanggal dan kontak wajib diisi");
    }

    try {
      const res = await API.post("/booking", {
        rumah_id: selectedRumah?.id,
        tanggal_kunjungan: tanggal,
        kontak,
        catatan,
      });

      showAlert("success", "Berhasil", res.data.message);
      handleCloseBookingModal();
      loadUserBookings();
      setSelectedCard("booking");
    } catch (err: any) {
      console.error(err.response || err);
      showAlert("error", "Gagal", err.response?.data?.message || "Terjadi kesalahan saat booking");
    }
  };

  const handleOpenStatusModal = (b: Booking, newStatus: string) => {
    setStatusToUpdate({
      id: b.id,
      status: newStatus,
      nomor_rumah: b.nomor_rumah,
      nama_blok: b.nama_blok,
    });
    openStatusModal();
  };

  const confirmUpdateStatus = async () => {
    if (!statusToUpdate) return;

    try {
      await API.put(`/booking/bookingStatusUser/${statusToUpdate.id}`, { status: statusToUpdate.status });
      showAlert("success", "Berhasil", `Booking berhasil ${statusToUpdate.status}`);
      loadUserBookings();
    } catch (err: any) {
      console.error(err.response || err);
      showAlert("error", "Gagal", err.response?.data?.message || "Gagal update status booking");
    } finally {
      closeStatusModal();
      setStatusToUpdate(null);
    }
  };

  const prevBlok = () => {
    setCurrentBlokIndex((prev) => (prev > 0 ? prev - 1 : blokRumah.length - 1));
  };
  const nextBlok = () => {
    setCurrentBlokIndex((prev) => (prev < blokRumah.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <PageMeta title="Data Booking | Dashboard" description="Manajemen Booking" />
      <ComponentCard>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* --- HEADER --- */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-lg mb-8 mt-2">
            <div className="relative z-10">
              <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Monitoring Properti
              </span>
              <h1 className="text-3xl font-extrabold mt-3 tracking-tight">Selamat datang, {nama}! 👋</h1>
              <p className="text-blue-50/80 mt-2 max-w-lg text-sm leading-relaxed">
                Temukan unit terbaik dan pantau status pengajuan booking Anda dengan mudah dalam satu dashboard.
              </p>
            </div>
            {/* Dekoratif Aksen */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-[60px]"></div>
          </div>

          {/* Alert */}
          {alert.show && (
            <div className="mb-6">
              <Alert
                variant={alert.variant}
                title={alert.title}
                message={alert.message}
              />
            </div>
          )}

          {/* --- TABS FULL WIDTH --- */}
          <div className="flex w-full border-b border-gray-200 dark:border-white/[0.08] mb-10">
            <button
              className={`relative flex-1 pb-4 text-sm font-bold transition-all duration-300 ${
                selectedCard === "rumah"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
              onClick={() => setSelectedCard("rumah")}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <span>Rumah Tersedia</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                  selectedCard === "rumah" 
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" 
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {rumah.length}
                </span>
              </div>
              {selectedCard === "rumah" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-500 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.3)]" />
              )}
            </button>

            <button
              className={`relative flex-1 pb-4 text-sm font-bold transition-all duration-300 ${
                selectedCard === "booking"
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
              onClick={() => setSelectedCard("booking")}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                <span>Booking Saya</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                  selectedCard === "booking" 
                  ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300" 
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {booking.length}
                </span>
              </div>
              {selectedCard === "booking" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 dark:bg-green-500 rounded-t-full shadow-[0_-2px_8px_rgba(22,163,74,0.3)]" />
              )}
            </button>
          </div>

          {/* Konten Rumah */}
          {selectedCard === "rumah" && (
            <div className="w-full pb-10">
              <h2 className="text-4xl font-bold mb-12 text-center dark:text-white/90 text-gray-800">Rumah Tersedia</h2>
              {loading ? (
                <p className="dark:text-white/90 text-gray-500 text-center">Loading...</p>
              ) : blokRumah.length === 0 ? (
                <p className="dark:text-white/90 text-gray-500 text-center">Belum ada rumah tersedia saat ini.</p>
              ) : (
                <div className="max-w-[1200px] mx-auto">
                  {/* Grid Rumah */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">
                    {blokRumah[currentBlokIndex][1].map((rumahItem) => (
                      <div key={rumahItem.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-2 overflow-hidden">
                        <div className="h-64 w-full overflow-hidden rounded-t-2xl">
                          {rumahItem.gambar ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL}/uploads/rumah/${rumahItem.gambar}`}
                              alt={`Rumah ${rumahItem.nomor_rumah}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="dark:text-white/90 flex items-center justify-center h-full text-gray-400">Tidak ada gambar</div>
                          )}
                        </div>
                        <div className="p-6">
                          <h3 className="text-xl dark:text-white/90 font-semibold text-gray-800">Nomor {rumahItem.nomor_rumah}</h3>
                          <p className="dark:text-white/90 mt-2">Luas Tanah: {rumahItem.luas_tanah || "-"} m² | Luas Bangunan: {rumahItem.luas_bangunan || "-"} m²</p>
                          {rumahItem.deskripsi && <p className="mt-3 dark:text-white/90 text-gray-600 text-sm line-clamp-3">{rumahItem.deskripsi}</p>}
                          <div className="mt-4 flex justify-between items-center">
                            <Badge size="sm" color="success"> {rumahItem.status.toUpperCase()}</Badge>
                            <Button size="sm" variant="primary" onClick={() => handleOpenBookingModal(rumahItem)}>Booking</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigasi Blok */}
                  <div className="flex justify-center items-center gap-6 mt-4">
                    <button onClick={prevBlok} className="bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow-md p-3 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <span className="font-semibold dark:text-white/90 text-gray-700 text-lg">Blok {blokRumah[currentBlokIndex][0]}</span>
                    <button onClick={nextBlok} className="bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow-md p-3 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Konten Booking */}
          {selectedCard === "booking" && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">#</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Nomor Rumah</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Blok</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">Tanggal Kunjungan</TableCell>
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
                    ) : booking.length === 0 ? (
                      <TableRow>
                        <TableCell className="px-5 py-6 text-theme-sm text-gray-500">Data tidak tersedia</TableCell>
                      </TableRow>
                    ) : (
                      booking.map((r, index) => (
                        <TableRow key={r.id}>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{index + 1}</TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.nomor_rumah}</TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.nama_blok}</TableCell>
                          <TableCell className="px-5 py-4 text-center text-theme-sm text-gray-500 dark:text-gray-400">{r.tanggal_kunjungan ? new Date(r.tanggal_kunjungan).toLocaleDateString('id-ID') : '-'}</TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.kontak}</TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.catatan || '-'}</TableCell>
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
                              {(r.status === "menunggu" || r.status === "dikonfirmasi") && (
                                <Button size="sm" variant="danger" onClick={() => handleOpenStatusModal(r, 'dibatalkan')}>Batalkan</Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </ComponentCard>

      {/* Modal Booking */}
      <Modal isOpen={isBookingOpen} onClose={handleCloseBookingModal} className="max-w-[400px] m-4">
        <div className="bg-white p-4 rounded-lg dark:bg-gray-900 text-black dark:text-white">
          <h4 className="text-lg font-medium mb-4">Booking Rumah NO {selectedRumah?.nomor_rumah}</h4>
          <p>Blok : {selectedRumah?.nama_blok}</p>
          <p>Status : <Badge size="md" color="success">{selectedRumah?.status}</Badge></p>

          <div className="flex flex-col gap-2 mt-4">
            <Label>Tanggal Kunjungan</Label>
            <DatePicker
              id="tanggal-kunjungan"
              placeholder="Pilih tanggal"
              onChange={(_, dateStr: string) => setTanggal(dateStr)}
            />
            <Label>Kontak</Label>
            <Input type="text" value={kontak} onChange={(e) => setKontak(e.target.value)} className="border p-2 rounded" placeholder="Isi informasi kontak anda" />

            <Label>Catatan</Label>
            <TextArea value={catatan} onChange={(value: string) => setCatatan(value)} className="border p-2 rounded" placeholder="Tuliskan catatan jika ada" />
            <div className="flex justify-end gap-2 mt-4">
              <Button size="sm" variant="primary" onClick={handleBookingSubmit}>Kirim Booking</Button>
              <Button size="sm" variant="outline" onClick={handleCloseBookingModal}>Batal</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Konfirmasi Update Status */}
      <Modal isOpen={isStatusOpen} onClose={closeStatusModal} className="max-w-[400px] m-4">
        <div className="relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Konfirmasi Ubah Status
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Apakah Anda yakin ingin membatalkan booking rumah <span className="font-medium">
              {statusToUpdate?.nama_blok} {statusToUpdate?.nomor_rumah}
            </span>{" "}
            menjadi <span className="font-medium">{statusToUpdate?.status}</span>?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button size="sm" variant="outline" onClick={closeStatusModal}>Batal</Button>
            <Button
              size="sm"
              variant={statusToUpdate?.status === "dibatalkan" ? "danger" : "primary"}
              onClick={confirmUpdateStatus}
            >
              {statusToUpdate?.status === "dibatalkan" ? "Ya, Batalkan" : "Ya, Ubah"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}