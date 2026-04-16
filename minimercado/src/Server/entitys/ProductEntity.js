
export default class Product{
    constructor({id,name,price,stock,image,category_id, promo_price, promo_status}){
        this.id = id;
        this.name = name;
        this.price = Number(price);
        this.stock = Number(stock);
        this.image = image;
        this.category_id = category_id;
        //this.promo_price = Number(promo_price);
        //this.promo_status = promo_status;
        this.promo_price = promo_price ? Number(promo_price) : null;
        this.promo_status = promo_status === true || promo_status === "true";
        this.validate();
    }
   
    get PromoPrice() {
        if (this.promo_status === true && this.promo_price !== null && this.promo_price < this.price) {
            return this.promo_price;
        }
        return this.price;
    }
  

    validate = () => {
         if (!this.name || !this.category_id || !this.price) {
      throw new Error("Campos obrigatórios faltando");
    }
        if(this.price < 0 || this.stock < 0 || this.promo_price <0){
        throw new Error("Preço não pode ser negativo")
        }
    }
  };

