import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/api";

import {ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

export default function SignInForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ===================== LOGIN ===================== */
  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
        keepLoggedIn: isChecked,
      });
    const prevEmail = localStorage.getItem("email");

    // Hapus data lama jika berbeda akun
    if (prevEmail && prevEmail !== res.data.email) {
      localStorage.clear();
    }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", res.data.email);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "admin") {
        navigate("/dashboardadmin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Kembali
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5">
            <h1 className="mb-2 font-semibold text-gray-800 dark:text-white/90">Sign In</h1>
            <p className="text-sm text-gray-500 dark:text-white/90">
              Enter your email and password to sign in!
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 text-red-700 p-2 rounded text-sm">
              {error}
            </div>
          )}

          <form>
            <div className="space-y-6">
              <div>
                <Label className="dark:text-white/90">Email *</Label>
                <Input
                  placeholder="info@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label className="dark:text-white/90">Password *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox checked={isChecked} onChange={setIsChecked} />
                  <span className="text-sm dark:text-white/90">Keep me logged in</span>
                </div>

                <Link to="/reset-password" className="text-sm text-brand-500">
                  Forgot password?
                </Link>
              </div>

              <Button
                onClick={handleLogin}
                size="sm"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Loading..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm dark:text-white/90">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-brand-500">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}