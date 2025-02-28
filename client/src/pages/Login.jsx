import { useState } from "react";
import { useMutation, useApolloClient } from "@apollo/client";
import AuthService from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { 
    Box, Button, Input, Text, 
    Tabs, TabList, TabPanels, Tab, TabPanel, 
    FormControl, FormLabel, VStack 
} from "@chakra-ui/react";
import { LOGIN, ADD_USER } from "../utils/mutations";

const Login = () => {
    const navigate = useNavigate();
    const client = useApolloClient();

    const [login, { error: loginError }] = useMutation(LOGIN);
    const [addUser, { error: signupError }] = useMutation(ADD_USER);

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ username: '', email: '', password: '' });

    const handleInputChange = (e, type) => {
        const { name, value } = e.target;
        if (type === 'login') {
            setLoginData({ ...loginData, [name]: value });
        } else {
            setSignupData({ ...signupData, [name]: value });
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await login({ variables: { ...loginData } });
            AuthService.login(data.login.token, navigate, client);
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await addUser({ variables: { ...signupData } });
            AuthService.login(data.addUser.token, navigate, client);
        } catch (err) {
            console.error('Signup failed', err);
        }
    };

    return (
        <Box maxW="400px" mx="auto" p="6" borderWidth="1px" borderRadius="md" bg="dark" color="text">
            <Tabs variant="login" isFitted>
                <TabList>
                    <Tab>Login</Tab>
                    <Tab>Sign Up</Tab>
                </TabList>

                <TabPanels>
                    {/* Login Form */}
                    <TabPanel>
                        <form onSubmit={handleLoginSubmit}>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Email or Username</FormLabel>
                                    <Input type="text" name="email" value={loginData.email} bg="light" onChange={(e) => handleInputChange(e, "login")} required />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Password</FormLabel>
                                    <Input type="password" name="password" value={loginData.password} bg="light" onChange={(e) => handleInputChange(e, "login")} required />
                                </FormControl>

                                <Button type="submit" variant="solid" width="full">Login</Button>
                                {loginError && <Text color="error">Invalid login credentials</Text>}
                            </VStack>
                        </form>
                    </TabPanel>

                    {/* Signup Form */}
                    <TabPanel>
                        <form onSubmit={handleSignupSubmit}>
                            <VStack spacing={4}>
                                <FormControl>
                                    <FormLabel>Username</FormLabel>
                                    <Input type="text" name="username" value={signupData.username} bg="light" onChange={(e) => handleInputChange(e, "signup")} required />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Email</FormLabel>
                                    <Input type="email" name="email" value={signupData.email} bg="light" onChange={(e) => handleInputChange(e, "signup")} required />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Password</FormLabel>
                                    <Input type="password" name="password" value={signupData.password} bg="light" onChange={(e) => handleInputChange(e, "signup")} required />
                                </FormControl>

                                <Button type="submit" colorScheme="primary" width="full">Sign Up</Button>
                                {signupError && <Text color="error">Error creating account</Text>}
                            </VStack>
                        </form>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default Login;