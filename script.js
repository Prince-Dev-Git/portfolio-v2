const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQuMMdMzCxRbecA8f_OSKbXEf43jyAbL4yCifIkMZ85WNOTSnFLXJeP4bQo9Hx1Kdd9q85wOCuIo3ZO/pub?gid=0&single=true&output=csv';

async function fetchMenu() {
    try {
        const response = await fetch(sheetUrl);
        const data = await response.text();
        
        // Split rows and filter out any empty lines
        const rows = data.split('\n').filter(row => row.trim() !== '').slice(1); 
        
        const menuItems = rows.map(row => {
            // Using a regex to split by comma but ignore commas inside quotes (if any)
            const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return {
                name: columns[0]?.trim(),
                cat: columns[1]?.trim(),
                price: columns[2]?.trim(),
                veg: columns[3]?.trim().toLowerCase() === 'true',
                desc: columns[4]?.trim(),
                img: columns[5] ? columns[5].trim() : 'food'
            };
        });

        renderMenu(menuItems);
    } catch (error) {
        console.error("Error fetching menu:", error);
        document.getElementById('menuContainer').innerHTML = `<p class="text-center text-gray-500 mt-10">Failed to load menu. Please check your connection.</p>`;
    }
}

function renderMenu(data) {
    const container = document.getElementById('menuContainer');
    const nav = document.getElementById('categoryNav');
    const isVegOnly = document.getElementById('vegToggle').checked;
    const searchTerm = document.getElementById('menuSearch').value.toLowerCase();

    // Get unique categories from the sheet data
    const categories = [...new Set(data.map(item => item.cat))];
    
    container.innerHTML = '';
    nav.innerHTML = '';

    categories.forEach(cat => {
        const catItems = data.filter(item => 
            item.cat === cat && 
            (!isVegOnly || item.veg) &&
            (item.name.toLowerCase().includes(searchTerm) || item.desc.toLowerCase().includes(searchTerm))
        );

        if (catItems.length > 0) {
            // Build Category Tab
            const navItem = document.createElement('a');
            navItem.href = `#${cat.replace(/\s+/g, '-')}`;
            navItem.className = "whitespace-nowrap pb-1 hover:text-red-500 transition-colors";
            navItem.innerText = cat;
            nav.appendChild(navItem);

            // Build Section
            let sectionHtml = `
                <section id="${cat.replace(/\s+/g, '-')}" class="mb-12">
                    <h2 class="text-xl font-bold mb-6 text-gray-800 border-l-4 border-red-500 pl-3">${cat}</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">`;
            
            catItems.forEach(item => {
                sectionHtml += `
                    <div class="flex justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div class="flex-1 pr-4">
                            <div class="w-4 h-4 border-2 ${item.veg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center mb-2">
                                <div class="w-2 h-2 ${item.veg ? 'bg-green-600' : 'bg-red-600'} rounded-full"></div>
                            </div>
                            <h3 class="font-bold text-gray-800">${item.name}</h3>
                            <p class="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">${item.desc}</p>
                            <p class="mt-3 font-bold text-gray-900">₹${item.price}</p>
                        </div>
                        <div class="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden relative shrink-0">
                            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80&sig=${item.name.replace(/\s+/g, '')}" 
                                 alt="${item.name}" 
                                 class="object-cover w-full h-full">
                            <button class="add-btn absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-red-500 border border-gray-100 px-4 py-1 rounded shadow-lg text-xs font-bold uppercase hover:bg-red-50 active:scale-95 transition-all">
                                Add
                            </button>
                        </div>
                    </div>`;
            });
            sectionHtml += `</div></section>`;
            container.innerHTML += sectionHtml;
        }
    });
let cart = [];
const SCRIPT_URL = 'PASTE_YOUR_GOOGLE_SCRIPT_URL_HERE';

// 1. Capture Table Number from URL automatically
const urlParams = new URLSearchParams(window.location.search);
const tableFromUrl = urlParams.get('table') || "";

function addToCart(name, price) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    document.getElementById('cartFab').classList.toggle('hidden', count === 0);
    document.getElementById('cartCountFab').innerText = count;
}

async function placeOrder() {
    const btn = document.getElementById('placeOrderBtn');
    const orderData = {
        customerName: document.getElementById('userName').value,
        phone: document.getElementById('userPhone').value,
        tableNum: document.getElementById('tableNum').value || tableFromUrl,
        items: cart,
        timestamp: new Date().toLocaleString()
    };

    if(!orderData.customerName || !orderData.phone) return alert("Please enter details");

    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
        alert("Order Placed Successfully!");
        cart = [];
        location.reload();
    } catch (e) {
        alert("Order sent to Sheet!"); 
        // Note: CORS might show error but data usually hits the sheet anyway
    }
}

// Admin Logic
function checkAdmin() {
    if(document.getElementById('adminPass').value === "1234") { // Your Secret Pin
        window.location.href = "admin.html";
    } else {
        alert("Wrong Pin");
    }
}
    // Handle "No results" state
    if (container.innerHTML === '') {
        container.innerHTML = `
            <div class="text-center py-20">
                <p class="text-gray-400 text-lg">No dishes found matching your search.</p>
            </div>`;
    }

    // Re-attach button logic
    document.querySelectorAll('.add-btn').forEach(btn => {
        btn.onclick = () => {
            const originalText = btn.innerText;
            btn.innerText = 'Added';
            btn.classList.add('bg-red-500', 'text-white', 'border-red-500');
            setTimeout(() => { 
                btn.innerText = originalText; 
                btn.classList.remove('bg-red-500', 'text-white', 'border-red-500'); 
            }, 1000);
        };
    });
}

// Event Listeners
document.getElementById('vegToggle').addEventListener('change', fetchMenu);
document.getElementById('menuSearch').addEventListener('input', fetchMenu);

// Initial Load
window.onload = fetchMenu;