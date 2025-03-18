import { useState } from "react";
import { useUser } from "../context/UserContext";
import { Box, Text, Textarea, Button, HStack, VStack, Card, CardBody, CardHeader, Heading, IconButton  } from "@chakra-ui/react";
import { UPDATE_WISHLIST_BOTTLE, REMOVE_WISHLIST_BOTTLE } from "../utils/mutations";
import { useMutation } from "@apollo/client";
import { FaTrash, FaSave } from "react-icons/fa";

const Wishlist = () => {
    const { user, setUser } = useUser();
    const [notes, setNotes] = useState({});
    const [noteChanged, setNoteChanged] = useState({});

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
        setNoteChanged({ ...noteChanged, [id]: true });
    }

    const handleSaveNote = async (id) => {
        try {
            await updateWishlistBottle({ variables: { _id: id, notes: notes[id] } });
            setNoteChanged({ ...noteChanged, [id]: false });
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
                        <Card key={entry._id} p={4} bg="dark" color="text" shadow="md" borderRadius="md" position="relative">
                            <IconButton 
                                icon={<FaTrash color="red" />} 
                                bg="transparent"
                                variant="ghost"
                                onClick={() => handleRemoveEntry(entry._id)}
                                aria-label="Remove from wishlist"
                                _hover={{ filter: "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.8))" }}
                                _active={{ bg: "transparent" }}
                                position="absolute"
                                top={2}
                                right={2}
                            />
                            <CardBody>
                                <HStack align="start" spacing={4} w="97%">
                                    <Box flex={2}>
                                        <Heading size="lg" color="primary.300">{entry.bottle.winery.name}</Heading>
                                        <Text fontSize="sm" color="secondary" my={1}>
                                            {entry.bottle.productName 
                                                ? entry.bottle.productName + (!entry.bottle.productName.toLowerCase().includes(entry.bottle.wineStyle.name.toLowerCase()) 
                                                    ? ` - ${entry.bottle.wineStyle.name}` 
                                                    : "")
                                                : entry.bottle.wineStyle.name
                                            }
                                        </Text>
                                        <Text fontSize="sm" color="secondary">Added: {entry.addedDate ? new Date(parseInt(entry.addedDate)).toLocaleDateString() : "Unknown"}</Text>
                                    </Box>
                                    <Box flex={3} position="relative">
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
                                            w="100%"
                                        />
                                        {noteChanged[entry._id] && (
                                            <IconButton 
                                                icon={<FaSave color="green" />} 
                                                bg="transparent"
                                                variant="ghost"
                                                onClick={() => handleSaveNote(entry._id)}
                                                aria-label="Save note"
                                                _hover={{ filter: "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.8))" }}
                                                _active={{ bg: "transparent" }}
                                                position="absolute"
                                                bottom={-1}
                                                right={-1}
                                                zIndex={"1001"}
                                            />
                                        )}
                                    </Box>
                                </HStack>
                            </CardBody>
                        </Card>
                    ))}
                </VStack>
            )}
        </Box>
    );
};

export default Wishlist;
