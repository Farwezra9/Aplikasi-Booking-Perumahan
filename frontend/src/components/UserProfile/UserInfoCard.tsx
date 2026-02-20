"use client";

import { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import API from "../../api/api";
import { UserType } from "../../pages/Dashboard/UserProfiles";

type Props = {
  user: UserType;
  setUser: any;
};

export default function UserInfoCard({ user, setUser }: Props) {
  const { isOpen, openModal, closeModal } = useModal();
  const [form, setForm] = useState(user);

  useEffect(() => {
    setForm(user);
  }, [user]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await API.put("/profile", {
        name: form.name,
        alamat: form.alamat,
        notelp: form.notelp,
      });

      setUser(res.data.user || res.data);
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.email}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.notelp || "-"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Alamat
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user.alamat || "-"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[400px] m-4">
  <div className="bg-white p-4 rounded-lg dark:bg-gray-900 text-black dark:text-white">
    <h4 className="text-lg font-medium mb-4">
      Edit Personal Information
    </h4>

    <div className="flex flex-col gap-3">
      <div>
        <Label>Name</Label>
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Masukkan nama"
        />
      </div>

      <div>
        <Label>Phone</Label>
        <Input
          name="notelp"
          value={form.notelp || ""}
          onChange={handleChange}
          placeholder="Masukkan nomor telepon"
        />
      </div>

      <div>
        <Label>Alamat</Label>
        <Input
          name="alamat"
          value={form.alamat || ""}
          onChange={handleChange}
          placeholder="Masukkan alamat"
        />
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button size="sm" onClick={handleSave}>
          Save Changes
        </Button>
        <Button size="sm" variant="outline" onClick={closeModal}>
          Batal
        </Button>
      </div>
    </div>
  </div>
</Modal>
    </div>
  );
}