// Tudo que a loja pode querer mudar fica aqui.
// Preço: troque `preco: null` de cada tamanho por um número (ex.: preco: 15)
// e o site mostra o valor e o total estimado do pedido.
window.DEGUCE = {
  // WhatsApp com DDI 55 + DDD + número, só dígitos.
  whatsapp: "5591991752024",
  instagram: "https://www.instagram.com/deguceacaioficial",

  // Endereço da loja. Enquanto estiver vazio, o site mostra "Endereço em breve".
  endereco: "",
  // Texto livre. Ex.: "Seg a Sáb, das 9h às 21h". Vazio = não aparece.
  horario: "",

  tipos: [
    { nome: "Açaí Fino",   desc: "Mais leve e líquido, pra tomar no copo." },
    { nome: "Açaí Médio",  desc: "O equilíbrio entre cremoso e leve." },
    { nome: "Açaí Grosso", desc: "Encorpado e cremoso, do jeito paraense." },
    { nome: "Açaí na Tigela", desc: "Batido cremoso com os acompanhamentos que você quiser." }
  ],

  tamanhos: [
    { nome: "Pequeno", desc: "", preco: null },
    { nome: "Médio",   desc: "", preco: null },
    { nome: "Grande",  desc: "", preco: null }
  ],

  acompanhamentos: [
    "Farinha d'água",
    "Farinha de tapioca",
    "Açúcar",
    "Granola",
    "Leite em pó",
    "Leite condensado",
    "Banana",
    "Morango",
    "Paçoca"
  ],

  pagamentos: ["Pix", "Dinheiro", "Cartão"]
};
