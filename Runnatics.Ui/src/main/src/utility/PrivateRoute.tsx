import { useContext } from "react";
import { AppPermission } from "../models/AppPermission";
import { UnauthorizedErrorPage } from "../pages/admin/errorPages/UnAuthorizedErrorPage";
import { Outlet} from "react-router-dom";
import { SessionContext } from "../contexts/SessionContext";

interface PrivateRouteProps {
    permissions: Array<AppPermission>
}

export const PrivateRoutes = (props: PrivateRouteProps) => {
    const { userHasPermission } = useContext(SessionContext);

    return userHasPermission(props.permissions) ? <Outlet /> : <UnauthorizedErrorPage />;
}