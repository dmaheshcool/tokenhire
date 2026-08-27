import { BrandPanel } from "../app/EmployerPage.jsx";
import { useStore } from "../../context/Store.jsx";

export default function OrgBrandPage() {
  const { orgs, setOrgs, setDrives, activeOrgId } = useStore();
  const org = orgs.find((o) => o.id === activeOrgId);
  if (!org) return null;
  return <BrandPanel org={org} setOrgs={setOrgs} setDrives={setDrives} embedded />;
}
