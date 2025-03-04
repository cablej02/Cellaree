import { useState } from "react";
import { useUser } from "../context/UserContext";
import { Box, Text, Textarea, Button, HStack, VStack, Card, CardBody, CardHeader, Heading, IconButton  } from "@chakra-ui/react";
import { UPDATE_WISHLIST_BOTTLE, REMOVE_WISHLIST_BOTTLE } from "../utils/mutations";
import { useMutation } from "@apollo/client";
import { capitalizeWords } from "../utils/formatting.js";
import { FaTrash } from "react-icons/fa";

const Wishlist = () => {
    const { user, setUser } = useUser();
    const [notes, setNotes] = useState({});

    const sortWishlist = (wishlist) => {
        return [...wishlist].sort((a, b) => {
            return parseInt(b.addedDate) - parseInt(a.addedDate);
        });
    };
    const wishlist = sortWishlist(user?.wishlist || []);

    const [updateWishlistBottle] = useMutation(UPDATE_WISHLIST_BOTTLE);
    const [removeWishlistBottle] = useMutation(REMOVE_WISHLIST_BOTTLE);

    const handleNoteChange = (id, value) => {
        setNotes({ ...notes, [id]: value });
    }

    const handleSaveNote = async (id) => {
        try {
            await updateWishlistBottle({ variables: { _id: id, notes: notes[id] } });
        } catch (error) {
            console.error("Error updating note:", error);
        }
    };

    const handleRemoveEntry = async (_id) => {
        try {
            await removeWishlistBottle({ variables: { _id } });
            setUser({ ...user, wishlist: user.wishlist.filter((entry) => entry._id !== _id) });
        } catch (error) {
            console.error("Error removing entry:", error);
        }
    };

    return (
        <Box maxW="1000px" mx="auto" p={4}>
            <Heading as="h2" size="lg" mb={4} color="text">Wishlist</Heading>
            {wishlist.length === 0 ? (
                <Text color="text">No items in your wishlist.</Text>
            ) : (
                <VStack spacing={4} align="stretch">
                    {wishlist.map((entry) => (
                        <Card key={entry._id} p={4} bg="dark" color="text" shadow="md" borderRadius="md">
                            <CardHeader>
                                <HStack justify="space-between">
                                    <Box>
                                        <Heading size="md">{capitalizeWords(entry.bottle.productName)}</Heading>
                                        <Text fontSize="sm" color="secondary">{capitalizeWords(entry.bottle.winery.name)} - {capitalizeWords(entry.bottle.wineStyle.name)}</Text>
                                        <Text fontSize="sm" color="secondary">Added: {entry.addedDate ? new Date(parseInt(entry.addedDate)).toLocaleDateString() : "Unknown"}</Text>
                                    </Box>
                                    <IconButton 
                                        icon={<FaTrash />} 
                                        colorScheme="red" 
                                        variant="ghost"
                                        onClick={() => handleRemoveEntry(entry._id)}
                                        aria-label="Remove from wishlist"
                                        _hover={{ filter: "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.8))" }}
                                        _active={{ bg: "transparent" }}
                                    />
                                </HStack>
                            </CardHeader>
                            <CardBody>
                                <VStack align="stretch">
                                    <Textarea 
                                        placeholder="Add notes..." 
                                        value={notes[entry._id] ?? entry.notes ?? ""} 
                                        onChange={(e) => handleNoteChange(entry._id, e.target.value)}
                                        resize="none"
                                        overflowY="auto"
                                        minH="100px"
                                        maxH="200px"
                                        bg="background"
                                        color="text"
                                        borderColor="secondary"
                                        borderRadius="md"
                                    />
                                    <Button size="sm" colorScheme="blue" onClick={() => handleSaveNote(entry._id)}>Save</Button>
                                </VStack>
                            </CardBody>
                        </Card>
                    ))}
                </VStack>
            )}
        </Box>
    );
};

export default Wishlist;
