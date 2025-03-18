import { useEffect, useState } from 'react';
import { 
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter,
    Button, FormControl, FormLabel, FormErrorMessage, Input, NumberInput, NumberInputField,
    List, ListItem, VStack,  Box, Text, InputLeftElement, InputGroup
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { ADD_CELLAR_BOTTLE, UPDATE_CELLAR_BOTTLE, REMOVE_CELLAR_BOTTLE } from '../utils/mutations';
import { useQuery } from '@apollo/client';
import { GET_BOTTLES } from '../utils/queries';
import { normalizeText } from "@shared/utils/formatting";
import { useUser } from '../context/UserContext';

const CellarBottleModal = ({ isOpen, onClose, entry = null }) => {
    const { setUser } = useUser();
    const { data } = useQuery(GET_BOTTLES, { fetchPolicy: 'network-only' });
    const bottles = data?.getBottles || [];

    const [formData, setFormData] = useState({
        bottleId: '',
        vintage: '',
        quantity: 1,
        purchasePrice: '',
        currentValue: '',
        purchaseDate: new Date().toISOString().split('T')[0], // today's date
        notes: '',
    });
    
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [bottleIdError, setBottleIdError] = useState(''); // state for managing missing bottleId custom error message

    // mutation to add bottle to cellar
    const [addCellarBottle, { loading, error }] = useMutation(ADD_CELLAR_BOTTLE);
    const [updateCellarBottle] = useMutation(UPDATE_CELLAR_BOTTLE);
    const [removeCellarBottle] = useMutation(REMOVE_CELLAR_BOTTLE);

    // populate form data if editing an existing entry
    useEffect(() => {
        if (entry) {
            setFormData({
                bottleId: entry.bottle._id,
                vintage: entry.vintage || '',
                quantity: entry.quantity,
                purchasePrice: entry.purchasePrice || '',
                currentValue: entry.currentValue || '',
                purchaseDate: new Date(parseInt(entry.purchaseDate)).toISOString().split('T')[0],
                notes: entry.notes || '',
            });
        }
    }, [entry]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        setFormData((prev) => ({ ...prev, bottleId: '' })); // remove bottleId if search input changes
        const input = e.target.value;
        setSearchInput(input);
       
        const filteredBottles = !input ? [] : bottles.filter((bottle) => {
            const normalizedInput = normalizeText(input);
            return (
                normalizeText(bottle.winery.name).includes(normalizedInput) ||
                normalizeText(bottle.productName).includes(normalizedInput) ||
                normalizeText(`${bottle.winery.name} - ${bottle.productName}`).includes(normalizedInput)
            );
        });
        filteredBottles.sort((a, b) => a.winery.name.localeCompare(b.winery.name));
        setSearchResults(filteredBottles);
    };

    const handleSelectBottle = (bottleId, bottleName) => {
        setSearchInput(bottleName); // set search input to selected bottle name
        setSearchResults([]); // clear search results
        setFormData((prev) => ({ ...prev, bottleId })); // set bottleId in form data
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // validate bottleId exists
        if (!formData.bottleId) {
            setBottleIdError('Please select a bottle before submitting.');
            return;
        }
        setBottleIdError('');

        try {
            const variables = {
                bottle: formData.bottleId,
                quantity: Number(formData.quantity),
                purchasePrice: Number(formData.purchasePrice) || 0,
                purchaseDate: formData.purchaseDate,
                notes: formData.notes
            };

            if (formData.vintage && Number(formData.vintage) >= 1800) {
                variables.vintage = Number(formData.vintage);
            }

            let success = false;
            if (entry) {
                if(parseInt(formData.quantity) === 0) {
                    const { data } = await removeCellarBottle({ variables: { _id: entry._id } });
                    success = !!data?.removeCellarBottle;

                    // update user context if successful
                    if(data?.removeCellarBottle) {
                        setUser((prev) => ({
                            ...prev,
                            cellar: prev.cellar.filter((entry) => entry._id !== data.removeCellarBottle._id)
                        }));
                    }
                } else{
                    variables._id = entry._id;
                    variables.currentValue = Number(formData.currentValue) || Number(formData.purchasePrice) || 0;
                    const { data } = await updateCellarBottle({ variables });
                    success = !!data?.updateCellarBottle;
                    if(data?.updateCellarBottle) {
                        setUser((prev) => ({
                            ...prev,
                            cellar: prev.cellar.map((entry) => entry._id === data.updateCellarBottle._id ? data.updateCellarBottle : entry)
                        }));
                    }
                }
            } else {
                const { data } = await addCellarBottle({ variables });
                success = !!data?.addCellarBottle;
                if(data?.addCellarBottle) {
                    setUser((prev) => ({
                        ...prev,
                        cellar: [...prev.cellar, data.addCellarBottle]
                    }));
                }
            }

            // reset form data and modal inputs
            if(success) {
                setFormData({
                    bottleId: '',
                    vintage: '',
                    quantity: 1,
                    purchasePrice: '',
                    currentValue: '',
                    purchaseDate: new Date().toISOString().split('T')[0],
                    notes: '',
                });
                setSearchInput('');
                setSearchResults([]);
                
                onClose();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg='bgModal' color='text'>
                <ModalHeader>Add Bottle to Cellar</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                <FormControl isRequired isInvalid={!!bottleIdError} position="relative">
                        <FormLabel>Bottle</FormLabel>
                        {/* If editing entry, we cannot change bottle */}
                        {entry ? (
                            <Text mb={1}>{entry.bottle.winery.name} - {entry.bottle.productName}</Text>
                        ) : (
                            <Input 
                                type='text'
                                placeholder='Search for a bottle...'
                                autoComplete='off'
                                value={searchInput}
                                onChange={handleSearchChange}
                                bg='light' color='white'
                            />
                        )}
                        <Box maxH="250px" overflowY="auto" position="absolute" w='100%' zIndex={1}>
                            <VStack align='stretch' spacing={0}>
                                {searchResults.length > 0 && (
                                    <List bg='dark' borderRadius='md' mt={2}>
                                        {searchResults.map((bottle) => {
                                            const displayName = bottle.productName ? `${bottle.winery.name} - ${bottle.productName}` : `${bottle.winery.name} - ${bottle.wineStyle.name}`;
                                            return (<ListItem 
                                                key={bottle._id}
                                                p={2}
                                                _hover={{ bg: 'light', cursor: 'pointer' }}
                                                onClick={() => handleSelectBottle(bottle._id, displayName)}
                                            >
                                                {displayName}
                                            </ListItem>
                                        )})}
                                    </List>
                                )}
                            </VStack>
                        </Box>
                        <FormErrorMessage>{bottleIdError}</FormErrorMessage>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Vintage</FormLabel>
                        <Input type='number' name='vintage' bg='light' value={formData.vintage} onChange={handleChange} />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Quantity</FormLabel>
                        <NumberInput min={0} value={formData.quantity} onChange={(valueString, valueNumber) => setFormData(prev => ({ ...prev, quantity: valueNumber || 0 }))}>
                            <NumberInputField name="quantity" bg="light" />
                        </NumberInput>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Purchase Price</FormLabel>
                        <InputGroup>
                            <InputLeftElement pointerEvents="none" color="text" fontSize="1.1em">$</InputLeftElement>
                            <Input type='number' name='purchasePrice' bg='light' value={formData.purchasePrice} onChange={handleChange} />
                        </InputGroup>
                    </FormControl>
                    {entry && (
                        <FormControl>
                            <FormLabel>Current Value</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none" color="text" fontSize="1.1em">$</InputLeftElement>
                                <Input type='number' name='currentValue' bg='light' value={formData.currentValue} onChange={handleChange} />
                            </InputGroup>
                        </FormControl>
                    )}
                    <FormControl>
                        <FormLabel>Purchase Date</FormLabel>
                        <Input type='date' name='purchaseDate' bg='light' value={formData.purchaseDate} onChange={handleChange} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Notes</FormLabel>
                        <Input type='text' name='notes' bg='light' value={formData.notes} onChange={handleChange} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} mr={3}>Cancel</Button>
                    <Button variant='primary' onClick={handleSubmit} isLoading={loading}>
                        {entry ? 'Update' : 'Add to Cellar'}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CellarBottleModal;