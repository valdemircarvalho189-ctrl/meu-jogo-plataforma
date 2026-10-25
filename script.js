
"use strict";

// ========================================
// CONFIGURAÇÃO DA LOJA
// ========================================

// Coloque seu WhatsApp com código do país e DDD.
// Exemplo brasileiro: 55 + DDD + número.
// Deixe vazio até configurar seu número.
const WHATSAPP_LOJA = "5588981270156";

// Chaves usadas para salvar os dados no navegador.
const CHAVE_PRODUTOS = "minhaLojinha_produtos_v1";
const CHAVE_CARRINHO = "minhaLojinha_carrinho_v1";

// Produtos de exemplo para a primeira abertura.
const produtosIniciais = [
  {
    id: "produto-1",
    nome: "Camiseta básica",
    preco: 39.90,
    categoria: "Roupas",
    estoque: 10,
    imagem: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
    descricao: "Camiseta confortável para o dia a dia."
  },
  {
    id: "produto-2",
    nome: "Tênis casual",
    preco: 129.90,
    categoria: "Calçados",
    estoque: 8,
    imagem: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    descricao: "Tênis para completar seu visual."
  },
  {
    id: "produto-3",
    nome: "Relógio moderno",
    preco: 89.90,
    categoria: "Acessórios",
    estoque: 5,
    imagem: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600",
    descricao: "Relógio elegante para várias ocasiões."
  },
  {
    id: "produto-4",
    nome: "Mochila urbana",
    preco: 69.90,
    categoria: "Acessórios",
    estoque: 6,
    imagem: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
    descricao: "Mochila prática para o trabalho e estudos."
  }
];

// ========================================
// DADOS E ARMAZENAMENTO
// ========================================

function lerDados(chave, valorPadrao) {
  try {
    const dados = localStorage.getItem(chave);

    if (dados === null) {
      return valorPadrao;
    }

    const resultado = JSON.parse(dados);

    return resultado ?? valorPadrao;
  } catch (erro) {
    console.error("Erro ao ler os dados:", erro);
    return valorPadrao;
  }
}

let produtos = lerDados(CHAVE_PRODUTOS, null);
let carrinho = lerDados(CHAVE_CARRINHO, []);

if (!Array.isArray(produtos)) {
  produtos = produtosIniciais.map(p => ({ ...p }));
}

if (!Array.isArray(carrinho)) {
  carrinho = [];
}

function salvarProdutos() {
  try {
    localStorage.setItem(CHAVE_PRODUTOS, JSON.stringify(produtos));
    return true;
  } catch (erro) {
    alert("Não foi possível salvar os produtos. Verifique o armazenamento do navegador.");
    console.error(erro);
    return false;
  }
}

function salvarCarrinho() {
  try {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
  } catch (erro) {
    console.error("Não foi possível salvar o carrinho:", erro);
  }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function escaparHTML(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, caractere => {
    const mapa = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return mapa[caractere];
  });
}

function formatarDinheiro(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function imagemSegura(url) {
  const endereco = String(url || "").trim();

  if (!endereco) {
    return "";
  }

  try {
    const enderecoURL = new URL(endereco);

    if (
      enderecoURL.protocol === "https:" ||
      enderecoURL.protocol === "http:"
    ) {
      return enderecoURL.href;
    }
  } catch (erro) {
    return "";
  }

  return "";
}

function imagemHTML(url, nome) {
  const endereco = imagemSegura(url);

  if (!endereco) {
    return `
      <div class="imagem-indisponivel"
           role="img"
           aria-label="${escaparHTML(nome)}">
        Sem imagem
      </div>
    `;
  }

  return `
    <img
      src="${escaparHTML(endereco)}"
      alt="${escaparHTML(nome)}"
      loading="lazy"
      onerror="this.style.display='none'; this.nextElementSibling.hidden=false"
    >
    <div class="imagem-indisponivel" hidden>
      Imagem indisponível
    </div>
  `;
}

function gerarId() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 9)
  );
}

// ========================================
// MOSTRAR PRODUTOS NA LOJA
// ========================================

