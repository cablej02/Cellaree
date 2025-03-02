import { useState } from 'react';
import { 
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, 
    Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, Text
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { DRINK_CELLAR_BOTTLE } from '../utils/mutations';
import { capitalizeWords } from '../utils/formatting';
import { useUser } from '../context/UserContext';

const DrinkBottleModal = ({ entry, isOpen, onClose }) => {
    const { setUser } = useUser();

    const [quantity, setQuantity] = useState(1);
    const [drankDate, setDrankDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [error, setError] = useState('');

    const [drinkCellarBottle, { loading }] = useMutation(DRINK_CELLAR_BOTTLE);

    const handleSubmit = async () => {
        if (quantity < 1 || quantity > entry.quantity) {
            setError(`Invalid quantity. You have ${entry.quantity} available.`);
            return;
        }
        setError('');

        try {
            const { data } = await drinkCellarBottle({
                variables: {
                    _id: entry._id,
                    quantity: Number(quantity),
                    drankDate
                }
            });

            // Update user context with new cellar and drank history
            if(data?.drinkCellarBottle) {
                setUser(prev => ({
                     ...prev,
                     cellar: data.drinkCellarBottle.cellar,
                     drankHistory: data.drinkCellarBottle.drankHistory
                }));
            }
            onClose();
        } catch (err) {
            console.error('Error drinking bottle:', err);
            setError('Unable to process request.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg='bgModal' color='text'>
                <ModalHeader>Drink Bottle</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text fontWeight='bold'>{capitalizeWords(entry.bottle.productName)}</Text>
                    <Text fontSize='sm' color='secondary'>
                        {capitalizeWords(entry.bottle.winery.name)} - {entry.vintage || 'N/A'}
                    </Text>
                    <FormControl mt={4} isRequired>
                        <FormLabel>Quantity</FormLabel>
                        <NumberInput min={1} max={entry.quantity} value={quantity} onChange={(value) => setQuantity(value)}>
                            <NumberInputField />
                        </NumberInput>
                    </FormControl>
                    <FormControl mt={4}>
                        <FormLabel>Drank Date</FormLabel>
                        <Input type='date' value={drankDate} onChange={(e) => setDrankDate(e.target.value)} />
                    </FormControl>
                    {error && <Text color='red.500' mt={2}>{error}</Text>}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} mr={3}>Cancel</Button>
                    <Button variant='primary' onClick={handleSubmit} isLoading={loading}>Confirm</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default DrinkBottleModal;
