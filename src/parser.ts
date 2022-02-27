import { error } from "console";
import ParseError from "./errors/parser-error";
import Return from "./errors/return";
import Assign from "./expressions/assign";
import Binary from "./expressions/binary";
import Call from "./expressions/call";
import Expression from "./expressions/expression";
import Get from "./expressions/get";
import Grouping from "./expressions/grouping";
import Literal from "./expressions/literal";
import Logical from "./expressions/logical";
import Set from "./expressions/set";
import This from "./expressions/this";
import Unary from "./expressions/unary";
import Variable from "./expressions/variable";
import Block from "./statements/block";
import Class from "./statements/class";
import StatementExpression from "./statements/expression";
import Function from "./statements/function";
import If from "./statements/if";
import Print from "./statements/print";
import { ReturnStatement } from "./statements/return";
import Statement from "./statements/statement";
import Var from "./statements/var";
import While from "./statements/while";
import Token from "./token";

class Parser {
    readonly tokens: Array<Token>;
    private current: number = 0;

    constructor(tokens: Array<Token>) {
        this.tokens = tokens;
    }


    parse(): Array<Statement | null> {
        let statements: Array<Statement | null> = [];
        while (!this.isAtEnd()) {
            statements.push(this.declaration());
        }

        return statements;
    }

    private declaration(): Statement | null {
        try {
            if (this.match(TokenType.CLASS)) return this.classDeclaration();
            if (this.match(TokenType.FUN)) return this.function("function");
            if (this.match(TokenType.VAR)) return this.varDeclaration();

            return this.statement();
            // var declaration, statement edhe synchronize
        }
        catch (error) {
            //parse error, in vain of typescript
            this.synchronize();
            return null;
        }
    }

    private varDeclaration(): Statement {
        const name: Token = this.consume(TokenType.IDENTIFIER, "Expect variable name.");
        let initializer = null;
        if (this.match(TokenType.EQUAL)) {
            initializer = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after variable declaration.");
        return new Var(name, initializer!);

    }


    private statement(): Statement {
        if (this.match(TokenType.FOR)) return this.forStatement();
        if (this.match(TokenType.IF)) return this.ifStatement();
        if (this.match(TokenType.PRINT)) return this.printStatement();
        if (this.match(TokenType.RETURN)) return this.returnStatement();
        if (this.match(TokenType.WHILE)) return this.whileStatement();
        if (this.match(TokenType.LEFT_BRACE)) return new Block(this.block());

        return this.expressionStatement();
    }

    private returnStatement() : Statement{
        const keyword : Token = this.previous();
        let value : Expression | null = null;

        if(!this.check(TokenType.SEMICOLON)){
            value = this.expression();
        }

        this.consume(TokenType.SEMICOLON,"Expect ';' after return value.");

        return new ReturnStatement(keyword,value!);

    }

    private printStatement(): Statement {
        const value: Expression = this.expression();
        this.consume(TokenType.SEMICOLON, "Expect ';' after value.");
        return new Print(value);
    }


    private expressionStatement():Statement{
        let expr  : Expression = this.expression();
        this.consume(TokenType.SEMICOLON,"Expect ';' after expression.");
        return new StatementExpression(expr);
    }

    private forStatement(): Statement {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'for'.");
        let initializer: Statement | null;
        if (this.match(TokenType.SEMICOLON)) {
            initializer = null;
        } else if (this.match(TokenType.VAR)) {
            initializer = this.varDeclaration();
        }
        else {
            initializer = this.expressionStatement();
        }

        let condition: Expression | null = null;
        if (!this.check(TokenType.SEMICOLON)) {
            condition = this.expression();
        }

        this.consume(TokenType.SEMICOLON, "Expect ';' after loop condition.");

        let increment: Expression | null = null;
        if (!this.check(TokenType.RIGHT_PAREN)) {
            increment = this.expression();
        }

        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for clauses.");

        let body: Statement = this.statement();

        if (increment !== null) {
            body = new Block([body, new StatementExpression(increment)])
        }

        if (condition === null) condition = new Literal(true);
        body = new While(condition, body);

        if (initializer !== null) {
            body = new Block([initializer, body]);
        }

        return body;
    }

    private ifStatement(): Statement {

        this.consume(TokenType.LEFT_PAREN, "Expect '(' after 'if' .");

        const condition: Expression = this.expression();

        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if condition.");

        const thenBranch: Statement = this.statement();
        let elseBranch: Statement | null = null;

        if (this.match(TokenType.ELSE)) {
            elseBranch = this.statement();
        }

        return new If(condition, thenBranch, elseBranch!);
    }

    private whileStatement() {
        this.consume(TokenType.LEFT_PAREN, "Expect '(' after while.");
        const condition: Expression = this.expression();
        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after condition.");
        const body: Statement = this.statement();
        return new While(condition, body);
    }

    private expression(): Expression {
        // fishy method
        return this.assignment();
    }


    private assignment(): Expression {
        let expr: Expression = this.or();
        if (this.match(TokenType.EQUAL)) {
            const equals: Token = this.previous();
            const value: Expression = this.assignment();
            if (expr instanceof Variable) {
                const name: Token = expr.name;
                return new Assign(name, value);
            }
            else if (expr instanceof Get) {
                const get: Get = expr;
                return new Set(get.object, get.name, value);
            }
            this.error(equals, "Invalid assignment target.");
        }
        return expr;
    }

    private or(): Expression {
        let expr: Expression = this.and();
        while (this.match(TokenType.OR)) {
            const operator: Token = this.previous();
            const right: Expression = this.and();
            expr = new Logical(expr, operator, right);
        }
        return expr;
    }


    private and(): Expression {
        let expr: Expression = this.equality();
        while (this.match(TokenType.AND)) {
            const operator: Token = this.previous();
            const right: Expression = this.equality();
            expr = new Logical(expr, operator, right);
        }

        return expr;
    }


    private equality(): Expression {
        let expr: Expression = this.comparison();
        while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
            const operator: Token = this.previous();
            const right: Expression = this.comparison();
            expr = new Binary(expr, operator, right);
        }

        return expr;
    }


