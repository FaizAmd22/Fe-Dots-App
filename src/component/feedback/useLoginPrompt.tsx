import { useNavigate } from "react-router-dom";
import { LuLogIn } from "react-icons/lu";
import { useConfirm } from "./useConfirm";
import { useTranslation } from "../../i18n/useTranslation";

// Ajakan login saat tamu mencoba fitur yang butuh akun (menu, like, dll.).
export const useLoginPrompt = () => {
  const confirm = useConfirm();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return async () => {
    const confirmed = await confirm({
      title: t("auth.loginRequiredTitle"),
      description: t("auth.loginRequiredText"),
      confirmText: t("auth.loginRequiredConfirm"),
      cancelText: t("common.later"),
      icon: <LuLogIn />,
    });
    if (confirmed) navigate("/login");
  };
};
