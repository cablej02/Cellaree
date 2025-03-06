import { useState } from "react";
import { Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, VStack, Input, Textarea, Checkbox, FormControl, FormLabel } from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { ADD_REVIEW } from "../utils/mutations";
import { capitalizeWords } from "../utils/formatting";

const ReviewModal = ({ isOpen, onClose, bottle, drankVintage }) => {
    const [formData, setFormData] = useState({
        rating: "",
        vintage: drankVintage || "",
        content: "",
        isPublic: true,
    });
    const [addReview] = useMutation(ADD_REVIEW);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async () => {
        if (!formData.rating) {
            return setError("Enter a rating.");
        }
        try {
            const variables = {
                bottle: bottle._id,
                rating: parseInt(formData.rating),
                content: formData.content,
                isPublic: formData.isPublic,
            }
            if (formData.vintage) variables.vintage = parseInt(formData.vintage);

            await addReview({variables});
            setError("Review added successfully!");
            onClose()
        } catch (error) {
            console.error("Error adding review:", error);
            setError("Failed to add review.");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent bg="bgModal" color="text">
                <ModalHeader>Leave a Review</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text fontWeight='bold'>{capitalizeWords(bottle.productName)}</Text>
                    <Text fontSize='sm' color='secondary'>
                        {capitalizeWords(bottle.winery.name)} - {capitalizeWords(bottle.wineStyle.name)}
                    </Text>
                    <VStack mt={4} spacing={3} align="stretch">
                        <FormControl>
                            <FormLabel>Rating (0-100)</FormLabel>
                            <Input name="rating" type="number" placeholder="Enter rating..." value={formData.rating} onChange={handleChange} min={0} max={100} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Vintage</FormLabel>
                            <Input name="vintage" type="number" placeholder="Vintage (Year)" value={formData.vintage} onChange={handleChange} />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Review</FormLabel>
                            <Textarea name="content" placeholder="Write your review..." value={formData.content} onChange={handleChange} />
                        </FormControl>
                        <Checkbox name="isPublic" isChecked={formData.isPublic} onChange={handleChange}>Make Review Public</Checkbox>
                        {error && <Text color='red.500' mt={2}>{error}</Text>}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" onClick={handleSubmit}>Submit Review</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ReviewModal;