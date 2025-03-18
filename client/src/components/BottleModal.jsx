import { useState } from "react";
import { useQuery } from "@apollo/client";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Button, Text, VStack, Divider, Box, HStack } from "@chakra-ui/react";
import { GET_BOTTLE_REVIEWS } from "../utils/queries";
import ReviewModal from "./ReviewModal";
import { useUser } from "../context/UserContext";

const BottleModal = ({ isOpen, onClose, bottle }) => {
    const { user } = useUser(); // needed to check if the review is the user's
    const { data, loading, error } = useQuery(GET_BOTTLE_REVIEWS, {
        variables: { bottle: bottle._id },
        skip: !bottle, // safety to prevent query if bottle is null
        fetchPolicy: "network-only" // force refetch to get updated data, don't use cache
    });
    
    const [showReviewModal, setShowReviewModal] = useState(false);
    
    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent bg="bgModal" color="text">
                    <ModalHeader>
                        <Text fontSize="xl" fontWeight="bold">{bottle.productName}</Text>
                        <Text fontSize="sm" color="secondary">{bottle.winery.name} - {bottle.wineStyle.name}</Text>
                        <Text fontSize="sm" color="secondary">{bottle.country || "Unknown"} | {bottle.location || "Unknown"}</Text>
                        <Text fontSize="sm" fontWeight="bold" color="primary">
                            Avg Rating: {data?.getBottleReviews.avgRating ? data.getBottleReviews.avgRating.toFixed(1) : "No Ratings Yet"}
                        </Text>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {loading ? (
                            <Text>Loading reviews...</Text>
                        ) : error ? (
                            <Text color="red.500">Failed to load reviews.</Text>
                        ) : (
                            <VStack spacing={3} align="start">
                                {data?.getBottleReviews.reviews.length > 0 ? (
                                    data.getBottleReviews.reviews.map((review) => (
                                        <Box key={review._id} p={3} borderWidth="1px" borderRadius="md" w="full">
                                            <HStack justify="space-between">
                                                <Text fontSize="lg" fontWeight="bold">
                                                    {review.vintage ? `Vintage: ${review.vintage}` : "No Vintage"}
                                                </Text>
                                                <Text fontSize="lg" fontWeight="bold">{review.rating}/100</Text>
                                            </HStack>
                                            <Text whiteSpace="normal" wordBreak="break-word" mt={1}>{review.content}</Text>
                                            <Divider my={2} />
                                            <Text fontSize="sm" fontStyle="italic">User: {review.user.username}</Text>
                                            {review.user._id === user._id && !review.isPublic && (
                                                <Text fontSize="xs" color="secondary" fontStyle="italic">
                                                    (This review is only visible to you)
                                                </Text>
                                            )}
                                        </Box>
                                    ))
                                ) : (
                                    <Text>No reviews yet.</Text>
                                )}
                            </VStack>
                        )}
                        <Button mt={4} colorScheme="blue" onClick={() => setShowReviewModal(true)}>
                            Add Review
                        </Button>
                    </ModalBody>
                </ModalContent>
            </Modal>
            {showReviewModal && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    bottle={bottle}
                />
            )}
        </>
    );
};

export default BottleModal;