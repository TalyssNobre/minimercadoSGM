import * as DashboardModel from "../models/DashboardModel";

export const createDashboard = async () => {
    try {
        const { sales, products, categories } = await DashboardModel.createDashboard();

        let totalVendido = 0;
        let totalRecebido = 0;
        let totalAReceber = 0;
        
        const catTotals = {};
        categories.forEach(c => { catTotals[c.id] = 0; });
        
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

                    if (descontoExtraVenda > 0) {
                        const valorBrutoVendaToda = items.reduce((acc, i) => acc + ((i.quantity || i.qty) * (i.unit_price || i.price)), 0);
                        if (valorBrutoVendaToda > 0) {
                            const proporcao = valorItemBruto / valorBrutoVendaToda;
                            valorItemLiquido -= (descontoExtraVenda * proporcao);
                        }
                    }

                    valorItemLiquido = Math.max(0, valorItemLiquido);

                    totalVendido += valorItemLiquido;
                    if (payment_status === 'PAGO') totalRecebido += valorItemLiquido;
                    if (payment_status === 'FIADO') totalAReceber += valorItemLiquido;
                    if (catTotals[produto.category_id] !== undefined) {
                        catTotals[produto.category_id] += valorItemLiquido;
                    }
                }
            });
        });

        return {
            success: true,
            data: {
                totaisGerais: { 
                    totalVendido, 
                    totalRecebido, 
                    totalAReceber 
                },
                totaisPorCategoria: catTotals, 
                categories 
            }
        };

    } catch (error) {
        return { success: false, message: "Erro ao processar balanço financeiro." };
    }
};