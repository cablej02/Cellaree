import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

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
    <RouterProvider router={router} />
)
