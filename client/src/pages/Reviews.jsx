import { useQuery, useMutation } from "@apollo/client";
import { GET_USER_REVIEWS } from "../utils/queries";
import { REMOVE_REVIEW } from "../utils/mutations";
import { useState, useEffect } from "react";
import { Box, Heading, VStack, Text, Button, HStack, IconButton, useToast, Divider, Flex, Card, CardBody } from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";
import { capitalizeWords } from "../utils/formatting";

const Reviews = () => {
    const { loading, error, data } = useQuery(GET_USER_REVIEWS, { 
        fetchPolicy: "network-only" // force refetch to get updated data, don't use cache
    });
    const [removeReview] = useMutation(REMOVE_REVIEW);
    const [reviews, setReviews] = useState([]);
    const toast = useToast();

    useEffect(() => {
        if (data?.getUserReviews) {
            setReviews(data.getUserReviews);
        }
    }, [data]);

    const handleDelete = async (reviewId) => {
        try {
            await removeReview({ variables: { _id: reviewId } });
            toast({ title: "Review deleted.", status: "success", duration: 3000 });
            setReviews((prevReviews) => prevReviews.filter((review) => review._id !== reviewId));
        } catch (err) {
            toast({ title: "Error deleting review.", status: "error", duration: 3000 });
        }
    };

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error loading reviews.</Text>;

    return (
        <Box maxW="1000px" mx="auto" p={4}>
            <Heading as="h2" size="lg" mb={4} color="text">Your Reviews</Heading>
            {reviews.length === 0 ? (
                <Text color="text">You have no reviews yet</Text>
            ) : (
                <VStack spacing={4} align="stretch">
                    {reviews.map((review) => (
                        <Card key={review._id} w="full" shadow="md" bg="dark" color="text" borderRadius="md">
                            <CardBody>
                                <Flex justify="space-between" align="center">
                                    <VStack align="start" spacing={1}>
                                        <Text fontSize="lg" fontWeight="bold">{review.bottle.productName}</Text>
                                        <Text fontSize="sm" color="secondary">{capitalizeWords(review.bottle.winery.name)} - {capitalizeWords(review.bottle.wineStyle.name)}</Text>
                                    </VStack>
                                    <IconButton
                                        icon={<FaTrash color="red" />} 
                                        bg="transparent"
                                        variant="ghost"
                                        _hover={{ filter: "drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.8))" }}
                                        _active={{ bg: "transparent" }}
                                        onClick={() => handleDelete(review._id)}
                                        aria-label="Delete review"
                                    />
                                </Flex>
                                <Divider my={2} />
                                <Text fontSize="sm">Vintage: <b>{review.vintage || "N/A"}</b></Text>
                                <Text fontSize="sm">Rating: <b>{review.rating}/100</b></Text>
                                <Text mt={2}>{review.content || "No review text provided."}</Text>
                                <Divider my={2} />
                                <Text fontSize="sm" color="secondary">Public: {review.isPublic ? "Yes" : "No"}</Text>
                            </CardBody>
                        </Card>
                    ))}
                </VStack>
            )}
        </Box>
    );
};

export default Reviews;
