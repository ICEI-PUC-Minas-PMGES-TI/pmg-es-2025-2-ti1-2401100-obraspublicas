const API_URL = 'http://localhost:3000/feedbacks';
const feedbackForm = document.getElementById('feedbackForm');

feedbackForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const anexoInput = document.getElementById('anexo');
  // Simula o caminho do anexo como no db.json
  const anexo =
    anexoInput.files.length > 0 ? `img/${anexoInput.files[0].name}` : null;

  // Monta o objeto conforme a estrutura do db.json
  const formData = {
    obra: document.getElementById('obra').value,
    nome: document.getElementById('nome').value,
    cpf: document.getElementById('cpf').value,
    email: document.getElementById('email').value,
    tipo: document.getElementById('tipo').value,
    titulo: document.getElementById('titulo').value,
    descricao: document.getElementById('descricao').value,
    dataEnvio: new Date().toISOString(), // Adiciona a data atual
    anexo: anexo,
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error('Erro ao enviar os dados.');

    alert('Solicitação/Feedback enviado com sucesso!');
    // Limpa o formulário após o envio
    feedbackForm.reset();
    // Opcional: Redireciona para a tela inicial ou de listagem
    window.location.href = 'listagem.html';
  } catch (error) {
    console.error('Erro:', error);
    alert('Ocorreu um erro ao enviar. Tente novamente.');
  }
});

// --- Formatador de CPF (Reutilizado do seu script.js) ---
document.getElementById('cpf').addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length > 11) value = value.substring(0, 11);

  if (value.length > 9) {
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (value.length > 6) {
    value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (value.length > 3) {
    value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }
  e.target.value = value;
});
