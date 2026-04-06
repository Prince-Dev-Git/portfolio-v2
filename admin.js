const ORDERS_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQdgaoxl5GXjgUt30Z5rp28XjBp0twaPAdSIC0HqIhqDzgZ-QEuv43U6-AV9aVzX7XfcV9-2T1Lp9-H/pub?gid=0&single=true&output=csv';
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzYlVPSbRMZqsB79FTVIQSPnzYsYp-IovISDPo3Bj5I8HF8UM41NwrUYrHPQyMxZj88FQ/exec';

async function fetchOrders() {
    try {
        const res = await fetch(ORDERS_CSV + '&t=' + Date.now());
        const text = await res.text();
        const rows = text.split(/\r?\n/).filter(r => r.trim() !== "").slice(1);
        
        const pending = rows.filter(r => {
            const cols = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            return cols[7]?.trim() === "Pending";
        });
        render(pending);
    } catch (e) { console.log(e); }
}

function render(rows) {
    const grid = document.getElementById('adminGrid');
    grid.innerHTML = '';
    const tickets = {};

    rows.forEach(r => {
        const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        const key = c[1] + c[3] + c[0]; 
        if(!tickets[key]) tickets[key] = { name: c[1], table: c[3], time: c[0], items: [] };
        tickets[key].items.push({ name: c[4], qty: c[5] });
    });

    Object.values(tickets).reverse().forEach(t => {
        grid.innerHTML += `
            <div class="bg-slate-800 p-5 rounded-2xl border-l-4 border-red-500 shadow-xl">
                <div class="flex justify-between mb-4">
                    <span class="font-bold text-red-500 uppercase">Table ${t.table}</span>
                    <span class="text-[10px] text-slate-500 font-bold uppercase">${t.name}</span>
                </div>
                <ul class="space-y-2 mb-6 border-t border-slate-700 pt-3">
                    ${t.items.map(i => `<li class="flex justify-between text-sm"><span>${i.name}</span><span class="font-bold text-red-400">x${i.qty}</span></li>`).join('')}
                </ul>
                <button onclick="done('${t.table}')" class="w-full bg-green-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all">Mark Prepared</button>
            </div>`;
    });
}

async function done(table) {
    await fetch(`${SCRIPT_URL}?action=complete&table=${table}`, { mode: 'no-cors' });
    fetchOrders();
}

setInterval(fetchOrders, 8000);
window.onload = fetchOrders;