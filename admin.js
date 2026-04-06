const ORDERS_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQdgaoxl5GXjgUt30Z5rp28XjBp0twaPAdSIC0HqIhqDzgZ-QEuv43U6-AV9aVzX7XfcV9-2T1Lp9-H/pub?gid=0&single=true&output=csv';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYlVPSbRMZqsB79FTVIQSPnzYsYp-IovISDPo3Bj5I8HF8UM41NwrUYrHPQyMxZj88FQ/exec';

async function fetchOrders() {
    try {
        const res = await fetch(ORDERS_CSV + '&t=' + Date.now());
        const text = await res.text();
        const rows = text.split(/\r?\n/).filter(r => r.trim() !== "").slice(1);
        
        // Filter rows where Status (column index 7) is "Pending"
        const pending = rows.filter(r => {
            const cols = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return cols[7]?.trim() === "Pending";
        });
        render(pending);
    } catch (e) { console.log("Admin sync error", e); }
}

function render(rows) {
    const grid = document.getElementById('adminGrid');
    grid.innerHTML = '';
    const tickets = {};

    rows.forEach(r => {
        const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const key = c[1] + c[3] + c[0]; // Group by Name + Table + Time
        if(!tickets[key]) tickets[key] = { name: c[1], table: c[3], time: c[0], items: [] };
        tickets[key].items.push({ name: c[4], qty: c[5] });
    });

    if (Object.keys(tickets).length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-slate-600 mt-20">All orders prepared!</p>';
    }

    Object.values(tickets).reverse().forEach(t => {
        grid.innerHTML += `
            <div class="bg-slate-800 p-5 rounded-2xl border-l-4 border-red-500 shadow-2xl">
                <div class="flex justify-between mb-4">
                    <span class="font-bold text-red-500 text-lg uppercase tracking-tight">Table ${t.table}</span>
                    <span class="text-[10px] text-slate-500 font-bold uppercase py-1">${t.name}</span>
                </div>
                <ul class="space-y-2 mb-6 border-t border-slate-700 pt-4">
                    ${t.items.map(i => `<li class="flex justify-between text-sm"><span class="text-slate-300 font-medium">${i.name}</span><span class="font-bold text-red-400">x${i.qty}</span></li>`).join('')}
                </ul>
                <button onclick="done('${t.table}')" class="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors">Mark Prepared</button>
            </div>`;
    });
}

async function done(table) {
    if(!confirm(`Close order for Table ${table}?`)) return;
    await fetch(`${SCRIPT_URL}?action=complete&table=${table}`, { mode: 'no-cors' });
    fetchOrders();
}

setInterval(() => { document.getElementById('clock').innerText = new Date().toLocaleTimeString(); }, 1000);
setInterval(fetchOrders, 8000); // Check every 8 seconds
window.onload = fetchOrders;