import { useState, useEffect } from "react";
import { Text, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, VStack, Input, Textarea, Checkbox, FormControl, FormLabel } from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { ADD_REVIEW, UPDATE_REVIEW } from "../utils/mutations";
import { capitalizeWords } from "../utils/formatting";

const ReviewModal = ({ isOpen, onClose, bottle, drankVintage, review }) => {
    const [formData, setFormData] = useState({});
    const [addReview] = useMutation(ADD_REVIEW);
    const [updateReview] = useMutation(UPDATE_REVIEW);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            if (review) {
                setFormData({
                    rating: review.rating,
                    vintage: review.vintage || "",
                    content: review.content || "",
                    isPublic: review.isPublic,
                });
            } else {
                setFormData({
                    rating: "",
                    vintage: drankVintage || "",
                    content: "",
                    isPublic: true,
                });
            }
        }
    }, [isOpen, review, drankVintage]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
    };

    const handleSubmit = async () => {
        if (!formData.rating || Number.isNaN(parseInt(formData.rating))) {
            return setError("Enter a valid rating.");
        }
        try {
            const variables = {
                bottle: bottle._id,
                rating: parseInt(formData.rating),
                content: formData.content,
                isPublic: formData.isPublic,
            }
            if (formData.vintage) variables.vintage = parseInt(formData.vintage);

            if (review) {
                variables._id = review._id;
                await updateReview({ variables });
            } else {
                await addReview({ variables });
            }

            setError("");
            onClose();
        } catch (error) {
            console.error("Error submitting review:", error);
            setError("Failed to submit review.");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent bg="bgModal" color="text">
                <ModalHeader>{review ? "Edit Review" : "Leave a Review"}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text fontWeight='bold'>{capitalizeWords(bottle.productName)}</Text>
                    <Text fontSize='sm' color='secondary'>
                        {capitalizeWords(bottle.winery.name)} - {capitalizeWords(bottle.wineStyle.name)}
                    </Text>
                    <Text mt={3}fontSize='sm'><b>Vintage:</b> {formData.vintage}</Text>
                    <VStack mt={4} spacing={3} align="stretch">
                        <FormControl>
                            <FormLabel>Rating (0-100)</FormLabel>
                            <Input name="rating" type="number" placeholder="Enter rating..." value={formData.rating} onChange={handleChange} min={0} max={100} />
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
                    <Button onClick={onClose} mr={3}>Cancel</Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isDisabled={!formData.rating}>
                        {review ? "Save Changes" : "Submit Review"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ReviewModal;