import { useState } from 'react';
import { useMutation } from '@apollo/client';
import AuthService from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Input, Text, Tabs, Field } from '@chakra-ui/react';
import { LOGIN, ADD_USER } from '../utils/mutations';

const Login = () => {
    const navigate = useNavigate();

    const [login, { error: loginError }] = useMutation(LOGIN);
    const [addUser, { error: signupError }] = useMutation(ADD_USER);

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ username: '', email: '', password: '' });

    const [tabValue, setTabValue] = useState("login");

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
            AuthService.login(data.login.token, navigate);
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    const handleSignupSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await addUser({ variables: { ...signupData } });
            AuthService.login(data.addUser.token, navigate);
        } catch (err) {
            console.error('Signup failed', err);
        }
    };

    return (
        <Box maxW="400px" mx="auto" mt="100px" p="6" borderWidth="1px" borderRadius="md">
            <Tabs.Root defaultValue={'login'} variant={'enclosed'} fitted>
                <Tabs.List>
                    <Tabs.Trigger value="login">Login</Tabs.Trigger>
                    <Tabs.Trigger value="signup">Sign Up</Tabs.Trigger>
                </Tabs.List>

                {/* Login Form */}
                <Tabs.Content value="login">
                    <form onSubmit={handleLoginSubmit}>
                        <Field.Root>
                            <Field.Label>Email or Username</Field.Label>
                            <Input 
                                type="text" 
                                name="email" 
                                value={loginData.email} 
                                onChange={(e) => handleInputChange(e, 'login')} 
                                required 
                            />
                        </Field.Root>
                        <Field.Root>
                            <Field.Label>Password</Field.Label>
                            <Input 
                                type="password" 
                                name="password" 
                                value={loginData.password} 
                                onChange={(e) => handleInputChange(e, 'login')} 
                                required 
                            />
                        </Field.Root>
                        <Button type="submit" colorScheme="blue" width="full" mt="3">Login</Button>
                    </form>
                    {loginError && <Text color="red.500" mt="2">Invalid login credentials</Text>}
                </Tabs.Content>

                {/* Signup Form */}
                <Tabs.Content value="signup">
                    <form onSubmit={handleSignupSubmit}>
                        <Field.Root>
                            <Field.Label>Username</Field.Label>
                            <Input 
                                type="text" 
                                name="username" 
                                value={signupData.username} 
                                onChange={(e) => handleInputChange(e, 'signup')} 
                                required 
                            />
                        </Field.Root>
                        <Field.Root>
                            <Field.Label>Email</Field.Label>
                            <Input 
                                type="email" 
                                name="email" 
                                value={signupData.email} 
                                onChange={(e) => handleInputChange(e, 'signup')} 
                                required 
                            />
                        </Field.Root>
                        <Field.Root>
                            <Field.Label>Password</Field.Label>
                            <Input 
                                type="password" 
                                name="password" 
                                value={signupData.password} 
                                onChange={(e) => handleInputChange(e, 'signup')} 
                                required 
                            />
                        </Field.Root>
                        <Button type="submit" colorScheme="green" width="full" mt="3">Sign Up</Button>
                    </form>
                    {signupError && <Text color="red.500" mt="2">Error creating account</Text>}
                </Tabs.Content>
            </Tabs.Root>
        </Box>
    );
};

export default Login;