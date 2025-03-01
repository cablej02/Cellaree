import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Box, Heading } from "@chakra-ui/react";

import CellarAccordion from "../components/CellarAccordion";
import AddBottleForm from "../components/AddBottleForm";    

const Cellar = () => {
    const { user } = useUser();

    // bottles groupbed by bottleId for accordion display
    const [groupedBottles, setGroupedBottles] = useState([]);

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

    return (
        <Box maxW='1000px' mx='auto' p={4}>
            <Heading as='h1' mb={4}>My Cellar</Heading>
            <AddBottleForm onSuccess={() => setGroupedBottles([])} />
            <CellarAccordion groupedBottles={groupedBottles} />
        </Box>
    );
};

export default Cellar;