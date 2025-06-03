// ============================
// 📤 Backup
// ============================
async function exportToExcel() {
    try {
        const clientsSnap = await db.collection('clients').get();
        const clients = clientsSnap.docs.map(doc => doc.data());

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(clients);
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
        XLSX.writeFile(wb, 'backup-clientes.xlsx');
        showCustomAlert('Backup de clientes exportado com sucesso!');
    } catch (e) {
        showCustomAlert('Erro ao exportar backup: ' + e.message);
    }
}