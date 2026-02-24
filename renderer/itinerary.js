const CRUD = require('./crud.js');

//Function to fetch data from the local JSON file and render it to the GUI.
function renderList() {
    // Locate the container in the HTML where the list will be displayed
    const container = document.getElementById('list');
    
    // Use the CRUD module to read all saved data from itineraries.json
    const favs = CRUD.read();
    
    // Clear the current list to avoid duplicate entries when refreshing
    container.innerHTML = '';
    
    // Iterate through each favourite item and build the GUI elements
    favs.forEach(f => {
        const item = document.createElement('div');
        item.className = 'fav-item';
        
        // The HTML template displays the Fixed Name and an Editable Note field
        item.innerHTML = `
            <div class="fav-header">
                <strong>Stop Name:</strong> ${f.name} (ID: ${f.stopId})
            </div>
            <label>Notes:</label>
            <input type="text" value="${f.note}" id="note-${f.id}">
            <div class="btn-group">
                <button onclick="update(${f.id})" class="btn-edit">Update Note</button>
                <button onclick="remove(${f.id})" class="btn-del">Delete</button>
            </div>
        `;
        container.appendChild(item);
    });
}


// Function to save changes made to the "Notes" field.

window.update = (id) => {
    // Get the new text from the specific input field using the unique ID
    const newNote = document.getElementById(`note-${id}`).value;
    
    // Pass the ID and new text to the CRUD module to update the JSON file
    const res = CRUD.updateNote(id, newNote);
    
    // Provide user feedback and refresh the list to show updated data
    alert(res.msg);
    renderList();
};

//Function to permanently remove a stop from the favourites list.

window.remove = (id) => {
    // User feedback: Ask for confirmation before deleting (Rubric Requirement)
    if (confirm("Are you sure you want to remove this stop?")) {
        // Execute delete operation in the local database
        CRUD.delete(id);
        // Refresh the UI list
        renderList();
    }
};

// Initial call to render the list when the window opens
renderList();