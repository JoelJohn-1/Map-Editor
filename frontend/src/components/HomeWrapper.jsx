import { useContext } from 'react'
import { Navigate } from "react-router-dom";
import UserHomescreen from './UserHomescreen'
import { AuthContext } from '../contexts/auth'

export default function HomeWrapper() {
    const { auth } = useContext(AuthContext);
    
    if (auth.getLoggedIn)
        return <UserHomescreen />
    else
        return <Navigate replace to="/" />
}