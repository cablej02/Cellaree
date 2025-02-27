import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import system from './theme/theme.js'

import './index.css'
import App from './App.jsx'
import Cellar from './pages/Cellar.jsx'
import Login from './pages/Login.jsx'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <div>404 Not Found</div>,
        children: [
            {
                index: true,
                element: <Cellar />,
            },
            {
                path: '/login',
                element: <Login />,
            },
        ]
    }
]);

createRoot(document.getElementById('root')).render(
    <ChakraProvider value={system}>
        <RouterProvider router={router} />
    </ChakraProvider>
)
