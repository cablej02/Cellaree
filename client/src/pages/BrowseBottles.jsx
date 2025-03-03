import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { ADD_WISHLIST_BOTTLE, REMOVE_WISHLIST_BOTTLE } from '../utils/mutations';
import { GET_BOTTLES, GET_WINERIES, GET_WINE_STYLES } from '../utils/queries';
import { useUser } from '../context/UserContext';
import { Box, Button, IconButton, Table, Thead, Tbody, Tr, Th, Td, Text, useToken } from '@chakra-ui/react';
import { capitalizeWords } from '../utils/formatting';
import AddBottleModal from '../components/AddBottleModal';
import { BsBagHeart, BsBagHeartFill } from "react-icons/bs";

const BrowseBottles = () => {
    const { user, setUser } = useUser();
    const { data: bottlesData, loading, error } = useQuery(GET_BOTTLES);
    const { data: wineriesData } = useQuery(GET_WINERIES);
    const { data: wineStylesData } = useQuery(GET_WINE_STYLES);
    
    const [bottles, setBottles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [addWishlistBottle] = useMutation(ADD_WISHLIST_BOTTLE);
    const [removeWishlistBottle] = useMutation(REMOVE_WISHLIST_BOTTLE);

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
        console.log('New bottle added:', newBottle);
        setBottles((prevBottles) => [...prevBottles, newBottle]);
    };
    
    //color imports
    const primaryColor = useToken("colors", "primary.500");
    const backgroundColor = useToken("colors", "background");
    return (
        <Box maxW='1000px' mx='auto' p={4}>
            {loading && <Text>Loading bottles...</Text>}
            {error && <Text color='red.500'>Error loading bottles.</Text>}

            {!loading && !error && (
            <>
                <Button variant='primary' mb={4} onClick={() => setIsModalOpen(true)}>Add New Bottle</Button>
                <Table variant='simple' size='sm'>
                    <Thead>
                        <Tr>
                            <Th color='tertiary'>Product Name</Th>
                            <Th color='tertiary'>Winery</Th>
                            <Th color='tertiary'>Type</Th>
                            <Th color='tertiary'>Wine Style</Th>
                            <Th color='tertiary'>Country</Th>
                            <Th color='tertiary'>Location</Th>
                            <Th color='tertiary'>In Cellar</Th>
                            <Th color='tertiary'>Drank</Th>
                            <Th color='tertiary'>Wishlist</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {bottles.length > 0 ? (
                            bottles.map((bottle) => {
                                const { cellarCount, drankCount, onWishlist } = getBottleUserStats(bottle._id);
                                return (
                                    <Tr key={bottle._id}>
                                        <Td>{capitalizeWords(bottle.productName)}</Td>
                                        <Td>{capitalizeWords(bottle.winery.name)}</Td>
                                        <Td>{bottle.wineStyle.category}</Td>
                                        <Td>{bottle.wineStyle.name}</Td>
                                        <Td>{bottle.country}</Td>
                                        <Td>{bottle.location}</Td>
                                        <Td>{cellarCount}</Td>
                                        <Td>{drankCount}</Td>
                                        <Td textAlign="center">
                                            <IconButton
                                                icon={onWishlist ? <BsBagHeartFill color='red' /> : <BsBagHeart color='white' />}
                                                size='lg'
                                                onClick={() => toggleWishlist(bottle._id)}
                                                aria-label='Toggle Wishlist'
                                                variant='ghost'
                                                _hover={{ bg: 'gray', color: 'white' }}
                                            />
                                        </Td>
                                    </Tr>
                                );
                            })
                        ) : (
                            <Tr>
                                <Td colSpan={4} textAlign='center'>No bottles found.</Td>
                            </Tr>
                        )}
                    </Tbody>
                </Table>
                <AddBottleModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAddSuccess={handleAddBottleSuccess}
                    wineries={wineriesData?.getWineries || []}
                    wineStyles={wineStylesData?.getWineStyles || []}
                />
            </>)}
        </Box>
    );
};

export default BrowseBottles;
