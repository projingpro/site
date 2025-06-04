async function showOrcamentosPage() {
    const content = document.getElementById('content');

    const clientsSnap = await db.collection('clients').get();
    const clients = clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const orcamentosSnap = await db.collection('orcamentos').get();
    const orcamentos = orcamentosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const orcamentosPorCliente = {};
    orcamentos.forEach(orc => {
        if (!orcamentosPorCliente[orc.clienteId]) {
            orcamentosPorCliente[orc.clienteId] = [];
        }
        orcamentosPorCliente[orc.clienteId].push(orc);
    });

    let listaHTML = '';
    for (const clienteId in orcamentosPorCliente) {
        const client = clients.find(c => c.id === clienteId) || { nomeEmpresa: 'Cliente Desconhecido' };
        listaHTML += `
            <div class="card client-category">
                <h3>${client.nomeEmpresa}</h3>
                ${orcamentosPorCliente[clienteId].map(o => `
                    <div class="client-item" onclick="showOrcamentoDetails('${o.id}')">
                        <strong>Número:</strong> ${o.numeroOrcamento} |
                        <strong>Valor:</strong> R$ ${parseFloat(o.valorFinal).toFixed(2)} |
                        <strong>Data:</strong> ${o.dataOrcamento || 'N/A'}
                    </div>
                `).join('')}
            </div>
        `;
    }

    content.innerHTML = `
        <button class="novo-orcamento-btn-mobile" onclick="abrirNovoOrcamento()">➕ Novo Orçamento</button>
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2>Orçamentos</h2>
                <button class="novo-orcamento-btn-desktop" onclick="abrirNovoOrcamento()">➕ Novo Orçamento</button>
            </div>
        </div>
        ${listaHTML || '<p>Nenhum orçamento encontrado.</p>'}
    `;
}

async function abrirNovoOrcamento(id = null) {
    try {
        const content = document.getElementById('content');
        if (!content) {
            console.error('Elemento #content não encontrado');
            showCustomAlert('Erro: Elemento de conteúdo não encontrado.');
            return;
        }

        const clientsSnap = await db.collection('clients').get();
        const clients = clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        let clientOptions = '<option value="">Selecione um Cliente</option>';
        clients.forEach(client => {
            clientOptions += `<option value="${client.id}">${client.nomeEmpresa}</option>`;
        });

        let orcamento = {
            clienteId: '',
            dataOrcamento: '',
            descricaoGeral: '',
            prazoExecucao: '',
            validadeProposta: '',
            formaPagamento: '',
            itensServico: []
        };

        if (id) {
            const doc = await db.collection('orcamentos').doc(id).get();
            if (doc.exists) {
                orcamento = { ...doc.data(), id };
            } else {
                showCustomAlert('Orçamento não encontrado.');
                return;
            }
        }

        content.innerHTML = `
            <div class="card form-container">
                <h2>${id ? 'Editar Orçamento' : 'Novo Orçamento'}</h2>
                <label>Cliente:</label>
                <select id="orcCliente" required>${clientOptions}</select>
                <label>Data do Orçamento:</label>
                <input type="date" id="dataOrcamento" value="${orcamento.dataOrcamento || ''}" />
                <label>Descrição Geral:</label>
                <textarea id="descricaoGeral">${orcamento.descricaoGeral || ''}</textarea>
                <label>Prazo de Execução:</label>
                <input type="text" id="prazoExecucao" value="${orcamento.prazoExecucao || ''}" />
                <label>Validade da Proposta:</label>
                <input type="text" id="validadeProposta" value="${orcamento.validadeProposta || ''}" />
                <label>Forma de Pagamento:</label>
                <input type="text" id="formaPagamento" value="${orcamento.formaPagamento || ''}" />
                <label>Itens de Serviço:</label>
                <div id="itens-servico"></div>
                <button onclick="adicionarItemServico()">Adicionar Item</button>
                <label>Valor Final (R$):</label>
                <input type="number" id="valorFinal" value="${orcamento.valorFinal || 0}" readonly />
                <div class="form-buttons">
                    <button class="form-button save-btn" onclick="${id ? `salvarOrcamento('${id}')` : 'salvarOrcamento()'}">Salvar</button>
                    <button class="form-button close-btn" onclick="showOrcamentosPage()">Cancelar</button>
                </div>
                <div id="form-message"></div>
            </div>
        `;

        const container = document.getElementById('itens-servico');
        if (orcamento.itensServico && orcamento.itensServico.length > 0) {
            orcamento.itensServico.forEach(item => {
                const div = document.createElement('div');
                div.className = 'item-servico';
                div.innerHTML = `
                    <input type="text" class="servico-nome" value="${item.servico || ''}" placeholder="Nome do Serviço" />
                    <input type="text" class="servico-quantidade" value="${item.quantidade || ''}" placeholder="Quantidade" />
                    <input type="number" class="servico-total" value="${item.total || ''}" step="0.01" placeholder="Total (R$)" oninput="calcularValorFinal()" />
                    <button onclick="removerItemServico(this)">-</button>
                `;
                container.appendChild(div);
            });
        } else {
            adicionarItemServico();
        }

        if (orcamento.clienteId) {
            document.getElementById('orcCliente').value = orcamento.clienteId;
        }

        calcularValorFinal();
    } catch (e) {
        showCustomAlert('Erro ao carregar formulário: ' + e.message);
        console.error('Erro em abrirNovoOrcamento:', e);
    }
}

