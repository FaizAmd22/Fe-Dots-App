import { API } from "../libs/axios";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { setProfile } from "../slices/profileSlice";

export const useProfileHooks = () => {
    // URL adalah sumber utama. Dulu username HANYA dibaca dari
    // sessionStorage "profile", yang diisi saat avatar di kartu thread diklik.
    // Akibatnya membuka link profil langsung, me-refresh halaman, atau datang
    // dari notifikasi/menu avatar menampilkan profil kosong atau profil orang
    // yang terakhir dilihat.
    const { username: routeUsername } = useParams();

    const sessionProfile = sessionStorage.getItem("profile")
    // JSON.parse(null) menghasilkan null, bukan galat — galatnya baru muncul
    // saat profile.username dibaca. Hook ini dipanggil dari banyak tempat yang
    // belum tentu pernah menyimpan "profile", jadi nilainya dijaga di sini.
    let profile: { username?: string } | null = null
    try {
        profile = sessionProfile ? JSON.parse(sessionProfile) : null
    } catch (error) {
        profile = null
    }
    const token = sessionStorage.getItem("token")

    const dispatch = useDispatch();

    // Username bisa dikirim eksplisit (halaman profil); pemanggil lain yang
    // hanya ingin menyegarkan profil yang sedang dibuka cukup memanggil tanpa
    // argumen.
    const fetchProfile = async (username?: string) => {
        const target = username || routeUsername || profile?.username

        // Tanpa username tidak ada yang bisa diambil; memaksakannya hanya
        // menghasilkan request ke "/users/undefined" yang berakhir 404.
        if (!target) return

        try {
            if (token) {
                const response = await API.get(`/users/${target}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                dispatch(setProfile(response.data.data));
            } else {
                const response = await API.get(`/user/${target}`);
                dispatch(setProfile(response.data.data));
            }
        } catch (error) {
            console.error("Error fetching profile:", error)
        }
    };

    return {
        fetchProfile,
    }
}
