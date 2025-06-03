async function renderClientsPage() {
    console.log('Rendering clients page...');
    const content = document.getElementById('content');
    if (!content) {
        console.error('Elemento #content não foi encontrado');
        showCustomAlert('Erro: elemento de conteúdo não encontrado.');
        return;
    }

    if (!firebase.auth().currentUser) {
        console.log('No usuário autenticado');
        content.innerHTML = '<p>Por favor, faça login para visualizar os clientes.</p>';
        return;
    }

    try {
        content.innerHTML = `
        <button class="novo-cliente-btn" onclick="toggleCadastroForm()">➕ Cadastrar</button>
            <div class="cardClints">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  
                    
                </div>
                <div class="cardCin">
                    <div class="category-button" onclick="filterClients('Agroindústria')">Agroindústria</div>
                    <div class="category-button" onclick="filterClients('Prefeituras')">Prefeituras</div>
                    <div class="category-button" onclick="filterClients('Fabricantes')">Fabricantes PEAD</div>
                    <div class="category-button" onclick="filterClients('Abatedouros')">Abatedouros</div>
                </div>
                <div id="client-list" class="client-list"></div>
            </div>
        `;
        await filterClients('Agroindústria');
    } catch (error) {
        console.error('Erro ao renderizar a página de clientes:', error.message, error.stack);
        content.innerHTML = `<p>Erro ao carregar os clientes: ${error.message}</p>`;
        showCustomAlert(`Erro ao carregar os clientes: ${error.message}`);
    }
}

async function filterClients(category) {
    console.log('Filtrando clientes por categoria:', category);
    const list = document.getElementById('client-list');
    if (!list) {
        console.error('Elemento #client-list não foi encontrado');
        showCustomAlert('Erro: elemento da lista de clientes não encontrado.');
        return;
    }

    if (!firebase.auth().currentUser) {
        list.innerHTML = '<p>Por favor, faça login para visualizar os clientes.</p>';
        return;
    }

    try {
        list.innerHTML = '<p>Carregando...</p>';
        const snapshot = await db.collection('clients').where('tipoCliente', '==', category).get();
        let html = `<div class="cardCin client-category"><h3>${category}</h3>`;
        if (snapshot.empty) {
            html += `<p>Nenhum cliente encontrado.</p>`;
        } else {
            snapshot.forEach(doc => {
                const clientData = doc.data();
                html += `<div class="client-item" onclick="showClientDetails('${doc.id}')">${clientData.nomeEmpresa || 'Sem nome'} - ${clientData.contato || 'Sem contato'}</div>`;
            });
        }
        html += '</div>';
        list.innerHTML = html;
    } catch (error) {
        console.error('Erro ao filtrar clientes:', error.message, error.stack);
        list.innerHTML = `<p>Erro ao carregar os clientes: ${error.message}</p>`;
        showCustomAlert(`Erro ao carregar os clientes: ${error.message}`);
    }
}

function toggleCadastroForm(client = {}, id = null) {
    console.log('Toggling cadastro de clientes...');
    const popup = document.querySelector('#client-form-popup');
    const popupContent = document.querySelector('#client-form-content');

    if (!popup || !popupContent) {
        console.error('Elementos do popup de formulário não foram encontrados');
        showCustomAlert('Erro: elemento do popup de formulário não encontrado.');
        return;
    }

    if (popup.style.display === 'flex') {
        popup.style.display = 'none';
        popupContent.innerHTML = '';
    } else {
        renderClientForm(client, id);
        popup.style.display = 'flex';
        const nomeEmpresaInput = popup.querySelector('#nomeEmpresa');
        if (nomeEmpresaInput) nomeEmpresaInput.focus();
    }
}

