import { useState } from 'react';
import { 
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, 
    Button, FormControl, FormLabel, FormErrorMessage, Input, NumberInput, NumberInputField, List, ListItem
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { ADD_CELLAR_BOTTLE } from '../utils/mutations';
import { useQuery } from '@apollo/client';
import { GET_BOTTLES } from '../utils/queries';
import { capitalizeWords } from '../utils/formatting';

const AddCellarBottleModal = ({ isOpen, onClose, onSuccess }) => {
    const { data } = useQuery(GET_BOTTLES);
    const bottles = data?.getBottles || [];

    const [formData, setFormData] = useState({
        bottleId: '',
        vintage: '',
        quantity: 1,
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0], // today's date
    });
    
    const [searchInput, setSearchInput] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [bottleIdError, setBottleIdError] = useState(''); // state for managing missing bottleId custom error message

    // mutation to add bottle to cellar
    const [addCellarBottle, { loading, error }] = useMutation(ADD_CELLAR_BOTTLE);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        setFormData((prev) => ({ ...prev, bottleId: '' })); // remove bottleId if search input changes
        const input = e.target.value;
        setSearchInput(input);
       
        const filteredBottles = [];
        for (const bottle of bottles) {
            if (
                bottle.winery.name.toLowerCase().includes(input.toLowerCase()) ||
                bottle.productName.toLowerCase().includes(input.toLowerCase()) ||
                `${bottle.winery.name} - ${bottle.productName}`.toLowerCase().includes(input.toLowerCase()) ||
                (bottle.winery.name.toLowerCase().includes(input.toLowerCase()) && bottle.productName.toLowerCase().includes(input.toLowerCase()))
            ) {
                filteredBottles.push(bottle);
                if (filteredBottles.length === 5) break; // limit search results to 5
            }
        };

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
            };

            if (formData.vintage && Number(formData.vintage) >= 1800) {
                variables.vintage = Number(formData.vintage);
            }

            const { data } = await addCellarBottle({ variables });
            if(data?.addCellarBottle) {
                onSuccess(data.addCellarBottle);

                // reset form data and modal inputs
                setFormData({
                    bottleId: '',
                    vintage: '',
                    quantity: 1,
                    purchasePrice: '',
                    purchaseDate: new Date().toISOString().split('T')[0],
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
                        <FormLabel>Search Bottle</FormLabel>
                        <Input 
                            type='text'
                            placeholder='Search for a bottle...'
                            autoComplete='off'
                            value={searchInput}
                            onChange={handleSearchChange}
                            bg='light' color='white'
                        />
                        {searchResults.length > 0 && (
                            <List bg='dark' borderRadius='md' mt={2} position="absolute" zIndex={1} w='100%'>
                                {searchResults.map((bottle) => (
                                    <ListItem 
                                        key={bottle._id}
                                        p={2}
                                        _hover={{ bg: 'light', cursor: 'pointer' }}
                                        onClick={() => handleSelectBottle(bottle._id, `${capitalizeWords(bottle.winery.name)} - ${capitalizeWords(bottle.productName)}`)}
                                    >
                                        {capitalizeWords(bottle.winery.name)} - {capitalizeWords(bottle.productName)}
                                    </ListItem>
                                ))}
                            </List>
                        )}
                        <FormErrorMessage>{bottleIdError}</FormErrorMessage>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Vintage</FormLabel>
                        <Input type='number' name='vintage' bg='light' value={formData.vintage} onChange={handleChange} />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Quantity</FormLabel>
                        <NumberInput min={1}>
                            <NumberInputField name='quantity' bg='light' value={formData.quantity} onChange={handleChange} />
                        </NumberInput>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Purchase Price</FormLabel>
                        <Input type='number' name='purchasePrice' bg='light' value={formData.purchasePrice} onChange={handleChange} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Purchase Date</FormLabel>
                        <Input type='date' name='purchaseDate' bg='light' value={formData.purchaseDate} onChange={handleChange} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} mr={3}>Cancel</Button>
                    <Button variant='primary' onClick={handleSubmit} isLoading={loading}>Add to Cellar</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddCellarBottleModal;