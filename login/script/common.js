// common.js
const auth = firebase.auth();
const db = firebase.firestore();

function showCustomAlert(message) {
    console.log('showCustomAlert chamado:', message);
    const modal = document.getElementById('custom-modal');
    const modalMessage = document.getElementById('custom-modal-message');
    const modalOkBtn = document.getElementById('custom-modal-ok');
    const modalCancelBtn = document.getElementById('custom-modal-cancel');

    if (!modal || !modalMessage || !modalOkBtn) {
        console.error('Elementos do modal não encontrados');
        return;
    }

    modalMessage.textContent = message;
    modalCancelBtn.style.display = 'none';
    modalOkBtn.onclick = () => modal.style.display = 'none';
    modal.style.display = 'flex';
}

function showCustomConfirm(message, callback) {
    console.log('showCustomConfirm chamado:', message);
    const modal = document.getElementById('custom-modal');
    const modalMessage = document.getElementById('custom-modal-message');
    const modalOkBtn = document.getElementById('custom-modal-ok');
    const modalCancelBtn = document.getElementById('custom-modal-cancel');

    if (!modal || !modalMessage || !modalOkBtn || !modalCancelBtn) {
        console.error('Elementos do modal não encontrados');
        return;
    }

    modalMessage.textContent = message;
    modalCancelBtn.style.display = 'inline-block';

    modalOkBtn.onclick = () => {
        modal.style.display = 'none';
        callback(true);
    };
    modalCancelBtn.onclick = () => {
        modal.style.display = 'none';
        callback(false);
    };
    modal.style.display = 'flex';
}

async function showPage(page) {
    console.log('showPage chamado com página:', page);
    const content = document.getElementById('content');
    if (!content) {
        console.error('Elemento #content não encontrado');
        showCustomAlert('Erro: elemento de conteúdo não encontrado.');
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user && page !== 'login') {
        content.innerHTML = '<p>Por favor, faça login para acessar esta página.</p>';
        return;
    }

    document.querySelectorAll('.sidebar a').forEach(item => item.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar a[onclick="showPage('${page}')"]`);
    if (activeLink) activeLink.classList.add('active');

    try {
        content.innerHTML = '';
        if (page === 'home') {
            console.log('Renderizando Home');
            content.innerHTML = `<div class="card"><h2>Bem-vindo</h2></div>`;
            if (typeof renderTasksPanel === 'function') {
                await renderTasksPanel();
            } else {
                console.warn('renderTasksPanel não está definido');
                content.innerHTML += '<p>Funcionalidade de tarefas não disponível.</p>';
            }
        } else if (page === 'clientes') {
            console.log('Renderizando Clientes');
            if (typeof renderClientsPage === 'function') {
                await renderClientsPage();
            } else {
                console.warn('renderClientsPage não está definido');
                content.innerHTML = '<p>Página de clientes não disponível.</p>';
            }
        } else if (page === 'financeiro') {
            console.log('Renderizando Financeiro');
            if (typeof renderFinanceiroPage === 'function') {
                await renderFinanceiroPage();
            } else {
                console.warn('renderFinanceiroPage não está definido');
                content.innerHTML = '<p>Página Financeiro não disponível.</p>';
            }
        } else if (page === 'orcamentos') {
            console.log('Renderizando Orçamentos');
            if (typeof showOrcamentosPage === 'function') {
                await showOrcamentosPage();
            } else {
                console.warn('showOrcamentosPage não está definido');
                content.innerHTML = '<p>Página Orçamentos não disponível.</p>';
            }
        } else if (page === 'backup') {
            console.log('Renderizando Backup');
            if (typeof renderBackupPage === 'function') {
                await renderBackupPage();
            } else {
                console.warn('renderBackupPage não está definido');
                content.innerHTML = '<p>Página Backup não disponível.</p>';
            }
        } else {
            console.log('Página não encontrada:', page);
            content.innerHTML = '<p>Página não encontrada.</p>';
        }
    } catch (e) {
        console.error(`Erro ao carregar página ${page}:`, e.message, e.stack);
        content.innerHTML = `<p>Erro ao carregar a página: ${e.message}</p>`;
        showCustomAlert(`Erro ao carregar a página: ${e.message}`);
    }
}


// Atualizar estado da bottom nav
function updateBottomNav(page) {
    document.querySelectorAll('.bottom-nav a').forEach(link => {
        link.classList.remove('active');
    });

    const activeLink = document.getElementById(`nav-${page}`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Intercepta a função showPage já existente
const originalShowPage = window.showPage;
window.showPage = function(page) {
    if (typeof originalShowPage === 'function') {
        originalShowPage(page);
    }
    updateBottomNav(page);
};
