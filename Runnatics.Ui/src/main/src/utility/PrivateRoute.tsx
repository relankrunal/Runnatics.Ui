import { createContext, useContext } from "react";
import { AppPermission } from "../models/AppPermission";


interface SessionContextType {
    userHasPermission: (permission: AppPermission) => boolean;
}

const SessionContext = createContext<SessionContextType>({
    userHasPermission: () => false,
});

interface PrivateRouteProps {
    permissions: Array<AppPermission>
}

export const PrivateRoutes = (props: PrivateRouteProps) => {
    const { userHasPermission } = useContext(SessionContext);
    return null;
}