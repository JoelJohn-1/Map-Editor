import { useContext } from 'react'
import { Navigate } from "react-router-dom";
import AllMapsScreen from './AllMapsScreen';
import { AuthContext } from '../contexts/auth'

export default function MapsWrapper() {
    const { auth } = useContext(AuthContext);
    
    if (auth.getLoggedIn)
        return <AllMapsScreen />
    else
        return <Navigate replace to="/" />
}