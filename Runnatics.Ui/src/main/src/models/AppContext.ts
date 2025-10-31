import { AppPermission } from "./AppPermission";
import { User } from "./User";

export interface AppContext {
    user: User;
    permissions: AppPermission[];
    dateFormat: string;
    timeFormat: string;
}
