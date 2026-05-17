// Category data
const categories = {
    income: [
        { name: 'Salary', emoji: '💼' },
        { name: 'Freelance', emoji: '💻' },
        { name: 'Investment', emoji: '📈' },
        { name: 'Bonus', emoji: '🎁' },
        { name: 'Other Income', emoji: '💵' }
    ],
    expense: [
        { name: 'Food & Dining', emoji: '🍔' },
        { name: 'Transport', emoji: '🚗' },
        { name: 'Shopping', emoji: '🛍️' },
        { name: 'Entertainment', emoji: '🎬' },
        { name: 'Bills & Utilities', emoji: '📄' },
        { name: 'Healthcare', emoji: '⚕️' },
        { name: 'Education', emoji: '📚' },
        { name: 'Travel', emoji: '✈️' },
        { name: 'Subscriptions', emoji: '📺' },
        { name: 'Other Expense', emoji: '🔖' }
    ]
};

// State
let transactions = [];
let currentFilter = 'all';

// DOM Elements
const form = document.getElementById('transactionForm');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const dateInput = document.getElementById('date');
const transactionsList = document.getElementById('transactionsList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clearBtn');
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');

// Set today's date as default
dateInput.valueAsDate = new Date();

// Initialize
loadTransactions();
populateCategories();
updateDashboard();
attachEventListeners();

// Event Listeners
form.addEventListener('submit', addTransaction);
typeSelect.addEventListener('change', populateCategories);
filterBtns.forEach(btn => btn.addEventListener('click', handleFilter));
clearBtn.addEventListener('click', clearAllTransactions);

function populateCategories() {
    const type = typeSelect.value;
    categorySelect.innerHTML = '<option value="">Select Category</option>';
    
    if (type && categories[type]) {
        categories[type].forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = `${cat.emoji} ${cat.name}`;
            categorySelect.appendChild(option);
        });
    }
}

function addTransaction(e) {
    e.preventDefault();

    if (!descInput.value || !amountInput.value || !typeSelect.value || !categorySelect.value || !dateInput.value) {
        alert('Please fill all fields');
        return;
    }

    const transaction = {
        id: Date.now(),
        description: descInput.value,
        amount: parseFloat(amountInput.value),
        type: typeSelect.value,
        category: categorySelect.value,
        date: dateInput.value
    };

    transactions.push(transaction);
    saveTransactions();
    updateDashboard();
    renderTransactions();

    // Reset form
    form.reset();
    dateInput.valueAsDate = new Date();
    categorySelect.innerHTML = '<option value="">Select Category</option>';
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    updateDashboard();
    renderTransactions();
}

function renderTransactions() {
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="empty-state">No transactions yet. Add one to get started! 🚀</p>';
        return;
    }

    const filtered = transactions.filter(t => currentFilter === 'all' || t.type === currentFilter);

    if (filtered.length === 0) {
        transactionsList.innerHTML = `<p class="empty-state">No ${currentFilter} transactions found.</p>`;
        return;
    }

    transactionsList.innerHTML = filtered
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(t => `
            <div class="transaction-item ${t.type}">
                <div class="transaction-info">
                    <div class="transaction-description">${t.description}</div>
                    <div class="transaction-meta">${t.category} • ${formatDate(t.date)}</div>
                </div>
                <div class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                </div>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">Delete</button>
            </div>
        `).join('');
}

function updateDashboard() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expense;

    totalBalanceEl.textContent = `$${balance.toFixed(2)}`;
    totalIncomeEl.textContent = `$${income.toFixed(2)}`;
    totalExpenseEl.textContent = `$${expense.toFixed(2)}`;
}

function handleFilter(e) {
    filterBtns.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderTransactions();
}

function clearAllTransactions() {
    if (confirm('Are you sure you want to delete all transactions? This cannot be undone.')) {
        transactions = [];
        saveTransactions();
        updateDashboard();
        renderTransactions();
    }
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function loadTransactions() {
    const saved = localStorage.getItem('transactions');
    if (saved) {
        transactions = JSON.parse(saved);
    }
}

function attachEventListeners() {
    renderTransactions();
}

function formatDate(dateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}