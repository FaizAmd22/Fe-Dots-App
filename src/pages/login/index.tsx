/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, Stack, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LuUser } from "react-icons/lu";
import { API } from "../../libs/axios";
import { addUser } from "../../slices/authSlice";
import GoogleLoginButton from "../../features/GoogleLoginButton";
import AuthLayout, { AuthDivider, AuthError, AuthSubmitButton } from "../../component/auth/AuthLayout";
import { AuthField, PasswordField } from "../../component/auth/AuthField";
import { useTranslation } from "../../i18n/useTranslation";

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { t } = useTranslation();

  const handleLogin = async () => {
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    try {
      setError("");
      const response = await API.post("/login", { username, password });
      dispatch(addUser(response.data));

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("id", response.data.user.id);

      toast({
        position: "top",
        title: t("auth.loginSuccess"),
        status: "success",
        duration: 1500,
        isClosable: true,
      });
      navigate("/");
    } catch (error: any) {
      // ?. wajib: galat jaringan tidak punya response, dan tanpa ini
      // halaman login ikut melempar error.
      setError(error.response?.data?.message || t("auth.loginFailed"));
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AuthLayout title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")}>
      {/* Form sungguhan supaya Enter langsung mengirim; dulu harus klik tombol. */}
      <Stack
        as="form"
        spacing="4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handleLogin();
        }}
      >
        <AuthField
          label={t("auth.usernameOrEmail")}
          icon={<LuUser />}
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        <PasswordField
          label={t("auth.password")}
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <AuthError message={error} />}

        <AuthSubmitButton isLoading={isLoggingIn}>{t("auth.submit")}</AuthSubmitButton>
      </Stack>

      <AuthDivider label={t("common.or")} />

      <GoogleLoginButton onError={setError} />

      <Text mt="8" textAlign="center" fontSize="sm" color="app.textMuted">
        {t("auth.noAccount")}{" "}
        <Link as={RouterLink} to="/register" color="green.500" fontWeight="semibold">
          {t("auth.createAccount")}
        </Link>
      </Text>
    </AuthLayout>
  );
};

export default Login;
