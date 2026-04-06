document.addEventListener('DOMContentLoaded', () => {
    const vegToggle = document.getElementById('vegToggle');
    const menuItems = document.querySelectorAll('.menu-item');

    // Veg/Non-Veg Filtering Logic
    vegToggle.addEventListener('change', () => {
        const isVegOnly = vegToggle.checked;

        menuItems.forEach(item => {
            const isItemVeg = item.getAttribute('data-veg') === 'true';
            
            if (isVegOnly && !isItemVeg) {
                // Smoothly hide non-veg items
                item.style.opacity = '0';
                setTimeout(() => item.style.display = 'none', 300);
            } else {
                item.style.display = 'flex';
                setTimeout(() => item.style.opacity = '1', 10);
            }
        });
    });

    // Add button interaction
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.innerText = 'Added';
            btn.classList.add('bg-red-500', 'text-white');
            setTimeout(() => {
                btn.innerText = 'Add';
                btn.classList.remove('bg-red-500', 'text-white');
            }, 2000);
        });
    });
});