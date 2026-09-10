import { API } from "../libs/axios";
import { useDispatch } from "react-redux";
import { setProfile } from "../slices/profileSlice";

export const useProfileHooks = () => {
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
    // console.log("profile di profile hooks :", profile.username);
    
    // console.log("username :", username);
    
    const dispatch = useDispatch();
    
    const fetchProfile = async () => {
        // Tanpa username tidak ada yang bisa diambil; memaksakannya hanya
        // menghasilkan request ke "/users/undefined" yang berakhir 404.
        if (!profile?.username) return

        try {
        if (token) {
            const response = await API.get(`/users/${profile.username}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            dispatch(setProfile(response.data.data));
        } else {
            const response = await API.get(`/user/${profile.username}`);
            dispatch(setProfile(response.data.data));
        }
        } catch (error) {
            console.error("Error fetching profile:", error)
        }
        // console.log("userID :", response.data.data.id);
        
        // console.log("fetchProfile :", response.data.data);
    };

    // const fetchLikeProfile

    return {
        fetchProfile,
    }
}
