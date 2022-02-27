import NuminClass from "./numin-class";
import Token from "./token";

export default class Scanner {
    private readonly source: string;
    private readonly tokens: Array<Token> = [];
    private current: number = 0; // int
    private start: number = 0; // int
    private line: number = 1; // int

    private static readonly keywords: Record<string, TokenType> = {}


    static initializeKeywords(): void {
        this.keywords['and'] = TokenType.AND;
        this.keywords['class'] = TokenType.CLASS;
        this.keywords['else'] = TokenType.ELSE;
        this.keywords['false'] = TokenType.FALSE;
        this.keywords['for'] = TokenType.FOR;
        this.keywords['fun'] = TokenType.FUN;
        this.keywords['if'] = TokenType.IF;
        this.keywords['nil'] = TokenType.NIL;
        this.keywords['or'] = TokenType.OR;
        this.keywords['print'] = TokenType.PRINT;
        this.keywords['return'] = TokenType.RETURN;
        this.keywords['super'] = TokenType.SUPER;
        this.keywords['this'] = TokenType.THIS;
        this.keywords['true'] = TokenType.TRUE;
        this.keywords['var'] = TokenType.VAR;
        this.keywords['while'] = TokenType.WHILE;
    }



    scanTokens(): Array<Token> {
        while (!this.isAtEnd()) {
            this.start = this.current;
            this.scanToken();
        }

        this.tokens.push(new Token(TokenType.EOF,"",null,this.line));
        return this.tokens;
    }

    private scanToken():void{
        const c : string = this.advance();
        switch(c){
            case '(': this.addTokenWithoutSource(TokenType.LEFT_PAREN); break;
            case ')': this.addTokenWithoutSource(TokenType.RIGHT_PAREN); break;
            case '{': this.addTokenWithoutSource(TokenType.LEFT_BRACE); break;
            case '}': this.addTokenWithoutSource(TokenType.RIGHT_BRACE); break;
            case ',': this.addTokenWithoutSource(TokenType.COMMA); break;
            case '.': this.addTokenWithoutSource(TokenType.DOT); break;
            case '-': this.addTokenWithoutSource(TokenType.MINUS); break;
            case '+': this.addTokenWithoutSource(TokenType.PLUS); break;
            case ';': this.addTokenWithoutSource(TokenType.SEMICOLON); break;
            case '*': this.addTokenWithoutSource(TokenType.STAR); break;
            case '!': this.addTokenWithoutSource(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); break;
            case '=': this.addTokenWithoutSource(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
            case '<': this.addTokenWithoutSource(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); break;
            case '>': this.addTokenWithoutSource(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;


            case '/':
                if (this.match('/')) {
                   
                    while (this.peek() != '\n' && !this.isAtEnd()) this.advance();
                } else {
                    this.addTokenWithoutSource(TokenType.SLASH);
                }
                break;

            case ' ':
            case '\r':
            case '\t':
                break;

            case '\n':
                this.line++;
                break;

            case '"': this.string(); break;

            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    //TODO: Numin.error(line, "Unexpected character.");
                }
                break;
        }
    }



    private identifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();


        const text: string = this.source.substring(this.start, this.current);

        let type: TokenType = Scanner.keywords[text];

        if (type === null) type = TokenType.IDENTIFIER;

        this.addTokenWithoutSource(type);
    }

    private number(): void {
        while (!this.isDigit(this.peek())) this.advance();

        if (this.peek() === "." && this.isDigit(this.peekNext())) {
            this.advance();

            while (this.isDigit(this.peek())) this.advance();

        }

        this.addToken(TokenType.NUMBER, +this.source.substring(this.start, this.current));

    }


    private string(): void {
        while (this.peek() !== "" && !this.isAtEnd()) {
            if (this.peek() === "\n") this.line++;
            this.advance();
        }


        if (this.isAtEnd()) {
            //TODO: numin error --> unterminated string
            return;
        }

        this.advance();

        const value: string = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }

    private match(expected: string): boolean {
        if (this.isAtEnd()) return false;
        if (this.source.charAt(this.current) !== expected) return false;

        this.current++;
        return true;
    }

    private peek(): string {
        if (this.isAtEnd()) return '\0';
        return this.source.charAt(this.current);
    }

    private peekNext(): string {
        //TODO: not sure if right
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }


    private isAlpha(c: string): boolean {

        return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
    }

    private isAlphaNumeric(c: string) {
        return this.isAlpha(c) || this.isDigit(c);

    }

    private isDigit(c: string): boolean {
        return c >= '0' && c <= '9';
    }

    private isAtEnd(): boolean {
        return this.current >= this.source.length;
    }

    private advance(): string { //char

        this.current++;
        return this.source.charAt(this.current - 1);
    }


    private addTokenWithoutSource(type: TokenType) {
        this.addToken(type, null);
    }

    private addToken(type: TokenType, literal: any) {
        const text: string = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));

    }

    constructor(source: string) {
        this.source = source;
        Scanner.initializeKeywords();

    }

}