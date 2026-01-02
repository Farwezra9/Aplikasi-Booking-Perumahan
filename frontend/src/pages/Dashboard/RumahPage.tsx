import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import API from "../../api/api";

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
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import InputFile from "../../components/form/input/FileInput";
import TextArea from "../../components/form/input/TextArea";
import Label from "../../components/form/Label";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Alert from "../../components/ui/alert/Alert";

/* ===================== TYPE ===================== */
interface Rumah {
  id: number;
  nomor_rumah: string;
  luas_tanah: string;
  luas_bangunan: string;
  status: "tersedia" | "dipesan" | "terjual";
  blok_id: number;
  nama_blok: string;
  deskripsi: string;
  gambar?: string;

}

interface Blok {
  id: number;
  nama_blok: string;
}

interface AlertState {
  show: boolean;
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}

/* ===================== COMPONENT ===================== */
export default function RumahPage() {
  const [rumah, setRumah] = useState<Rumah[]>([]);
  const [gambar, setGambar] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Blok select
  const [blok, setBlok] = useState<Blok[]>([]);
  const [blokId, setBlokId] = useState("");

  // Modal states
  const { isOpen, openModal, closeModal } = useModal();
  const [currentRumah, setCurrentRumah] = useState<Rumah | null>(null);
  const [formData, setFormData] = useState({
    nomor_rumah: "",
    luas_tanah: "",
    luas_bangunan: "",
    status: "" as "" | Rumah["status"],
    deskripsi: "",
  });

  // Delete confirmation modal
  const {
    isOpen: isDeleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();
  const [rumahToDelete, setRumahToDelete] = useState<Rumah | null>(null);

  // Alert state
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

  /* ================= LOAD DATA ================= */
  const loadRumah = async () => {
    try {
      setLoading(true);
      const res = await API.get<Rumah[]>("/rumah");
      setRumah(res.data);
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error(error.response || error);
      showAlert("error", "Gagal Load", error.response?.data?.message || "Gagal load data rumah");
    } finally {
      setLoading(false);
    }
  };

  const loadBlok = async () => {
    try {
      const res = await API.get<Blok[]>("/blok");
      setBlok(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRumah();
    loadBlok();
  }, []);

  /* ================= MODAL HANDLERS ================= */
  const handleOpenAdd = () => {
    setCurrentRumah(null);
    setGambar(null);
    setFormData({
      nomor_rumah: "",
      luas_tanah: "",
      luas_bangunan: "",
      status: "",
      deskripsi: "",
    });
    setBlokId(""); // kosongkan select blok saat tambah
    openModal();
  };

  const handleOpenEdit = (r: Rumah) => {
    setCurrentRumah(r);
    setFormData({
      nomor_rumah: r.nomor_rumah,
      luas_tanah: r.luas_tanah,
      luas_bangunan: r.luas_bangunan,
      status: r.status,
      deskripsi: r.deskripsi,
    });
    setBlokId(r.blok_id.toString());
    openModal();
  };

  const handleSave = async () => {
  try {
    if (!formData.nomor_rumah || !blokId || !formData.status) {
      return showAlert("warning", "Peringatan", "Data wajib belum lengkap");
    }

    const fd = new FormData();
    fd.append("nomor_rumah", formData.nomor_rumah);
    fd.append("luas_tanah", formData.luas_tanah);
    fd.append("luas_bangunan", formData.luas_bangunan);
    fd.append("status", formData.status);
    fd.append("blok_id", blokId);
    fd.append("deskripsi", formData.deskripsi);

    if (gambar) {
      fd.append("gambar", gambar);
    }

    if (currentRumah) {
      await API.put(`/rumah/${currentRumah.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showAlert("success", "Berhasil", "Data rumah berhasil diperbarui");
    } else {
      await API.post("/rumah", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showAlert("success", "Berhasil", "Data rumah berhasil ditambahkan");
    }

    closeModal();
    setGambar(null);
    loadRumah();
  } catch (err) {
    showAlert("error", "Gagal", "Gagal menyimpan data");
  }
};



  const handleOpenDelete = (r: Rumah) => {
    setRumahToDelete(r);
    openDeleteModal();
  };

  const handleDelete = async () => {
    if (!rumahToDelete) return;
    try {
      await API.delete(`/rumah/${rumahToDelete.id}`);
      closeDeleteModal();
      showAlert("success", "Berhasil", "Data rumah berhasil dihapus");
      loadRumah();
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error(error.response || error);
      showAlert("error", "Gagal", error.response?.data?.message || "Gagal hapus rumah");
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      <PageMeta title="Data Rumah | Dashboard" description="Manajemen rumah" />
      <PageBreadcrumb pageTitle="Data Rumah" />

      <ComponentCard>
        <div className="mb-4 flex justify-end">
        <Button size="sm" variant="primary" onClick={handleOpenAdd}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Button>
      </div>

        {/* Alert */}
        {alert.show && (
          <div className="mb-4">
            <Alert variant={alert.variant} title={alert.title} message={alert.message} />
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">#</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Nomor Rumah</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Blok</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">Gambar</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Luas Tanah</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Luas Bangunan</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Deskripsi</TableCell>
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
                ) : rumah.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-theme-sm text-gray-500">Data tidak tersedia</TableCell>
                  </TableRow>
                ) : (
                  rumah.map((r, index) => (
                    <TableRow key={r.id}>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{index + 1}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.nomor_rumah}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.nama_blok}</TableCell>
                      
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center justify-center">
                          {r.gambar ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL}/uploads/rumah/${r.gambar}`}
                              alt="rumah"
                              className="h-[50px] w-[50px] object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
                              Gambar tidak ada
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.luas_tanah}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.luas_bangunan}</TableCell>
                      <TableCell className="px-5 py-4 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                        <Badge size="sm" color={
                          r.status === "terjual" ? "success"
                          : r.status === "dipesan" ? "warning"
                          : r.status === "tersedia" ? "primary"
                          : "error"}
                          > {r.status.toUpperCase()}
                          </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.deskripsi}</TableCell>
                      <TableCell className="px-5 py-4 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="warning" onClick={() => handleOpenEdit(r)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg></Button>
                          <Button size="sm" variant="danger" onClick={() => handleOpenDelete(r)}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </ComponentCard>

      {/* Modal Tambah/Edit */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full max-w-[700px] flex flex-col rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="mb-4">
            <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">{currentRumah ? "Edit Rumah" : "Tambah Rumah"}</h4>
          </div>
            {/* Alert */}
            {alert.show && (
              <div className="mb-2">
                <Alert
                  variant={alert.variant}
                  title={alert.title}
                  message={alert.message}
                />
              </div>
            )}
          <div className="custom-scrollbar overflow-y-auto flex-grow pb-3">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <Label>Nomor Rumah</Label>
                <Input type="text" value={formData.nomor_rumah} onChange={e => setFormData({ ...formData, nomor_rumah: e.target.value })}  placeholder="Masukan Nomor Rumah"/>
              </div>

              <div>
                <Label>Blok</Label>
                <Select
                  value={blokId}
                  onChange={val => setBlokId(val)}
                  options={blok.map(b => ({ value: b.id.toString(), label: b.nama_blok }))}
                />
              </div>
              <div>
                <Label>Gambar Rumah</Label>
                <InputFile className="custom-class" onChange={e => setGambar(e.target.files?.[0] || null)} />
              </div>
              <div>
                <Label>Luas Tanah</Label>
                <Input type="text" value={formData.luas_tanah} onChange={e => setFormData({ ...formData, luas_tanah: e.target.value })}  placeholder="Masukan Luas Tanah"/>
              </div>

              <div>
                <Label>Luas Bangunan</Label>
                <Input type="text" value={formData.luas_bangunan} onChange={e => setFormData({ ...formData, luas_bangunan: e.target.value })}  placeholder="Masukan Luas Bangunan"/>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={val => setFormData({ ...formData, status: val as Rumah["status"] })}
                  options={[
                    { value: "tersedia", label: "Tersedia" },
                    { value: "dipesan", label: "Dipesan" },
                    { value: "terjual", label: "Terjual" },
                  ]}
                />
              </div>

              <div>
                <Label>Deskripsi</Label>
                <TextArea value={formData.deskripsi} onChange={val => setFormData({ ...formData, deskripsi: val })} rows={4} className="w-full" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <Button size="sm" variant="outline" onClick={closeModal}>Batal</Button>
            <Button
              size="sm"
              variant={currentRumah ? "success" : "primary"}
              onClick={handleSave}
            >
               {currentRumah ? "Update" : "Simpan"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Hapus */}
      <Modal isOpen={isDeleteOpen} onClose={closeDeleteModal} className="max-w-[400px] m-4">
        <div className="no-scrollbar relative overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">
            Konfirmasi Hapus
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Apakah Anda yakin ingin menghapus rumah{" "}
            <span className="font-medium">BLOK {rumahToDelete?.nama_blok} - {rumahToDelete?.nomor_rumah}</span>?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button size="sm" variant="outline" onClick={closeDeleteModal}>
              Batal
            </Button>
            <Button size="sm" variant="primary" className="bg-red-500 hover:bg-red-600" onClick={handleDelete}>
              Hapus
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