function renderizarProdutos() {
  const lista = document.getElementById("listaProdutos");
  const pesquisa = document.getElementById("pesquisa").value
    .trim()
    .toLocaleLowerCase("pt-BR");

  const encontrados = produtos.filter(produto => {
    const texto = [
      produto.nome,
      produto.categoria,
      produto.descricao
    ].join(" ").toLocaleLowerCase("pt-BR");

    return texto.includes(pesquisa);
  });

  document.getElementById("mensagemProdutos").hidden =
    encontrados.length > 0;

  lista.innerHTML = encontrados.map(produto => `
    <article class="produto">
      ${imagemHTML(produto.imagem, produto.nome)}

      <div class="produto-conteudo">
        <span class="categoria-produto">
          ${escaparHTML(produto.categoria || "Geral")}
        </span>

        <h3>${escaparHTML(produto.nome)}</h3>

        <p class="descricao-produto">
          ${escaparHTML(produto.descricao || "Confira este produto.")}
        </p>

        <strong class="preco">
          ${formatarDinheiro(produto.preco)}
        </strong>

        <span class="estoque-produto">
          ${
            produto.estoque > 0
              ? `Estoque: ${produto.estoque} unidade(s)`
              : "Produto indisponível"
          }
        </span>

        <button
          class="botao principal botao-comprar"
          onclick="adicionarCarrinho('${escaparHTML(produto.id)}')"
          ${produto.estoque <= 0 ? "disabled" : ""}
        >
          ${produto.estoque > 0 ? "Adicionar ao carrinho" : "Esgotado"}
        </button>
      </div>
    </article>
  `).join("");
}

// ========================================
// CADASTRAR E EDITAR PRODUTOS
// ========================================

const formulario = document.getElementById("formProduto");

formulario.addEventListener("submit", function(evento) {
  evento.preventDefault();

  const id = document.getElementById("produtoId").value;
  const nome = document.getElementById("nome").value.trim();
  const preco = Number(document.getElementById("preco").value);
  const categoria = document.getElementById("categoria").value.trim();
  const estoque = Number(document.getElementById("estoque").value);
  const imagem = document.getElementById("imagem").value.trim();
  const descricao = document.getElementById("descricao").value.trim();

  if (!nome) {
    alert("Informe o nome do produto.");
    return;
  }

  if (!Number.isFinite(preco) || preco <= 0) {
    alert("Informe um preço válido.");
    return;
  }

  if (!Number.isSafeInteger(estoque) || estoque < 0) {
    alert("Informe uma quantidade inteira de estoque.");
    return;
  }

  if (imagem && !imagemSegura(imagem)) {
    alert("Informe uma URL de imagem válida, começando com http:// ou https://.");
    return;
  }

  let produtoAtualizado;

  if (id) {
    const indice = produtos.findIndex(produto => produto.id === id);

    if (indice === -1) {
      alert("Produto não encontrado.");
      cancelarEdicao();
      return;
    }

    produtoAtualizado = {
      ...produtos[indice],
      nome,
      preco,
      categoria,
      estoque,
      imagem,
      descricao
    };

    produtos[indice] = produtoAtualizado;
  } else {
    produtoAtualizado = {
      id: gerarId(),
      nome,
      preco,
      categoria,
      estoque,
      imagem,
      descricao
    };

    produtos.push(produtoAtualizado);
  }

  if (!salvarProdutos()) {
    // Recarrega a versão anteriormente salva para evitar
    // deixar a tela com dados que não foram persistidos.
    produtos = lerDados(CHAVE_PRODUTOS, produtosIniciais);
    renderizarTudo();
    return;
  }

  const mensagem = id
    ? "Produto atualizado com sucesso!"
    : "Produto cadastrado com sucesso!";

  formulario.reset();
  document.getElementById("produtoId").value = "";
  document.getElementById("estoque").value = "10";

  atualizarFormulario(false);
  mostrarMensagem(mensagem);
  renderizarTudo();
});

