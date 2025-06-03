
// financeiro.js
async function renderFinanceiroPage() {
    console.log('renderFinanceiroPage chamado');
    try {
        const content = document.getElementById('content');
        if (!content) {
            console.error('Elemento #content não encontrado');
            showCustomAlert('Erro: elemento não encontrado');
            return;
        }

        const incomesSnapshot = await db.collection('incomes').get();
        const incomes = incomesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const expensesSnapshot = await db.collection('expenses').get();
        const expenses = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const totalIncomes = incomes.reduce((sum, income) => sum + (parseFloat(income.amount) || 0), 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0);
        const balance = totalIncomes - totalExpenses;

        const clientsSnapshot = await db.collection('clients').get();
        const clients = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        let clientOptions = '<option value="">Selecione um Cliente</option>';
        clients.forEach(client => {
            clientOptions += `<option value="${client.id}">${client.nomeEmpresa}</option>`;
        });

        let incomesHTML = '';
        for (const income of incomes.slice(0, 5)) {
            const client = clients.find(c => c.id === income.clientId) || { nomeEmpresa: 'Desconhecido' };
            incomesHTML += `
                <tr>
                    <td>${income.date || '-'}</td>
                    <td>${client.nomeEmpresa}</td>
                    <td>R$ ${parseFloat(income.amount).toFixed(2)}</td>
                    <td>${income.description || '-'}</td>
                    <td>
                        <button class="edit-btn" onclick="editIncome('${income.id}')">Editar</button>
                        <button class="delete-btn" onclick="deleteIncome('${income.id}')">Excluir</button>
                    </td>
                </tr>
            `;
        }

        let expensesHTML = '';
        for (const expense of expenses.slice(0, 5)) {
            expensesHTML += `
                <tr>
                    <td>${expense.date || '-'}</td>
                    <td>${expense.category || '-'}</td>
                    <td>R$ ${parseFloat(expense.amount).toFixed(2)}</td>
                    <td>${expense.description || '-'}</td>
                    <td>
                        <button class="edit-btn" onclick="editExpense('${expense.id}')">Editar</button>
                        <button class="delete-btn" onclick="deleteExpense('${expense.id}')">Excluir</button>
                    </td>
                </tr>
            `;
        }

        content.innerHTML = `
       
            <div class="finance-container">
                <div class="left-column">
                    <div class="card balance-card">
                        <h3>Saldo Total</h3>
                        <div class="total">R$ ${balance.toFixed(2)}</div>
                        <div class="details">Entradas: R$ ${totalIncomes.toFixed(2)} | Saídas: R$ ${totalExpenses.toFixed(2)}</div>
                    </div>
                    <div class="card form-container">
                        <div class="tabs">
                            <button class="tab active" onclick="showTab('income')">Nova Entrada</button>
                            <button class="tab" onclick="showTab('expense')">Nova Saída</button>
                        </div>
                        <div id="income-form" class="tab-content active">
                            <label for="incomeClient">Cliente:</label>
                            <select id="incomeClient">${clientOptions}</select>
                            <label for="incomeAmount">Valor (R$):</label>
                            <input type="number" id="incomeAmount" placeholder="Valor (R$)" step="0.01" min="0.01" required />
                            <label for="incomeDate">Data:</label>
                            <input type="date" id="incomeDate" required />
                            <label for="incomeDescription">Descrição:</label>
                            <textarea id="incomeDescription" placeholder="Descrição"></textarea>
                            <button onclick="addIncome()">Adicionar Entrada</button>
                            <div id="income-message"></div>
                        </div>
                        <div id="expense-form" class="tab-content">
                            <label for="expenseCategory">Categoria:</label>
                            <select id="expenseCategory">
                                <option value="">Selecione a Categoria</option>
                                <option value="Funcionários">Funcionários</option>
                                <option value="Fornecedores">Fornecedores</option>
                                <option value="Manutenção">Manutenção</option>
                                <option value="Outros">Outros</option>
                            </select>
                            <label for="expenseAmount">Valor (R$):</label>
                            <input type="number" id="expenseAmount" placeholder="Valor (R$)" step="0.01" min="0.01" required />
                            <label for="expenseDate">Data:</label>
                            <input type="date" id="expenseDate" required />
                            <label for="expenseDescription">Descrição:</label>
                            <textarea id="expenseDescription" placeholder="Descrição"></textarea>
                            <button onclick="addExpense()">Adicionar Saída</button>
                            <div id="expense-message"></div>
                        </div>
                    </div>
                </div>
                <div class="right-column">
                    <div class="card">
                        <div class="filters">
                            <input type="text" id="filterClientName" placeholder="Nome do Cliente" aria-label="Filtrar por Nome do Cliente" />
                            <input type="date" id="filterStartDate" placeholder="Data Início" aria-label="Data Início" />
                            <input type="date" id="filterEndDate" placeholder="Data Fim" aria-label="Data Fim" />
                            <select id="filterCategory" aria-label="Filtrar por Categoria">
                                <option value="">Filtrar por Categoria</option>
                                <option value="Funcionários">Funcionários</option>
                                <option value="Fornecedores">Fornecedores</option>
                                <option value="Manutenção">Manutenção</option>
                                <option value="Outros">Outros</option>
                            </select>
                            <button onclick="applyFilters()" aria-label="Aplicar Filtros">Filtrar</button>
                        </div>
                        <h3>Entradas</h3>
                        <div class="table-container">
                            <table class="transaction-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Cliente</th>
                                        <th>Valor</th>
                                        <th>Descrição</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="incomesTable">${incomesHTML}</tbody>
                            </table>
                        </div>
                        <h3>Saídas</h3>
                        <div class="table-container">
                            <table class="transaction-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Categoria</th>
                                        <th>Valor</th>
                                        <th>Descrição</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody id="expensesTable">${expensesHTML}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        console.error('Erro ao carregar a página Financeiro:', e);
        showCustomAlert('Erro ao carregar a página Financeiro: ' + e.message);
        const content = document.getElementById('content');
        if (content) {
            content.innerHTML = `
                <div class="card">
                    <h2>Erro</h2>
                    <p>Não foi possível carregar a seção Financeiro. Detalhes: ${e.message}</p>
                </div>
            `;
        }
    }
}

function showTab(tabId) {
    console.log('showTab chamado para:', tabId);
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`.tab[onclick="showTab('${tabId}')"]`).classList.add('active');
    document.getElementById(`${tabId}-form`).classList.add('active');
}

async function addIncome() {
    console.log('addIncome chamado');
    const income = {
        clientId: document.getElementById('incomeClient').value,
        amount: parseFloat(document.getElementById('incomeAmount').value),
        date: document.getElementById('incomeDate').value,
        description: document.getElementById('incomeDescription').value
    };
    if (!income.clientId || isNaN(income.amount) || income.amount <= 0 || !income.date) {
        showCustomAlert('Preencha todos os campos obrigatórios para a Entrada.');
        return;
    }

    try {
        await db.collection('incomes').add(income);
        showCustomAlert('Entrada adicionada com sucesso!');
        renderFinanceiroPage();
    } catch (e) {
        console.error('Erro ao adicionar entrada:', e);
        showCustomAlert(`Erro ao adicionar entrada: ${e.message}`);
    }
}

async function editIncome(id) {
    console.log('editIncome chamado para ID:', id);
    showCustomAlert('Funcionalidade de edição de entrada em desenvolvimento.');
}

async function deleteIncome(id) {
    console.log('deleteIncome chamado para ID:', id);
    showCustomConfirm('Deseja realmente excluir esta entrada?', async (confirmed) => {
        if (confirmed) {
            try {
                await db.collection('incomes').doc(id).delete();
                showCustomAlert('Entrada excluída com sucesso!');
                renderFinanceiroPage();
            } catch (e) {
                console.error('Erro ao excluir entrada:', e);
                showCustomAlert(`Erro ao excluir entrada: ${e.message}`);
            }
        }
    });
}

async function addExpense() {
    console.log('addExpense chamado');
    const expense = {
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        date: document.getElementById('expenseDate').value,
        description: document.getElementById('expenseDescription').value
    };
    if (!expense.category || isNaN(expense.amount) || expense.amount <= 0 || !expense.date) {
        showCustomAlert('Preencha todos os campos obrigatórios para a Saída.');
        return;
    }

    try {
        await db.collection('expenses').add(expense);
        showCustomAlert('Saída adicionada com sucesso!');
        renderFinanceiroPage();
    } catch (e) {
        console.error('Erro ao adicionar saída:', e);
        showCustomAlert(`Erro ao adicionar saída: ${e.message}`);
    }
}

async function editExpense(id) {
    console.log('editExpense chamado para ID:', id);
    showCustomAlert('Funcionalidade de edição de saída em desenvolvimento.');
}

async function deleteExpense(id) {
    console.log('deleteExpense chamado para ID:', id);
    showCustomConfirm('Deseja realmente excluir esta saída?', async (confirmed) => {
        if (confirmed) {
            try {
                await db.collection('expenses').doc(id).delete();
                showCustomAlert('Saída excluída com sucesso!');
                renderFinanceiroPage();
            } catch (e) {
                console.error('Erro ao excluir saída:', e);
                showCustomAlert(`Erro ao excluir saída: ${e.message}`);
            }
        }
    });
}

async function applyFilters() {
    console.log('applyFilters chamado');
    showCustomAlert('Funcionalidade de filtro em desenvolvimento.');
}