    private comparison(): Expression {

        let expr: Expression = this.addition();
        while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
            const operator: Token = this.previous();
            const right: Expression = this.addition();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }


    private addition(): Expression {

        let expr = this.multiplication();
        while (this.match(TokenType.MINUS, TokenType.PLUS)) {
            const operator: Token = this.previous();
            const right: Expression = this.multiplication();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }


    private multiplication(): Expression {
        let expr: Expression = this.unary();
        while (this.match(TokenType.SLASH, TokenType.STAR)) {
            const operator: Token = this.previous();
            const right: Expression = this.unary();
            expr = new Binary(expr, operator, right);
        }
        return expr;
    }


    private unary(): Expression {
        if (this.match(TokenType.BANG, TokenType.MINUS)) {
            const operator: Token = this.previous();
            const right: Expression = this.unary();
            return new Unary(operator, right);
        }
        return this.call();
    }



    private call(): Expression {
        let expr: Expression = this.primary();
        while (true) {
            if (this.match(TokenType.LEFT_PAREN)) {
                expr = this.finishCall(expr);
            }
            else if (this.match(TokenType.DOT)) {
                const name: Token = this.consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
                expr = new Get(expr, name);

            } else {
                break;
            }

        }

        return expr;
    }


    private finishCall(callee: Expression): Expression {

        const valueArguments: Array<Expression> = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if (valueArguments.length >= 8) {
                    this.error(this.peek(), "Cannot have more than 8 arguments.");

                }
                valueArguments.push(this.expression());

            } while (this.match(TokenType.COMMA));
        }
        const paren: Token = this.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");

        return new Call(callee, paren, valueArguments);

    }


    private primary(): Expression {
        if (this.match(TokenType.FALSE)) return new Literal(false);
        if (this.match(TokenType.TRUE)) return new Literal(true);
        if (this.match(TokenType.NIL)) return new Literal(null);

        if (this.match(TokenType.NUMBER, TokenType.STRING)) {
            return new Literal(this.previous().literal);

        }

        if (this.match(TokenType.SUPER)) {
            const keyword: Token = this.previous();
            this.consume(TokenType.DOT, "Expect '.' after super.");

        }

        if (this.match(TokenType.THIS)) return new This(this.previous());

        if (this.match(TokenType.IDENTIFIER)) {
            return new Variable(this.previous());

        }

        if (this.match(TokenType.LEFT_PAREN)) {
            const expr: Expression = this.expression();
            this.consume(TokenType.RIGHT_PAREN, "Expect ') after expression.");
            return new Grouping(expr);
        }

        throw this.error(this.peek(), "Expect expression.")


    }

    private synchronize(): void {
        this.advance();
        while (!this.isAtEnd()) {
            if (this.previous().type == TokenType.SEMICOLON) return;

            switch (this.peek().type) {
                case TokenType.CLASS:
                case TokenType.FUN:
                case TokenType.VAR:
                case TokenType.FOR:
                case TokenType.IF:
                case TokenType.WHILE:
                case TokenType.PRINT:
                case TokenType.RETURN:
                    return;
            }

            this.advance();
        }
    }


    private match(...types: Array<TokenType>): boolean {

        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }


    private classDeclaration(): Statement {
        const name: Token = this.consume(TokenType.IDENTIFIER, "Expect class name.");

        let superClass: Expression;
        if (this.match(TokenType.LESS)) {
            this.consume(TokenType.IDENTIFIER, "Expect superclass name.");
            superClass = new Variable(this.previous());
        }

        this.consume(TokenType.LEFT_BRACE, "Expect '{' before class body.");

        const methods: Array<Function> = [];

        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            methods.push(this.function("method"));
        }

        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after class body.");

        return new Class(name, superClass!, methods);
    }


    private function(kind: String): Function {
        const name: Token = this.consume(TokenType.IDENTIFIER, `Expect ${kind} name.`);
        this.consume(TokenType.LEFT_PAREN, `Expect '(' after ${kind} name.`);
        const parameters: Array<Token> = [];
        if (!this.check(TokenType.RIGHT_PAREN)) {
            do {
                if (parameters.length >= 8) {
                    this.error(this.peek(), "Cannot have more than 8 parametrs");

                }

                parameters.push(this.consume(TokenType.IDENTIFIER, "Expect parameter name."));


            }
            while (this.match(TokenType.COMMA));
        }

        this.consume(TokenType.RIGHT_PAREN, "Expect ')' after parameters.");
        this.consume(TokenType.LEFT_BRACE, `Expect '{' before ${kind} body.`);

        const body: Array<Statement> = this.block();
        return new Function(name, parameters, body);


    }


    private block(): Array<Statement> {
        const statements: Array<Statement> = [];
        while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
            statements.push(this.declaration()!);

        }
        this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");
        return statements;
    }







    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();

        throw error(this.peek(), message);
    }


    private error(token: Token, message: string): ParseError {
        // numin.error(token,message);
        return new ParseError();
    }


    private advance(): Token {
        if (!this.isAtEnd()) this.current++;
        return this.previous();

    }


    private previous(): Token {
        return this.tokens[this.current - 1];
    }


    private check(tokenType: TokenType) {
        if (this.isAtEnd()) return false;
        return this.peek().type == tokenType;
    }




    private isAtEnd(): boolean {
        return this.peek().type == TokenType.EOF;
    }


    private peek(): Token {
        return this.tokens[this.current];
    }

}