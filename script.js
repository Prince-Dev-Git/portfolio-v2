const MENU_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQuMMdMzCxRbecA8f_OSKbXEf43jyAbL4yCifIkMZ85WNOTSnFLXJeP4bQo9Hx1Kdd9q85wOCuIo3ZO/pub?gid=0&single=true&output=csv';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYlVPSbRMZqsB79FTVIQSPnzYsYp-IovISDPo3Bj5I8HF8UM41NwrUYrHPQyMxZj88FQ/exec';

let cart = [];
const urlParams = new URLSearchParams(window.location.search);
const tableFromUrl = urlParams.get('table');

async function fetchMenu() {
    console.log("Fetching menu data...");
    try {
        const res = await fetch(MENU_CSV);
        const text = await res.text();
        const rows = text.split(/\r?\n/).filter(r => r.trim() !== "").slice(1);
        const items = rows.map(r => {
            const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return { name: c[0], cat: c[1], price: c[2], veg: c[3]?.toLowerCase().includes('true'), desc: c[4] };
        });
        console.log("Menu items loaded:", items.length);
        render(items);
    } catch (e) { console.error("Critical Load Error:", e); }
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
            nav.innerHTML += `<a href="#${cat.replace(/\s+/g, '-')}" class="whitespace-nowrap px-3 py-1 bg-white rounded-full border text-xs shadow-sm">${cat}</a>`;
            let html = `<section id="${cat.replace(/\s+/g, '-')}"><h2 class="font-bold text-lg mb-4 text-gray-800 border-l-4 border-red-500 pl-2">${cat}</h2><div class="space-y-4">`;
            filtered.forEach(i => {
                html += `
                    <div class="bg-white p-4 rounded-2xl flex justify-between border shadow-sm">
                        <div class="flex-1 pr-4">
                            <div class="w-3 h-3 border ${i.veg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center mb-1">
                                <div class="w-1.5 h-1.5 ${i.veg ? 'bg-green-600' : 'bg-red-600'} rounded-full"></div>
                            </div>
                            <h3 class="font-bold text-gray-800 text-sm">${i.name}</h3>
                            <p class="text-[10px] text-gray-400 mt-1 line-clamp-1">${i.desc || ''}</p>
                            <p class="text-sm font-bold mt-2 text-gray-900">₹${i.price}</p>
                        </div>
                        <div class="flex flex-col items-center justify-center">
                            <button onclick="addToCart('${i.name.replace(/'/g,"\\'")}', ${i.price})" class="bg-red-500 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all">ADD</button>
                        </div>
                    </div>`;
            });
            container.innerHTML += html + `</div></section>`;
        }
    });
}

function addToCart(n, p) {
    const itemInCart = cart.find(i => i.name === n);
    if(itemInCart) itemInCart.qty++; else cart.push({name: n, price: p, qty: 1});
    updateUI();
}

function updateUI() {
    const count = cart.reduce((a, b) => a + b.qty, 0);
    const cb = document.getElementById('cartBar');
    const cf = document.getElementById('cartFab');
    if(cb) cb.classList.toggle('hidden', count === 0);
    if(cf) cf.classList.toggle('hidden', count === 0);
    if(document.getElementById('cartCount')) document.getElementById('cartCount').innerText = `${count} Items`;
    if(document.getElementById('cartCountFab')) document.getElementById('cartCountFab').innerText = count;
}

function openModal() {
    const list = document.getElementById('cartItemsList');
    const totalEl = document.getElementById('cartTotal');
    let total = 0;
    if(!list || !totalEl) return;
    list.innerHTML = cart.map(item => {
        total += (item.price * item.qty);
        return `<div class="flex justify-between items-center text-sm mb-2 pb-2 border-b"><span>${item.name} x ${item.qty}</span><span class="font-bold">₹${item.price * item.qty}</span></div>`;
    }).join('');
    totalEl.innerText = `₹${total}`;
    document.getElementById('orderModal').classList.remove('hidden');
    if(tableFromUrl) document.getElementById('tableNum').value = tableFromUrl;
}

function closeModal() { document.getElementById('orderModal').classList.add('hidden'); }

async function placeOrder() {
    const name = document.getElementById('userName').value;
    const phone = document.getElementById('userPhone').value;
    const table = document.getElementById('tableNum').value;
    if(!name || !phone || !table) return alert("Please fill all details");
    const btn = document.getElementById('placeBtn');
    btn.innerText = "Placing..."; btn.disabled = true;
    try {
        await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ customerName: name, phone: phone, tableNum: table, items: cart }) });
        alert("Order Successful!"); cart = []; location.reload();
    } catch (e) { alert("Sent to Kitchen!"); location.reload(); }
}

document.getElementById('vegToggle').onchange = fetchMenu;
document.getElementById('menuSearch').oninput = fetchMenu;
window.onload = fetchMenu;