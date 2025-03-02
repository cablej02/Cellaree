import { useUser } from "../context/UserContext";
import AuthService from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { Box, Flex, HStack, Button, Text, Spacer, Menu, MenuButton, MenuList, MenuItem, useToken } from "@chakra-ui/react";

const Navbar = () => {
    const { user, setUser } = useUser();
    const navigate = useNavigate();

    // get pimary color hex value from theme
    const primary500 = useToken("colors", "primary.500");

    const handleLogout = () => {
        AuthService.logout(navigate);
        setUser(null);
    };

    return (
        <Box bg="dark" px={4} color="text">
            <Flex h={16} alignItems="center" justifyContent="space-between">
                {/* Left Side - App Title */}
                <HStack spacing={8} alignItems="center">
                    <Text
                        fontSize="5xl"
                        fontWeight="bold"
                        color="text"
                        textShadow={`2px 2px 4px ${primary500}`}
                        onClick={() => navigate("/")}
                        cursor="pointer"
                    >
                        Cellaree
                    </Text>
                </HStack>

                <Spacer />
                {/* Right Side - Nav Links */}
                {user && (
                    <HStack spacing={4} display={{ base: "none", md: "flex" }}>
                        <Button variant="navbar" onClick={() => navigate("/browse")}>
                            Browse Bottles
                        </Button>

                        {/* User Dropdown Menu */}
                        <Menu variant="navbar">
                            <MenuButton as={Button} variant="navbar">
                                {user.username}
                            </MenuButton>
                            <MenuList>
                                <MenuItem onClick={() => navigate("/")}>My Cellar</MenuItem>
                                <MenuItem onClick={() => navigate("/drank-history")}>Drank History</MenuItem>
                                <MenuItem onClick={() => navigate("/wishlist")}>Wishlist</MenuItem>
                                <MenuItem onClick={() => navigate("/update-user")}>Update User</MenuItem>
                                <MenuItem onClick={handleLogout} color="red.500" >
                                    Logout
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </HStack>
                )}
            </Flex>
        </Box>
    );
};

export default Navbar;