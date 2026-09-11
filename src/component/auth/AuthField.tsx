import {
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  InputRightElement,
} from "@chakra-ui/react";
import { ReactElement, useState } from "react";
import { LuEye, LuEyeOff, LuLock } from "react-icons/lu";
import { useTranslation } from "../../i18n/useTranslation";

const inputStyle = {
  rounded: "xl",
  bg: "transparent",
  borderColor: "app.border",
  focusBorderColor: "green.500",
  _hover: { borderColor: "app.borderStrong" },
  _placeholder: { color: "app.textMuted", opacity: 0.7 },
  fontSize: "md",
};

// Input berlabel dengan ikon di kiri. FormControl menghubungkan label dengan
// input-nya, jadi mengklik label ikut memfokuskan input.
export const AuthField = ({
  label,
  icon,
  ...props
}: { label: string; icon: ReactElement } & InputProps) => (
  <FormControl>
    <FormLabel fontSize="sm" fontWeight="medium" mb="1.5">
      {label}
    </FormLabel>
    <InputGroup size="lg">
      <InputLeftElement pointerEvents="none" color="app.textMuted">
        {icon}
      </InputLeftElement>
      <Input {...inputStyle} {...props} />
    </InputGroup>
  </FormControl>
);

export const PasswordField = ({ label, ...props }: { label: string } & InputProps) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { t } = useTranslation();

  return (
    <FormControl>
      <FormLabel fontSize="sm" fontWeight="medium" mb="1.5">
        {label}
      </FormLabel>
      <InputGroup size="lg">
        <InputLeftElement pointerEvents="none" color="app.textMuted">
          <LuLock />
        </InputLeftElement>
        <Input {...inputStyle} pr="12" type={isVisible ? "text" : "password"} {...props} />
        <InputRightElement>
          <IconButton
            size="sm"
            variant="ghost"
            rounded="full"
            color="app.textMuted"
            aria-label={isVisible ? t("auth.hidePassword") : t("auth.showPassword")}
            icon={isVisible ? <LuEyeOff /> : <LuEye />}
            _hover={{ bg: "app.hover", color: "app.text" }}
            onClick={() => setIsVisible((current) => !current)}
          />
        </InputRightElement>
      </InputGroup>
    </FormControl>
  );
};
