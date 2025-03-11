import { useState } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Text, Button } from '@chakra-ui/react';
import { capitalizeWords } from '../utils/formatting';
import DrinkBottleModal from './DrinkBottleModal';
import BottleModal from './BottleModal';

const CellarTable = ({ cellar }) => {
    const [selectedBottle, setSelectedBottle] = useState(null);
    const [isDrinkModalOpen, setIsDrinkModalOpen] = useState(false);
    const [isBottleModalOpen, setIsBottleModalOpen] = useState(false);
    
    const openDrinkModal = (entry) => {
        setSelectedBottle(entry);
        setIsDrinkModalOpen(true);
    }

    const openBottleModal = (entry) => {
        setSelectedBottle(entry);
        setIsBottleModalOpen(true);
    }

    return (
        <Box>
            {cellar.length > 0 ? (
                <Table variant='simple' size='sm'>
                    <Thead>
                        <Tr>
                            <Th color="tertiary">Winery</Th>
                            <Th color="tertiary">Product</Th>
                            <Th color="tertiary">Style</Th>
                            <Th color="tertiary">Country</Th>
                            <Th color="tertiary">Location</Th>
                            <Th color="tertiary">Vintage</Th>
                            <Th color="tertiary">Quantity</Th>
                            <Th color="tertiary">Purchase Price</Th>
                            <Th color="tertiary">Current Value</Th>
                            <Th color="tertiary">Purchase Date</Th>
                            <Th color="tertiary">Notes</Th>
                            <Th color="tertiary">Drink Bottle</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {cellar.map(entry => (
                            <Tr key={entry._id}>
                                <Td>{capitalizeWords(entry.bottle.winery.name)}</Td>
                                <Td>
                                    <Button variant='link' color='blue.400' onClick={() => openBottleModal(entry)}>
                                        {capitalizeWords(entry.bottle.productName)}
                                    </Button>
                                </Td>
                                <Td>{capitalizeWords(entry.bottle.wineStyle.name)}</Td>
                                <Td>{entry.bottle.country}</Td>
                                <Td>{entry.bottle.location}</Td>
                                <Td>{entry.vintage || 'N/A'}</Td>
                                <Td>{entry.quantity}</Td>
                                <Td>${entry.purchasePrice?.toFixed(2) || 'N/A'}</Td>
                                <Td>${entry.currentValue?.toFixed(2) || 'N/A'}</Td>
                                <Td>{new Date(parseInt(entry.purchaseDate)).toLocaleDateString()}</Td>
                                <Td>{entry.notes}</Td>
                                <Td textAlign='center'>
                                    <Button variant='primary' size='xs' onClick={() => openDrinkModal(entry)}>Drink</Button>
                                </Td>
                            </Tr>
                        ))}
                        
                    </Tbody>
                </Table>
            ) : (
                <Text>No bottles in your cellar.</Text>
            )}
            {selectedBottle && (
                <DrinkBottleModal 
                    isOpen={isDrinkModalOpen} 
                    onClose={() => setIsDrinkModalOpen(false)} 
                    entry={selectedBottle} 
                />
            )}
            {selectedBottle && (
                <BottleModal 
                    isOpen={isBottleModalOpen} 
                    onClose={() => setIsBottleModalOpen(false)} 
                    bottle={selectedBottle.bottle} 
                />
            )}
        </Box>
    );
};

export default CellarTable;