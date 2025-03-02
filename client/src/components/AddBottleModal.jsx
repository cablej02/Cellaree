import { useState } from 'react';
import { 
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, 
    Button, FormControl, FormLabel, Input, Select
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@apollo/client';
import { ADD_BOTTLE } from '../utils/mutations';
import { GET_ALLOWED_COUNTRIES } from '../utils/queries';
import { capitalizeWords } from '../utils/formatting';


const AddBottleModal = ({ isOpen, onClose, onAddSuccess, wineries, wineStyles }) => {
    const { data: countryData } = useQuery(GET_ALLOWED_COUNTRIES);
    const allowedCountries = countryData?.getAllowedCountries || [];

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
        setFormData((prev) => {
            let updatedData = { ...prev, [name]: value };

            // Auto-set productName based on winery and wineStyle
            const selectedWinery = wineries.find(w => w._id === updatedData.winery)?.name || '';
            const selectedWineStyle = wineStyles.find(s => s._id === updatedData.wineStyle)?.name || '';
            
            // if winery or wineStyle is updated, update productName
            if (name === 'winery' || name === 'wineStyle') {
                updatedData.productName = selectedWinery && selectedWineStyle
                    ? `${capitalizeWords(selectedWinery)} - ${capitalizeWords(selectedWineStyle)}`
                    : selectedWinery || selectedWineStyle;
            }

            return updatedData;
        });
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
                        <FormLabel>Winery</FormLabel>
                        <Select name='winery' value={formData.winery} onChange={handleChange} bg="dark">
                            <option value='' disabled style={{ background: '#212529', color: 'white' }}>Select a Winery</option>
                            {wineries.map((winery) => (
                                <option key={winery._id} value={winery._id} style={{ background: '#212529', color: 'white' }}>{capitalizeWords(winery.name)}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Wine Style</FormLabel>
                        <Select name='wineStyle' value={formData.wineStyle} onChange={handleChange} bg="dark">
                            <option value='' disabled style={{ background: '#212529', color: 'white' }}>Select a Wine Style</option>
                            {wineStyles.map((style) => (
                                <option key={style._id} value={style._id} style={{ background: '#212529', color: 'white' }}>{capitalizeWords(style.name)}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Country</FormLabel>
                        <Select name="country" value={formData.country} onChange={handleChange} bg="dark">
                            <option value="" disabled style={{ background: '#212529', color: 'white' }}>Select a Country</option>
                            {allowedCountries.map((country) => (
                                <option key={country} value={country} style={{ background: '#212529', color: 'white' }}>{country}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl>
                        <FormLabel>Location</FormLabel>
                        <Input name='location' value={formData.location} onChange={handleChange} bg="dark"/>
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel >Product Name</FormLabel>
                        <Input name='productName' value={formData.productName} onChange={handleChange} bg="dark"/>
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
