import { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Box, Text, Button, Flex } from '@chakra-ui/react';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import DrinkBottleModal from './DrinkBottleModal';
import BottleModal from './BottleModal';
import CellarBottleModal from './CellarBottleModal';

const CellarTable = ({ cellar }) => {
    const [selectedBottle, setSelectedBottle] = useState(null);
    const [isDrinkModalOpen, setIsDrinkModalOpen] = useState(false);
    const [isBottleModalOpen, setIsBottleModalOpen] = useState(false);
    const [isCellarBottleModalOpen, setIsCellarBottleModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'purchaseDate', direction: 'desc' });
    
    const openDrinkModal = (entry) => {
        setSelectedBottle(entry);
        setIsDrinkModalOpen(true);
    }

    const openBottleModal = (entry) => {
        setSelectedBottle(entry);
        setIsBottleModalOpen(true);
    }

    const openCellarBottleModal = (entry) => {
        setSelectedBottle(entry);
        setIsCellarBottleModalOpen(true);
    }

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
        }
        return <FaSort />;
    };

    const sortedCellar = cellar.map(entry => ({
        ...entry,
        // flatten nested fields for sorting
        winery: entry.bottle.winery.name,
        product: entry.bottle.productName,
        style: entry.bottle.wineStyle.name,
        country: entry.bottle.country,
        location: entry.bottle.location,
    })).sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === "purchaseDate") {
            valA = parseInt(valA);
            valB = parseInt(valB);
        }

        // push bottles with no vintage to end
        if (sortConfig.key === "vintage") {
            if (!valA) valA = sortConfig.direction === "asc" ? 9999 : -1;
            if (!valB) valB = sortConfig.direction === "asc" ? 9999 : -1;
            return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        } else if (typeof valA === "string" && typeof valB === "string") {
            // localeCompare is case insensitive and handles special characters
            return sortConfig.direction === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortConfig.direction === "asc" ? valA - valB : valB - valA;
    });

    return (
        <Box>
            {sortedCellar.length > 0 ? (
                <Table variant='simple' size='sm' colorScheme="primary">
                    <Thead>
                        <Tr>
                            <Th color="tertiary" cursor="pointer" onClick={() => handleSort("winery")}> 
                                <Flex align="center"> Winery {getSortIcon("winery")} </Flex>
                            </Th>
                            <Th color="tertiary" cursor="pointer" onClick={() => handleSort("product")}> 
                                <Flex align="center"> Product {getSortIcon("product")} </Flex>
                            </Th>
                            <Th color="tertiary" cursor="pointer" onClick={() => handleSort("style")}> 
                                <Flex align="center"> Style {getSortIcon("style")} </Flex>
                            </Th>
                            <Th color="tertiary" cursor="pointer" onClick={() => handleSort("vintage")}> 
                                <Flex align="center"> Vintage {getSortIcon("vintage")} </Flex>
                            </Th>
                            <Th color="tertiary" cursor="pointer" onClick={() => handleSort("country")}> 
                                <Flex align="center"> Country {getSortIcon("country")} </Flex>
                            </Th>
                            <Th color="tertiary" cursor="pointer" onClick={() => handleSort("location")}> 
                                <Flex align="center"> Location {getSortIcon("location")} </Flex>
                            </Th>
                            <Th color="tertiary" cursor="pointer" onClick={() => handleSort("quantity")}> 
                                <Flex align="center"> Quantity {getSortIcon("quantity")} </Flex>
                            </Th>
                            <Th color="tertiary" cursor="pointer" onClick={() => handleSort("purchasePrice")}> 
                                <Flex align="center"> Purchase Price {getSortIcon("purchasePrice")} </Flex>
                            </Th>
                            <Th color="tertiary" cursor="pointer" onClick={() => handleSort("currentValue")}> 
                                <Flex align="center"> Current Value {getSortIcon("currentValue")} </Flex>
                            </Th>
                            <Th color="tertiary" cursor="pointer" onClick={() => handleSort("purchaseDate")}> 
                                <Flex align="center"> Purchase Date {getSortIcon("purchaseDate")} </Flex>
                            </Th>
                            <Th color="tertiary">Notes</Th>
                            <Th color="tertiary">Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {sortedCellar.map(entry => (
                            <Tr key={entry._id}>
                                <Td maxW="110px">{entry.bottle.winery.name}</Td>
                                {/* <Td maxWidth="120px" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap"> */}
                                <Td 
                                    maxW="160px" 
                                    whiteSpace="normal" 
                                    cursor="pointer" 
                                    color="blue.400" 
                                    _hover={{ textDecoration: "underline" }} 
                                    onClick={() => openBottleModal(entry)}
                                >
                                    {entry.bottle.productName ? entry.bottle.productName : `${entry.bottle.wineStyle.name}`}
                                </Td>
                                <Td maxW="100px">{entry.bottle.wineStyle.name}</Td>
                                <Td>{entry.vintage || 'NV'}</Td>
                                <Td maxW="110px">{entry.bottle.country}</Td>
                                <Td maxW="110px">{entry.bottle.location}</Td>
                                <Td>{entry.quantity}</Td>
                                <Td>${entry.purchasePrice?.toFixed(2) || 'N/A'}</Td>
                                <Td>${entry.currentValue?.toFixed(2) || 'N/A'}</Td>
                                <Td>{new Date(parseInt(entry.purchaseDate)).toLocaleDateString()}</Td>
                                <Td maxW="150px">{entry.notes}</Td>
                                <Td textAlign='center'>
                                    <Flex justifyContent='center' gap={1}>
                                        <Button variant='solid' color="text" bg="green" _hover={{bg: "green.400"}} size='xs' onClick={() => openCellarBottleModal(entry)}>Edit</Button>
                                        <Button variant='primary' size='xs' onClick={() => openDrinkModal(entry)}>Drink</Button>
                                    </Flex>
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

export default CellarTable;