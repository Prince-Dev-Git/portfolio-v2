const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQuMMdMzCxRbecA8f_OSKbXEf43jyAbL4yCifIkMZ85WNOTSnFLXJeP4bQo9Hx1Kdd9q85wOCuIo3ZO/pub?gid=0&single=true&output=csv';
const SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE'; // Replace with your Web App URL

let cart = [];

async function fetchMenu() {
    console.log("Attempting to fetch menu...");
    try {
        const response = await fetch(sheetUrl);
        if (!response.ok) throw new Error("Could not reach Google Sheets");
        
        const data = await response.text();
        
        if (data.includes("<!DOCTYPE html>")) {
            alert("Error: Link returned HTML. Please re-publish Google Sheet as CSV.");
            return;
        }

        // Clean and parse rows
        const rawRows = data.split(/\r?\n/).filter(row => row.trim() !== "").slice(1);
        
        const menuItems = rawRows.map(row => {
            const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return {
                name: cols[0]?.trim(),
                cat: cols[1]?.trim(),
                price: cols[2]?.trim(),
                veg: cols[3]?.trim().toLowerCase() === 'true',
                desc: cols[4]?.trim(),
                img: cols[5]?.trim() || 'food'
            };
        });

        renderMenu(menuItems);
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

function renderMenu(data) {
    const container = document.getElementById('menuContainer');
    const nav = document.getElementById('categoryNav');
    const isVegOnly = document.getElementById('vegToggle').checked;
    const searchTerm = document.getElementById('menuSearch').value.toLowerCase();

    container.innerHTML = '';
    nav.innerHTML = '';

    const categories = [...new Set(data.map(item => item.cat))];
    
    categories.forEach(cat => {
        const catItems = data.filter(item => 
            item.cat === cat && 
            (!isVegOnly || item.veg) &&
            (item.name.toLowerCase().includes(searchTerm) || item.desc.toLowerCase().includes(searchTerm))
        );

        if (catItems.length > 0) {
            const navLink = document.createElement('a');
            navLink.href = `#${cat.replace(/\s+/g, '-')}`;
            navLink.className = "whitespace-nowrap pb-1 hover:text-red-500 transition-colors";
            navLink.innerText = cat;
            nav.appendChild(navLink);

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
                            <button onclick="addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price})" class="add-btn absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white text-red-500 border border-gray-100 px-4 py-1 rounded shadow-lg text-xs font-bold uppercase hover:bg-red-50 transition-all">Add</button>
                        </div>
                    </div>`;
            });
            container.innerHTML += sectionHtml + `</div></section>`;
        }
    });
}

// --- CART & ORDER LOGIC ---

function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
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

function openCart() {
    document.getElementById('orderModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('orderModal').classList.add('hidden');
}

async function placeOrder() {
    const btn = document.getElementById('placeOrderBtn');
    const orderData = {
        customerName: document.getElementById('userName').value,
        phone: document.getElementById('userPhone').value,
        tableNum: document.getElementById('tableNum').value,
        items: cart
    };

    if(!orderData.customerName || !orderData.phone) return alert("Please enter details");

    btn.innerText = "Processing...";
    btn.disabled = true;

    try {
        await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(orderData)
        });
        alert("Order Placed!");
        cart = [];
        location.reload();
    } catch (e) {
        alert("Check your Google Sheet!");
        location.reload();
    }
}

// --- ADMIN LOGIC ---

let logoClicks = 0;
const logo = document.querySelector('h1');
logo.style.cursor = 'pointer';

logo.addEventListener('click', () => {
    logoClicks++;
    if (logoClicks === 5) {
        document.getElementById('adminModal').classList.remove('hidden');
        logoClicks = 0;
    }
    setTimeout(() => { logoClicks = 0; }, 2000);
});

function checkAdmin() {
    const pass = document.getElementById('adminPass').value;
    if(pass === "HelloPrince") { 
        window.location.href = "admin.html";
    } else {
        alert("Wrong Password");
    }
}

// --- INITIALIZATION ---

document.getElementById('vegToggle').addEventListener('change', fetchMenu);
document.getElementById('menuSearch').addEventListener('input', fetchMenu);
window.onload = fetchMenu;