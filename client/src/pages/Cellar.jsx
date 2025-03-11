import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Box, Heading, Button, HStack, Switch, Text, Input } from "@chakra-ui/react";
import { normalizeText } from "../utils/formatting";
import CellarAccordion from "../components/CellarAccordion";
import CellarTable from "../components/CellarTable";
import AddCellarBottleModal from "../components/AddCellarBottleModal";

const Cellar = () => {
    const { user, setUser } = useUser();

    // toggle state for view
    const [isTableView, setIsTableView] = useState(false);

    // open modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // search query state
    const [searchQuery, setSearchQuery] = useState("");
     
    // apply filtering
    let filteredCellar = user?.cellar.filter(entry => {
        const normalizedQuery = normalizeText(searchQuery);
        return (!searchQuery || 
            normalizeText(entry.bottle.productName).includes(normalizedQuery) ||
            normalizeText(entry.bottle.winery.name).includes(normalizedQuery) ||
            normalizeText(entry.bottle.wineStyle.name).includes(normalizedQuery) ||
            normalizeText(entry.bottle.country).includes(normalizedQuery) ||
            normalizeText(entry.bottle.location).includes(normalizedQuery)
        )
    }) || [];

    const handleAddBottleSuccess = (newBottle) => {
        // if bottle already exists, do nothing.  Apollo cache will update automatically
        if(user.cellar.some(entry => entry._id === newBottle._id)) return;
        
        // add new bottle to user context
        setUser(prev => ({ ...prev, cellar: [...prev.cellar, newBottle] })); 
    };

    return (
        <>
            <Box maxW='1000px' mx='auto' p={4}>
                {/* Header Row */}
                <HStack justifyContent="space-between">
                    <Heading as='h1' mb={4}>My Cellar</Heading>
                    <Text fontWeight="bold">Total Bottles: {filteredCellar.length}</Text>
                </HStack>

                {/* Second Row */}
                <HStack justifyContent="space-between" mb={4}>
                    <Button variant='primary' mb={4} onClick={() => setIsModalOpen(true)}>Add Bottle</Button>
                    <HStack>
                        <Input 
                            placeholder="Search..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </HStack>
                </HStack>

                {/* Third Row */}
                <HStack justifyContent={"space-between"} mb={4}>
                    <HStack>
                        <Text fontWeight="bold">Table View</Text>
                        <Switch isChecked={isTableView} onChange={() => setIsTableView(!isTableView)}/>
                    </HStack>
                </HStack>
            </Box>

            {/* Table or Accordion */}
            <Box mx='auto' px={4}>
                {isTableView ?
                    <CellarTable cellar={filteredCellar} /> :
                    <CellarAccordion cellar={filteredCellar} />
                }
            </Box>

            {/* Modal */}
            <AddCellarBottleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAddBottleSuccess} 
            />
        </>
    );
};

export default Cellar;