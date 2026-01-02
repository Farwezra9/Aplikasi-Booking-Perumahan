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
import Label from "../../components/form/Label";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Alert from "../../components/ui/alert/Alert";

/* ===================== TYPE ===================== */
interface Users {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  status: "aktif" | "nonaktif";
}

interface AlertState {
  show: boolean;
  variant: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
}
/* ===================== COMPONENT ===================== */
export default function UsersPage() {
  const [users, setUsers] = useState<Users[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // Modal states
  const { isOpen, openModal, closeModal } = useModal();
  const [currentUsers, setCurrentUsers] = useState<Users | null>(null);
  const [formData, setFormData] = useState({
      name: "",
      email: "",
      role: "" as "" | Users["role"],
      status: "" as "" | Users["status"],
    });

  // Delete confirmation modal
    const {
      isOpen: isDeleteOpen,
      openModal: openDeleteModal,
      closeModal: closeDeleteModal,
    } = useModal();
    const [usersToDelete, setUsersToDelete] = useState<Users | null>(null);

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
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get<Users[]>("/users");
      setUsers(res.data);
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error(error.response || error);
      showAlert("error", "Gagal Load", error.response?.data?.message || "Gagal load data users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================= MODAL HANDLERS ================= */
  const handleOpenAdd = () => {
    setCurrentUsers(null);
    setFormData({
      name: "",
      email: "",
      role: "",
      status: "",
    });
    openModal();
  };

  const handleOpenEdit = (r: Users) => {
    setCurrentUsers(r);
    setFormData({
      name: r.name,
      email: r.email,
      role: r.role,
      status: r.status,
    });
    openModal();
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.email || !formData.role || !formData.status) {
        return showAlert("warning", "Peringatan", "Nama, email, role dan status harus diisi");
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      };

      if (currentUsers) {
        await API.put(`/users/${currentUsers.id}`,payload);
        showAlert("success", "Berhasil", "Data user berhasil diperbarui");
      } else {
        await API.post("/users",payload);
        showAlert("success", "Berhasil", "Data user berhasil ditambahkan");
      }

      closeModal();
      loadUsers();
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error(error.response || error);
      showAlert("error", "Gagal", error.response?.data?.message || "Gagal menyimpan data user");
    }
  };

  const handleOpenDelete = (r: Users) => {
    setUsersToDelete(r);
    openDeleteModal();
  };

  const handleDelete = async () => {
    if (!usersToDelete) return;
    try {
      await API.delete(`/users/${usersToDelete.id}`);
      closeDeleteModal();
      showAlert("success", "Berhasil", "Data user berhasil dihapus");
      loadUsers();
    } catch (err) {
      const error = err as AxiosError<any>;
      console.error(error.response || error);
      showAlert("error", "Gagal", error.response?.data?.message || "Gagal hapus user");
    }
  };

  return (
    <>
    <PageMeta title="Data Users | Dashboard" description="Manajemen Users" />
      <PageBreadcrumb pageTitle="Data Users" />

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
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Nama</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Email</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Role</TableCell>
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
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-6 text-theme-sm text-gray-500">Data tidak tersedia</TableCell>
                  </TableRow>
                ) : (
                  users.map((r, index) => (
                    <TableRow key={r.id}>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{index + 1}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.name}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.email}</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{r.role}</TableCell>
                      <TableCell className="px-5 py-4 text-center text-theme-sm text-gray-500 dark:text-gray-400">
                        <Badge size="md" color={
                          r.status === "aktif" ? "success"
                          : "error"}
                          > {r.status.toUpperCase()}
                          </Badge>
                      </TableCell>
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
            <h4 className="mb-6 text-lg font-medium text-gray-800 dark:text-white/90">{currentUsers ? "Edit User" : "Tambah User"}</h4>
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
                <Label>Nama</Label>
                <Input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}  placeholder="Masukan Nama"/>
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}  placeholder="Masukan Email"/>
              </div>

              <div>
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onChange={val => setFormData({ ...formData, role: val as Users["role"] })}
                  options={[
                    { value: "admin", label: "Admin" },
                    { value: "user", label: "User" },
                  ]}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={val => setFormData({ ...formData, status: val as Users["status"] })}
                  options={[
                    { value: "aktif", label: "aktif" },
                    { value: "nonaktif", label: "nonaktif" },
                  ]}
                />
              </div>

            </div>
          </div>

          <div className="flex gap-3 justify-end mt-4">
            <Button size="sm" variant="outline" onClick={closeModal}>Batal</Button>
            <Button
              size="sm"
              variant={currentUsers ? "success" : "primary"}
              onClick={handleSave}
            >
               {currentUsers ? "Update" : "Simpan"}
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
            Apakah Anda yakin ingin menghapus akun{" "}
            <span className="font-medium">{usersToDelete?.email}</span>?
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
