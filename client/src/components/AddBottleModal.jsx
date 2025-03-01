import { useState } from 'react';
import { 
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, 
    Button, FormControl, FormLabel, Input, Select, NumberInput, NumberInputField 
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { ADD_CELLAR_BOTTLE } from '../utils/mutations';
import { useQuery } from '@apollo/client';
import { GET_BOTTLES } from '../utils/queries';
import { capitalizeWords } from '../utils/formatting';

const AddBottleModal = ({ isOpen, onClose, onSuccess }) => {
    const { data } = useQuery(GET_BOTTLES);
    const bottles = data?.getBottles || [];

    const [formData, setFormData] = useState({
        bottleId: '',
        vintage: '',
        quantity: 1,
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0], // today's date
    });
    
    const [addCellarBottle, { loading, error }] = useMutation(ADD_CELLAR_BOTTLE);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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

            console.log(variables);

            const { data } = await addCellarBottle({ variables });
            if(data?.addCellarBottle) {
                onSuccess(data.addCellarBottle);
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
                    <FormControl isRequired>
                        <FormLabel>Select Bottle</FormLabel>
                        <Select name='bottleId' value={formData.bottleId} onChange={handleChange} bg='dark' color='text'>
                            <option value='' disabled>Select a bottle</option>
                            {bottles.map((bottle) => (
                                <option key={bottle._id} value={bottle._id}>{capitalizeWords(bottle.winery.name)} - {capitalizeWords(bottle.productName)}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Vintage</FormLabel>
                        <Input type='number' name='vintage' value={formData.vintage} onChange={handleChange} />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Quantity</FormLabel>
                        <NumberInput min={1}>
                            <NumberInputField name='quantity' value={formData.quantity} onChange={handleChange} />
                        </NumberInput>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Purchase Price</FormLabel>
                        <Input type='number' name='purchasePrice' value={formData.purchasePrice} onChange={handleChange} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Purchase Date</FormLabel>
                        <Input type='date' name='purchaseDate' value={formData.purchaseDate} onChange={handleChange} />
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

export default AddBottleModal;