export default class Team{
    constructor({id, name, color}){
        this.id = id;
        this.name = name;
        this.color = color;

        this.validate();
    }

    validate = () => {
        if(!this.name){
            throw new Error("Campos obrigatórios faltando");
        }
    }
}