function editarProduto(id) {
  const produto = produtos.find(item => item.id === id);

  if (!produto) {
    alert("Produto não encontrado.");
    return;
  }

  document.getElementById("produtoId").value = produto.id;
  document.getElementById("nome").value = produto.nome;
  document.getElementById("preco").value = produto.preco;
  document.getElementById("categoria").value = produto.categoria || "";
  document.getElementById("estoque").value = produto.estoque;
  document.getElementById("imagem").value = produto.imagem || "";
  document.getElementById("descricao").value = produto.descricao || "";

  atualizarFormulario(true);

  document.getElementById("administracao").scrollIntoView({
    behavior: "smooth"
  });

  document.getElementById("nome").focus();
}

function atualizarFormulario(editando) {
  document.getElementById("tituloFormulario").textContent =
    editando ? "Editar produto" : "Cadastrar novo produto";

  document.getElementById("botaoSalvar").textContent =
    editando ? "Salvar alterações" : "Cadastrar produto";

  document.getElementById("botaoCancelar").hidden = !editando;
}

function cancelarEdicao() {
  formulario.reset();
  document.getElementById("produtoId").value = "";
  document.getElementById("estoque").value = "10";

  atualizarFormulario(false);
  mostrarMensagem("");
}

function mostrarMensagem(texto) {
  document.getElementById("mensagemAdmin").textContent = texto;
}

// ========================================
// TABELA ADMINISTRATIVA
// ========================================

