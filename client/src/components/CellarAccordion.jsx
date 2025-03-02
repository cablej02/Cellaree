import { useMutation } from '@apollo/client';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Text, Button, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { capitalizeWords } from '../utils/formatting';
import { DRINK_CELLAR_BOTTLE } from '../utils/mutations';

const CellarAccordion = ({ groupedBottles}) => {
    const [drinkCellarBottle] = useMutation(DRINK_CELLAR_BOTTLE);

    const handleDrinkBottle = async (entry) => {
        console.log("Drinking bottle:", entry);
        const variables = {
            _id: entry._id,
            quantity: 1,
        }
        const { data } = await drinkCellarBottle({
            variables
        });
        console.log(data);
    }

    return (
        <Accordion allowToggle>
            {groupedBottles.length > 0 ? (
                groupedBottles.map(({ bottle, totalQuantity, entries }) => (
                    <AccordionItem key={bottle._id}>
                        <h2>
                            <AccordionButton>
                                <Box flex='1' textAlign='left'>
                                    <Text fontWeight='bold'>{capitalizeWords(bottle.productName)}</Text>
                                    <Text fontSize='sm' color='secondary'>
                                        {capitalizeWords(bottle.winery.name)} - {bottle.winery.countries?.join(", ") || ""} - {bottle.location} - {bottle.wineStyle.name} ({totalQuantity === 1 ? '1 bottle' : `${totalQuantity} bottles`})
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
                                            <Td>
                                                <Button variant='secondary' size='xs' onClick={() => handleDrinkBottle(entry)}>Drink</Button>
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
    );
};

export default CellarAccordion;