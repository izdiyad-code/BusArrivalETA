// CRUD Module: Handles Create, Read, Update, Delete operations for itineraries
const fs = require('fs');
const path = require('path');

// Define the absolute path to the data storage file
const dataPath = path.join(__dirname, '../data/itineraries.json');

const CRUD = {
    
    // READ: Retrieves all saved favourite stops from the JSON file
    read: () => {
        try {
            // Check if the file exists before attempting to read
            if (!fs.existsSync(dataPath)) return [];
            
            // Read file content as a UTF-8 string
            const data = fs.readFileSync(dataPath, 'utf8');
            
            // Parse string back into a JavaScript array (default to empty array if null)
            return JSON.parse(data || "[]");
        } catch (err) { 
            // Return empty list if any error occurs during file access
            return []; 
        }
    },

    // CREATE: Adds a new bus stop to the favourites list with a user note
    create: (stopId, name, note) => {
        let favs = CRUD.read();
        
        // Logical Check: Prevent duplicate entries for the same bus stop ID
        if (favs.some(f => f.stopId === stopId)) {
            return { success: false, msg: "Stop already in favourites!" };
        }
        
        // Construct a new data object with a unique timestamp-based ID
        const newFav = { 
            id: Date.now(), 
            stopId: stopId, 
            name: name, 
            note: note 
        };
        
        // Add to the array and write the updated list back to the physical file
        favs.push(newFav);
        fs.writeFileSync(dataPath, JSON.stringify(favs, null, 2));
        
        return { success: true, msg: "Saved to favourites!" };
    },

    // UPDATE: Modifies the 'note' 
    updateNote: (id, newNote) => {
        let favs = CRUD.read();
        
        // Find the index of the item matching the unique entry ID
        const index = favs.findIndex(f => f.id == id);
        
        if (index !== -1) {
            // Update only the user provided note
            favs[index].note = newNote;
            
            // Save changes to the JSON file
            fs.writeFileSync(dataPath, JSON.stringify(favs, null, 2));
            return { success: true, msg: "Note updated!" };
        }
        return { success: false, msg: "Update failed." };
    },

    // DELETE: Permanently removes a stop from the itineraries list
    delete: (id) => {
        let favs = CRUD.read();
        
        // Filter the array to remove the item matching the ID
        favs = favs.filter(f => f.id != id);
        
        // Sync the updated array back to the storage file
        fs.writeFileSync(dataPath, JSON.stringify(favs, null, 2));
        return { success: true, msg: "Deleted successfully!" };
    }
};

// Export the module for use in the Renderer process (IPC communication)
module.exports = CRUD;