export default interface StatementVisitor<T>{
    //TODO: remove any to extended statement classes
    visitBlockStatement(block:any):T
    visitClassStatement(clazz:any):T
    visitExpressionStatement(expression:any):T
    visitFunctionStatement(functionStatement:any):T
    visitIfStatement(ifStatement:any):T
    visitPrintStatement(printStatement:any):T
    visitReturnStatement(returnStatement:any):T
    visitVariableStatement(variable:any):T
    visitWhileStatement(whileStatement:any):T


}

