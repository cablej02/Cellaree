import { useState } from "react";
import { useUser } from "../context/UserContext";
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Input, Button, VStack } from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { UPDATE_USER, UPDATE_PASSWORD } from "../utils/mutations";

const UpdateUser = () => {
    const { user, setUser } = useUser();
    const [formData, setFormData] = useState({ username: user?.username || "", email: user?.email || "", password: "" });
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
        if (!formData.password) return alert("Password is required to update your details.");
        try {
            const { data } = await updateUser({ variables: { ...formData } });
            setUser({...user, username: data.updateUser.username, email: data.updateUser.email });
            alert("User details updated successfully!");
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const handlePasswordUpdate = async () => {
        if (!passwords.currentPassword || !passwords.newPassword || passwords.newPassword !== passwords.confirmPassword) {
            return alert("Please fill out all fields correctly.");
        }
        try {
            const { data } = await updatePassword({ variables: { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword } });
            alert("Password updated successfully!");
        } catch (error) {
            console.error("Error updating password:", error);
        }
    };

    return (
        <Box maxW="600px" mx="auto" p={4}>
            <Heading as="h2" size="lg" mb={4} color="text">Update User</Heading>
            <Tabs variant="login" isFitted>
                <TabList>
                    <Tab>Update Info</Tab>
                    <Tab>Change Password</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        <VStack spacing={4} align="stretch">
                            <Input name="username" placeholder="Username" value={formData.username} onChange={handleInputChange} />
                            <Input name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} />
                            <Input name="password" type="password" placeholder="Current Password (required)" value={formData.password} onChange={handleInputChange} />
                            <Button colorScheme="blue" onClick={handleUserUpdate}>Save Changes</Button>
                        </VStack>
                    </TabPanel>
                    <TabPanel>
                        <VStack spacing={4} align="stretch">
                            <Input name="currentPassword" type="password" placeholder="Current Password" value={passwords.currentPassword} onChange={handlePasswordChange} />
                            <Input name="newPassword" type="password" placeholder="New Password" value={passwords.newPassword} onChange={handlePasswordChange} />
                            <Input name="confirmPassword" type="password" placeholder="Confirm New Password" value={passwords.confirmPassword} onChange={handlePasswordChange} />
                            <Button colorScheme="blue" onClick={handlePasswordUpdate}>Change Password</Button>
                        </VStack>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default UpdateUser;
