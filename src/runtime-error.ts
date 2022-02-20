
import Token from "./token";


export default class RuntimeError extends Error{
    readonly token:Token 

    constructor(token:Token,message:string){
        super(message);
        this.token = token;
    }
}