function renderizarTabela() {
  const tabela = document.getElementById("tabelaProdutos");

  if (produtos.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="4">Nenhum produto cadastrado.</td>
      </tr>
    `;
    return;
  }

  tabela.innerHTML = produtos.map(produto => `
    <tr>
      <td>${escaparHTML(produto.nome)}</td>
      <td>${formatarDinheiro(produto.preco)}</td>
      <td>${produto.estoque}</td>
      <td>
        <div class="acoes-tabela">
          <button
            class="botao-editar"
            onclick="editarProduto('${escaparHTML(produto.id)}')"
          >
            Editar
          </button>

          <button
            class="botao-excluir"
            onclick="excluirProduto('${escaparHTML(produto.id)}')"
          >
            Excluir
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function excluirProduto(id) {
  const produto = produtos.find(item => item.id === id);

  if (!produto) {
    return;
  }

  const confirmou = confirm(
    `Deseja realmente excluir "${produto.nome}"?`
  );

  if (!confirmou) {
    return;
  }

  const produtosAnteriores = [...produtos];

  produtos = produtos.filter(item => item.id !== id);

  if (!salvarProdutos()) {
    produtos = produtosAnteriores;
    return;
  }

  // Remove do carrinho as unidades do produto excluído.
  carrinho = carrinho.filter(item => item.id !== id);
  salvarCarrinho();

  if (document.getElementById("produtoId").value === id) {
    cancelarEdicao();
  }

  mostrarMensagem("Produto excluído com sucesso.");
  renderizarTudo();
}

// ========================================
// CARRINHO DE COMPRAS
// ========================================

function adicionarCarrinho(id) {
  const produto = produtos.find(item => item.id === id);

  if (!produto || produto.estoque <= 0) {
    alert("Este produto não está disponível.");
    return;
  }

  const item = carrinho.find(item => item.id === id);
  const quantidadeAtual = item ? item.quantidade : 0;

  if (quantidadeAtual >= produto.estoque) {
    alert("Você atingiu a quantidade disponível em estoque.");
    return;
  }

  if (item) {
    item.quantidade++;
  } else {
    carrinho.push({
      id: produto.id,
      quantidade: 1
    });
  }

  salvarCarrinho();
  renderizarCarrinho();
  alert("Produto adicionado ao carrinho!");
}

function alterarQuantidade(id, variacao) {
  const item = carrinho.find(item => item.id === id);
  const produto = produtos.find(item => item.id === id);

  if (!item || !produto) {
    return;
  }

  const novaQuantidade = item.quantidade + variacao;

  if (novaQuantidade <= 0) {
    carrinho = carrinho.filter(item => item.id !== id);
  } else if (novaQuantidade > produto.estoque) {
    alert("Não há estoque suficiente.");
    return;
  } else {
    item.quantidade = novaQuantidade;
  }

  salvarCarrinho();
  renderizarCarrinho();
}

function removerCarrinho(id) {
  carrinho = carrinho.filter(item => item.id !== id);

  salvarCarrinho();
  renderizarCarrinho();
}

function renderizarCarrinho() {
  // Descarta produtos que não existem mais.
  carrinho = carrinho.filter(item =>
    produtos.some(produto => produto.id === item.id)
  );

  salvarCarrinho();

  const totalUnidades = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0
  );

  document.getElementById("quantidadeCarrinho").textContent =
    totalUnidades;

  const itensHTML = carrinho.map(item => {
    const produto = produtos.find(p => p.id === item.id);

    if (!produto) {
      return "";
    }

    return `
      <div class="item-carrinho">
        ${imagemHTML(produto.imagem, produto.nome)}

        <div>
          <h3>${escaparHTML(produto.nome)}</h3>
          <p>${formatarDinheiro(produto.preco * item.quantidade)}</p>

          <div class="quantidade-item">
            <button
              onclick="alterarQuantidade('${escaparHTML(item.id)}', -1)"
              aria-label="Diminuir quantidade"
            >−</button>

            <span>${item.quantidade}</span>

            <button
              onclick="alterarQuantidade('${escaparHTML(item.id)}', 1)"
              aria-label="Aumentar quantidade"
              ${item.quantidade >= produto.estoque ? "disabled" : ""}
            >+</button>
          </div>
        </div>

        <button
          class="remover-item"
          onclick="removerCarrinho('${escaparHTML(item.id)}')"
        >
          Remover
        </button>
      </div>
    `;
  }).join("");

  document.getElementById("itensCarrinho").innerHTML =
    itensHTML || "<p class='mensagem-vazia'>Seu carrinho está vazio.</p>";

  const total = carrinho.reduce((soma, item) => {
    const produto = produtos.find(p => p.id === item.id);

    return soma + (produto ? produto.preco * item.quantidade : 0);
  }, 0);

  document.getElementById("totalCarrinho").textContent =
    formatarDinheiro(total);
}

function mostrarCarrinho() {
  document.getElementById("areaCarrinho").hidden = false;
  renderizarCarrinho();
}

function fecharCarrinho() {
  document.getElementById("areaCarrinho").hidden = true;
}

function finalizarCompra() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  // Confira novamente os itens e o estoque antes de gerar o pedido.
  const linhas = [];

  for (const item of carrinho) {
    const produto = produtos.find(p => p.id === item.id);

    if (!produto || item.quantidade > produto.estoque) {
      alert(
        "Um dos produtos não tem mais estoque suficiente. Atualize seu carrinho."
      );
      renderizarCarrinho();
      return;
    }

    linhas.push(
      `${produto.nome} - ${item.quantidade} x ${formatarDinheiro(produto.preco)}`
    );
  }

  const total = carrinho.reduce((soma, item) => {
    const produto = produtos.find(p => p.id === item.id);
    return soma + produto.preco * item.quantidade;
  }, 0);

  const mensagem = [
    "Olá! Quero fazer este pedido:",
    "",
    ...linhas,
    "",
    `Total: ${formatarDinheiro(total)}`,
    "",
    "Gostaria de confirmar a disponibilidade e a entrega."
  ].join("\n");

  const numero = WHATSAPP_LOJA.replace(/\D/g, "");

  if (!numero) {
    alert(
      "Para finalizar pelo WhatsApp, abra script.js e configure a variável WHATSAPP_LOJA com seu número."
    );
    return;
  }

  if (!/^\d{12,13}$/.test(numero)) {
    alert("Confira o número do WhatsApp configurado no script.js.");
    return;
  }

  const link = "https://wa.me/" + numero +
    "?text=" + encodeURIComponent(mensagem);

  window.open(link, "_blank", "noopener,noreferrer");
}

// ========================================
// INICIALIZAÇÃO
// ========================================

function renderizarTudo() {
  renderizarProdutos();
  renderizarTabela();
  renderizarCarrinho();
}

document.getElementById("pesquisa").addEventListener(
  "input",
  renderizarProdutos
);

document.getElementById("anoAtual").textContent =
  new Date().getFullYear();

renderizarTudo();