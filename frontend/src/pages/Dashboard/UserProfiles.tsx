"use client";

import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UserMetaCard from "../../components/UserProfile/UserMetaCard";
import UserInfoCard from "../../components/UserProfile/UserInfoCard";
import PageMeta from "../../components/common/PageMeta";
import API from "../../api/api";

export type UserType = {
  id: number;
  name: string;
  email: string;
  alamat?: string;
  notelp?: string;
};

export default function UserProfiles() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/profile");
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  if (!user) return null;

  return (
    <>
      <PageMeta
        title="Dashboard"
        description="Profile Page"
      />
      <PageBreadcrumb pageTitle="Profile" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3>

        <div className="space-y-6">
          <UserMetaCard user={user} />
          <UserInfoCard user={user} setUser={setUser} />
        </div>
      </div>
    </>
  );
}