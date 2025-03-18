import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ADD_WISHLIST_BOTTLE, REMOVE_WISHLIST_BOTTLE } from '../utils/mutations';
import { GET_BOTTLES, GET_WINERIES, GET_WINE_STYLES } from '../utils/queries';
import { useUser } from '../context/UserContext';
import { Box, Flex, HStack, Button, IconButton, SimpleGrid, Card, CardBody, Text, Input, Heading, InputGroup, InputRightElement, useToken, useToast } from '@chakra-ui/react';
import { normalizeText } from "@shared/utils/formatting";
import AddBottleModal from '../components/AddBottleModal';
import BottleModal from '../components/BottleModal';
import AddWineryModal from '../components/AddWineryModal';
import { BsBagHeart, BsBagHeartFill } from "react-icons/bs";
import { FaArrowUpFromBracket } from "react-icons/fa6";
import { FaSearch } from 'react-icons/fa';

const BrowseBottles = () => {
    const toast = useToast();
    const { user, setUser } = useUser();
    const { data: bottlesData, loading, error } = useQuery(GET_BOTTLES, { fetchPolicy: 'network-only' });
    const { data: wineriesData } = useQuery(GET_WINERIES);
    const { data: wineStylesData } = useQuery(GET_WINE_STYLES);
    
    const [bottles, setBottles] = useState([]);
    const [isBottleModalOpen, setIsBottleModalOpen] = useState(false);
    const [isWineryModalOpen, setIsWineryModalOpen] = useState(false);
    const [selectedBottle, setSelectedBottle] = useState(null); // for bottle modal

    const [addWishlistBottle] = useMutation(ADD_WISHLIST_BOTTLE);
    const [removeWishlistBottle] = useMutation(REMOVE_WISHLIST_BOTTLE);

    // search query state
    const [searchQuery, setSearchQuery] = useState("");

    // apply filtering
    let filteredBottles = bottles?.filter(bottle => {
        const normalizedQuery = normalizeText(searchQuery);
        return (!searchQuery || 
            normalizeText(bottle.productName).includes(normalizedQuery) ||
            normalizeText(bottle.winery.name).includes(normalizedQuery) ||
            normalizeText(bottle.wineStyle.name).includes(normalizedQuery) ||
            normalizeText(bottle.country).includes(normalizedQuery) ||
            normalizeText(bottle.location).includes(normalizedQuery)
        )
    }) || [];

    useEffect(() => {
        if (bottlesData?.getBottles && !loading) {
            setBottles(bottlesData.getBottles); // Sync state when data loads
        }
    }, [bottlesData]);

    const getBottleUserStats = (bottleId) => {
        const cellarCount = user?.cellar?.filter((entry) => entry.bottle._id === bottleId).reduce((acc, entry) => acc + entry.quantity, 0);
        const drankCount = user?.drankHistory?.filter((entry) => entry.bottle._id === bottleId).reduce((acc, entry) => acc + entry.quantity, 0);
        const onWishlist = user?.wishlist?.some((entry) => entry.bottle._id === bottleId);

        return { cellarCount, drankCount, onWishlist };
    };

    const toggleWishlist = async (bottleId) => {
        const isOnWishlist = user?.wishlist?.some((entry) => entry.bottle._id === bottleId);
        try {
            if (isOnWishlist) {
                await removeWishlistBottle({ variables: { _id: user.wishlist.find((entry) => entry.bottle._id === bottleId)._id } });
                setUser({ ...user, wishlist: user.wishlist.filter((entry) => entry.bottle._id !== bottleId) });
            } else {
                const { data } = await addWishlistBottle({ variables: { bottle: bottleId } });
                setUser({ ...user, wishlist: [...user.wishlist, data.addWishlistBottle] });
            }
        } catch (error) {
            console.error('Error updating wishlist:', error);
        }
    };

    const handleAddBottleSuccess = (newBottle) => {
        setBottles((prevBottles) => [...prevBottles, newBottle]);
        toast({ title: 'Bottle added!', status: 'success' });
    };
    
    //color imports
    const primaryColor = useToken("colors", "primary.300");
    const textColor = useToken("colors", "text");
    return (
        <>
            <Box maxW='1000px' mx='auto' p={4}>
                {loading && <Text>Loading bottles...</Text>}
                {error && <Text color='red.500'>Error loading bottles.</Text>}

                {!loading && !error && (
                <>
                    <HStack justify="space-between" mb={4}>
                        <Heading as='h1'>Browse</Heading>
                        <HStack>
                            <InputGroup>
                                <Input 
                                    placeholder="Search..." 
                                    value={searchQuery} 
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    bg="dark"
                                    color="text"
                                    maxW="40vw"
                                />
                                <InputRightElement pointerEvents="none">
                                    <FaSearch color="text" />
                                </InputRightElement>
                            </InputGroup>
                        </HStack>
                    </HStack>
                    <HStack justifyContent='space-between' mb={4}>
                        <Button variant='primary' onClick={() => setIsBottleModalOpen(true)}>Add Bottle</Button>
                        <Button variant='primary' onClick={() => setIsWineryModalOpen(true)}>Add Winery</Button>
                    </HStack>
                    <SimpleGrid columns={[1, 2]} spacing={6}>
                        {filteredBottles.map((bottle) => {
                            const { cellarCount, drankCount, onWishlist } = getBottleUserStats(bottle._id);
                            return (
                                <Card key={bottle._id} borderRadius="xl" bg="dark" color="text">
                                    <CardBody pb={1}>
                                        <Text fontWeight="bold" fontSize="lg" color="primary.200">{bottle.productName}</Text>
                                        <Text fontSize="sm" color="secondary">{bottle.winery.name} - {bottle.wineStyle.name}</Text>
                                        <Text fontSize="sm" color="secondary">{bottle.country}, {bottle.location}</Text>
                                        <Flex justify="space-between" mt={2}>
                                            <Text fontSize="sm">In Cellar: {cellarCount}</Text>
                                            <Text fontSize="sm">Drank: {drankCount}</Text>
                                        </Flex>
                                        <Flex justify="space-between" mt={2}>
                                            <IconButton
                                                icon={<FaArrowUpFromBracket color={textColor} />} 
                                                size='lg'
                                                onClick={() => setSelectedBottle(bottle)}
                                                aria-label='View Bottle'
                                                bg="transparent"
                                                _hover={{ filter: "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.8))" }}
                                                _active={{ bg: "transparent" }}
                                            />
                                            <IconButton
                                                icon={onWishlist ? <BsBagHeartFill color={primaryColor} /> : <BsBagHeart color={textColor} />}
                                                size='lg'
                                                onClick={() => toggleWishlist(bottle._id)}
                                                aria-label='Toggle Wishlist'
                                                bg="transparent"
                                                _hover={{ filter: "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.8))" }}
                                                _active={{ bg: "transparent" }}
                                            />
                                        </Flex>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </SimpleGrid>
                    {selectedBottle && (
                        <BottleModal isOpen={!!selectedBottle} onClose={() => setSelectedBottle(null)} bottle={selectedBottle} />
                    )}
                </>)}
            </Box>
            <AddBottleModal
                isOpen={isBottleModalOpen}
                onClose={() => setIsBottleModalOpen(false)}
                onAddSuccess={handleAddBottleSuccess}
                wineries={wineriesData?.getWineries || []}
                wineStyles={wineStylesData?.getWineStyles || []}
            />
            <AddWineryModal
                isOpen={isWineryModalOpen}
                onClose={() => setIsWineryModalOpen(false)}
                onAddSuccess={() => toast({ title: 'Winery added!', status: 'success' })}
            />
        </>
    );
};

export default BrowseBottles;
