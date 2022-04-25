import NuminCallable from "./numin-callable";
import Environment from "./environment";
import Return from "./errors/return";
import RuntimeError from "./errors/runtime-error";
import assign from "./expressions/assign";
import binary from "./expressions/binary";
import call from "./expressions/call";
import Expression from "./expressions/expression";
import ExpressionVisitor from "./expressions/expression-visitor";
import get from "./expressions/get";
import grouping from "./expressions/grouping";
import literal from "./expressions/literal";
import logical from "./expressions/logical";
import set from "./expressions/set";
import _super from "./expressions/super";
import _this from "./expressions/this";
import unary from "./expressions/unary";
import variable from "./expressions/variable";
import clock from "./globals/clock";
import NuminClass from "./numin-class";
import NuminFunction from "./numin-function";
import Block from "./statements/block";
import Class from "./statements/class";
import StatementExpression from "./statements/expression";
import Function from "./statements/function";
import If from "./statements/if";
import Print from "./statements/print";
import { ReturnStatement } from "./statements/return";
import Statement from "./statements/statement";
import StatementVisitor from "./statements/statement-visitor";
import Var from "./statements/var";
import While from "./statements/while";
import Token from "./token";
import TypedRecord from "./util-classes/typed-record";
import NuminInstance from "./numin-instance";
import { TokenType } from "./token-type";

export default class Interpreter implements ExpressionVisitor<any>, StatementVisitor<any>{

    readonly globals: Environment = Environment.fromRoot();

    private environment: Environment = this.globals;
    private locals: TypedRecord<Expression, number> = new TypedRecord();

    constructor() {
        this.globals.define("clock", clock);
    }

    interpret(statements: Array<Statement>): void {
        try {
            for (const statement of statements) {
                this.execute(statement);
            }
        }
        catch (e) {
            console.log(e);
        }
    }


    private execute(statement: Statement) {
        statement.accept(this);
    }


    resolve(expr: Expression, depth: number) {
        this.locals.put(expr, depth);
    }

    executeBlock(statements: Array<Statement>, environment: Environment) {
        const previous: Environment = this.environment;

        try {
            this.environment = environment;
            for (const statement of statements) {
                this.execute(statement);
            }

        }
        finally {

            this.environment = previous;
        }
    }

    private evaluate(expr: Expression): any {
        return expr.accept(this);
    }




    visitBlockStatement(stmt: Block) {
        this.executeBlock(stmt.statements, new Environment(this.environment));
        return null;
    }


    visitClassStatement(clazz: Class) {
        this.environment.define(clazz.name.lexeme, null);
        let superClass: any = null;
        if (clazz.superClass != null) {
            superClass = this.evaluate(clazz.superClass);
            if (!(superClass instanceof NuminClass)) {
                throw new RuntimeError(clazz.name, "Superclass must be a class.");

            }
            this.environment = new Environment(this.environment);
            this.environment.define("super", superClass);
        }
        const methods: Record<string, NuminFunction> = {};
        for (const method of clazz.methods) {
            const numinFunction: NuminFunction = new NuminFunction(method, this.environment, method.name.lexeme === "init");
            methods[method.name.lexeme] = numinFunction;
        }

        const klass: NuminClass = new NuminClass(clazz.name.lexeme, superClass, methods);

        if (superClass) {
            this.environment = this.environment.enclosing!;
        }

        this.environment.assign(clazz.name, klass);
        return null;

    }


    visitExpressionStatement(stmt: StatementExpression) {
        this.evaluate(stmt.expression);
        return null;
    }

    visitFunctionStatement(functionStatement: Function) {
        const func: NuminFunction = new NuminFunction(functionStatement, this.environment, false);
        this.environment.define(functionStatement.name.lexeme, func);
        return null;
    }

    visitIfStatement(ifStatement: If) {
        if (this.isTruthy(this.evaluate(ifStatement.condition))) {
            this.execute(ifStatement.thenBranch);
        }
        else if (ifStatement.elseBranch != null) {
            this.execute(ifStatement.elseBranch);
        }
        return null;
    }

    visitPrintStatement(printStatement: Print) {
        const value: any = this.evaluate(printStatement.expression);
        console.log(this.stringify(value)); //TODO: this wont wooooork
        return null;
    }
    visitReturnStatement(returnStatement: ReturnStatement) {
        let value: any = null;
        if (returnStatement.value) value = this.evaluate(returnStatement.value);
        throw new Return(value);
    }

    visitVariableStatement(variable: Var) {
        let value: any = null;
        if (variable.initializer) {
            value = this.evaluate(variable.initializer);
        }
        this.environment.define(variable.name.lexeme, value);
        return null;
    }


    visitWhileStatement(whileStatement: While) {
        while (this.isTruthy(this.evaluate(whileStatement.condition))) {
            this.execute(whileStatement.body);
        }
        return null;
    }

    visitAssignExpression(expr: assign) {
        let value: any = this.evaluate(expr.value);
        let distance: number = this.locals.get(expr);
        if (distance) {
            this.environment.assignAt(distance, expr.name, value);

        } else {
            this.globals.assign(expr.name, value);
        }

        return value;
    }


