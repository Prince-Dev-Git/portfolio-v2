const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQuMMdMzCxRbecA8f_OSKbXEf43jyAbL4yCifIkMZ85WNOTSnFLXJeP4bQo9Hx1Kdd9q85wOCuIo3ZO/pub?gid=0&single=true&output=csv';

async function fetchMenu() {
    console.log("Attempting to fetch menu...");
    try {
        const response = await fetch(sheetUrl);
        if (!response.ok) {
            alert("Network error: Could not reach Google Sheets");
            return;
        }
        const data = await response.text();
        console.log("Data received successfully");
        
        // If data is empty or HTML (error page), stop here
        if (data.includes("<!DOCTYPE html>")) {
            alert("Error: Google Sheet link returned a login page instead of data. Please re-publish as CSV.");
            return;
        }

        const rows = data.split(/\r?\n/).filter(row => row.trim() !== "").slice(1);
        renderMenu(rows);
    } catch (error) {
        alert("JavaScript Error: " + error.message);
        console.error(error);
    }
}

function renderMenu(data) {
    const container = document.getElementById('menuContainer');
    const nav = document.getElementById('categoryNav');
    const isVegOnly = document.getElementById('vegToggle').checked;
    const searchTerm = document.getElementById('menuSearch').value.toLowerCase();

    // Reset UI
    container.innerHTML = '';
    nav.innerHTML = '';

    // Get unique categories
    const categories = [...new Set(data.map(item => item.cat))];
    
    categories.forEach(cat => {
        const catItems = data.filter(item => 
            item.cat === cat && 
            (!isVegOnly || item.veg) &&
            (item.name.toLowerCase().includes(searchTerm) || item.desc.toLowerCase().includes(searchTerm))
        );

        if (catItems.length > 0) {
            // Add Navigation Link
            const navLink = document.createElement('a');
            navLink.href = `#${cat.replace(/\s+/g, '-')}`;
            navLink.className = "whitespace-nowrap pb-1 hover:text-red-500 transition-colors";
            navLink.innerText = cat;
            nav.appendChild(navLink);

            // Add Menu Section
            let sectionHtml = `
                <section id="${cat.replace(/\s+/g, '-')}" class="mb-12">
                    <h2 class="text-xl font-bold mb-6 border-l-4 border-red-500 pl-3 text-gray-800">${cat}</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">`;
            
            catItems.forEach(item => {
                sectionHtml += `
                    <div class="flex justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div class="flex-1 pr-4">
                            <div class="w-4 h-4 border-2 ${item.veg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center mb-2">
                                <div class="w-2 h-2 ${item.veg ? 'bg-green-600' : 'bg-red-600'} rounded-full"></div>
                            </div>
                            <h3 class="font-bold text-gray-800">${item.name}</h3>
                            <p class="text-xs text-gray-500 mt-1 line-clamp-2">${item.desc}</p>
                            <p class="mt-3 font-bold text-gray-900">₹${item.price}</p>
                        </div>
                        <div class="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden relative shrink-0">
                            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80&sig=${item.name.replace(/\s+/g, '')}" alt="Food" class="object-cover w-full h-full">
                            <button onclick="addToCart('${item.name}', ${item.price})" class="add-btn absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-red-500 border border-gray-100 px-4 py-1 rounded shadow-lg text-xs font-bold uppercase hover:bg-red-50 transition-all">Add</button>
                        </div>
                    </div>`;
            });
            container.innerHTML += sectionHtml + `</div></section>`;
        }
    });
}
// Event Listeners
document.getElementById('vegToggle').addEventListener('change', fetchMenu);
document.getElementById('menuSearch').addEventListener('input', fetchMenu);

// Initial Load
window.onload = fetchMenu;

function checkAdmin() {
    const pass = document.getElementById('adminPass').value;
    // Use a strong password here
    if(pass === "Hello@world") { 
        window.location.href = "admin.html";
    } else {
        alert("Access Denied: Incorrect Password");
    }
}

let logoClicks = 0;
document.querySelector('h1').addEventListener('click', () => {
    logoClicks++;
    if(logoClicks === 5 {
        document.getElementById('adminModal').classList.remove('hidden');
        logoClicks = 0; // Reset
    }
    setTimeout(() => { logoClicks = 0; }, 2000); // Reset if not 3 clicks in 1 sec
});
async function clearOrder(table) {
    const SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
    try {
        // We now call the 'complete' action instead of 'delete'
        await fetch(`${SCRIPT_URL}?action=complete&table=${table}`, { mode: 'no-cors' });
        
        alert(`Table ${table} marked as Completed!`);
        fetchOrders(); // Refresh screen
    } catch (e) {
        fetchOrders();
    }
}

// Inside your renderOrders function, change how you filter rows:
const rows = data.split('\n').filter(r => r.trim() !== '').slice(1);

const pendingRows = rows.filter(row => {
    const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return cols[7]?.trim() === "Pending"; // Only show orders that aren't done yet
});

renderOrders(pendingRows);

let logoClicks = 0;
const logo = document.querySelector('h1');

logo.style.cursor = 'pointer'; // Make it look clickable for you
logo.addEventListener('click', () => {
    logoClicks++;
    if (logoClicks === 5) {
        const pass = prompt("Enter Admin Password:");
        if (pass === "HelloPrince") { // Your Full Password
            window.location.href = "admin.html";
        } else {
        
            alert("Wrong Password");
        }
        logoClicks = 0;
    }
    setTimeout(() => { logoClicks = 0; }, 2000);
});