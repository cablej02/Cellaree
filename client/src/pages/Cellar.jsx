import { useQuery } from "@apollo/client";
import { ME } from "../utils/queries";
import { Box, Text } from "@chakra-ui/react";

const Cellar = () => {
    const { loading, error, data } = useQuery(ME);

    console.log(data);

    if (loading) return <Text>Loading cellar...</Text>
    if (error) return <Text>Error loading cellar...</Text>

    // if data exists, if me exists, then assign to cellar, else assign empty array
    const cellar = data?.me?.cellar || [];

    return (
        <Box p={4}>
            <Text fontSize="2xl" mb={4}>Your Cellar</Text>
            {cellar.length === 0 ? (
                <Text>Your cellar is empty! Add some bottles and they'll display here.</Text>
            ) : (
                <Box>
                    {cellar.map(({ _id, bottle, vintage, quantity }) => (
                        <Box key={_id} p={2} borderBottom="1px solid gray">
                            <Text>{bottle?.productName} ({vintage || "NV"}) - {quantity} bottle(s)</Text>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default Cellar;