function adicionarItemServico() {
    const container = document.getElementById('itens-servico');
    const div = document.createElement('div');
    div.className = 'item-servico';
    div.innerHTML = `
        <input type="text" class="servico-nome" placeholder="Nome do Serviço" />
        <input type="text" class="servico-quantidade" placeholder="Quantidade" />
        <input type="number" class="servico-total" step="0.01" placeholder="Total (R$)" oninput="calcularValorFinal()" />
        <button onclick="removerItemServico(this)">-</button>
    `;
    container.appendChild(div);
    calcularValorFinal();
}

function removerItemServico(button) {
    button.parentElement.remove();
    calcularValorFinal();
}

function calcularValorFinal() {
    const itens = document.querySelectorAll('.item-servico');
    let total = 0;
    itens.forEach(item => {
        const totalInput = item.querySelector('.servico-total');
        if (totalInput && totalInput.value) {
            total += parseFloat(totalInput.value) || 0;
        }
    });
    const valorFinalInput = document.getElementById('valorFinal');
    if (valorFinalInput) {
        valorFinalInput.value = total.toFixed(2);
    }
}

async function salvarOrcamento(id = null) {
    try {
        const orcamento = {
            clienteId: document.getElementById('orcCliente').value,
            dataOrcamento: document.getElementById('dataOrcamento').value,
            descricaoGeral: document.getElementById('descricaoGeral').value,
            prazoExecucao: document.getElementById('prazoExecucao').value,
            validadeProposta: document.getElementById('validadeProposta').value,
            formaPagamento: document.getElementById('formaPagamento').value,
            valorFinal: parseFloat(document.getElementById('valorFinal').value) || 0,
            itensServico: Array.from(document.querySelectorAll('.item-servico')).map(item => ({
                servico: item.querySelector('.servico-nome').value,
                quantidade: item.querySelector('.servico-quantidade').value,
                total: parseFloat(item.querySelector('.servico-total').value) || 0
            }))
        };

        if (!orcamento.clienteId || orcamento.itensServico.length === 0) {
            showCustomAlert('Preencha o cliente e pelo menos um item de serviço.');
            return;
        }

        if (id) {
            await db.collection('orcamentos').doc(id).update(orcamento);
            showCustomAlert('Orçamento atualizado com sucesso!');
        } else {
            // Contar orçamentos do ano atual para gerar número sequencial
            const currentYear = new Date().getFullYear();
            const orcamentosSnap = await db.collection('orcamentos')
                .where('dataOrcamento', '>=', `${currentYear}-01-01`)
                .where('dataOrcamento', '<=', `${currentYear}-12-31`)
                .get();
            const count = orcamentosSnap.docs.length + 1; // Próximo número
            const numeroOrcamento = `ORC-${String(count).padStart(3, '0')}/${currentYear}`;

            await db.collection('orcamentos').add({
                ...orcamento,
                numeroOrcamento: numeroOrcamento
            });
            showCustomAlert('Orçamento salvo com sucesso!');
        }

        showOrcamentosPage();
    } catch (e) {
        showCustomAlert('Erro ao salvar orçamento: ' + e.message);
        console.error('Erro em salvarOrcamento:', e);
    }
}

