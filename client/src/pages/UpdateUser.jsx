import { useState } from "react";
import { useUser } from "../context/UserContext";
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Input, Button, VStack, Text, FormControl, FormLabel } from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { UPDATE_USER, UPDATE_PASSWORD } from "../utils/mutations";

const UpdateUser = () => {
    const { user, setUser } = useUser();

    const [formData, setFormData] = useState({ username: user?.username || "", email: user?.email || "", password: "" });
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [responseText, setResponseText] = useState({ message: "", type: "" });

    const [updateUser] = useMutation(UPDATE_USER);
    const [updatePassword] = useMutation(UPDATE_PASSWORD);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords({ ...passwords, [name]: value });
    };

    const handleUserUpdate = async () => {
        if (!formData.password) {
            return setResponseText({message: "Password is required to update your details.", type: "error"});
        }

        try {
            const { data } = await updateUser({ variables: { ...formData } });
            setUser({...user, username: data.updateUser.username, email: data.updateUser.email });
            setResponseText({ message: "User updated successfully!", type: "success" });
        } catch (error) {
            console.error("Error updating user");
            setResponseText({ message: "Failed to update user.", type: "error" });
        }
    };

    const handlePasswordUpdate = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || passwords.confirmPassword) {
            return setResponseText({ message: "Please fill out all fields correctly.", type: "error" });
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setResponseText({ message: "Passwords do not match.", type: "error" });
        }

        try {
            const { data } = await updatePassword({ variables: { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword } });
            setResponseText({ message: "Password updated succesfully!", type: "success" });
        } catch (error) {
            console.error("Error updating password");
            setResponseText({ message: "Error updating password", type: "error" });
        }
    };

    return (
        <Box maxW="400px" mt="20px" mx="auto" p="6" borderWidth="1px" borderRadius="md" bg="dark" color="text">
            <Tabs variant="login" isFitted>
                <TabList>
                    <Tab>Update Info</Tab>
                    <Tab>Change Password</Tab>
                </TabList>
                <TabPanels>
                    {/* Update username/email */}
                    <TabPanel>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Updated Username</FormLabel>
                                <Input name="username" bg="light" placeholder="New Username..." value={formData.username} onChange={handleInputChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Updated Email</FormLabel>
                                <Input name="email" bg="light" placeholder="New Email..." value={formData.email} onChange={handleInputChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Password</FormLabel>
                                <Input name="password" type="password" placeholder="Current Password (required)..." bg="light" value={formData.password} onChange={handleInputChange} />
                            </FormControl>
                            {responseText.message && (
                                <Text color={responseText.type === "success" ? "green.400" : "red.400"} mb={4}>
                                    {responseText.message}
                                </Text>
                            )}
                            <Button variant="primary" width="full" onClick={handleUserUpdate}>Save Changes</Button>
                        </VStack>
                    </TabPanel>
                    <TabPanel>
                        <VStack spacing={4} align="stretch">
                            <FormControl>
                                <FormLabel>Current Password</FormLabel>
                                <Input name="currentPassword" type="password" placeholder="Current Password..." bg='light' value={passwords.currentPassword} onChange={handlePasswordChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>New Password</FormLabel>
                                <Input name="newPassword" type="password" placeholder="New Password..." bg='light' value={passwords.newPassword} onChange={handlePasswordChange} />
                            </FormControl>
                            <FormControl>
                                <FormLabel>Confirm New Password</FormLabel>
                                <Input name="confirmPassword" type="password" placeholder="Confirm New Password..." bg='light' value={passwords.confirmPassword} onChange={handlePasswordChange} />
                            </FormControl>
                            {responseText.message && (
                                <Text color={responseText.type === "success" ? "green.400" : "red.400"} mb={4}>
                                    {responseText.message}
                                </Text>
                            )}
                            <Button variant="primary" width="full" onClick={handlePasswordUpdate}>Change Password</Button>
                        </VStack>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default UpdateUser;
