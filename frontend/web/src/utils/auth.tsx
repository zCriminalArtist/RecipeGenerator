export const isAuthenticated = () => {
    return !!localStorage.getItem("jwt"); // Check if token exists
};