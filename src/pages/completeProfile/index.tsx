/* eslint-disable @typescript-eslint/no-explicit-any */
import { Avatar, Button, Input, Link, Stack, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { API } from "../../libs/axios";
import { addUser } from "../../slices/authSlice";

// Langkah kedua login Google: akun belum dibuat sampai user memilih username.
// signupToken dibawa lewat router state dari GoogleLoginButton.
const CompleteProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

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
        title: "Account created!",
        status: "success",
        duration: 1500,
        isClosable: true,
      });
      navigate("/");
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack w="100vw" bg="#1D1D1D" h="100vh">
      <Stack w={{ base: "90%", md: "40%" }} p="4" color="white" margin="auto">
        <Text fontSize="5xl" fontWeight="semibold" color="green.500">
          Dots.
        </Text>

        <Text pb="1" fontSize="3xl" fontWeight="semibold">
          Choose your username
        </Text>

        <Text pb="4" fontSize="sm" color="gray.400">
          Satu langkah lagi. Username ini yang akan tampil di profil dan link kamu.
        </Text>

        {profile && (
          <Stack direction="row" align="center" spacing="3" pb="2">
            <Avatar size="sm" src={profile.picture || undefined} name={profile.name} />
            <Stack spacing="0">
              <Text fontSize="sm">{profile.name}</Text>
              <Text fontSize="xs" color="gray.400">
                {profile.email}
              </Text>
            </Stack>
          </Stack>
        )}

        <Input
          type="text"
          value={username}
          placeholder="Username"
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
          _hover={{ color: "green.500", bg: "white" }}
          onClick={handleSubmit}
        >
          Continue
        </Button>

        {error && <Text color="red.500">{error}</Text>}

        <Text py="2" fontSize="sm">
          Berubah pikiran?
          <Link px="2" color="green.500" _hover={{ color: "white" }} onClick={() => navigate("/login")}>
            Kembali ke login
          </Link>
        </Text>
      </Stack>
    </Stack>
  );
};

export default CompleteProfile;
