/* eslint-disable @typescript-eslint/no-explicit-any */
import { Text, Stack, Input, Button, Link, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { API } from "../../libs/axios";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "../../features/GoogleLoginButton";
import BrandLogo from "../../component/BrandLogo";
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // console.log("data change :", formData);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      setError("");
      const response = await API.post("/register", formData);
      const token = response.data.token;
      const userId = response.data.user.id;

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("id", userId);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast({
        position: "top",
        title: t("auth.registerSuccess"),
        status: "success",
        duration: 1500,
        isClosable: true,
      });
      // window.location.assign("/");
      navigate("/");

      // console.log('response :', response.data)
    } catch (error: any) {
      // if (!formData.username && !formData.password && !formData.fullname) {
      //   setError("Data can't be empty!");
      // } else if (!formData.password) {
      //   setError("Password can't be empty");
      // } else if (!formData.username) {
      //   setError("Username can't be empty!");
      // } else if (!formData.fullname) {
      //   setError("Fullname can't be empty!");
      // }

      setError(error.response?.data?.message || t("auth.registerFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack w="100vw" h="100vh" bg="app.bg">
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
          {t("auth.registerTitle")}
        </Text>

        <Stack spacing={3}>
          <Input
            type="text"
            name="fullname"
            placeholder={t("auth.fullname")}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="username"
            placeholder={t("auth.username")}
            onChange={handleChange}
          />
          <Input
            type="text"
            name="password"
            placeholder={t("auth.password")}
            onChange={handleChange}
          />
        </Stack>

        <Button
          mt="7"
          color="white"
          rounded="full"
          bg="green.500"
          textAlign="center"
          _hover={{ color: "green.500", bg: "app.inverse" }}
          isLoading={isSubmitting}
          onClick={handleSubmit}
        >
          {t("auth.create")}
        </Button>

        {error && <Text color="red.500">{error}</Text>}

        <Text py="2" textAlign="center" color="app.textMuted" fontSize="sm">
          {t("common.or")}
        </Text>

        <GoogleLoginButton text="signup_with" onError={setError} />

        <Text py="2">
          {t("auth.haveAccount")}
          <Link
            px="2"
            color="green.500"
            _hover={{ color: "app.text" }}
            onClick={() => navigate("/login")}
          >
            {t("auth.login")}
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
          <Text>{t("auth.backToHome")}</Text>
        </Link>
      </Stack>
    </Stack>
  );
};

export default Register;
