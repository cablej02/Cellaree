import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AuthService from './utils/auth'

import Navbar from './components/Navbar'

import './App.css'

const httpLink = createHttpLink({
    uri: '/graphql',
})

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('id_token')
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    }
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

const App = () => {
    const navigate = useNavigate();

    // check if user is logged in on mount
    useEffect(() => {
        if (!AuthService.loggedIn()) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <ApolloProvider client={client}>
            <Navbar />
            <Outlet />
        </ApolloProvider>
    )
}

export default App