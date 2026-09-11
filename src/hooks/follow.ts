import { useDispatch } from "react-redux";
import { API } from "../libs/axios";
import { setFollower, setFollowing } from "../slices/followSlice";

export const useFollowHooks = () => {
    const userId = sessionStorage.getItem("id");
    const token = sessionStorage.getItem("token");
    const dispatch = useDispatch()
//   const [following, setFollowing] = useState<any>([]);
//   const [follower, setFollower] = useState<any>([]);
    
    const fetchFollow = async () => {
        const response = await API.get(`/follow/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("response following :", response.data.following);
        console.log("response follower :", response.data.follower);
  
        // setFollower(response.data.follower);
        // setFollowing(response.data.following);
        dispatch(setFollower(response.data.follower))
        dispatch(setFollowing(response.data.following))
      };
    const fetchFollower = async () => {
      const response = await API.get(`/follow/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response following :", response.data.following);
      console.log("response follower :", response.data.follower);

      // setFollower(response.data.follower);
      // setFollowing(response.data.following);
      dispatch(setFollower(response.data.follower))
    };
    const fetchFollowing = async () => {
      const response = await API.get(`/follow/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response following :", response.data.following);
      console.log("response follower :", response.data.follower);

      // setFollower(response.data.follower);
      // setFollowing(response.data.following);
      dispatch(setFollowing(response.data.following))
    };

    // Daftar milik user mana pun, untuk halaman /profile/:username/followers.
    // Tidak disimpan di Redux: slice follow khusus daftar milik sendiri.
    // Versi login dipakai kalau ada token, supaya isFollow dihitung dari
    // sudut pandang user yang melihat.
    const fetchUserFollows = async (username: string) => {
      const response = token
        ? await API.get(`/users/${username}/follows`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await API.get(`/user/${username}/follows`);

      return {
        user: response.data.user,
        follower: response.data.follower,
        following: response.data.following,
      };
    };

    return {
      fetchFollow,
      fetchFollower,
      fetchFollowing,
      fetchUserFollows,
    }
}
