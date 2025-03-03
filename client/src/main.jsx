import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'
import App from './App.jsx'
import Cellar from './pages/Cellar.jsx'
import Login from './pages/Login.jsx'
import DrankHistory from './pages/DrankHistory.jsx'
import BrowseBottles from './pages/BrowseBottles.jsx'
import Wishlist from './pages/Wishlist.jsx'

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
            {
                path: '/drank-history',
                element: <DrankHistory />,
            },
            {
                path: '/browse',
                element: <BrowseBottles />,
            },
            {
                path: '/wishlist',
                element: <Wishlist />,
            }
        ]
    }
]);

createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)
