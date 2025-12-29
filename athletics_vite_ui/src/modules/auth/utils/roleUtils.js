import { jwtDecode } from "jwt-decode";
import authService from "../services/auth_service";

export const getUserRole = () => {
    const token = authService.getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        // Assuming the role is stored in the token payload. 
        // If not, we might need to fetch the user profile.
        // Based on the backend code, the token only contains 'sub' (user_id).
        // So we likely need to fetch the user profile to get the role.
        return decoded.role || null;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

export const getUserName = () => {
    const token = authService.getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        // Assuming the role is stored in the token payload. 
        // If not, we might need to fetch the user profile.
        // Based on the backend code, the token only contains 'sub' (user_id).
        // So we likely need to fetch the user profile to get the role.
        return decoded.name + " (" + decoded.role.toLowerCase() + ")" || null;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

export const getUserEmail = () => {
    const token = authService.getToken();
    if (!token) return null;

    try {
        const decoded = jwtDecode(token);
        return decoded.email || null;
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};
