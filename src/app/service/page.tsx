import { RequireAuth } from "@/features/auth/components/require-auth";
import { ServicePage } from "@/features/service/components/service-page";

export default function ServiceRoute() {
  return (
    <RequireAuth>
      <ServicePage startInSelection />
    </RequireAuth>
  );
}
