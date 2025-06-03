console.log('tasks.js carregado');

async function renderTasksPanel() {
    console.log('renderTasksPanel chamado');
    const content = document.getElementById('content');
    if (!content) {
        console.error('Elemento #content não encontrado');
        return;
    }

    // Verificar autenticação
    const user = firebase.auth().currentUser;
    console.log('Usuário autenticado:', user ? user.uid : 'Nenhum usuário');
    if (!user) {
        const tasksPanel = document.createElement('div');
        tasksPanel.className = 'card tasks-panel';
        tasksPanel.innerHTML = '<p>Por favor, faça login para visualizar as tarefas.</p>';
        content.appendChild(tasksPanel);
        return;
    }

    try {
        // Carregar tarefas do Firebase
        console.log('Carregando tarefas do Firestore...');
        let tasksHTML = '<p>Nenhuma tarefa encontrada.</p>';
        try {
            const tasksSnap = await db.collection('tasks').orderBy('createdAt', 'desc').get();
            const tasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            tasksHTML = tasks.map(task => `
                <div class="task-item" style="${task.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleTaskCompletion('${task.id}', ${!task.completed})">
                    <span>${task.description}</span>
                    <div class="task-actions">
                        <button class="task-edit-btn" onclick="showEditTaskInput('${task.id}', '${task.description.replace(/'/g, "\\'")}')">✏️</button>
                        <button class="task-delete-btn" onclick="deleteTask('${task.id}')">🗑️</button>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            console.error('Erro ao carregar tarefas:', e);
            tasksHTML = `<p>Erro ao carregar tarefas: ${e.message}</p>`;
        }

        // Renderizar painel de tarefas
        const tasksPanel = document.createElement('div');
        tasksPanel.className = 'card tasks-panel';
        tasksPanel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Tarefas</h2>
                <button class="add-task-btn" onclick="toggleAddTaskInput()">➕ Adicionar Tarefa</button>
            </div>
            <div id="add-task-form" class="add-task-form" style="display: none;">
                <input type="text" id="new-task-description" placeholder="Digite a descrição da tarefa" onkeypress="if(event.key === 'Enter') addTask();">
                <div class="task-form-buttons">
                    <button class="task-save-btn" onclick="addTask()">Salvar</button>
                    <button class="task-cancel-btn" onclick="toggleAddTaskInput()">Cancelar</button>
                </div>
            </div>
            <div class="tasks-list">
                ${tasksHTML}
            </div>
        `;
        content.appendChild(tasksPanel);
    } catch (e) {
        console.error('Erro em renderTasksPanel:', e);
        const tasksPanel = document.createElement('div');
        tasksPanel.className = 'card tasks-panel';
        tasksPanel.innerHTML = `<p>Erro ao carregar o painel de tarefas: ${e.message}</p>`;
        content.appendChild(tasksPanel);
    }
}

function toggleAddTaskInput() {
    console.log('toggleAddTaskInput chamado');
    const form = document.getElementById('add-task-form');
    const input = document.getElementById('new-task-description');
    if (form.style.display === 'none') {
        form.style.display = 'flex';
        input.focus();
    } else {
        form.style.display = 'none';
        input.value = '';
    }
}

async function addTask() {
    console.log('addTask chamado');
    if (!firebase.auth().currentUser) {
        showCustomAlert('Você precisa estar logado para adicionar tarefas.');
        return;
    }

    const descriptionInput = document.getElementById('new-task-description');
    const description = descriptionInput.value.trim();
    if (!description) {
        showCustomAlert('A descrição da tarefa não pode estar vazia.');
        return;
    }

    try {
        await db.collection('tasks').add({
            description: description,
            completed: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        showCustomAlert('Tarefa adicionada com sucesso!');
        descriptionInput.value = ''; // Limpa o input
        document.getElementById('add-task-form').style.display = 'none'; // Esconde o formulário
        showPage('home'); // Recarrega a página inicial
    } catch (e) {
        showCustomAlert('Erro ao adicionar tarefa: ' + e.message);
        console.error('Erro em addTask:', e);
    }
}

function showEditTaskInput(id, currentDescription) {
    console.log('showEditTaskInput chamado para ID:', id);
    const taskItem = document.querySelector(`.task-item input[onclick*="toggleTaskCompletion('${id}',"]`).parentElement;
    const span = taskItem.querySelector('span');
    span.innerHTML = `
        <input type="text" class="edit-task-input" value="${currentDescription.replace(/\\'/g, "'")}" onkeypress="if(event.key === 'Enter') editTask('${id}', this.value);">
        <div class="task-form-buttons">
            <button class="task-save-btn" onclick="editTask('${id}', document.querySelector('.edit-task-input').value)">Salvar</button>
            <button class="task-cancel-btn" onclick="showPage('home')">Cancelar</button>
        </div>
    `;
    taskItem.querySelector('.edit-task-input').focus();
}

async function editTask(id, newDescription) {
    console.log('editTask chamado para ID:', id);
    if (!firebase.auth().currentUser) {
        showCustomAlert('Você precisa estar logado para editar tarefas.');
        return;
    }

    newDescription = newDescription.trim();
    if (!newDescription) {
        showCustomAlert('A descrição da tarefa não pode estar vazia.');
        return;
    }

    try {
        await db.collection('tasks').doc(id).update({
            description: newDescription
        });
        showCustomAlert('Tarefa atualizada com sucesso!');
        showPage('home'); // Recarrega a página inicial
    } catch (e) {
        showCustomAlert('Erro ao editar tarefa: ' + e.message);
        console.error('Erro em editTask:', e);
    }
}

async function deleteTask(id) {
    console.log('deleteTask chamado para ID:', id);
    if (!firebase.auth().currentUser) {
        showCustomAlert('Você precisa estar logado para excluir tarefas.');
        return;
    }

    showCustomConfirm('Deseja realmente excluir esta tarefa?', async (confirmed) => {
        if (!confirmed) return;
        try {
            await db.collection('tasks').doc(id).delete();
            showCustomAlert('Tarefa excluída com sucesso.');
            showPage('home'); // Recarrega a página inicial
        } catch (e) {
            showCustomAlert('Erro ao excluir tarefa: ' + e.message);
            console.error('Erro em deleteTask:', e);
        }
    });
}

async function toggleTaskCompletion(id, completed) {
    console.log('toggleTaskCompletion chamado para ID:', id, 'Completed:', completed);
    if (!firebase.auth().currentUser) {
        showCustomAlert('Você precisa estar logado para atualizar tarefas.');
        return;
    }

    try {
        await db.collection('tasks').doc(id).update({
            completed: completed
        });
        showPage('home'); // Recarrega a página inicial
    } catch (e) {
        showCustomAlert('Erro ao atualizar tarefa: ' + e.message);
        console.error('Erro em toggleTaskCompletion:', e);
    }
}