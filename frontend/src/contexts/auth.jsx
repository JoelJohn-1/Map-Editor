import { createContext, useEffect, useState } from "react";
import authApi from "../api/auth.js"
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthActionType = {
    SET_LOGGED_IN: "SET_LOGGED_IN",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    REGISTER_USER: "REGISTER_USER",
    FAILED: "FAILED"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false,
        error: null
    });
    const navigate = useNavigate();

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.SET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    error: null
                });
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true,
                    error: null
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    error: null
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    error: null
                })
            }
            case AuthActionType.FAILED: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    error: payload
                })
            }
            default:
                return auth;
        }
    }

    auth.getLoggedIn = async function () {
        const response = await authApi.get("/loggedIn/");
        if (response.status === 200) {
            authReducer({
                type: AuthActionType.SET_LOGGED_IN,
                payload: {
                    loggedIn: response.data.loggedIn,
                    user: response.data.user
                }
            });

            return true;
        }
    }

    auth.registerUser = async function(username, email, password) {
		const response = await authApi.post("/register", {
			username: username,
			email: email,
			password: password,
		});

		if (response.status === 200) {
			authReducer({
				type: AuthActionType.REGISTER_USER,
				payload: {
					user: response.data.user,
				},
			});
			//auth.loginUser(email, password);
		} else {
			authReducer({
				type: AuthActionType.FAILED,
				payload: response.data.errorMessage,
			});
		}
	}

    auth.loginUser = async function(email, password) {
        const response = await authApi.post("/login/", {
            email : email,
            password : password
        })

        if (response.status === 200) {
            authReducer({
                type: AuthActionType.LOGIN_USER,
                payload: {
                    user: response.data.user
                }
            })
            navigate("/user")
        } else {
            authReducer({
                type: AuthActionType.FAILED,
                payload: response.data.errorMessage
            })
        }
    } 

    auth.logoutUser = async function() {
        const response = await authApi.get("/logout/")
        if (response.status === 200) {
            authReducer( {
                type: AuthActionType.LOGOUT_USER,
                payload: null
            })
            navigate("/")
        }
    }

    auth.getUserInitials = function() {
        let initials = "";
        if (auth.user) {
            initials += auth.user.username.charAt(0);
        }
        return initials;
    }

    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };