import { useState, useEffect } from 'react';
import { 
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, 
    Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, Text
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@apollo/client';
import { DRINK_CELLAR_BOTTLE } from '../utils/mutations';
import { GET_USER_REVIEWS } from '../utils/queries';
import { useUser } from '../context/UserContext';
import ReviewModal from './ReviewModal';

const DrinkBottleModal = ({ entry, isOpen, onClose }) => {
    const { setUser } = useUser();

    const [quantity, setQuantity] = useState(1);
    const [drankDate, setDrankDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [error, setError] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);

    const [drinkCellarBottle, { loading }] = useMutation(DRINK_CELLAR_BOTTLE);
    const { data: reviewData } = useQuery(GET_USER_REVIEWS, { fetchPolicy: 'network-only' });

    useEffect(() => {
        if(isOpen) {
            setQuantity(1);
            setDrankDate(new Date().toISOString().split('T')[0]);
            setError('');
        }
    }, [isOpen]);

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
                    drankDate: drankDate
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

            // If user has not reviewed this bottle+vintage, show review modal
            const reviews = reviewData?.getUserReviews || [];
            console.log(reviews);
            const reviewed = reviews.some(review => review.bottle._id === entry.bottle._id && review.vintage === entry.vintage);
            if (!reviewed) {
                setShowReviewModal(true);
            }
        } catch (err) {
            console.error('Error drinking bottle:', err);
            setError('Unable to process request.');
        }
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent bg='bgModal' color='text'>
                    <ModalHeader>Drink Bottle</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontWeight='bold'>{entry.bottle.productName}</Text>
                        <Text fontSize='sm' color='secondary'>
                            {entry.bottle.winery.name} - {entry.vintage || 'N/A'}
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
            {showReviewModal && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    bottle={entry.bottle}
                    drankVintage={entry.vintage}
                />
            )}
        </>
    );
};

export default DrinkBottleModal;
