// ============================
// 🔎 Busca
// ============================
async function searchClients() {
    const term = document.getElementById('search-input').value.trim().toLowerCase();
    const popup = document.getElementById('popup');
    const popupContent = document.getElementById('popup-content');

    if (!term) {
        showCustomAlert('Digite algo para pesquisar.');
        return;
    }

    const snapshot = await db.collection('clients').get();
    const results = snapshot.docs.filter(doc => doc.data().nomeEmpresa.toLowerCase().includes(term));

    let html = `<h3>Resultados:</h3>`;
    html += results.length === 0 ? '<p>Nenhum cliente encontrado.</p>' :
        results.map(doc => `<div class="search-result" onclick="showClientDetails('${doc.id}')">${doc.data().nomeEmpresa}</div>`).join('');

    popupContent.innerHTML = html;
    document.getElementById('close-popup-btn').onclick = () => popup.style.display = 'none';
    document.getElementById('edit-client-btn').style.display = 'none';
    document.getElementById('delete-client-btn').style.display = 'none';
    popup.style.display = 'flex';
}

