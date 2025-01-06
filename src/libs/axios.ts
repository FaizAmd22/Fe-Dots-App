import axios from "axios";

export const API = axios.create({
    baseURL: "https://be-dots-app.onrender.com/api/v1"
})