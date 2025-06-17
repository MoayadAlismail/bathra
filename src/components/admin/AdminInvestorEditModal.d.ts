import { AdminInvestorInfo } from "../../lib/investor-types";

interface AdminInvestorEditModalProps {
  investor: AdminInvestorInfo;
  isOpen: boolean;
  onClose: () => void;
  onInvestorUpdated: () => void;
}

declare const AdminInvestorEditModal: React.FC<AdminInvestorEditModalProps>;

export default AdminInvestorEditModal;
