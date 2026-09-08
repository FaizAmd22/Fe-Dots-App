/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, useToast } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API } from "../libs/axios";
import { addUser } from "../slices/authSlice";

// Google Identity Services disuntikkan lewat <script> di index.html, jadi
// tipenya tidak ikut dari npm. Cukup dideklarasikan seadanya di sini.
declare global {
  interface Window {
    google?: any;
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const GoogleLoginButton = ({
  onError,
  text = "signin_with",
}: {
  onError?: (message: string) => void;
  text?: "signin_with" | "signup_with" | "continue_with";
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [scriptFailed, setScriptFailed] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  // Dipakai di dalam callback Google yang tidak ikut siklus render React,
  // jadi disimpan di ref supaya selalu memakai versi terbaru.
  const handlers = useRef({ navigate, dispatch, toast, onError });
  handlers.current = { navigate, dispatch, toast, onError };

  useEffect(() => {
    if (!CLIENT_ID) return;

    const handleCredential = async (response: { credential: string }) => {
      const { navigate, dispatch, toast, onError } = handlers.current;

      try {
        const res = await API.post("/auth/google", { credential: response.credential });

        // Akun Google yang belum terdaftar diminta memilih username dulu.
        // Akunnya baru dibuat setelah langkah itu selesai.
        if (res.data.needsUsername) {
          navigate("/complete-profile", {
            state: { signupToken: res.data.signupToken, profile: res.data.profile },
          });
          return;
        }

        dispatch(addUser(res.data));
        sessionStorage.setItem("token", res.data.token);
        sessionStorage.setItem("id", res.data.user.id);

        toast({
          position: "top",
          title: "Login Success!",
          status: "success",
          duration: 1500,
          isClosable: true,
        });
        navigate("/");
      } catch (error: any) {
        onError?.(error.response?.data?.message || "Login with Google failed!");
      }
    };

    // Script-nya async, jadi tunggu sampai objek google tersedia.
    let attempts = 0;
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredential,
        });

        if (buttonRef.current) {
          // React StrictMode menjalankan effect dua kali saat development;
          // dikosongkan dulu supaya tombolnya tidak dobel.
          buttonRef.current.innerHTML = "";
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: 320,
            text,
          });
        }
      } else if (++attempts > 100) {
        clearInterval(timer);
        setScriptFailed(true);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [text]);

  if (!CLIENT_ID)
    return (
      <Text color="orange.300" fontSize="sm" textAlign="center">
        VITE_GOOGLE_CLIENT_ID belum diset, tombol Google tidak bisa ditampilkan.
      </Text>
    );

  if (scriptFailed)
    return (
      <Text color="orange.300" fontSize="sm" textAlign="center">
        Gagal memuat Google Sign-In. Periksa koneksi internet lalu muat ulang halaman.
      </Text>
    );

  return <div ref={buttonRef} style={{ display: "flex", justifyContent: "center" }} />;
};

export default GoogleLoginButton;
