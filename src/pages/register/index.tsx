/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, Stack, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { LuAtSign, LuUser } from "react-icons/lu";
import { API } from "../../libs/axios";
import GoogleLoginButton from "../../features/GoogleLoginButton";
import AuthLayout, { AuthDivider, AuthError, AuthSubmitButton } from "../../component/auth/AuthLayout";
import { AuthField, PasswordField } from "../../component/auth/AuthField";
import { useTranslation } from "../../i18n/useTranslation";

const Register = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      setError("");
      const response = await API.post("/register", formData);
      const token = response.data.token;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("id", response.data.user.id);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast({
        position: "top",
        title: t("auth.registerSuccess"),
        status: "success",
        duration: 1500,
        isClosable: true,
      });
      navigate("/");
    } catch (error: any) {
      setError(error.response?.data?.message || t("auth.registerFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title={t("auth.registerTitle")} subtitle={t("auth.registerSubtitle")}>
      <Stack
        as="form"
        spacing="4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <AuthField
          label={t("auth.fullname")}
          icon={<LuUser />}
          name="fullname"
          autoComplete="name"
          autoFocus
          value={formData.fullname}
          onChange={handleChange}
        />

        <AuthField
          label={t("auth.username")}
          icon={<LuAtSign />}
          name="username"
          autoComplete="username"
          value={formData.username}
          onChange={handleChange}
        />

        {/* Dulu bertipe teks biasa, jadi kata sandi terlihat saat diketik. */}
        <PasswordField
          label={t("auth.password")}
          name="password"
          autoComplete="new-password"
          value={formData.password}
          onChange={handleChange}
        />

        {error && <AuthError message={error} />}

        <AuthSubmitButton isLoading={isSubmitting}>{t("auth.create")}</AuthSubmitButton>
      </Stack>

      <AuthDivider label={t("common.or")} />

      <GoogleLoginButton text="signup_with" onError={setError} />

      <Text mt="8" textAlign="center" fontSize="sm" color="app.textMuted">
        {t("auth.haveAccount")}{" "}
        <Link as={RouterLink} to="/login" color="green.500" fontWeight="semibold">
          {t("auth.login")}
        </Link>
      </Text>
    </AuthLayout>
  );
};

export default Register;