function renderClientForm(client = {}, id = null) {
    console.log('Rendering formulário de cliente...');
    const popupContent = document.querySelector('#client-form-content');
    if (!popupContent) {
        console.error('Elemento #client-form-content não foi encontrado');
        return;
    }
    popupContent.innerHTML = `
        <div class="client-form-grid">
            <h3>${id ? 'Editar Cliente' : 'Cadastrar Cliente'}</h3>
            <div class="form-row">
                <div class="form-group">
                    <label for="nomeEmpresa">Nome da Empresa:</label>
                    <input type="text" id="nomeEmpresa" value="${client.nomeEmpresa || ''}" />
                </div>
                <div class="form-group">
                    <label for="contato">Contato:</label>
                    <input type="text" id="contato" value="${client.contato || ''}" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="tipoCliente">Tipo de Cliente:</label>
                    <select id="tipoCliente">
                        <option value="">Selecione</option>
                        <option value="Agroindústria" ${client.tipoCliente === 'Agroindústria' ? 'selected' : ''}>Agroindústria</option>
                        <option value="Prefeituras" ${client.tipoCliente === 'Prefeituras' ? 'selected' : ''}>Prefeituras</option>
                        <option value="Fabricantes PEAD" ${client.tipoCliente === 'Fabricantes PEAD' ? 'selected' : ''}>Fabricantes PEAD</option>
                        <option value="Abatedouros" ${client.tipoCliente === 'Abatedouros' ? 'selected' : ''}>Abatedouros</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="estado">Estado:</label>
                    <input type="text" id="estado" value="${client.estado || ''}" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="cidade">Cidade:</label>
                    <input type="text" id="cidade" value="${client.cidade || ''}" />
                </div>
                <div class="form-group">
                    <label for="telefone">Telefone:</label>
                    <input type="text" id="telefone" value="${client.telefone || ''}" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" value="${client.email || ''}" />
                </div>
                <div class="form-group">
                    <label for="responsavel">Responsável:</label>
                    <input type="text" id="responsavel" value="${client.responsavel || ''}" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="statusContato">Status do Contato:</label>
                    <input type="text" id="statusContato" value="${client.statusContato || ''}" />
                </div>
                <div class="form-group">
                    <label for="dataContato">Data do Primeiro Contato:</label>
                    <input type="date" id="dataContato" value="${client.dataContato || ''}" />
                </div>
            </div>
            <div class="form-row">
                <div class="form-group full-width">
                    <label for="observacoes">Observações:</label>
                    <textarea id="observacoes">${client.observacoes || ''}</textarea>
                </div>
            </div>
            <div class="form-buttons">
                <button class="form-button save-btn" onclick="${id ? `updateClient('${id}')` : 'saveClient()'}">Salvar</button>
                <button class="form-button close-btn" onclick="toggleCadastroForm()">Cancelar</button>
            </div>
            <div id="form-message"></div>
        </div>
    `;
}

function getClientFormData() {
    return {
        nomeEmpresa: document.querySelector('#nomeEmpresa')?.value.trim() || '',
        contato: document.querySelector('#contato')?.value.trim() || '',
        tipoCliente: document.querySelector('#tipoCliente')?.value || '',
        estado: document.querySelector('#estado')?.value.trim() || '',
        cidade: document.querySelector('#cidade')?.value.trim() || '',
        telefone: document.querySelector('#telefone')?.value.trim() || '',
        email: document.querySelector('#email')?.value.trim() || '',
        responsavel: document.querySelector('#responsavel')?.value.trim() || '',
        statusContato: document.querySelector('#statusContato')?.value.trim() || '',
        dataContato: document.querySelector('#dataContato')?.value || '',
        observacoes: document.querySelector('#observacoes')?.value.trim() || ''
    };
}

