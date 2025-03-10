import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { Flex, Box, Table, Thead, Tbody, Tr, Th, Td, Text, Button } from "@chakra-ui/react";
import { FaSortUp, FaSortDown, FaSort } from "react-icons/fa";
import { capitalizeWords } from "../utils/formatting";
import BottleModal from "../components/BottleModal";

const DrankHistory = () => {
    const { user } = useUser();
    const [history, setHistory] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: "drankDate", direction: 'desc' });
    const [selectedBottle, setSelectedBottle] = useState(null); // for bottle modal

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc', // if same key, toggle direction
        }))
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

    // Sync state with user data on load
    useEffect(() => {
        if (user?.drankHistory) {
            // create a new array with nested fields flattened for sorting
            let sortedHistory = user.drankHistory.map(entry => ({
                ...entry,
                productName: entry.bottle?.productName || "",
                wineryName: entry.bottle?.winery?.name || "",
                country: entry.bottle?.country || "",
                location: entry.bottle?.location || "",
                type: entry.bottle?.wineStyle?.category || "",
                style: entry.bottle?.wineStyle?.name || "",
            }));

            sortedHistory.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                // Convert date strings to numbers
                if (sortConfig.key === "drankDate") {
                    valA = parseInt(valA);
                    valB = parseInt(valB);
                }

                // convert strings to lowercase before sorting
                if (typeof valA === "string") valA = valA.toLowerCase();
                if (typeof valB === "string") valB = valB.toLowerCase();

                // Use localeCompare for string sorting
                if (typeof valA === "string" && typeof valB === "string") {
                    return sortConfig.direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }

                return sortConfig.direction === "asc" ? valA - valB : valB - valA;
            });

            setHistory(sortedHistory);
        }
    }, [user, sortConfig]);

    return (
        <Box bg="background" p={6} borderRadius="md">
            <Text fontSize="2xl" fontWeight="bold" color="text" mb={4}>
                Drank History
            </Text>
            
            <Table variant="simple" colorScheme="primary">
                <Thead>
                    <Tr>
                        <Th color="text" cursor="pointer" onClick={()=> handleSort("drankDate")}>
                            <Flex align="center" gap={2}>
                                Drank Date {getSortIcon("drankDate")}
                            </Flex>
                        </Th>
                        <Th color="text" cursor="pointer" onClick={()=> handleSort("productName")}>
                            <Flex align="center" gap={2}>
                                Product Name{ getSortIcon("productName")}
                            </Flex>
                        </Th>
                        <Th color="text" cursor="pointer" onClick={()=> handleSort("wineryName")}>
                            <Flex align="center" gap={2}>
                                Winery {getSortIcon("wineryName")}
                            </Flex>
                        </Th>
                        <Th color="text" cursor="pointer" onClick={()=> handleSort("country")}>
                            <Flex align="center" gap={2}>
                                Country {getSortIcon("country")}
                            </Flex>
                        </Th>
                        <Th color="text" cursor="pointer" onClick={()=> handleSort("location")}>
                            <Flex align="center" gap={2}>
                                Location {getSortIcon("location")}
                            </Flex>
                        </Th>
                        <Th color="text" cursor="pointer" onClick={()=> handleSort("type")}>
                            <Flex align="center" gap={2}>
                                Type {getSortIcon("type")}
                            </Flex>
                        </Th>
                        <Th color="text" cursor="pointer" onClick={()=> handleSort("style")}>
                            <Flex align="center" gap={2}>
                                Style {getSortIcon("style")}
                            </Flex>
                        </Th>
                        <Th color="text" cursor="pointer" onClick={()=> handleSort("vintage")}>
                            <Flex align="center" gap={2}>
                                Vintage {getSortIcon("vintage")}
                            </Flex>
                        </Th>
                        <Th color="text" cursor="pointer" onClick={()=> handleSort("quantity")}>
                            <Flex align="center" gap={2}>
                                Quantity {getSortIcon("quantity")}
                            </Flex>
                        </Th>
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
                                <Td>
                                    <Button variant="link" color="blue.400" onClick={() => setSelectedBottle(entry.bottle)}>
                                        {capitalizeWords(entry.bottle.productName)}
                                    </Button>
                                </Td>
                                <Td color="text">{capitalizeWords(entry.bottle.winery.name)}</Td>
                                <Td color="text">{entry.bottle.country || "Unknown"}</Td>
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
            {selectedBottle && (
                <BottleModal
                    isOpen={!!selectedBottle}
                    onClose={() => setSelectedBottle(null)}
                    bottle={selectedBottle}
                />
            )}
        </Box>
    );
};

export default DrankHistory;