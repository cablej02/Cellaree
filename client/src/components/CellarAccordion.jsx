import { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Text, Button, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { capitalizeWords } from '../utils/formatting';
import DrinkBottleModal from './DrinkBottleModal';

const CellarAccordion = ({ cellar }) => {
    const [selectedBottle, setSelectedBottle] = useState(null);
    const [isDrinkModalOpen, setIsDrinkModalOpen] = useState(false);
    const [groupedBottles, setGroupedBottles] = useState([]);

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
    
    const openModal = (entry) => {
        setSelectedBottle(entry);
        setIsDrinkModalOpen(true);
    }

    return (
        <>
            <Accordion allowToggle>
                {groupedBottles.length > 0 ? (
                    groupedBottles.map(({ bottle, totalQuantity, entries }) => (
                        <AccordionItem key={bottle._id}>
                            <h2>
                                <AccordionButton>
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
                                <Table variant='simple' size='sm'>
                                    <Thead>
                                        <Tr>
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
                                        {entries.map((entry) => (
                                            <Tr key={entry._id}>
                                                <Td>{entry.vintage || 'N/A'}</Td>
                                                <Td>{entry.quantity}</Td>
                                                <Td>${entry.purchasePrice?.toFixed(2) || 'N/A'}</Td>
                                                <Td>${entry.currentValue?.toFixed(2) || 'N/A'}</Td>
                                                <Td>{new Date(parseInt(entry.purchaseDate)).toLocaleDateString()}</Td>
                                                <Td>{entry.notes}</Td>
                                                <Td textAlign='center'>
                                                    <Button variant='primary' size='xs' onClick={() => openModal(entry)}>Drink</Button>
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
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
        </>
    );
};

export default CellarAccordion;