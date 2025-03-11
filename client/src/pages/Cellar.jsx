import { useState } from "react";
import { useQuery } from "@apollo/client";
import { useUser } from "../context/UserContext";
import { Box, Heading, Button, HStack, Switch, Text, Input, InputGroup, InputRightElement, Menu, MenuList, MenuButton, MenuItem, Checkbox } from "@chakra-ui/react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

import { normalizeText } from "../utils/formatting";
import { GET_WINE_STYLES } from "../utils/queries";
import CellarAccordion from "../components/CellarAccordion";
import CellarTable from "../components/CellarTable";
import AddCellarBottleModal from "../components/AddCellarBottleModal";

const CATEGORY_ORDER = ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified", "Other"];

const Cellar = () => {
    const { user, setUser } = useUser();
    const { data } = useQuery(GET_WINE_STYLES);
    const wineStyles = data?.getWineStyles || [];
    const wineCategories = data?.getWineStyles ? [...new Set(wineStyles.map(style => style.category))] : []; // get unique categories

    // toggle state for view
    const [isTableView, setIsTableView] = useState(false);

    // open modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // search query state
    const [searchQuery, setSearchQuery] = useState("");

    // filter states
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStyles, setSelectedStyles] = useState([]);
    
    // handle category selection
    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            // if category already selected, remove it.  Otherwise, add it
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    // apply filtering
    let filteredCellar = user?.cellar.filter(entry => {
        const normalizedQuery = normalizeText(searchQuery);
        return (!searchQuery || 
            normalizeText(entry.bottle.productName).includes(normalizedQuery) ||
            normalizeText(entry.bottle.winery.name).includes(normalizedQuery) ||
            normalizeText(entry.bottle.wineStyle.name).includes(normalizedQuery) ||
            normalizeText(entry.bottle.country).includes(normalizedQuery) ||
            normalizeText(entry.bottle.location).includes(normalizedQuery)
        ) && (!selectedCategories.length || selectedCategories.includes(entry.bottle.wineStyle.category)) // if none selected or category matches
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
                        <InputGroup>
                            <Input 
                                placeholder="Search..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                bg="dark"
                                color="text"
                            />
                            <InputRightElement pointerEvents="none">
                                <FaSearch color="text" />
                            </InputRightElement>
                        </InputGroup>
                    </HStack>
                </HStack>

                {/* Third Row */}
                <HStack justifyContent={"space-between"} mb={4}>
                    <HStack>
                        <Text fontWeight="bold">Table View</Text>
                        <Switch isChecked={isTableView} onChange={() => setIsTableView(!isTableView)}/>
                    </HStack>
                    <Menu closeOnSelect={false}>
                        <MenuButton as={Button} variant="primary" rightIcon={<FaChevronDown />}>Category</MenuButton>
                        <MenuList bg="dark" color="text">
                            {CATEGORY_ORDER.map(category => (
                                <MenuItem key={category} onClick={() => toggleCategory(category)} bg="transparent" _hover={{ bg: "light" }}>
                                    <Checkbox isChecked={selectedCategories.includes(category)} mr={2} colorScheme="primary" />
                                    {category}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
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