import { useUser } from "../context/UserContext";
import AuthService from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { Box, Flex, HStack, Button, Text, Spacer, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";

const Navbar = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const handleLogout = () => {
        AuthService.logout(navigate);
    };

    return (
        <Box bg="background" px={4} color="text">
            <Flex h={16} alignItems="center" justifyContent="space-between">
                {/* Left Side - App Title */}
                <HStack spacing={8} alignItems="center">
                    <Text fontSize="xl" fontWeight="bold">Cellaree</Text>
                </HStack>

                <Spacer />

                {/* Right Side - Navigation Links */}
                <HStack spacing={4} display={{ base: "none", md: "flex" }}>
                    <Button variant="outline" color="text" onClick={() => navigate("/browse")}>
                        Browse Bottles
                    </Button>

                    {/* User Dropdown Menu */}
                    <Menu>
                        <MenuButton as={Button} variant="outline">
                            {user?.username || "Loading..."}
                        </MenuButton>
                        <MenuList>
                            <MenuItem onClick={() => navigate("/cellar")}>Cellar</MenuItem>
                            <MenuItem onClick={() => navigate("/drank-history")}>Drank History</MenuItem>
                            <MenuItem onClick={() => navigate("/wishlist")}>Wishlist</MenuItem>
                            <MenuItem onClick={() => navigate("/update-user")}>Update User</MenuItem>
                            <MenuItem onClick={handleLogout} color="red.500" _hover={{ bg: "red.100" }}>
                                Logout
                            </MenuItem>
                        </MenuList>
                    </Menu>
                </HStack>
            </Flex>
        </Box>
    );
};

export default Navbar;