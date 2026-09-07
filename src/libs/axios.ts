import axios from "axios";

export const API = axios.create({
    baseURL: "https://be-dots-app.onrender.com/api/v1"
    // baseURL: "http://localhost:5000/api/v1"
})