document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");
  const obraSelect = document.getElementById("obra");

  const obras = [
    "Construção da Praça Central",
    "Reforma da Escola Municipal",
    "Pavimentação da Rua das Flores",
    "Ampliação do Hospital Regional"
  ];

  obras.forEach(nome => {
    const option = document.createElement("option");
    option.value = nome;
    option.textContent = nome;
    obraSelect.appendChild(option);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const dados = {
      obra: obraSelect.value,
      nome: document.getElementById("nome").value,
      cpf: document.getElementById("cpf").value,
      email: document.getElementById("email").value,
      tipo: document.getElementById("tipo").value,
      titulo: document.getElementById("titulo").value,
      descricao: document.getElementById("descricao").value
    };

    console.log("Feedback enviado:", dados);
    alert("Feedback enviado com sucesso!");
    form.reset();
  });
});
