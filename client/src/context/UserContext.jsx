import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useApolloClient } from "@apollo/client";
import { ME } from "../utils/queries";
import AuthService from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { use } from "react";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const navigate = useNavigate();
    const client = useApolloClient();

    const [user, setUser] = useState(null);

    const { data, error } = useQuery(ME, {
        // skip the query if no user is logged in
        skip: !AuthService.loggedIn(),
    });

    useEffect(() => {
        console.log("User updated:", user);
        console.log("Apollo Cache:", client.cache.extract()); // Log full Apollo cache
    }, [user])

    useEffect(() => {
        if (error) {
            console.error("Auth error:", error);
            AuthService.logout(navigate, client);
        }
        if (data?.me) {
            setUser(data.me);
        }
    }, [data, error, navigate]);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};

// custom hook for convenience
export const useUser = () => useContext(UserContext);