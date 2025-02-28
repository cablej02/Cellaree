import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Box, Text, Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel } from "@chakra-ui/react";

const Cellar = () => {
    const { user } = useUser();

    // organize bottles by bottleId
    const [groupedBottles, setGroupedBottles] = useState([]);

    useEffect(() => {
        if(user?.cellar) {
            // group entries by bottleId
            const grouped = user.cellar.reduce((acc, entry) => {
                // find group if it already exists in the accumulator
                let group = acc.find(group => group.bottle._id === entry.bottle._id);

                // if bottleId not in accumulator, add new group
                if(!group) {
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
            setGroupedBottles(grouped);
        }
    } , [user]);

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
                                        {bottle.winery.name} - {bottle.wineStyle.name} ({totalQuantity} bottles)
                                    </Text>
                                </Box>
                                <AccordionIcon />
                            </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                            {entries.map((entry) => (
                                <Box key={entry._id} p={2} borderBottom='1px solid gray'>
                                    <Text>Vintage: {entry.vintage || 'N/A'}</Text>
                                    <Text>Quantity: {entry.quantity}</Text>
                                    <Text>Purchase Price: ${entry.purchasePrice?.toFixed(2) || 'N/A'}</Text>
                                    <Text>Current Value: ${entry.currentValue?.toFixed(2) || 'N/A'}</Text>
                                    <Text>Purchase Date: {new Date(parseInt(entry.purchaseDate)).toLocaleDateString()}</Text>
                                </Box>
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

export default Cellar;