document.getElementById('searchCep').addEventListener('click', function () {
  const cep = document.getElementById('cep').value.replace(/\D/g, '');

  if (cep.length !== 8) {
    alert('CEP inválido. Digite um CEP com 8 dígitos.');
    return;
  }

  // Simulação de busca de CEP (em um sistema real, isso seria uma chamada à API dos Correios)
  alert('Buscando informações do CEP: ' + cep);

  // Exemplo de preenchimento automático (simulado)
  document.getElementById('street').value = 'Rua das Flores';
  document.getElementById('neighborhood').value = 'Jardim Primavera';
  document.getElementById('city').value = 'São Paulo';
  document.getElementById('state').value = 'SP';
});

document.getElementById('citizenForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('As senhas não coincidem. Por favor, verifique.');
    return;
  }

  alert('Cadastro realizado com sucesso!');
  // Aqui normalmente enviaríamos os dados para o servidor
});

// Formatação automática do CPF
document.getElementById('cpf').addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, '');

  if (value.length > 11) {
    value = value.substring(0, 11);
  }

  if (value.length > 9) {
    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (value.length > 6) {
    value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (value.length > 3) {
    value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }

  e.target.value = value;
});

// Formatação automática do CEP
document.getElementById('cep').addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, '');

  if (value.length > 8) {
    value = value.substring(0, 8);
  }

  if (value.length > 5) {
    value = value.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  }

  e.target.value = value;
});

// Formatação automática do telefone
document.getElementById('phone').addEventListener('input', function (e) {
  let value = e.target.value.replace(/\D/g, '');

  if (value.length > 11) {
    value = value.substring(0, 11);
  }

  if (value.length > 10) {
    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (value.length > 6) {
    value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else if (value.length > 2) {
    value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  } else if (value.length > 0) {
    value = value.replace(/(\d{0,2})/, '($1');
  }

  e.target.value = value;
});
