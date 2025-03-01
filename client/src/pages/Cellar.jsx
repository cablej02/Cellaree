import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Box, Heading, Button } from "@chakra-ui/react";

import CellarAccordion from "../components/CellarAccordion";
import AddBottleModal from "../components/AddBottleModal";    

const Cellar = () => {
    const { user, setUser } = useUser();

    // bottles groupbed by bottleId for accordion display
    const [groupedBottles, setGroupedBottles] = useState([]);

    // open modal state
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if(user?.cellar) {
            // group entries by bottleId
            const grouped = user.cellar.reduce((acc, entry) => {
                // find group if it already exists in the accumulator
                let group = acc.find(group => group.bottle._id === entry.bottle._id);

                // if bottleId not in accumulator, add new group
                if(!group) {
                    group = {
                        bottle: entry.bottle,
                        totalQuantity: 0,
                        entries: [],
                    };
                    acc.push(group);
                }

                // add entry to group and increment total quantity
                group.totalQuantity += entry.quantity;
                group.entries.push(entry);
                return acc;
            }, []);

            // sort entries by vintage
            grouped.forEach(group => {
                group.entries.sort((a, b) => (a.vintage || 9999) - (b.vintage || 9999));
            });
            setGroupedBottles(grouped);
        }
    } , [user]);

    const handleAddBottleSuccess = (newBottle) => {
        setUser({ ...user, cellar: [...user.cellar, newBottle] });
    }

    return (
        <Box maxW='1000px' mx='auto' p={4}>
            <Heading as='h1' mb={4}>My Cellar</Heading>
            <Button variant='primary' mb={4} onClick={() => setIsModalOpen(true)}>Add Bottle</Button>
            <AddBottleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleAddBottleSuccess} 
            />
            <CellarAccordion groupedBottles={groupedBottles} />
        </Box>
    );
};

export default Cellar;