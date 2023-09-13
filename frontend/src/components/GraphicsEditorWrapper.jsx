import { useContext } from 'react'
import { Navigate } from "react-router-dom";
import GraphicsEditorScreen from './GraphicsEditorScreen';
import { AuthContext } from '../contexts/auth'

export default function GraphicsEditorWrapper() {
    const { auth } = useContext(AuthContext);
    
    if (auth.getLoggedIn)
        return <GraphicsEditorScreen />
    else
        return <Navigate replace to="/" />
}