import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Select, NumberInput, NumberInputField } from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import { ADD_CELLAR_BOTTLE } from '../utils/mutations';
import { useQuery } from '@apollo/client';
import { GET_BOTTLES } from '../utils/queries';
import { useUser } from '../context/UserContext';

const AddBottleForm = ({ onSuccess }) => {
    const { data } = useQuery(GET_BOTTLES);
    const { user, setUser } = useUser();
    const bottles = data?.getBottles || [];

    const [formData, setFormData] = useState({
        bottle: '',
        vintage: '',
        quantity: 1,
        purchasePrice: '',
        purchaseDate: '',
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
                bottle: formData.bottle,
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
                setUser({ ...user, cellar: [...user.cellar, data.addCellarBottle] });
            }
            setFormData({
                bottle: '',
                vintage: '',
                quantity: 1,
                purchasePrice: '',
                purchaseDate: '',
            });
            onSuccess(); 
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Box as='form' onSubmit={handleSubmit} maxW='500px' mx='auto' p={4} borderWidth={1} borderRadius='lg'>
            <FormControl isRequired>
                <FormLabel>Select Bottle</FormLabel>
                <Select name='bottle' value={formData.bottle} onChange={handleChange}>
                    <option value='' disabled>Select a bottle</option>
                    {bottles.map((bottle) => (
                        <option key={bottle._id} value={bottle._id}>{bottle.productName} - {bottle.winery.name}</option>
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
            
            <Button mt={4} type='submit' colorScheme='blue' isLoading={loading}>
                Add to Cellar
            </Button>
            {error && <p style={{ color: 'red' }}>Error adding bottle</p>}
        </Box>
    );
};

export default AddBottleForm;