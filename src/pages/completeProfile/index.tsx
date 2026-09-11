/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Box, Flex, Link, Stack, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link as RouterLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import { LuAtSign } from "react-icons/lu";
import { API } from "../../libs/axios";
import { addUser } from "../../slices/authSlice";
import AuthLayout, { AuthError, AuthSubmitButton } from "../../component/auth/AuthLayout";
import { AuthField } from "../../component/auth/AuthField";
import { useTranslation } from "../../i18n/useTranslation";

// Langkah kedua login Google: akun belum dibuat sampai user memilih username.
// signupToken dibawa lewat router state dari GoogleLoginButton.
const CompleteProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { t } = useTranslation();

  const signupToken = location.state?.signupToken as string | undefined;
  const profile = location.state?.profile as
    | { name: string; email: string; picture: string | null }
    | undefined;

  const [username, setUsername] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Halaman ini tidak berarti apa-apa tanpa signupToken, misalnya kalau
  // dibuka langsung lewat URL atau setelah halaman di-refresh.
  if (!signupToken) return <Navigate to="/login" replace />;

  const handleSubmit = async () => {
    if (isLoading) return;

    try {
      setError("");
      setIsLoading(true);

      const response = await API.post("/auth/google/register", { signupToken, username });

      dispatch(addUser(response.data));
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("id", response.data.user.id);

      toast({
        position: "top",
        title: t("auth.accountCreated"),
        status: "success",
        duration: 1500,
        isClosable: true,
      });
      navigate("/");
    } catch (error: any) {
      setError(error.response?.data?.message || t("auth.somethingWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title={t("auth.chooseUsername")} subtitle={t("auth.chooseUsernameHint")}>
      {profile && (
        <Flex
          alignItems="center"
          gap="3"
          p="3"
          mb="6"
          rounded="xl"
          border="1px"
          borderColor="app.border"
        >
          <Avatar size="sm" src={profile.picture || undefined} name={profile.name} />
          <Box minW="0">
            <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
              {profile.name}
            </Text>
            <Text fontSize="xs" color="app.textMuted" noOfLines={1}>
              {profile.email}
            </Text>
          </Box>
        </Flex>
      )}

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
          label={t("auth.username")}
          icon={<LuAtSign />}
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />

        {error && <AuthError message={error} />}

        <AuthSubmitButton isLoading={isLoading}>{t("common.continue")}</AuthSubmitButton>
      </Stack>

      <Text mt="8" textAlign="center" fontSize="sm" color="app.textMuted">
        {t("auth.changedMind")}{" "}
        <Link as={RouterLink} to="/login" color="green.500" fontWeight="semibold">
          {t("auth.backToLogin")}
        </Link>
      </Text>
    </AuthLayout>
  );
};

export default CompleteProfile;
