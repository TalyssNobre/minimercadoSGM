import * as DashboardModel from "../models/DashboardModel";

export const createDashboard = async () => {
    try {
        const { sales, products, categories } = await DashboardModel.createrDashboard();

        let totalVendido = 0;
        let totalRecebido = 0;
        let totalAReceber = 0;
        
        const catTotals = {};
        categories.forEach(c => { catTotals[c.id] = 0; });

        const prodTotals = {}; 
        
        const vendasValidas = sales.filter(s => s.status !== 'CANCELADA');

        vendasValidas.forEach(venda => {
            const descontoExtraVenda = Number(venda.discount) || 0;
            const items = venda.Item_sale || venda.item_sale || venda.items || [];
            const payment_status = venda.status ? 'PAGO' : 'FIADO';

            items.forEach(item => {
                const produto = products.find(p => p.id === item.product_id);
                
                if (produto) {
                    const qty = item.quantity || item.qty;
                    const price = item.unit_price || item.price;
                    const valorItemBruto = qty * price;
                    const descontoDesteItem = Number(item.item_discount) || 0;
                    
                    let valorItemLiquido = valorItemBruto - descontoDesteItem;
                    let descontoTotalDesteProduto = descontoDesteItem; // 🟢 Guarda o desconto

                    if (descontoExtraVenda > 0) {
                        const valorBrutoVendaToda = items.reduce((acc, i) => acc + ((i.quantity || i.qty) * (i.unit_price || i.price)), 0);
                        if (valorBrutoVendaToda > 0) {
                            const proporcao = valorItemBruto / valorBrutoVendaToda;
                            const rateioDesconto = (descontoExtraVenda * proporcao);
                            valorItemLiquido -= rateioDesconto;
                            descontoTotalDesteProduto += rateioDesconto; // 🟢 Soma o rateio
                        }
                    }

                    valorItemLiquido = Math.max(0, valorItemLiquido);

                    totalVendido += valorItemLiquido;
                    if (payment_status === 'PAGO') totalRecebido += valorItemLiquido;
                    if (payment_status === 'FIADO') totalAReceber += valorItemLiquido;
                    
                    if (catTotals[produto.category_id] !== undefined) {
                        catTotals[produto.category_id] += valorItemLiquido;
                    }

                    if (!prodTotals[produto.id]) {
                        // 🟢 Adicionamos a propriedade "desconto" aqui
                        prodTotals[produto.id] = { nome: produto.name, qtd: 0, valor: 0, desconto: 0 };
                    }
                    prodTotals[produto.id].qtd += qty;
                    prodTotals[produto.id].valor += valorItemLiquido;
                    prodTotals[produto.id].desconto += descontoTotalDesteProduto; // 🟢 Acumula o desconto
                }
            });
        });

        const curvaABC = Object.values(prodTotals).sort((a, b) => b.valor - a.valor);

        return {
            success: true,
            data: {
                totaisGerais: { totalVendido, totalRecebido, totalAReceber },
                totaisPorCategoria: catTotals, 
                categories,
                curvaABC 
            }
        };

    } catch (error) {
        return { success: false, message: "Erro ao processar balanço financeiro." };
    }
};