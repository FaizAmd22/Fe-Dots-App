import { ReactNode, useCallback, useRef, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { ConfirmContext, ConfirmOptions } from "./confirmContext";
import { useTranslation } from "../../i18n/useTranslation";

// Satu dialog untuk seluruh aplikasi, dipanggil lewat useConfirm():
//   if (await confirm({ title: "Hapus?" })) { ... }
const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const resolver = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback(
    (next: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        // Dialog sebelumnya yang belum dijawab dianggap batal.
        resolver.current?.(false);
        resolver.current = resolve;
        setOptions(next);
      }),
    []
  );

  const finish = (confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setOptions(null);
    setIsLoading(false);
  };

  const handleConfirm = async () => {
    if (!options) return;

    if (options.onConfirm) {
      setIsLoading(true);
      try {
        await options.onConfirm();
      } finally {
        // Kegagalan ditangani pemanggil (misalnya lewat toast); dialog tetap ditutup.
        finish(true);
      }
      return;
    }

    finish(true);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <ConfirmDialog
        isOpen={!!options}
        title={options?.title || ""}
        description={options?.description}
        confirmText={options?.confirmText || t("common.yes")}
        cancelText={options?.cancelText || t("common.cancel")}
        tone={options?.tone}
        icon={options?.icon}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={() => !isLoading && finish(false)}
      />
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
