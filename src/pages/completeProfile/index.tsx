/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Button, Input, Link, Stack, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { API } from "../../libs/axios";
import { addUser } from "../../slices/authSlice";
import BrandLogo from "../../component/BrandLogo";
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
    <Stack w="100vw" bg="app.bg" h="100vh">
      <Stack w={{ base: "90%", md: "40%" }} p="4" color="app.text" margin="auto">
        <BrandLogo h="56px" />

        <Text pb="1" fontSize="3xl" fontWeight="semibold">
          {t("auth.chooseUsername")}
        </Text>

        <Text pb="4" fontSize="sm" color="app.textMuted">
          {t("auth.chooseUsernameHint")}
        </Text>

        {profile && (
          <Stack direction="row" align="center" spacing="3" pb="2">
            <Avatar size="sm" src={profile.picture || undefined} name={profile.name} />
            <Stack spacing="0">
              <Text fontSize="sm">{profile.name}</Text>
              <Text fontSize="xs" color="app.textMuted">
                {profile.email}
              </Text>
            </Stack>
          </Stack>
        )}

        <Input
          type="text"
          value={username}
          placeholder={t("auth.username")}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />

        <Button
          mt="5"
          color="white"
          rounded="full"
          bg="green.500"
          textAlign="center"
          isLoading={isLoading}
          _hover={{ color: "green.500", bg: "app.inverse" }}
          onClick={handleSubmit}
        >
          {t("common.continue")}
        </Button>

        {error && <Text color="red.500">{error}</Text>}

        <Text py="2" fontSize="sm">
          {t("auth.changedMind")}
          <Link px="2" color="green.500" _hover={{ color: "app.text" }} onClick={() => navigate("/login")}>
            {t("auth.backToLogin")}
          </Link>
        </Text>
      </Stack>
    </Stack>
  );
};

export default CompleteProfile;
