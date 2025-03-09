import { useState } from "react";
import { useMutation } from "@apollo/client";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Input, FormControl, FormLabel, Text } from "@chakra-ui/react";
import { ADD_WINERY } from "../utils/mutations";
import { GET_WINERIES } from "../utils/queries";

const WineryModal = ({ isOpen, onClose, onAddSuccess }) => {
    const [formData, setFormData] = useState({ name: "" });
    const [addWinery, { loading, error }] = useMutation(ADD_WINERY, {
        refetchQueries: [{ query: GET_WINERIES }],
    });
    
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;
        try {
            const { data } = await addWinery({ variables: { name: formData.name.trim().toLowerCase() } });
            onAddSuccess(data.addWinery);
            formData.name = ""; // clear form data
            onClose();
        } catch (err) {
            console.error("Error adding winery:", err);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent bg="bgModal" color="text">
                <ModalHeader>Add New Winery</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <FormControl>
                        <FormLabel>Winery Name</FormLabel>
                        <Input name="name" placeholder="Enter winery name..." value={formData.name} onChange={handleChange} />
                    </FormControl>
                    {error && <Text color="red.500" mt={2}>Failed to add winery.</Text>}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={onClose} mr={3}>Cancel</Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading} isDisabled={!formData.name.trim()}>
                        Add Winery
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default WineryModal;