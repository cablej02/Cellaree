import { useQuery } from '@apollo/client';
import { GET_BOTTLES } from '../utils/queries';
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';
import { capitalizeWords } from '../utils/formatting';

const BrowseBottles = () => {
    const { data, loading, error } = useQuery(GET_BOTTLES);
    const bottles = data?.getBottles || [];

    if (loading) return <Text>Loading bottles...</Text>;
    if (error) return <Text color='red.500'>Error loading bottles.</Text>;

    return (
        <Box maxW='1000px' mx='auto' p={4}>
            <Button variant='primary' mb={4}>Add New Bottle</Button>
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
        </Box>
    );
};

export default BrowseBottles;
