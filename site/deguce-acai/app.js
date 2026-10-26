(function () {
  "use strict";
  var C = window.DEGUCE;
  var $ = function (id) { return document.getElementById(id); };

  var zapBase = "https://wa.me/" + C.whatsapp;
  var temPreco = C.tamanhos.some(function (t) { return typeof t.preco === "number"; });

  function reais(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---------- Links fixos ----------
  var zapOi = zapBase + "?text=" + encodeURIComponent("Olá! Vim pelo site da Deguce Açaí.");
  ["link-zap", "rod-zap", "zap-flutuante"].forEach(function (id) { $(id).href = zapOi; });
  $("rod-insta").href = C.instagram;
  $("ano").textContent = new Date().getFullYear();

  // ---------- Onde estamos ----------
  if (C.endereco) {
    var q = encodeURIComponent(C.endereco);
    $("txt-endereco").textContent = C.endereco;
    $("link-rota").href = "https://www.google.com/maps/search/?api=1&query=" + q;
    $("mapa").innerHTML =
      '<iframe title="Mapa da Deguce Açaí" loading="lazy" referrerpolicy="no-referrer-when-downgrade" ' +
      'src="https://maps.google.com/maps?q=' + q + '&output=embed"></iframe>';
  } else {
    $("txt-endereco").textContent = "Endereço em breve. Chama a gente no WhatsApp que a gente te passa a localização.";
    $("link-rota").href = zapBase + "?text=" + encodeURIComponent("Olá! Pode me mandar a localização da loja?");
    $("link-rota").textContent = "Pedir localização";
    $("mapa").innerHTML = '<div class="mapa__vazio"><img src="assets/logo.jpg" alt=""><span>Mapa aparece aqui quando o endereço for cadastrado.</span></div>';
  }
  if (C.horario) $("txt-horario").textContent = "Horário: " + C.horario;
  else $("txt-horario").hidden = true;

  // ---------- Cardápio ----------
  $("cards-tipos").innerHTML = C.tipos.map(function (t, i) {
    return '<article class="card">' +
      '<div class="card__gota" style="--n:' + i + '"></div>' +
      "<h3>" + esc(t.nome) + "</h3><p>" + esc(t.desc) + "</p>" +
      '<a href="#pedido" data-tipo="' + i + '">Quero esse</a></article>';
  }).join("") +
  (temPreco ? '<p class="precos">' + C.tamanhos.map(function (t) {
    return esc(t.nome) + (typeof t.preco === "number" ? " " + reais(t.preco) : "");
  }).join(" · ") + "</p>" : "");

  // ---------- Opções do formulário ----------
  function radios(alvo, nome, lista, rotulo) {
    $(alvo).innerHTML = lista.map(function (item, i) {
      return '<label class="op"><input type="radio" name="' + nome + '" value="' + i + '"><span>' + rotulo(item) + "</span></label>";
    }).join("");
  }
  radios("op-tipo", "tipo", C.tipos, function (t) { return esc(t.nome); });
  radios("op-tamanho", "tamanho", C.tamanhos, function (t) {
    var extra = [t.desc, typeof t.preco === "number" ? reais(t.preco) : ""].filter(Boolean).join(" · ");
    return esc(t.nome) + (extra ? "<small>" + esc(extra) + "</small>" : "");
  });
  $("op-acomp").innerHTML = C.acompanhamentos.map(function (a) {
    return '<label class="op op--chip"><input type="checkbox" name="acomp" value="' + esc(a) + '"><span>' + esc(a) + "</span></label>";
  }).join("");
  $("op-pagamento").innerHTML = C.pagamentos.map(function (p, i) {
    return '<label class="op"><input type="radio" name="pagamento" value="' + esc(p) + '"' + (i === 0 ? " checked" : "") + "><span>" + esc(p) + "</span></label>";
  }).join("");

  // "Quero esse" no cardápio já marca o tipo
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-tipo]");
    if (!a) return;
    var r = document.querySelector('input[name="tipo"][value="' + a.dataset.tipo + '"]');
    if (r) r.checked = true;
  });

  // ---------- Quantidade ----------
  var qtd = 1;
  function setQtd(v) { qtd = Math.max(1, Math.min(20, v)); $("qtd-valor").textContent = qtd; }
  $("qtd-menos").onclick = function () { setQtd(qtd - 1); };
  $("qtd-mais").onclick = function () { setQtd(qtd + 1); };

  // ---------- Pedido ----------
  var itens = [];

  function lerItem() {
    var tipo = document.querySelector('input[name="tipo"]:checked');
    var tam = document.querySelector('input[name="tamanho"]:checked');
    if (!tipo && !tam) return { erro: "Escolha o tipo e o tamanho do açaí." };
    if (!tipo) return { erro: "Escolha o tipo de açaí." };
    if (!tam) return { erro: "Escolha o tamanho." };
    var acomp = Array.prototype.map.call(document.querySelectorAll('input[name="acomp"]:checked'), function (c) { return c.value; });
    var t = C.tamanhos[+tam.value];
    return { tipo: C.tipos[+tipo.value].nome, tamanho: t.nome, preco: t.preco, acomp: acomp, qtd: qtd };
  }

  function limparItem() {
    $("form-item").reset();
    setQtd(1);
  }

  function descItem(it) {
    return it.qtd + "x " + it.tipo + " (" + it.tamanho + ")";
  }

  function total() {
    if (!itens.length || itens.some(function (it) { return typeof it.preco !== "number"; })) return null;
    return itens.reduce(function (s, it) { return s + it.preco * it.qtd; }, 0);
  }

  function desenharLista() {
    var ul = $("lista-itens");
    if (!itens.length) { ul.innerHTML = '<li class="vazio">Nenhum açaí adicionado ainda.</li>'; return; }
    var tot = total();
    ul.innerHTML = itens.map(function (it, i) {
      return "<li><div><b>" + esc(descItem(it)) + "</b>" +
        (it.acomp.length ? "<small>" + esc(it.acomp.join(", ")) + "</small>" : "<small>Sem acompanhamentos</small>") +
        '</div><button type="button" data-remover="' + i + '" aria-label="Remover">×</button></li>';
    }).join("") + (tot !== null ? '<li class="total"><span>Total estimado</span><b>' + reais(tot) + "</b></li>" : "");
  }

  $("lista-itens").addEventListener("click", function (e) {
    var b = e.target.closest("[data-remover]");
    if (!b) return;
    itens.splice(+b.dataset.remover, 1);
    desenharLista();
  });

  $("form-item").addEventListener("submit", function (e) {
    e.preventDefault();
    var it = lerItem();
    if (it.erro) { $("erro-item").textContent = it.erro; return; }
    $("erro-item").textContent = "";
    itens.push(it);
    limparItem();
    desenharLista();
    $("form-envio").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Entrega x retirada, troco
  function atualizarCampos() {
    var entrega = document.querySelector('input[name="modo"]:checked').value === "Entrega";
    $("bloco-endereco").hidden = !entrega;
    var pag = document.querySelector('input[name="pagamento"]:checked');
    $("bloco-troco").hidden = !(pag && pag.value === "Dinheiro");
  }
  document.addEventListener("change", function (e) {
    if (e.target.name === "modo" || e.target.name === "pagamento") atualizarCampos();
  });
  atualizarCampos();

  // ---------- Enviar no WhatsApp ----------
  $("form-envio").addEventListener("submit", function (e) {
    e.preventDefault();
    var erro = $("erro-envio");

    // Se a pessoa montou um açaí mas esqueceu de adicionar, entra junto.
    if (!itens.length) {
      var it = lerItem();
      if (it.erro) {
        erro.textContent = "Monte pelo menos um açaí antes de enviar.";
        $("form-item").scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      itens.push(it);
      limparItem();
      desenharLista();
    }

    var nome = $("nome").value.trim();
    var modo = document.querySelector('input[name="modo"]:checked').value;
    var end = $("endereco").value.trim();
    var ref = $("referencia").value.trim();
    var pag = document.querySelector('input[name="pagamento"]:checked').value;
    var troco = $("troco").value.trim();
    var obs = $("obs").value.trim();

    if (!nome) { erro.textContent = "Coloca seu nome pra gente saber de quem é o pedido."; $("nome").focus(); return; }
    if (modo === "Entrega" && !end) { erro.textContent = "Informe o endereço de entrega."; $("endereco").focus(); return; }
    erro.textContent = "";

    var L = [];
    L.push("*NOVO PEDIDO | DEGUCE AÇAÍ*", "");
    L.push("*Cliente:* " + nome, "");
    L.push("*Itens:*");
    itens.forEach(function (it, i) {
      L.push((i + 1) + ". " + descItem(it) + (typeof it.preco === "number" ? " | " + reais(it.preco * it.qtd) : ""));
      L.push("   Acompanhamentos: " + (it.acomp.length ? it.acomp.join(", ") : "nenhum"));
    });
    var tot = total();
    if (tot !== null) L.push("", "*Total estimado:* " + reais(tot));
    L.push("");
    if (modo === "Entrega") {
      L.push("*Entrega:* " + end);
      if (ref) L.push("*Referência:* " + ref);
    } else {
      L.push("*Retirada na loja*");
    }
    L.push("*Pagamento:* " + pag + (pag === "Dinheiro" && troco ? " (troco para " + troco + ")" : ""));
    if (obs) L.push("*Observações:* " + obs);

    window.open(zapBase + "?text=" + encodeURIComponent(L.join("\n")), "_blank");
  });
})();
