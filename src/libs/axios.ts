import axios from "axios";

export const API = axios.create({
    baseURL: "https://be-dots-app-server.up.railway.app/api/v1"
})