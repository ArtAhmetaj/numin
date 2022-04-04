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
import This from "./expressions/this";
import _this from "./expressions/this";
import unary from "./expressions/unary";
import VariableStatement from "./expressions/variable";
import Variable from "./expressions/variable";
import Interpreter from "./interpreter";
import NuminClass from "./numin-class";
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

enum ClassType {
    NONE,
    CLASS,
    SUBCLASS
}

enum FunctionType {
    NONE,
    FUNCTION,
    INITIALIZER,
    METHOD
}

class Resolver implements ExpressionVisitor<void>, StatementVisitor<void>{
    private readonly interpreter: Interpreter;
    private readonly scopes: Stack<Record<string, boolean>> = new Stack<Record<string, boolean>>();
    private currentFunction = FunctionType.NONE;
    private currentClass = ClassType.NONE;

    constructor(interpreter: Interpreter) {
        this.interpreter = interpreter;

    }

    resolve(statements: Array<Statement>): void {
        for (const statement of statements) {
            this.resolveStatement(statement);
        }
    }

    private resolveStatement(stmt: Statement): void {
        stmt.accept(this);
    }

    private resolveExpression(expr: Expression): void {
        expr.accept(this);
    }

    private beginScope(): void {
        this.scopes.push({});
    }

    private endScope(): void {
        this.scopes.pop();

    }

    private declare(name: Token): void {
        if (this.scopes.isEmpty()) return;
        const scope = this.scopes.peek();
        if (scope) {
            if (scope[name.lexeme]) {
                // Numin.error(name,"variable with name already declarined in this scope.")
            }
            scope[name.lexeme] = false;
        }

    }

    private define(name: Token): void {
        if (this.scopes.isEmpty()) return;
        this.scopes.peek()![name.lexeme] = true;
    }

    private resolveLocal(expr: Expression, name: Token) {
        for (let i = this.scopes.size() - 1; i >= 0; i--) {
            if (this.scopes.get(i)[name.lexeme]) {
                this.interpreter.resolve(expr, this.scopes.size() - 1 - i);
                return;
            }
        }
    }


    private resolveFunction(func: Function, type: FunctionType): void {
        const enclosingFunction = this.currentFunction;
        this.currentFunction = type;
        this.beginScope();
        for (const param of func.parameters) {
            this.declare(param);
            this.define(param);

        }

        this.resolve(func.body);
        this.endScope();

        this.currentFunction = enclosingFunction;

    }


    visitBlockStatement(block: Block) {
        this.beginScope();
        this.resolve(block.statements);
        this.endScope();
        return null;

    }
    visitClassStatement(clazz: Class) {
        this.declare(clazz.name);
        this.define(clazz.name);
        const enclosingClass = this.currentClass;
        this.currentClass = ClassType.CLASS;
        if (clazz.superClass) {
            this.currentClass = ClassType.SUBCLASS;
            this.resolveExpression(clazz.superClass);
            this.beginScope();
            this.scopes.peek()!['super'] = true;

        }
        this.beginScope();
        this.scopes.peek()!["this"] = true;

        for (const method of clazz.methods) {
            let declaration = FunctionType.METHOD;
            if (method.name.lexeme === "init") {
                declaration = FunctionType.INITIALIZER;
            }
            this.resolveFunction(method, declaration);
        }

        this.endScope();

        if (clazz.superClass) this.endScope();
        this.currentClass = enclosingClass;
        return null;

    }
    visitExpressionStatement(expression: StatementExpression) {
        this.resolveExpression(expression.expression);
        return null;
    }
    visitFunctionStatement(functionStatement: Function) {
        this.declare(functionStatement.name);
        this.define(functionStatement.name);

        this.resolveFunction(functionStatement, FunctionType.FUNCTION);
        return null;
    }


    visitIfStatement(ifStatement: If) {
        this.resolveExpression(ifStatement.condition);
        this.resolveStatement(ifStatement.thenBranch);
        if (ifStatement.elseBranch) this.resolveStatement(ifStatement.elseBranch);
        return null;
    }
    visitPrintStatement(printStatement: Print) {
        this.resolveExpression(printStatement.expression);
        return null;

    }
    visitReturnStatement(returnStatement: ReturnStatement) {
        if (this.currentFunction === FunctionType.NONE) {
            // Numin.error(returnStatement.keyword,"Cannot return from top-level code.");

        }
        if (returnStatement.value) {
            if (this.currentFunction === FunctionType.INITIALIZER) {
                // Numin.error(returnStatement.keyword,"Cannot return a value from an initializer.");

            }
            this.resolveExpression(returnStatement.value);
        }
        return null;
    }

    visitVariableStatement(varStmt: Var) {
        this.declare(varStmt.name);
        if (varStmt.initializer) {
            this.resolveExpression(varStmt.initializer);
        }
        this.define(varStmt.name);
        return null;
    }

    visitWhileStatement(whileStatement: While) {
        this.resolveExpression(whileStatement.condition);
        this.resolveStatement(whileStatement.body);
        return null;
    }
    visitAssignExpression(expr: assign) {
        this.resolveExpression(expr.value);
        this.resolveLocal(expr, expr.name);
        return null;
    }
    visitBinaryExpression(binaryExpression: binary) {
        this.resolveExpression(binaryExpression.left);
        this.resolveExpression(binaryExpression.right);
        return null;
    }
    visitCallExpression(callExpression: call) {
        this.resolveExpression(callExpression.callee);
        for (const argument of callExpression.callArguments) {
            this.resolveExpression(argument);
        }
        return null;
    }

    visitGetExpression(getExpresssion: get) {
        this.resolveExpression(getExpresssion.object);
        return null;
    }

    visitGroupingExpression(groupingExpression: grouping) {
        this.resolveExpression(groupingExpression.expression);
        return null;
    }

    visitLiteralExpression(literalExpression: literal) {
        return null;
    }

    visitlogicalExpression(logicalExpression: logical) {
        this.resolveExpression(logicalExpression.left);
        this.resolveExpression(logicalExpression.right);
        return null;
    }

    visitSetExpression(setExpression: set) {
        this.resolveExpression(setExpression.value);
        this.resolveExpression(setExpression.object);
        return null;
    }

    visitSuperExpression(superExpression: _super) {
        if (this.currentClass === ClassType.NONE) {
            //Numin.error(superExpression.keyword,"Cannot use 'super" outside of a class.");
        } else if (this.currentClass !== ClassType.SUBCLASS) {
            //Numin.error(superExpression.keyword,"Cannot use 'super" in a class with no superclass.");

        }

        this.resolveLocal(superExpression, superExpression.keyword);
        return null;

    }

    visitThisExpression(thisExpression: _this) {
        if (this.currentClass === ClassType.NONE) {
            // Numin.error(thisExpression.keyword, "Cannot use 'this' outside of a class.");  
            return null;
        }

        this.resolveLocal(thisExpression,thisExpression.keyword);
        return null;

    }
    visitUnaryExpression(unaryExpression: unary) {
        this.resolveExpression(unaryExpression.right);
        return null;
    }

    visitVariableExpression(variableExpression: Variable) {
    if(!this.scopes.isEmpty() && this.scopes.peek()![variableExpression.name.lexeme]===false){
        // Numin.error(expr.name, "Cannot read local variable in its own initializer.");
    }
    this.resolveLocal(variableExpression,variableExpression.name);
    return null;
    }

}