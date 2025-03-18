import { useState, useEffect } from "react";
import { 
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
    Text, Button, Divider, VStack, Input, Textarea, Checkbox, FormControl, FormLabel } from "@chakra-ui/react";
import { useMutation } from "@apollo/client";
import { GET_BOTTLE_REVIEWS } from "../utils/queries";
import { ADD_REVIEW, UPDATE_REVIEW } from "../utils/mutations";

const ReviewModal = ({ isOpen, onClose, bottle, drankVintage, review }) => {
    const [formData, setFormData] = useState({
        rating: "",
        vintage: "",
        content: "",
        isPublic: true,
    });
    const [addReview] = useMutation(ADD_REVIEW, {
        refetchQueries: [{ query: GET_BOTTLE_REVIEWS, variables: { bottle: bottle._id } }],
    });
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
                    <Divider mb={2} />
                    <Text fontWeight='bold'>{bottle.productName}</Text>
                    <Text fontSize='sm' color='secondary'>
                        {bottle.winery.name} - {bottle.wineStyle.name}
                    </Text>
                    <Divider my={2} />
                    {/* If we didn't get a vintage from the inputs, render it as an input, otherwise render as text */}
                    {(!drankVintage || !review) ? (
                        <FormControl>
                            <FormLabel>Vintage</FormLabel>
                            <Input name="vintage" type="number" placeholder="Enter vintage..." value={formData.vintage} onChange={handleChange} />
                        </FormControl>
                    ) : (
                        <Text fontSize='sm'><b>Vintage:</b> {formData.vintage || ""}</Text>
                    )}
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