async function showOrcamentoDetails(id) {
    const popup = document.getElementById('orcamento-details-popup');
    const popupContent = document.getElementById('orcamento-details-content');

    try {
        const doc = await db.collection('orcamentos').doc(id).get();
        if (!doc.exists) {
            popupContent.innerHTML = '<p>Orçamento não encontrado.</p>';
            popup.style.display = 'flex';
            return;
        }

        const o = doc.data();
        const clientSnap = await db.collection('clients').doc(o.clienteId).get();
        const client = clientSnap.exists ? clientSnap.data() : { nomeEmpresa: 'Cliente Desconhecido' };

        const itensHtml = o.itensServico.map(item => `
            <tr>
                <td>${item.servico}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${parseFloat(item.total).toFixed(2)}</td>
            </tr>
        `).join('');

        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, '0');
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = hoje.getFullYear();
        const dataFormatada = `${dia}/${mes}/${ano}`;

        popupContent.innerHTML = `
        <div id="pj-container">
            <header id="pj-header">
                <div id="pj-header-grid">
                    <div id="pj-logo">
                        <img src="logoorc.svg" alt="Logo Projing" />
                    </div>
                    <div id="pj-contato">
                        <strong id="pj-contato-nome">Marco Antônio</strong>
                        <span>📱 (44) 9 8414-7645</span><br />
                        <span>📧 marcoantonio@projing.pro</span><br />
                        <span>🌐 www.projing.pro</span>
                    </div>
                </div>
                <div id="pj-sub-header">
                    <div>Orçamento</div>
                    <div id="pj-codigo-proposta">${o.numeroOrcamento}</div>
                    <div id="pj-data-proposta">${dataFormatada}</div>
                </div>
            </header>

            <section class="pj-section">
                <h2>Descrição Geral</h2>
                <p>${o.descricaoGeral || '-'}</p>
            </section>

            <section class="pj-section">
                <h2>Descrição de Itens</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Serviço</th>
                            <th>Quant.</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itensHtml}
                    </tbody>
                </table>
            </section>

            <section class="pj-section">
                <h2>observações</h2>
                <p><strong>Importante:</strong></p>
                <ul>
                    <li>Prazo de execução: ${o.prazoExecucao || '-'}</li>
                    <li>Validade da proposta: ${o.validadeProposta || '-'}</li>
                </ul>
            </section>

            <section class="pj-section">
                <h2>Total</h2>
                <p class="pj-highlight">R$ ${parseFloat(o.valorFinal).toFixed(2)}</p>
            </section>

            <section class="pj-section">
                <h2>Forma de Pagamento</h2>
                <p>${o.formaPagamento || '-'}</p>
            </section>

            <footer id="pj-footer">
                <p><strong>⚠️ Importante</strong></p>
                <p>Esse orçamento baseado nos dados fornecidos pelo contratante. Alterações encontradas "in loco" deverão passar por análise e revisão deste orçamento.</p>
            </footer>
        </div>
        `;

        document.querySelector('.orcamento-details-sidebar').innerHTML = `
            <button onclick="gerarPDF()">📄 Salvar PDF</button>
            <button onclick="editOrcamento('${id}')">✏️ Editar</button>
            <button class="delete-btn" onclick="deleteOrcamento('${id}')">🗑️ Excluir</button>
            <button onclick="document.getElementById('orcamento-details-popup').style.display='none'">❌ Fechar</button>
        `;
            document.querySelector('.orcamento-details-sidebar-mobile').innerHTML = `
            <button onclick="gerarPDF()">📄 Salvar PDF</button>
            <button onclick="editOrcamento('${id}')">✏️ Editar</button>
            <button class="delete-btn" onclick="deleteOrcamento('${id}')">🗑️ Excluir</button>
            <button onclick="document.getElementById('orcamento-details-popup').style.display='none'">❌ Fechar</button>
        `;
           
        popup.style.display = 'flex';
        
         
    } catch (error) {
        popupContent.innerHTML = `<p>Erro ao carregar orçamento: ${error.message}</p>`;
        popup.style.display = 'flex';
    }
}

async function gerarPDF() {
    if (!window.jspdf || !window.htmlToImage) {
        showCustomAlert('Erro: Bibliotecas jsPDF ou html-to-image não estão carregadas.');
        console.error('jsPDF or html-to-image not loaded.');
        return;
    }

    const node = document.querySelector('#orcamento-details-content > div#pj-container');
    if (!node) {
        showCustomAlert('Erro: Conteúdo do orçamento não encontrado na tela.');
        console.error('Element #pj-container not found.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const filename = `${document.getElementById('pj-codigo-proposta')?.innerText || 'orcamento'}.pdf`;

    try {
        await new Promise(resolve => setTimeout(resolve, 100));
        const dataUrl = await window.htmlToImage.toPng(node, {
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            skipAutoScale: true,
            imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1L8SgAAAABJRU5ErkJggg=='
        });

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        if (imgHeight > pdfHeight) {
            const ratio = pdfHeight / imgHeight;
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeight * ratio);
        } else {
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeight);
        }

        pdf.save(filename);
        showCustomAlert('PDF gerado com sucesso!');
    } catch (error) {
        showCustomAlert('Erro ao gerar PDF: ' + error.message);
        console.error('Erro ao gerar PDF:', error);
    }
}

async function editOrcamento(id) {
    try {
        await abrirNovoOrcamento(id);
    } catch (e) {
        showCustomAlert('Erro ao carregar orçamento para edição: ' + e.message);
        console.error('Erro de edição de orçamento:', e);
    }
}

function deleteOrcamento(id) {
    const modal = document.getElementById('custom-modal');
    const message = document.getElementById('custom-modal-message');
    const okButton = document.getElementById('custom-modal-ok');
    const cancelButton = document.getElementById('custom-modal-cancel');

    message.innerText = 'Deseja realmente excluir este orçamento?';
    modal.style.display = 'flex';
    cancelButton.style.display = 'inline-block';

    okButton.onclick = async () => {
        try {
            await db.collection('orcamentos').doc(id).delete();
            modal.style.display = 'none';
            showCustomAlert('Orçamento excluído com sucesso.');
            document.getElementById('orcamento-details-popup').style.display = 'none';
            showOrcamentosPage();
        } catch (e) {
            modal.style.display = 'none';
            showCustomAlert('Erro ao excluir orçamento: ' + e.message);
        }
    };

    cancelButton.onclick = () => {
        modal.style.display = 'none';
    };
}