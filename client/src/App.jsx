import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import AuthService from './utils/auth'
import { ChakraProvider } from "@chakra-ui/react";
import { UserProvider } from './context/UserContext'

import Navbar from './components/Navbar'

// chakra theme
import theme from './theme/theme.js'

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

// Handle global GraphQL errors
const errorLink = onError(({ graphQLErrors }) => {
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        if (err.message === "Not logged in") {
          console.warn("Authentication error detected. Logging out user.");
          AuthService.logout();
        }
      }
    }
  });

const client = new ApolloClient({
    link: errorLink.concat(authLink).concat(httpLink),
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
        <ChakraProvider theme={theme}>
            <ApolloProvider client={client}>
                <UserProvider>
                    <Navbar />
                    <Outlet />
                </UserProvider>
            </ApolloProvider>
        </ChakraProvider>
    )
}

export default App;