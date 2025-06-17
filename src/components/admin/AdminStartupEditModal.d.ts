import { AdminStartupInfo } from "@/lib/startup-types";

interface AdminStartupEditModalProps {
  startup: AdminStartupInfo;
  isOpen: boolean;
  onClose: () => void;
  onStartupUpdated: () => void;
}

declare const AdminStartupEditModal: React.FC<AdminStartupEditModalProps>;

export default AdminStartupEditModal;
