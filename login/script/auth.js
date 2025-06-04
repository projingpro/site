// ============================
// 🔐 Login e Sessão
// ============================
window.onload = () => {
    auth.signOut(); // Força logout ao carregar
};

auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('main').style.display = 'flex';
        showPage('home');
        document.querySelector('.bottom-nav').style.display = 'flex'
    } else {
        document.querySelector('.bottom-nav').style.display = 'none'
        document.getElementById('main').style.display = 'none';
        document.getElementById('login').style.display = 'flex';
    }
});

function login() {
    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('login-error');

    if (!email || !password) {
        errorDiv.textContent = 'Preencha e-mail e senha.';
        return;
    }

    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            errorDiv.textContent = '';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        })
        .catch(error => {
            errorDiv.textContent = 'Erro no login: ' + error.message;
            document.getElementById('login').style.display = 'flex';
            document.getElementById('main').style.display = 'none';
        });
}

function logout() {
    const confirmLogout = confirm("Você realmente deseja sair do sistema?");
    if (confirmLogout) {
        auth.signOut().then(() => {
            document.getElementById('main').style.display = 'none';
            document.getElementById('login').style.display = 'flex';
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('login-error').textContent = '';
            document.querySelector('.bottom-nav').style.display = 'none';
        });
    } else {
        // Cancelou, não faz nada
        console.log("Logout cancelado.");
    }

}