import { useState } from 'react';
import { 
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, 
    Button, FormControl, FormLabel, Input, Select
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { ADD_BOTTLE } from '../utils/mutations';
import { capitalizeWords } from '../utils/formatting';

const AddBottleModal = ({ isOpen, onClose, onAddSuccess, wineries, wineStyles }) => {
    const [formData, setFormData] = useState({
        productName: '',
        winery: '',
        wineStyle: '',
        country: '',
        location: '',
    });

    const [addBottle, { loading }] = useMutation(ADD_BOTTLE);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // TODO: Add form validation

        try {
            const { data } = await addBottle({ variables: { ...formData } });
            if (data?.addBottle) {
                onAddSuccess(data.addBottle); // Pass the new bottle to the parent component
            }
            onClose();
            setFormData({ productName: '', winery: '', wineStyle: '', country: '', location: '' }); // Reset form
        } catch (err) {
            console.error('Error adding bottle:', err);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg='bgModal' color='text'>
                <ModalHeader>Add New Bottle</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl isRequired>
                        <FormLabel>Product Name</FormLabel>
                        <Input name='productName' value={formData.productName} onChange={handleChange} />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Winery</FormLabel>
                        <Select name='winery' value={formData.winery} onChange={handleChange}>
                            <option value='' disabled>Select a winery</option>
                            {wineries.map((winery) => (
                                <option key={winery._id} value={winery._id}>{winery.name}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Wine Style</FormLabel>
                        <Select name='wineStyle' value={formData.wineStyle} onChange={handleChange}>
                            <option value='' disabled>Select a wine style</option>
                            {wineStyles.map((style) => (
                                <option key={style._id} value={style._id}>{style.name}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Country</FormLabel>
                        <Input name='country' value={formData.country} onChange={handleChange} />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Location</FormLabel>
                        <Input name='location' value={formData.location} onChange={handleChange} />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} mr={3}>Cancel</Button>
                    <Button variant='primary' onClick={handleSubmit} isLoading={loading}>Add Bottle</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddBottleModal;
