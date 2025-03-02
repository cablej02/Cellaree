import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_BOTTLES, GET_WINERIES, GET_WINE_STYLES } from '../utils/queries';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';
import { capitalizeWords } from '../utils/formatting';
import AddBottleModal from '../components/AddBottleModal';

const BrowseBottles = () => {
    const { data: bottlesData, loading, error } = useQuery(GET_BOTTLES);
    const { data: wineriesData } = useQuery(GET_WINERIES);
    const { data: wineStylesData } = useQuery(GET_WINE_STYLES);
    
    const [bottles, setBottles] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (bottlesData?.getBottles && !loading) {
            setBottles(bottlesData.getBottles); // Sync state when data loads
        }
    }, [bottlesData]);

    const handleAddBottleSuccess = (newBottle) => {
        console.log('New bottle added:', newBottle);
        setBottles((prevBottles) => [...prevBottles, newBottle]);
    };

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
                        </Tr>
                    </Thead>
                    <Tbody>
                        {bottles.length > 0 ? (
                            bottles.map((bottle) => (
                                <Tr key={bottle._id}>
                                    <Td>{capitalizeWords(bottle.productName)}</Td>
                                    <Td>{capitalizeWords(bottle.winery.name)}</Td>
                                    <Td>{bottle.wineStyle.category}</Td>
                                    <Td>{bottle.wineStyle.name}</Td>
                                    <Td>{bottle.country}</Td>
                                    <Td>{bottle.location}</Td>
                                </Tr>
                            ))
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
