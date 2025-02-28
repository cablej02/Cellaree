import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Text, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { capitalizeWords } from '../utils/formatting';

const CellarAccordion = ({ groupedBottles}) => {
    return (
        <Accordion allowMultiple>
            {groupedBottles.length > 0 ? (
                groupedBottles.map(({ bottle, totalQuantity, entries }) => (
                    <AccordionItem key={bottle._id}>
                        <h2>
                            <AccordionButton>
                                <Box flex='1' textAlign='left'>
                                    <Text fontWeight='bold'>{capitalizeWords(bottle.productName)}</Text>
                                    <Text fontSize='sm' color='secondary'>
                                        {capitalizeWords(bottle.winery.name)} - {bottle.wineStyle.name} ({totalQuantity === 1 ? '1 bottle' : `${totalQuantity} bottles`})
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