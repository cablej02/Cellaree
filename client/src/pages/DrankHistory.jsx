import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Text } from "@chakra-ui/react";

import { capitalizeWords } from "../utils/formatting";

const DrankHistory = () => {
    const { user } = useUser();
    const [history, setHistory] = useState([]);

    // Sync state with user data on load
    useEffect(() => {
        if (user?.drankHistory) {
            setHistory(user.drankHistory);
        }
    }, [user]);

    return (
        <Box bg="background" p={6} borderRadius="md">
            <Text fontSize="2xl" fontWeight="bold" color="text" mb={4}>
                Drank History
            </Text>
            
            <Table variant="simple" colorScheme="primary">
                <Thead>
                    <Tr>
                        <Th color="text">Drank Date</Th>
                        <Th color="text">Product Name</Th>
                        <Th color="text">Winery</Th>
                        <Th color="text">Country</Th>
                        <Th color="text">Location</Th>
                        <Th color="text">Type</Th>
                        <Th color="text">Style</Th>
                        <Th color="text">Vintage</Th>
                        <Th color="text">Quantity</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {history.length > 0 ? (
                        history.map((entry) => (
                            <Tr key={entry._id}>
                                <Td color="text">
                                    {entry.drankDate && !isNaN(parseInt(entry.drankDate))
                                        ? new Date(parseInt(entry.drankDate)).toLocaleDateString()
                                        : "Invalid Date"
                                    }
                                </Td>
                                <Td color="text">{capitalizeWords(entry.bottle.productName)}</Td>
                                <Td color="text">{capitalizeWords(entry.bottle.winery.name)}</Td>
                                <Td color="text">{entry.bottle.winery.countries?.join(", ") || "Unknown"}</Td>
                                <Td color="text">{entry.bottle.location || "Unknown" }</Td>
                                <Td color="text">{entry.bottle.wineStyle.category}</Td>
                                <Td color="text">{entry.bottle.wineStyle.name}</Td>
                                <Td color="text">{entry.vintage || "N/A"}</Td>
                                <Td color="text">{entry.quantity}</Td>
                            </Tr>
                        ))
                    ) : (
                        <Tr>
                            <Td colSpan={5} textAlign="center" color="text">
                                No history recorded yet.
                            </Td>
                        </Tr>
                    )}
                </Tbody>
            </Table>
        </Box>
    );
};

export default DrankHistory;