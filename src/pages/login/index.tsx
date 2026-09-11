/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Text,
  Stack,
  Input,
  InputGroup,
  Button,
  InputRightElement,
  Link,
  useToast
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../libs/axios";
import { useDispatch } from "react-redux";
 
import { addUser } from "../../slices/authSlice";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";
import GoogleLoginButton from "../../features/GoogleLoginButton";
import BrandLogo from "../../component/BrandLogo";

const Login = () => {
  const [show, setShow] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useToast()

  const dispatch = useDispatch();

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;

    const requestingData = {
      username,
      password,
    };

    setIsLoggingIn(true);
    try {
      setError("");
      const response = await API.post("/login", requestingData);
      console.log("response: ", response);
      dispatch(addUser(response.data));

      const token = response.data.token;
      const userId = response.data.user.id;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("id", userId);

      // axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast({
        position: 'top',
        title: 'Login Success!',
        status: 'success',
        duration: 1500,
        isClosable: true,
      })
      // window.location.assign("/");
      navigate("/")

      // console.log("error : ", response.data);
    } catch (error: any) {
      console.log("error : ", error.response);
      // ?. wajib: galat jaringan tidak punya response, dan tanpa ini
      // halaman login ikut melempar error.
      setError(error.response?.data?.message || "Gagal login, coba lagi!");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <Stack w="100vw" bg="app.bg" h={"100vh"}>
      <Stack
        w={{ base: "90%", md: "40%" }}
        p="4"
        pb="0"
        color="app.text"
        margin="auto"
      >
        <Link href="/" w="fit-content" _hover={{ textDecoration: "none" }}>
          <BrandLogo h="56px" />
        </Link>

        <Text
          pb="4"
          fontSize="3xl"
          fontWeight="semibold"
          display={{ base: "none", md: "block" }}
        >
          Login to Dots.
        </Text>

        <Stack spacing={3}>
          <Input
            type="text"
            placeholder="Username or Email"
            onChange={(e) => setUsername(e.target.value)}
          />

          <InputGroup size="md">
            <Input
              pr="4.5rem"
              placeholder="Password"
              type={show ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
            />

            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                bg="none"
                size="sm"
                color="green.500"
                onClick={() => setShow(!show)}
              >
                {show ? <BiSolidShow /> : <BiSolidHide />}
              </Button>
            </InputRightElement>
          </InputGroup>
        </Stack>

        <Button
          mt="7"
          color="white"
          rounded="full"
          bg="green.500"
          textAlign="center"
          _hover={{ color: "green.500", bg: "app.inverse" }}
          isLoading={isLoggingIn}
          onClick={handleLogin}
        >
          Submit
        </Button>

        {error && <Text color="red.500">{error}</Text>}

        <Text py="2" textAlign="center" color="app.textMuted" fontSize="sm">
          or
        </Text>

        <GoogleLoginButton onError={setError} />

        <Text py="2">
          Don't have an account yet?
          <Link
            px="2"
            color="green.500"
            _hover={{ color: "app.text" }}
            onClick={() => navigate("/register")}
          >
            Create account
          </Link>
        </Text>

        <Link
          mt="5"
          py="2"
          bg="red.500"
          // Eksplisit putih: tanpa ini teksnya mewarisi warna teks tema dan
          // menjadi gelap di atas merah saat mode terang.
          color="white"
          rounded="full"
          textAlign="center"
          fontWeight="semibold"
          _hover={{ color: "red.500", bg: "app.inverse", textDecoration: "none" }}
          onClick={() => navigate("/")}
        >
          <Text>Back To Home</Text>
        </Link>
      </Stack>
    </Stack>
  );
};

export default Login;
