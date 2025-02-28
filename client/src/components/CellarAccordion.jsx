import { Box, Flex, Text, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from "@chakra-ui/react";

const CellarAccordion = ({ groupedBottles}) => {
    return (
        <Accordion allowMultiple>
            {groupedBottles.length > 0 ? (
                groupedBottles.map(({ bottle, totalQuantity, entries }) => (
                    <AccordionItem key={bottle._id}>
                        <h2>
                            <AccordionButton>
                                <Box flex='1' textAlign='left'>
                                    <Text fontWeight='bold'>{bottle.productName}</Text>
                                    <Text fontSize='sm' color='gray.500'>
                                        {bottle.winery.name} - {bottle.wineStyle.name} ({totalQuantity === 1 ? '1 bottle' : `${totalQuantity} bottles`})
                                    </Text>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            {entries.map((entry) => (
                                <Flex key={entry._id} p={2} borderBottom='1px solid gray' justifyContent='space-between' wrap='wrap'>
                                    <Text flex='1'>Vintage: {entry.vintage || 'N/A'}</Text>
                                    <Text flex='1'>Quantity: {entry.quantity}</Text>
                                    <Text flex='1'>Purchase Price: ${entry.purchasePrice?.toFixed(2) || 'N/A'}</Text>
                                    <Text flex='1'>Current Value: ${entry.currentValue?.toFixed(2) || 'N/A'}</Text>
                                    <Text flex='1'>Purchase Date: {new Date(parseInt(entry.purchaseDate)).toLocaleDateString()}</Text>
                                </Flex>
                            ))}
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