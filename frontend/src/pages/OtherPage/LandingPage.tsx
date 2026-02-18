import { useEffect, useState } from "react";
import API from "../../api/api";
import { Link, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import UserDropdown from "../../components/header/UserDropdown";
import DatePicker from "../../components/form/date-picker";
import TextArea from "../../components/form/input/TextArea";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import Alert from "../../components/ui/alert/Alert";

interface Rumah {
  id: number;
  nomor_rumah: string;
  nama_blok: string;
  luas_tanah: string;
  luas_bangunan: string;
  status: "tersedia" | "dipesan" | "terjual";
  deskripsi?: string;
  gambar?: string;
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

export default function LandingPage() {
  const [rumahList, setRumahList] = useState<Rumah[]>([]);
  const [booking, setBooking] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [currentBlokIndex, setCurrentBlokIndex] = useState(0);

  // ===== LOGIN STATE =====
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // ===== BOOKING STATE =====
  const [selectedRumah, setSelectedRumah] = useState<Rumah | null>(null);
  const [tanggal, setTanggal] = useState("");
  const [kontak, setKontak] = useState("");
  const [catatan, setCatatan] = useState("");
  const navigate = useNavigate();


  const { isOpen: isBookingOpen, openModal: openBookingModal, closeModal: closeBookingModal } = useModal();

  // ===== ALERT STATE =====
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

  useEffect(() => {
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    const role = localStorage.getItem("role"); // ambil role user
    setIsLoggedIn(!!name && !!email);
    setUserRole(role);
  }, []);

  // Load rumah
  useEffect(() => {
    loadRumah();
  }, []);

  const loadRumah = async () => {
    try {
      setLoading(true);
      const res = await API.get<Rumah[]>("/rumah/available");
      setRumahList(res.data);
    } catch (err) {
      console.error(err);
      showAlert("error", "Gagal", "Gagal load rumah tersedia");
    } finally {
      setLoading(false);
    }
  };

  // Load booking user jika role user
  useEffect(() => {
    if (userRole === "user") {
      loadUserBookings();
    }
  }, [userRole]);

  const loadUserBookings = async () => {
    try {
      const res = await API.get<Booking[]>("/booking/user");
      setBooking(res.data);
    } catch (err) {
      console.error(err);
      showAlert("error", "Gagal", "Gagal load booking Anda");
    }
  };

  const handleOpenBookingModal = (rumahItem: Rumah) => {
    if (!isLoggedIn || userRole !== "user") {
      navigate("/signin");
      return;
    }

    // cek booking
    const alreadyBooked = booking.find(
      (b) =>
        b.nomor_rumah === rumahItem.nomor_rumah &&
        (b.status === "menunggu" || b.status === "dikonfirmasi")
    );

    if (alreadyBooked) {
      // redirect ke dashboard user tab booking
      navigate("/dashboarduser", { state: { tab: "booking", rumahId: rumahItem.id } });
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
      navigate("/dashboarduser", { state: { tab: "booking", rumahId: selectedRumah?.id } });
    } catch (err: any) {
      console.error(err.response || err);
      showAlert("error", "Gagal", err.response?.data?.message || "Terjadi kesalahan saat booking");
    }
  };

  // Hero slideshow
  useEffect(() => {
    if (rumahList.length === 0) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % rumahList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [rumahList]);

  // Kelompokkan per blok
  const blokRumah = Object.entries(
    rumahList.reduce<Record<string, Rumah[]>>((acc, rumah) => {
      if (!acc[rumah.nama_blok]) acc[rumah.nama_blok] = [];
      acc[rumah.nama_blok].push(rumah);
      return acc;
    }, {})
  );

  const totalBlok = blokRumah.length;
  const prevBlok = () => setCurrentBlokIndex((prev) => (prev - 1 + totalBlok) % totalBlok);
  const nextBlok = () => setCurrentBlokIndex((prev) => (prev + 1) % totalBlok);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <>
    <PageMeta
        title="PerumKu"
        description="Booking Perumahan Murah"
      />
      <div className="bg-gray-100 min-h-screen flex flex-col">
        {/* NAVBAR */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <img
              src="./images/logo/logo-icon.png"
              alt="Logo"
              width={60}
          height={40}
            />
              <div className="hidden md:flex space-x-6 items-center">
                <button onClick={() => scrollTo("wellcome")} className="nav-btn">Home</button>
                <button onClick={() => scrollTo("daftar-rumah")} className="nav-btn">Rumah</button>
                <button onClick={() => scrollTo("footer")} className="nav-btn">Kontak</button>
                {isLoggedIn ? <UserDropdown /> : (
                  <>
                    <Link
                      to="/signin"
                      className="px-4 py-1 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-600 hover:text-white transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
              <div className="md:hidden">
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mobileMenuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden bg-white px-4 py-3 border-t">
              <div className="flex flex-wrap gap-4 items-center">
                <button onClick={() => scrollTo("wellcome")} className="nav-btn">Home</button>
                <button onClick={() => scrollTo("daftar-rumah")} className="nav-btn">Rumah</button>
                <button onClick={() => scrollTo("footer")} className="nav-btn">Kontak</button>
                {isLoggedIn ? <UserDropdown /> : (
                  <>
                    <Link
                      to="/signin"
                      className="px-3 py-1 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-600 hover:text-white transition"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <div id="wellcome"
          className="relative text-white min-h-[80vh] py-32 sm:py-40 px-6 sm:px-20 bg-cover bg-center transition-all duration-1000 flex items-center"
          style={{
            backgroundImage: rumahList[currentImage]?.gambar
              ? `url(${import.meta.env.VITE_API_URL}/uploads/rumah/${rumahList[currentImage].gambar})`
              : 'url("/default-home.jpg")',
          }}
        >
          <div className="bg-black bg-opacity-40 p-8 sm:p-12 rounded-xl max-w-2xl">
            <h1 className="text-5xl font-bold mb-6 sm:text-6xl animate-fade-in">Selamat Datang di Perumahan Kami</h1>
            <p className="text-xl sm:text-2xl animate-fade-in delay-100">Temukan rumah impian Anda dengan lokasi strategis dan fasilitas lengkap.</p>
            <button
              onClick={() => scrollTo("daftar-rumah")}
              className="mt-6 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Lihat Rumah
            </button>
          </div>
        </div>

        {/* Rumah Grid */}
        <div id="daftar-rumah" className="w-full min-h-[80vh] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">Rumah Tersedia</h2>
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
          {loading ? (
            <p className="text-gray-500 text-center">Loading...</p>
          ) : blokRumah.length === 0 ? (
            <p className="text-gray-500 text-center">Belum ada rumah tersedia saat ini.</p>
          ) : (
            <div className="max-w-[1200px] mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">
                {blokRumah[currentBlokIndex][1].map((rumah) => (
                  <div key={rumah.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-2 overflow-hidden">
                    <div className="h-64 w-full overflow-hidden rounded-t-2xl">
                      {rumah.gambar ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/uploads/rumah/${rumah.gambar}`}
                          alt={`Rumah ${rumah.nomor_rumah}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">Tidak ada gambar</div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-800">Nomor {rumah.nomor_rumah}</h3>
                      <p className="text-gray-500 mt-2">Luas Tanah: {rumah.luas_tanah} m² | Luas Bangunan: {rumah.luas_bangunan} m²</p>
                      {rumah.deskripsi && <p className="mt-3 text-gray-600 text-sm line-clamp-3">{rumah.deskripsi}</p>}
                      <div className="mt-4 flex justify-between items-center">
                        <Badge size="sm" color="success">{rumah.status.toUpperCase()}</Badge>
                        <Button size="sm" variant="primary" onClick={() => handleOpenBookingModal(rumah)}>
  Booking
</Button>

                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigasi Blok */}
              <div className="flex justify-center items-center gap-6 mt-4">
                <button
                  onClick={prevBlok}
                  className="bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow-md p-3 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="font-semibold text-gray-700 text-lg">Blok {blokRumah[currentBlokIndex][0]}</span>
                <button
                  onClick={nextBlok}
                  className="bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow-md p-3 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Kenapa Memilih Section */}
      <div className="w-full min-h-[70vh] py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-xl overflow-hidden shadow-lg">
            {rumahList.length > 0 && rumahList[0].gambar ? (
              <img src={`${import.meta.env.VITE_API_URL}/uploads/rumah/${rumahList[0].gambar}`} alt="Rumah Pilihan" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">Tidak ada gambar</div>
            )}
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-800">Kenapa Memilih Rumah di Sini?</h2>
            <p className="text-gray-600 text-lg">Perumahan kami menawarkan lokasi strategis dekat pusat kota, akses mudah ke transportasi umum, lingkungan aman, dan fasilitas lengkap untuk keluarga Anda.</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600 text-lg">
              <li>Lokasi strategis dan mudah dijangkau</li>
              <li>Lingkungan nyaman dan aman</li>
              <li>Fasilitas lengkap: sekolah, pusat perbelanjaan, taman</li>
              <li>Cicilan fleksibel dan harga bersaing</li>
            </ul>
            <button
              onClick={() => scrollTo("daftar-rumah")}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Lihat Rumah
            </button>
          </div>
        </div>
      </div>

      {/* Booking Plan Section */}
      <div className="w-full min-h-[70vh] py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <h2 className="text-4xl font-bold mb-12 text-center text-gray-800">Pilih Plan Anda</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 max-w-[1200px] mx-auto">
          {[
            { title: "Cicilan Ringan", price: "Rp 3.000.000 / bulan", dp: "DP 10%", bedroom: "2 Kamar Tidur", bathroom: "1 Kamar Mandi" },
            { title: "Cicilan Medium", price: "Rp 5.000.000 / bulan", dp: "DP 15%", bedroom: "3 Kamar Tidur", bathroom: "2 Kamar Mandi" },
            { title: "Cicilan Premium", price: "Rp 7.000.000 / bulan", dp: "DP 20%", bedroom: "4 Kamar Tidur", bathroom: "2 Kamar Mandi + Taman" }
          ].map((plan, i) => (
            <div key={i} className="bg-white p-10 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2">
              <h3 className="text-2xl font-bold mb-6">{plan.title}</h3>
              <p className="text-xl text-gray-700 mb-6">{plan.price}</p>
              <ul className="text-gray-500 mb-6 space-y-3 text-lg">
                <li>{plan.dp}</li>
                <li>{plan.bedroom}</li>
                <li>{plan.bathroom}</li>
              </ul>
              <button className="w-full bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 transition text-lg">Booking Sekarang</button>
            </div>
          ))}
        </div>
      </div>

      <footer id="footer" className="bg-gray-800 text-white py-12 mt-auto">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
    {/* Logo & copyright */}
    <div className="flex flex-col items-center md:items-start text-center md:text-left">
      <div className="text-2xl font-bold text-indigo-400 mb-2">PerumKu</div>
      <p className="text-gray-400">&copy; {new Date().getFullYear()} PerumKu. All rights reserved.</p>
    </div>

    {/* Kontak 2 kolom */}
    <div>
      <h3 className="text-lg font-semibold text-white mb-4 text-center md:text-left">Kontak Kami</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
        {/* Kolom 1 */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span>Instagram :</span>
            <a href="https://instagram.com/perumku" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">
              @perumku
            </a>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span>Facebook :</span>
            <a href="https://facebook.com/perumku" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">
              PerumKu
            </a>
          </div>
        </div>

        {/* Kolom 2 */}
        <div className="space-y-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span>Whatsapp :</span>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400">
              +62 812-3456-7890
            </a>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span>No Handphone :</span>
            <a href="tel:+6281234567890" className="hover:text-indigo-400">
              +62 812-3456-7890
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>


        {/* Modal Booking */}
<Modal isOpen={isBookingOpen} onClose={handleCloseBookingModal} className="max-w-[400px] m-4">
  {/* Cukup tambahkan text-black dark:text-white di sini */}
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
      <Input type="text" value={kontak} onChange={(e) => setKontak(e.target.value)} className="border p-2 rounded" placeholder="Isi informasi kontak anda"/>

      <Label>Catatan</Label>
      <TextArea value={catatan} onChange={(value: string) => setCatatan(value)} className="border p-2 rounded" placeholder="Tuliskan catatan jika ada"/>
      <div className="flex justify-end gap-2 mt-4">
        <Button size="sm" variant="primary" onClick={handleBookingSubmit}>Kirim Booking</Button>
        <Button size="sm" variant="outline" onClick={handleCloseBookingModal}>Batal</Button>
      </div>
    </div>
  </div>
</Modal>
      </div>
    </>
  );
}
