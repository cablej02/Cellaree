import { useState } from "react";
import { useQuery } from "@apollo/client";
import { useUser } from "../context/UserContext";
import { 
    Box, Heading, Button, HStack, Switch, Text, Input, InputGroup, InputRightElement, 
    Menu, MenuList, MenuButton, MenuItem, Checkbox, useBreakpointValue } from "@chakra-ui/react";
import { FaChevronDown, FaSearch } from "react-icons/fa";

import { normalizeText } from "../utils/formatting";
import { GET_WINE_STYLES } from "../utils/queries";
import CellarAccordion from "../components/CellarAccordion";
import CellarTable from "../components/CellarTable";
import CellarBottleModal from "../components/CellarBottleModal";

const CATEGORY_ORDER = ["Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified", "Other"];

const Cellar = () => {
    const { user } = useUser();
    const { data } = useQuery(GET_WINE_STYLES);

    // detect if screen is mobile
    const isMobile = useBreakpointValue({ base: true, md: false });

    // toggle state for view
    const [isTableView, setIsTableView] = useState(false);

    // open modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    // search query state
    const [searchQuery, setSearchQuery] = useState("");

    // filter states
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStyles, setSelectedStyles] = useState([]);

    // extract styles based on selected categories
    const wineStyles = data?.getWineStyles?.filter(style =>
        selectedCategories.length === 0 || selectedCategories.includes(style.category)
    ) || [];
    
    // handle category selection
    const toggleCategory = (category) => {
        setSelectedCategories(prev => {
            const newCategories = prev.includes(category) 
                ? prev.filter(c => c !== category) 
                : [...prev, category];
            
            // Remove styles that no longer belong to any selected categories
            const validStyles = wineStyles
                .filter(style => newCategories.includes(style.category))
                .map(style => style.name);
            
            setSelectedStyles(prevStyles => prevStyles.filter(style => validStyles.includes(style)));
            return newCategories;
        });
    };

    // handle style selection
    const toggleStyle = (style) => {
        setSelectedStyles(prev =>
            prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
        );
    };

    // clear category filters
    const clearCategories = () => {
        setSelectedCategories([]);
        setSelectedStyles([]);
    };

    // clear style filters
    const clearStyles = () => {
        setSelectedStyles([]);
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
        && (!selectedStyles.length || selectedStyles.includes(entry.bottle.wineStyle.name)); // if none selected or style matches
    }) || [];

    return (
        <>
            <Box maxW='1000px' mx='auto' p={4}>
                {/* Header Row */}
                <HStack justifyContent="space-between" mb={3}>
                    <Heading as='h1'>My Cellar</Heading>
                    {!isMobile &&
                        <HStack>
                            <Text fontWeight="bold">Table View</Text>
                            <Switch isChecked={isTableView} onChange={() => setIsTableView(!isTableView)}/>
                        </HStack>
                    }
                    <HStack>
                        <InputGroup>
                            <Input 
                                placeholder="Search..." 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)}
                                bg="dark"
                                color="text"
                                maxW="40vw"
                            />
                            <InputRightElement pointerEvents="none">
                                <FaSearch color="text" />
                            </InputRightElement>
                        </InputGroup>
                    </HStack>
                </HStack>

                {/* Second Row */}
                <HStack justifyContent={"space-between"} mb={4}>
                    <Button variant='primary' onClick={() => setIsModalOpen(true)}>
                        <Text fontSize="sm">Add Bottle</Text>
                    </Button>
                    <HStack>
                        {/* Style Filter Menu */}
                        <Menu closeOnSelect={false}>
                            <MenuButton as={Button} variant="primary" rightIcon={<FaChevronDown />} minW="100px">
                                <Text fontSize="sm">Style {selectedStyles.length ? `(${selectedStyles.length})`: ""}</Text>
                            </MenuButton>
                            <MenuList bg="dark" color="text" maxH="50vh" overflowY="auto">
                                <MenuItem
                                    onClick={clearStyles} 
                                    fontWeight="bold" 
                                    bg="transparent" 
                                    color="primary.200" 
                                    justifyContent="center" 
                                    _hover={{ bg: "light" }} 
                                    _active={{ bg: "primary.100", transition: "background-color 0.3s ease-in-out" }}
                                >
                                    Clear All
                                </MenuItem>
                                {wineStyles.map(style => (
                                    <MenuItem key={style.name} onClick={() => toggleStyle(style.name)} bg="transparent" _hover={{ bg: "light" }}>
                                        <Checkbox isChecked={selectedStyles.includes(style.name)} mr={2} colorScheme="primary" />
                                        {style.name}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </Menu>
                        {/* Category Filter Menu */}
                        <Menu closeOnSelect={false}>
                            <MenuButton as={Button} variant="primary" rightIcon={<FaChevronDown />} minW="130px">
                                <Text fontSize="sm">Category {selectedCategories.length ? `(${selectedCategories.length})` : ""}</Text>
                            </MenuButton>
                            <MenuList bg="dark" color="text">
                            <MenuItem
                                    onClick={clearCategories} 
                                    fontWeight="bold" 
                                    bg="transparent" 
                                    color="primary.200" 
                                    justifyContent="center" 
                                    _hover={{ bg: "light" }} 
                                    _active={{ bg: "primary.100", transition: "background-color 0.3s ease-in-out" }}
                                >
                                    Clear All
                                </MenuItem>
                                {CATEGORY_ORDER.map(category => (
                                    <MenuItem key={category} onClick={() => toggleCategory(category)} bg="transparent" _hover={{ bg: "light" }}>
                                        <Checkbox isChecked={selectedCategories.includes(category)} mr={2} colorScheme="primary" />
                                        {category}
                                    </MenuItem>
                                ))}
                            </MenuList>
                        </Menu>
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
            <CellarBottleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default Cellar;