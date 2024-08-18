'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";
import { async } from "@firebase/util";
import { textAlign } from "@mui/system";

export default function Home() {
  const [inventory, setInventory] = useState([]); // Manages the inventory list state
  const [open, setOpen] = useState(false); // Manages modal open state
  const [itemName, setItemName] = useState(""); // Manages the item name input
  const [searchQuery, setSearchQuery] = useState(""); // Manages the search query input

  // Function to update the inventory list from Firestore
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList); // Updates the inventory state with the fetched data
  };

  // Function to add an item to the inventory or increase quantity if it already exists
  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 }); // Increases quantity if item exists
    } else {
      await setDoc(docRef, { quantity: 1 }); // Adds new item with a quantity of 1
    }
    await updateInventory(); // Updates the inventory after modification
  };

  // Function to remove an item or decrease its quantity
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef); // Deletes the item if quantity is 1
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }); // Decreases quantity if more than 1
      }
    }
    await updateInventory(); // Updates the inventory after modification
  };

  // Fetches the inventory data when the component mounts
  useEffect(() => {
    updateInventory();
  }, []);

  // Modal open and close handlers
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Filters inventory based on search query
  const filteredInventory = inventory.filter((item) =>
    (item.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      paddingTop={4} // Adds spacing from the top of the page
      gap={4} // Adds vertical spacing between elements
      sx={{
        backgroundColor: "#D8C3A5", // Set your solid background color here
      }}
    >
      {/* Centered title at the top */}
      <Box 
        width="100%" 
        display="flex" 
        justifyContent="center" 
        bgcolor="#D8C3A5" // Set the background color here
        padding={1} // Optional: Adds some padding around the text
      >
        <Typography
          variant="h1"
          color="#064715"
          textAlign="center"
          sx={{ fontWeight: 'bold' }} // Makes the text bold
        >
          Pantry Inventory
        </Typography>
      </Box>
      {/* Centered search bar */}
      <TextField
        label="Search Pantry"
        variant="outlined"
        size="small"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)} // Updates search query state
        sx={{
          width: "350px", // Set a fixed width for the search input
          backgroundColor: "#593504", // Set the background color here
        }}
        InputLabelProps={{
          sx: {
            color: '#FFFFFF', // Change the color of the label text here
          },
        }}
      />

      {/* Centered Add New Item button */}
      <Button
        variant="contained"
        onClick={() => handleOpen()}
        style={{ backgroundColor: "#064715" }} // Changes the background color
      >
        Add New Item
      </Button>

      {/* Inventory list section */}
      <Box width="80%" maxWidth="800px">
        <Stack
          width="100%"
          height="500px"
          spacing={1}
          overflow="auto"
          sx={{
            /* Local scrollbar styles */
            '&::-webkit-scrollbar': {
              width: '12px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#D8C3A5',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#593504',
              borderRadius: '20px',
              border: '3px solid #212A31',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#EAE7DC',
            },
          }}
        >
          {filteredInventory.map(({ name, quantity }) => (
            <Box 
              key={name} 
              width="100%" 
              minHeight="150px" 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between"
              bgColor="#f0f0f0"
              padding={5}
              sx={{
                border: '3px solid #8E8D8A', // Sets the border color and thickness
                borderRadius: '30px', // Add rounded corners if desired
              }}
            >
              {/* Displays item name */}
              <Typography variant="h3" color="#593504" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              {/* Displays item quantity */}
              <Typography variant="h3" color="#064715" textAlign="center">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={() => addItem(name)}
                  style={{ backgroundColor: "#064715" }} // Changes the background color of the button
                > Add </Button>
                <Button variant="contained" onClick={() => removeItem(name)}
                  style={{ backgroundColor: "#593504" }} // Changes the background color of the button
                > Remove </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Modal for adding new items */}
      <Modal
        open={open} 
        onClose={handleClose}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography variant="h6" style={{ color: "#098765", textAlign: "center" }}>
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)} // Updates itemName state
            />
            <Button 
              variant="outlined" 
              onClick={() => {
                addItem(itemName); // Adds item to inventory
                setItemName(""); // Resets the input field
                handleClose(); // Closes the modal
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}