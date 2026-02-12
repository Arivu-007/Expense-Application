document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const STORAGE_KEY = 'expense_tracker_data';
    let expenses = [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        expenses = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(expenses)) expenses = [];
    } catch (_) {
        expenses = [];
    }

    // --- Categories Configuration ---
    const categories = [
        { id: 'food', name: 'Food', icon: 'ph-hamburger', color: '#ff7675' },
        { id: 'transport', name: 'Transport', icon: 'ph-car', color: '#0984e3' },
        { id: 'shopping', name: 'Shopping', icon: 'ph-shopping-bag', color: '#e17055' },
        { id: 'utilities', name: 'Utilities', icon: 'ph-lightbulb', color: '#fdcb6e' },
        { id: 'entertainment', name: 'Entertainment', icon: 'ph-film-strip', color: '#a29bfe' },
        { id: 'health', name: 'Health', icon: 'ph-heart', color: '#00b894' },
        { id: 'other', name: 'Other', icon: 'ph-dots-three-circle', color: '#636e72' }
    ];

    // --- DOM Elements ---
    const balanceEl = document.getElementById('totalAmount');
    const transactionListEl = document.getElementById('transactionList');
    const spendingBarsEl = document.getElementById('spendingBars');
    const currentDateEl = document.getElementById('currentDate');
    const modal = document.getElementById('addModal');
    const addBtn = document.getElementById('addExpenseBtn');
    const closeBtn = document.getElementById('closeModal');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const expenseForm = document.getElementById('expenseForm');
    const categorySelectContainer = document.getElementById('categorySelect');
    const categoryInput = document.getElementById('expenseCategory');

    // --- Initialization ---
    init();

    function init() {
        updateDate();
        renderCategories();
        renderExpenses();
        updateBalance();
        renderChart();
    }

    // --- Event Listeners ---
    addBtn.addEventListener('click', () => {
        modal.classList.add('active');
        // Set default date to today
        document.getElementById('expenseDate').valueAsDate = new Date();
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Clear all functionality
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (expenses.length === 0) return;
            expenses = [];
            saveExpenses();
            renderExpenses();
            updateBalance();
            renderChart();
        });
    }

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addExpense();
    });

    // --- Functions ---

    function updateDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateEl.textContent = now.toLocaleDateString('en-US', options);
    }

    function renderCategories() {
        categorySelectContainer.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('div');
            btn.className = 'category-option';
            btn.innerHTML = `<i class="ph ${cat.icon}"></i> ${cat.name}`;
            btn.dataset.id = cat.id;
            btn.addEventListener('click', () => selectCategory(cat.id));
            categorySelectContainer.appendChild(btn);
        });
        // Select first by default
        if (categories.length > 0) selectCategory(categories[0].id);
    }

    function selectCategory(id) {
        // Visual update
        document.querySelectorAll('.category-option').forEach(el => {
            el.classList.remove('selected');
            if (el.dataset.id === id) el.classList.add('selected');
        });
        // Input update
        categoryInput.value = id;
    }

    function addExpense() {
        const name = document.getElementById('expenseName').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const categoryId = categoryInput.value;
        const date = document.getElementById('expenseDate').value;

        if (name.trim() === '' || isNaN(amount) || amount <= 0 || !date) {
            alert('Please fill out all fields correctly.');
            return;
        }

        const expense = {
            id: generateID(),
            name,
            amount,
            categoryId,
            date
        };

        expenses.unshift(expense); // Add to beginning
        saveExpenses();
        renderExpenses();
        updateBalance();
        renderChart();

        // Close and reset
        modal.classList.remove('active');
        expenseForm.reset();
        selectCategory(categories[0].id); // Reset category
    }

    function generateID() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    function saveExpenses() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }

    function renderExpenses() {
        transactionListEl.innerHTML = '';
        if (expenses.length === 0) {
            transactionListEl.innerHTML = `
                <li class="empty-state">
                    <i class="ph ph-receipt" style="font-size: 3rem; color: #dfe6e9; margin-bottom: 1rem;"></i>
                    <p style="color: #b2bec3;">No expenses yet. Start tracking!</p>
                </li>
            `;
            return;
        }

        expenses.forEach(expense => {
            const category = categories.find(c => c.id === expense.categoryId) || categories[categories.length - 1];
            const li = document.createElement('li');
            li.className = 'transaction-item';
            li.style.borderLeftColor = category.color;

            li.innerHTML = `
                <div class="transaction-info">
                    <span class="transaction-title">${expense.name}</span>
                    <span class="transaction-meta">
                        <i class="ph ${category.icon}"></i> ${category.name} • ${formatDate(expense.date)}
                    </span>
                </div>
                <div class="transaction-amount">
                    -$${formatMoney(expense.amount)}
                </div>
                <button class="delete-btn" style="background:none; border:none; color: #ff7675; cursor: pointer; margin-left: 10px; opacity: 0; transition: opacity 0.2s;">
                    <i class="ph ph-trash"></i>
                </button>
            `;

            // Delete functionality on hover
            li.addEventListener('mouseenter', () => {
                li.querySelector('.delete-btn').style.opacity = '1';
            });
            li.addEventListener('mouseleave', () => {
                li.querySelector('.delete-btn').style.opacity = '0';
            });

            li.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                removeExpense(expense.id);
            });

            transactionListEl.appendChild(li);
        });
    }

    function removeExpense(id) {
        expenses = expenses.filter(expense => expense.id !== id);
        saveExpenses();
        renderExpenses();
        updateBalance();
        renderChart();
    }

    function updateBalance() {
        const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
        balanceEl.innerText = `$${formatMoney(total)}`;
    }

    function renderChart() {
        // Simple visual representation of spending categories
        spendingBarsEl.innerHTML = '';
        if (expenses.length === 0) return;

        // Calculate totals by category
        const categoryTotals = {};
        let totalSpent = 0;

        expenses.forEach(exp => {
            if (!categoryTotals[exp.categoryId]) categoryTotals[exp.categoryId] = 0;
            categoryTotals[exp.categoryId] += exp.amount;
            totalSpent += exp.amount;
        });

        // Create bars
        const defaultCategory = { name: 'Other', color: '#636e72' };
        Object.keys(categoryTotals).forEach(catId => {
            const amount = categoryTotals[catId];
            const category = categories.find(c => c.id === catId) || defaultCategory;
            const percentage = (amount / totalSpent) * 100;

            if (percentage > 0) {
                const barContainer = document.createElement('div');
                barContainer.style.marginBottom = '8px';
                barContainer.innerHTML = `
                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 3px; color: #636e72;">
                        <span>${category.name}</span>
                        <span>${Math.round(percentage)}%</span>
                    </div>
                    <div style="height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                        <div style="height: 100%; width: ${percentage}%; background: ${category.color}; border-radius: 4px;"></div>
                    </div>
                 `;
                spendingBarsEl.appendChild(barContainer);
            }
        });
    }

    function formatMoney(amount) {
        return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }

    function formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
});
