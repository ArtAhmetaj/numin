import { TokenType } from "./token-type";

class Token {


    constructor(readonly type: TokenType,
        readonly lexeme: string,
        readonly literal: any,
        readonly line: number) {

    }

    toString(): string {
        return `${this.type} ${this.lexeme} ${this.literal}`;
    }

}

export default Token;
