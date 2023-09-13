import { useContext } from 'react'
import { Navigate } from "react-router-dom";
import MapEditorScreen from './MapEditorScreen';
import { AuthContext } from '../contexts/auth'

export default function MapWrapper() {
    const { auth } = useContext(AuthContext);
    
    if (auth.getLoggedIn)
        return <MapEditorScreen />
    else
        return <Navigate replace to="/" />
}