import { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Text, Button, VStack, Flex } from '@chakra-ui/react';
import { capitalizeWords } from '../utils/formatting';
import DrinkBottleModal from './DrinkBottleModal';
import CellarBottleModal from './CellarBottleModal';

const CellarAccordion = ({ cellar }) => {
    const [selectedBottle, setSelectedBottle] = useState(null);
    const [isDrinkModalOpen, setIsDrinkModalOpen] = useState(false);
    const [isCellarBottleModalOpen, setIsCellarBottleModalOpen] = useState(false);
    const [groupedBottles, setGroupedBottles] = useState([]);

    const openDrinkModal = (entry) => {
        setSelectedBottle(entry);
        setIsDrinkModalOpen(true);
    }

    const openCellarBottleModal = (entry) => {
        setSelectedBottle(entry);
        setIsCellarBottleModalOpen(true);
    }

    useEffect(() => {
        if (cellar.length > 0) {
            // group entries by bottleId
            const grouped = cellar.reduce((acc, entry) => {
                // find group if it already exists in the accumulator
                let group = acc.find(group => group.bottle._id === entry.bottle._id);
                
                // if bottleId not in accumulator, add new group
                if (!group) {
                    group = {
                        bottle: entry.bottle,
                        totalQuantity: 0,
                        entries: [],
                    };
                    acc.push(group);
                }
                
                // add entry to group and increment total quantity
                group.totalQuantity += entry.quantity;
                group.entries.push(entry);
                return acc;
            }, []);

            // sort by vintage. if no vintage, put at end
            grouped.forEach(group => {
                group.entries.sort((a, b) => (a.vintage || 9999) - (b.vintage || 9999)); 
            });
            setGroupedBottles(grouped);
        } else {
            setGroupedBottles([]);
        }
    }, [cellar]);

    return (
        <Box maxW="600px" mx="auto">
            <Accordion allowToggle>
                {groupedBottles.length > 0 ? (
                    groupedBottles.map(({ bottle, totalQuantity, entries }) => (
                        <AccordionItem key={bottle._id}>
                            <h2>
                                <AccordionButton color='primary.200'>
                                    <Box flex='1' textAlign='left'>
                                        <Text fontWeight='bold'>{capitalizeWords(bottle.productName)}</Text>
                                        <Text fontSize='sm' color='secondary'>
                                            {capitalizeWords(bottle.winery.name)} - {bottle.country} - {bottle.location} - {bottle.wineStyle.name} ({totalQuantity === 1 ? '1 bottle' : `${totalQuantity} bottles`})
                                        </Text>
                                    </Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <VStack spacing={3} align="stretch">
                                    {entries.map((entry) => (
                                        <Box key={entry._id} p={3} bg="dark" borderRadius="xl" fontSize='sm'>
                                            <Flex justify="space-between" fontWeight="bold">
                                                <Text>Vintage:</Text>
                                                <Text>{entry.vintage || 'NV'}</Text>
                                            </Flex>
                                            <Flex justify="space-between">
                                                <Text>Quantity:</Text>
                                                <Text>{entry.quantity}</Text>
                                            </Flex>
                                            <Flex justify="space-between">
                                                <Text>Purchase Price:</Text>
                                                <Text>${entry.purchasePrice?.toFixed(2)}</Text>
                                            </Flex>
                                            <Flex justify="space-between">
                                                <Text>Current Value:</Text>
                                                <Text>${entry.currentValue?.toFixed(2)}</Text>
                                            </Flex>
                                            <Flex justify="space-between">
                                                <Text>Purchase Date:</Text>
                                                <Text>{new Date(parseInt(entry.purchaseDate)).toLocaleDateString()}</Text>
                                            </Flex>
                                            {entry.notes && (
                                                <Flex justify="space-between">
                                                    <Text>Notes:</Text>
                                                    <Text>{entry.notes}</Text>
                                                </Flex>
                                            )}
                                            <Flex justify="end" gap={3} mt={2}>
                                                <Button variant='solid' bg="green" _hover={{bg: "green.500"}} size='sm' onClick={() => openCellarBottleModal(entry)}>Edit</Button>
                                                <Button variant='primary' size='sm' onClick={() => openDrinkModal(entry)}>Drink</Button>
                                            </Flex>
                                        </Box>
                                    ))}
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>
                    ))
                ) : (
                    <Text>No bottles in your cellar.</Text>
                )}
            </Accordion>
            {selectedBottle && (
                <DrinkBottleModal 
                    isOpen={isDrinkModalOpen} 
                    onClose={() => setIsDrinkModalOpen(false)} 
                    entry={selectedBottle} 
                />
            )}
            {selectedBottle && (
                <CellarBottleModal 
                    isOpen={isCellarBottleModalOpen} 
                    onClose={() => setIsCellarBottleModalOpen(false)} 
                    entry={selectedBottle} 
                />
            )}
        </Box>
    );
};

export default CellarAccordion;