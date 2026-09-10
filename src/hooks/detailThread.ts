import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { API } from "../libs/axios";
import { addDetailThread } from "../slices/detailThreadSlice";

export const useDetailThreadHooks = () => {
    const { id } = useParams();
    const token = sessionStorage.getItem("token");
    const dispatch = useDispatch();

    // Hook ini mengambil id dari URL, tapi dipanggil juga dari tempat yang sama
    // sekali bukan halaman detail — Create Post, Alert Delete, Edit Profile, dan
    // navbar. Di sana id-nya undefined, sehingga tanpa penjaga ini request-nya
    // menjadi "/threads/undefined" dan berakhir 404.
    const fetchDetail = async () => {
        if (!id) return;

        try {
            const response = await API.get(`/thread/${id}`);
            dispatch(addDetailThread(response.data.data));
        } catch (error) {
            console.error("Error fetching detail thread:", error);
        }
    };

    const fetchDetailAuth = async () => {
        if (!id) return;

        try {
            const response = await API.get(`/threads/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            dispatch(addDetailThread(response.data.data));
        } catch (error) {
            // Thread yang baru saja dihapus juga masuk ke sini; tidak perlu
            // dianggap kegagalan yang mengganggu tampilan.
            console.error("Error fetching detail thread:", error);
        }
    };

    return {
        fetchDetail,
        fetchDetailAuth,
    };
};
