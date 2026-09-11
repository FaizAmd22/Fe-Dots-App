import { useContext } from "react";
import { ConfirmContext } from "./confirmContext";

export const useConfirm = () => {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm harus dipakai di dalam <ConfirmProvider>.");
  }
  return confirm;
};
