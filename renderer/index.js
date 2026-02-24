
 //renderer/index.js
 //Purpose: Handles KMB API data fetching, ETA calculations, and UI updates.


const { ipcRenderer } = require('electron');
const CRUD = require('./crud.js');


//Fetches the initial list of bus stops from the KMB Open Data API.
async function init() {
    // Fetch all available stops from the API
    const res = await fetch('https://data.etabus.gov.hk/v1/transport/kmb/stop');
    const json = await res.json();
    
    // Select only the first 15 records 
    const stops = json.data.slice(0, 15);
    const select = document.getElementById('stopSelect');
    select.innerHTML = '';
    
    // Populate the dropdown menu dynamically
    stops.forEach(s => {
        let opt = document.createElement('option');
        opt.value = s.stop;       // Store stop ID
        opt.textContent = s.name_en; // Display English name
        select.appendChild(opt);
    });
}


 // Retrieves live arrival data and calculates the countdown in minutes.
window.checkETA = async () => {
    const stopId = document.getElementById('stopSelect').value;
    // Fetch live ETA data for the specific bus stop
    const res = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/${stopId}`);
    const json = await res.json();
    
    let displayHtml = "";

    // Check if the API returned valid arrival data
    if (json.data && json.data.length > 0) {
        
        // --- NEXT BUS (Identification of the 1st Vehicle) ---
        const bus1 = json.data[0];
        const eta1 = new Date(bus1.eta);
        
        // MEANINGFUL CALCULATION: (ETA Date - Current Date) / 60,000ms = Minutes
        const wait1 = Math.round((eta1 - new Date()) / 60000);
        const time1 = eta1.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Update display with formatted sentence
        displayHtml += `
            <div class="bus-info next">
                <h4>Next Bus (Route ${bus1.route})</h4>
                <p>Arriving at ${time1} (${wait1 > 0 ? wait1 : 0} mins left).</p>
            </div>
        `;

        // --- UPCOMING BUS (Identification of the 2nd Vehicle) ---
        if (json.data.length > 1) {
            const bus2 = json.data[1];
            const eta2 = new Date(bus2.eta);
            
            // Repeat calculation for the second vehicle in the array
            const wait2 = Math.round((eta2 - new Date()) / 60000);
            const time2 = eta2.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            displayHtml += `
                <div class="bus-info upcoming">
                    <h4>Following Bus</h4>
                    <p>Arriving at ${time2} (${wait2 > 0 ? wait2 : 0} mins left).</p>
                </div>
            `;
        }
    } else {
        // Fallback if no buses are active
        displayHtml = "<p>No buses currently scheduled.</p>";
    }

    // Render the final calculated sentences to the GUI
    document.getElementById('display').innerHTML = displayHtml;
};


// Saves the selected stop, its name, and a user-provided note to the JSON database.
window.addStop = () => {
    const select = document.getElementById('stopSelect');
    const noteInput = document.getElementById('userNote');
    
    // Call CRUD module to write data to local itineraries.json
    const res = CRUD.create(select.value, select.options[select.selectedIndex].text, noteInput.value);
    
    // Provide user feedback via alert
    alert(res.msg);
    noteInput.value = ''; // Clear input after successful save
};

// Uses Electron IPC to signal the main process to open the Favourites window.

window.openFavourites = () => ipcRenderer.send('open-fav-window');

// Execute initialization on script load
init();