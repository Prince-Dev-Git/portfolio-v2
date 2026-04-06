const MENU_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQuMMdMzCxRbecA8f_OSKbXEf43jyAbL4yCifIkMZ85WNOTSnFLXJeP4bQo9Hx1Kdd9q85wOCuIo3ZO/pub?gid=0&single=true&output=csv';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYlVPSbRMZqsB79FTVIQSPnzYsYp-IovISDPo3Bj5I8HF8UM41NwrUYrHPQyMxZj88FQ/exec';

let cart = [];

async function fetchMenu() {
    try {
        const res = await fetch(MENU_CSV);
        const text = await res.text();
        const rows = text.split(/\r?\n/).filter(r => r.trim() !== "").slice(1);
        const items = rows.map(r => {
            const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return { name: c[0], cat: c[1], price: c[2], veg: c[3]?.toLowerCase() === 'true', desc: c[4] };
        });
        render(items);
    } catch (e) { console.log("Error loading menu", e); }
}

function render(data) {
    const container = document.getElementById('menuContainer');
    const nav = document.getElementById('categoryNav');
    const isVeg = document.getElementById('vegToggle').checked;
    const search = document.getElementById('menuSearch').value.toLowerCase();
    
    container.innerHTML = ''; nav.innerHTML = '';
    const cats = [...new Set(data.map(i => i.cat))];

    cats.forEach(cat => {
        const filtered = data.filter(i => i.cat === cat && (!isVeg || i.veg) && i.name.toLowerCase().includes(search));
        if (filtered.length > 0) {
            nav.innerHTML += `<a href="#${cat}" class="whitespace-nowrap">${cat}</a>`;
            let html = `<section id="${cat}"><h2 class="font-bold text-lg mb-4 text-gray-800 border-l-4 border-red-500 pl-2">${cat}</h2><div class="space-y-4">`;
            filtered.forEach(i => {
                html += `
                    <div class="bg-white p-4 rounded-2xl flex justify-between border shadow-sm">
                        <div class="flex-1 pr-4">
                            <div class="w-3 h-3 border ${i.veg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center mb-1">
                                <div class="w-1.5 h-1.5 ${i.veg ? 'bg-green-600' : 'bg-red-600'} rounded-full"></div>
                            </div>
                            <h3 class="font-bold text-gray-800">${i.name}</h3>
                            <p class="text-[10px] text-gray-400 mt-1">${i.desc || ''}</p>
                            <p class="text-sm font-bold mt-2">₹${i.price}</p>
                        </div>
                        <div class="flex flex-col items-center">
                            <div class="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden mb-2">
                                <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&sig=${i.name.replace(/\s+/g, '')}" class="w-full h-full object-cover">
                            </div>
                            <button onclick="addToCart('${i.name.replace(/'/g,"\\'")}', ${i.price})" class="bg-red-50 text-red-500 px-4 py-1 rounded-lg font-bold text-xs border border-red-100 hover:bg-red-500 hover:text-white transition-all">ADD</button>
                        </div>
                    </div>`;
            });
            container.innerHTML += html + `</div></section>`;
        }
    });
}

function addToCart(n, p) {
    const item = cart.find(i => i.name === n);
    if(item) item.qty++; else cart.push({name: n, price: p, qty: 1});
    updateUI();
}

function updateUI() {
    const count = cart.reduce((a, b) => a + b.qty, 0);
    document.getElementById('cartBar').classList.toggle('hidden', count === 0);
    document.getElementById('cartFab').classList.toggle('hidden', count === 0);
    document.getElementById('cartCount').innerText = `${count} Items`;
    document.getElementById('cartCountFab').innerText = count;
}

function openModal() { document.getElementById('orderModal').classList.remove('hidden'); }
function closeModal() { document.getElementById('orderModal').classList.add('hidden'); }

async function placeOrder() {
    const data = {
        customerName: document.getElementById('userName').value,
        phone: document.getElementById('userPhone').value,
        tableNum: document.getElementById('tableNum').value,
        items: cart
    };
    if(!data.customerName || !data.phone) return alert("Please fill in your name and phone number");
    const btn = document.getElementById('placeBtn');
    btn.innerText = "Processing...";
    btn.disabled = true;
    
    await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
    alert("Order Successful! We are preparing your food.");
    cart = [];
    location.reload();
}

// Admin Trigger (Logo Clicks)
let clicks = 0;
document.getElementById('adminTrigger').onclick = () => {
    clicks++;
    if(clicks === 5) {
        document.getElementById('adminModal').classList.remove('hidden');
        clicks = 0;
    }
    setTimeout(() => clicks = 0, 2000);
};

function checkAdmin() {
    const pass = document.getElementById('adminPass').value;
    if(pass === "HelloPrince") {
        window.location.href = "admin.html";
    } else {
        alert("Incorrect Pin");
    }
}

document.getElementById('vegToggle').onchange = fetchMenu;
document.getElementById('menuSearch').oninput = fetchMenu;
window.onload = fetchMenu;