async function saveClient() {
    console.log('Salvando cliente...');
    if (!firebase.auth().currentUser) {
        showCustomAlert('Você precisa estar logado para cadastrar clientes.');
        return;
    }

    const client = getClientFormData();
    if (!client.nomeEmpresa || !client.email || !client.tipoCliente) {
        showCustomAlert('Nome da Empresa, Email e Tipo de Cliente são obrigatórios.');
        return;
    }

    try {
        await db.collection('clients').add({
            ...client,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showCustomAlert('Cliente salvo com sucesso!');
        toggleCadastroForm();
        await filterClients(client.tipoCliente || 'Agroindústria');
    } catch (error) {
        console.error('Erro ao salvar cliente:', error.message, error.stack);
        showCustomAlert(`Erro ao salvar cliente: ${error.message}`);
    }
}

async function updateClient(id) {
    console.log('Atualizando cliente ID:', id);
    if (!firebase.auth().currentUser) {
        showCustomAlert('Você precisa estar logado para atualizar clientes.');
        return;
    }

    const client = getClientFormData();
    if (!client.nomeEmpresa || !client.email || !client.tipoCliente) {
        showCustomAlert('Nome da Empresa, Email e Tipo de Cliente são obrigatórios.');
        return;
    }

    try {
        await db.collection('clients').doc(id).update(client);
        showCustomAlert('Cliente atualizado com sucesso!');
        toggleCadastroForm();
        await filterClients(client.tipoCliente || 'Agroindústria');
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error.message, error.stack);
        showCustomAlert(`Erro ao atualizar cliente: ${error.message}`);
    }
}

async function showClientDetails(id) {
    console.log('Exibindo detalhes do cliente ID:', id);

    const popup = document.querySelector('#popup');
    const popupContent = document.querySelector('#popup-content');

    if (!popup || !popupContent) {
        console.error('Popup ou popup-content não encontrados');
        showCustomAlert('Erro: popup de visualização não encontrado.');
        return;
    }

    // Limpar conteúdo existente
    popupContent.innerHTML = '';
    popup.style.display = 'flex';

    try {
        popupContent.innerHTML = '<p>Carregando...</p>';

        const doc = await db.collection('clients').doc(id).get();
        if (!doc.exists) {
            popupContent.innerHTML = '<p>Cliente não encontrado.</p>';
            showCustomAlert('Cliente não encontrado.');
            return;
        }

        const client = doc.data();
        popupContent.innerHTML = `
          
            <h3>${client.nomeEmpresa || 'Sem nome'}</h3>
            <p><strong>Contato:</strong> ${client.contato || '-'}</p>
            <p><strong>Tipo:</strong> ${client.tipoCliente || '-'}</p>
            <p><strong>Estado:</strong> ${client.estado || '-'}</p>
            <p><strong>Cidade:</strong> ${client.cidade || '-'}</p>
            <p><strong>Telefone:</strong> ${client.telefone || '-'}</p>
            <p><strong>Email:</strong> ${client.email || '-'}</p>
            <p><strong>Responsável:</strong> ${client.responsavel || '-'}</p>
            <p><strong>Status:</strong> ${client.statusContato || '-'}</p>
            <p><strong>Data Contato:</strong> ${client.dataContato || '-'}</p>
            <p><strong>Observações:</strong> ${client.observacoes || '-'}</p>
        `;

        // Vincular eventos
        const editBtn = document.querySelector('#edit-client-btn');
        const deleteBtn =  document.querySelector('#delete-client-btn');
        const closeBtn =  document.querySelector('#close-popup-btn');

        if (editBtn) {
            editBtn.addEventListener('click', () => {
                console.log('Botão Editar clicado');
                editClient(id);
            });
        } else {
            console.error('Botão #edit-client-btn não encontrado');
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                console.log('Botão Excluir clicado');
                deleteClient(id);
            });
        } else {
            console.error('Botão #delete-client-btn não encontrado');
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('Botão Fechar clicado');
                popup.style.display = 'none';
                popupContent.innerHTML = '';
            });
        } else {
            console.error('Botão #close-popup-btn não encontrado');
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes do cliente:', error.message, error.stack);
        popupContent.innerHTML = `<p>Erro ao carregar detalhes do cliente: ${error.message}</p>`;
        showCustomAlert(`Erro ao carregar detalhes do cliente: ${error.message}`);
    }
}

async function editClient(id) {
    console.log('Editando cliente ID:', id);
    try {
        const doc = await db.collection('clients').doc(id).get();
        if (!doc.exists) {
            showCustomAlert('Cliente não encontrado.');
            return;
        }
        const popup = document.querySelector('#popup');
        if (popup) {
            popup.style.display = 'none';
            popup.querySelector('#popup-content').innerHTML = '';
        }
        toggleCadastroForm(doc.data(), id);
    } catch (error) {
        showCustomAlert('Erro ao carregar cliente para edição: ' + error.message);
        console.error('Erro ao editar cliente:', error);
    }
}

async function deleteClient(id) {
    console.log('Excluindo cliente ID:', id);
    showCustomConfirm('Deseja realmente excluir este cliente?', async (confirmed) => {
        if (confirmed) {
            try {
                await db.collection('clients').doc(id).delete();
                showCustomAlert('Cliente excluído com sucesso!');
                const popup = document.querySelector('#popup');
                if (popup) {
                    popup.style.display = 'none';
                    popup.querySelector('#popup-content').innerHTML = '';
                }
                await filterClients('Agroindústria');
            } catch (error) {
                showCustomAlert('Erro ao excluir cliente: ' + error.message);
                console.error('Erro ao excluir cliente:', error);
            }
        }
    });
}