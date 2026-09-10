import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { API } from "../libs/axios";
import { addProfileThread } from "../slices/profileThreadSlice";

export const useProfileThreadHooks = () => {
    const token = sessionStorage.getItem("token");
    const dispatch = useDispatch();

    // Username diambil dari URL halaman profil — sumber yang paling bisa
    // dipercaya. Dulu dari sessionStorage/Redux, yang bisa masih berisi profil
    // yang terakhir dibuka sebelumnya.
    const { username } = useParams();

    // Dulu: mengunduh SELURUH feed (thread semua orang beserta like dan reply-nya)
    // lalu menyaring milik satu user di browser. Sekarang database yang menyaring
    // lewat ?username=, jadi yang terkirim hanya thread milik profil ini.
    //
    // Di luar halaman profil tidak ada username, dan hook ini berhenti sendiri.
    const fetchProfileThread = async () => {
        if (!username) return;

        try {
            const response = await API.get("/thread", { params: { username } });
            dispatch(addProfileThread(response.data.data));
        } catch (error) {
            console.error("Error fetching profile threads:", error);
        }
    };

    const fetchProfileThreadAuth = async () => {
        if (!username) return;

        try {
            const response = await API.get("/threads", {
                headers: { Authorization: `Bearer ${token}` },
                params: { username },
            });
            dispatch(addProfileThread(response.data.data));
        } catch (error) {
            console.error("Error fetching profile threads:", error);
        }
    };

    return {
        fetchProfileThread,
        fetchProfileThreadAuth,
    };
};