    visitBinaryExpression(expr: binary) {
        let left: any = this.evaluate(expr.left);
        let right: any = this.evaluate(expr.right);
        switch (expr.operator.type) {
            case TokenType.BANG_EQUAL:
                return !this.isEqual(left, right);
            case TokenType.EQUAL_EQUAL:
                return this.isEqual(left, right);
            case TokenType.GREATER:
                this.checkNumberOperands(expr.operator, left, right);
                return left > right;
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left > right;
            case TokenType.LESS:
                this.checkNumberOperands(expr.operator, left, right);
                return left < right;
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(expr.operator, left, right);
                return left <= right;
            case TokenType.MINUS:
                this.checkNumberOperands(expr.operator, left, right);
                return left - right;
            case TokenType.PLUS:
                if (typeof (left) === "number" && typeof (right) === "number") {
                   return left + right;
                }

                if (typeof (left) === "string" && typeof (right) === "string") {
                    return left + right;
                }

                throw new RuntimeError(expr.operator, "Operands must be two numbers or two strings.");
            case TokenType.SLASH:
                this.checkNumberOperands(expr.operator, left, right);
                return left / right;
            case TokenType.STAR:
                this.checkNumberOperands(expr.operator, left, right);
                return left * right;

        }
        return null;
    }
    visitCallExpression(callExpression: call) {
        const callee: any = this.evaluate(callExpression.callee);
        const args: Array<any> = [];
        for (const arg of callExpression.callArguments) {
            args.push(arg);
        }

        // cant use instanceOf as a polymorphic check have to check based on all implementations instead of abstractions

        if (!(callee instanceof NuminClass) && !(callee instanceof NuminFunction)) {
            throw new RuntimeError(callExpression.paren, "Can only call functions and classes.");

        }

        const func: NuminClass | NuminFunction = callee;
        if (args.length !== func.arity()) {
            throw new RuntimeError(callExpression.paren, "Expected " + func.arity() + " arguments but got " + args.length + ".");

        }

        return func.call(this, args);
    }


    visitGetExpression(getExpresssion: get) {
        const object: any = this.evaluate(getExpresssion.object);
        if (object instanceof NuminInstance) {
            return object.get(getExpresssion.name);
        }

        throw new RuntimeError(getExpresssion.name, "Only instances have properties.");

    }


    visitGroupingExpression(groupingExpression: grouping) {
        return this.evaluate(groupingExpression.expression);
    }


    visitLiteralExpression(literalExpression: literal) {

        return literalExpression.value;
    }
    
    visitlogicalExpression(logicalExpression: logical) {
        const left: any = this.evaluate(logicalExpression.left);
        if (logicalExpression.operator.type === TokenType.OR) {
            if (this.isTruthy(left)) return left;
        } else {
            if (!this.isTruthy(left)) return left;
        }

        return this.evaluate(logicalExpression.right);

    }


    visitSetExpression(setExpression: set) {
        const object: any = this.evaluate(setExpression.object);
        if (!(object instanceof NuminInstance)) {
            throw new RuntimeError(setExpression.name, "Only instances have fields.");
        }
    }
    visitSuperExpression(superExpression: _super) {
        let distance = this.locals.get(superExpression);
        const superClass: NuminClass = this.environment.getAt(distance, 'super');
        const object: NuminInstance = this.environment.getAt(distance - 1, "this");
        const method = superClass.findMethod(object, superExpression.method.lexeme);
        if (!method) {
            throw new RuntimeError(superExpression.method, `Undefined property '${superExpression.method.lexeme}'.`);
        }
        return method;
    }

    visitThisExpression(thisExpression: _this) {
        return this.lookUpVariable(thisExpression.keyword, thisExpression);
    }

    visitUnaryExpression(unaryExpression: unary) {
        const right = this.evaluate(unaryExpression.right);
        switch (unaryExpression.operator.type) {
            case TokenType.BANG: return !this.isTruthy(right);
            case TokenType.MINUS:
                this.checkNumberOperand(unaryExpression.operator, right);
                return -right;
        }

        return null;
    }


    visitVariableExpression(variableExpression: variable) {
        return this.lookUpVariable(variableExpression.name, variableExpression);
    }


    private lookUpVariable(name: Token, expr: Expression): any {
        const distance: number = this.locals.get(expr);
        if (distance) {
            return this.environment.getAt(distance, name.lexeme);
        }
        else {
            return this.globals.get(name);
        }
    }

    private checkNumberOperand(operator: Token, operand: any): void {
        if (operand instanceof Number) return;
        throw new RuntimeError(operator, "Operand must be a number");
    }

    private checkNumberOperands(operator: Token, left: any, right: any) {
        if (left instanceof Number && right instanceof Number) {
            throw new RuntimeError(operator, "Operands must be numbers.");

        }



    }

    private isTruthy(object: any): boolean {
        if (!object) return false;
        if (object instanceof Boolean) return object as boolean;
        return true;
    }


    private isEqualObj(a: any, b: any) {
        //TODO: bad implementation due to ts limitations
        return JSON.stringify(a) === JSON.stringify(b);
    }


    private isEqual(a: any, b: any) {
        if (!a && !b) return true;
        if (!a) return false;

        //TODO: could be a===b
        return this.isEqualObj(a, b);
    }

    private stringify(object: any) {
        if (!object) return "nil";
        if (object instanceof Number) {
            let text: string = object.toString();
            if (text.endsWith(".0")) {
                text = text.substring(0, text.length - 2);
            }
            return text;
        }

        return object.toString();
    }

}

