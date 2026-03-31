export default class Member{
    constructor({id, name, team_id}){
        this.id = id;
        this.name = name;
        this.team_id = team_id;

        this.validate();
    }

    validate = () => {
        if(!this.name || !this.team_id){
            throw new Error("Campos obrigatórios faltando");
        }
    }
}