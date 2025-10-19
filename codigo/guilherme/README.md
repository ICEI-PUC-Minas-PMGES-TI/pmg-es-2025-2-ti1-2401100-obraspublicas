## README.md — Projeto de Obras Públicas

### Sobre

Este projeto apresenta uma aplicação web para cadastro e visualização de obras públicas. Ele permite:

- ✅ Cadastrar novas obras com informações detalhadas
- ✅ Editar e excluir obras existentes
- ✅ Visualizar todas as obras cadastradas
- ✅ Interagir com os dados via interface dinâmica


### Como iniciar o projeto

#### 1. Instalar o JSON Server (se ainda não tiver)

Abra o terminal e execute:

npm install -g json-server

#### 2. Iniciar o servidor de dados

Na pasta do projeto, execute:

json-server --watch obras.json --port 3000

> Isso cria uma API REST acessível em: [http://localhost:3000/obras]

#### 3. Abrir o site

Abra o arquivo `index.html` com Live Server (VS Code):

- Clique com o botão direito no `index.html`
- Selecione **"Open with Live Server"**

> O site será aberto em [http://127.0.0.1:5500]