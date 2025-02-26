import { useState } from 'react';
import { useMutation } from '@apollo/client';
import AuthService from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, Text } from '@chakra-ui/react';
import { LOGIN } from '../utils/mutations';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [login, { error }] = useMutation(LOGIN);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await login({ variables: { email, password } });
            AuthService.login(data.login.token);
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    return (
        <Box maxW="400px" mx="auto" mt="100px" p="6" borderWidth="1px" borderRadius="md">
            <Text fontSize="2xl" mb="4">Login</Text>
            <form onSubmit={handleSubmit}>
                <FormControl mb="3">
                    <FormLabel>Email of Username</FormLabel>
                    <Input type="text" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </FormControl>
                <FormControl mb="3">
                    <FormLabel>Password</FormLabel>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </FormControl>
                <Button type="submit" colorScheme="blue" width="full">Login</Button>
            </form>
            {error && <Text color="red.500" mt="2">Invalid credentials</Text>}
        </Box>
    );
};

export default Login;