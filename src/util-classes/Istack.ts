interface IStack<T> {
    push(item: T): void;
    pop(): T | undefined;
    peek(): T | undefined;
    size(): number;
    isEmpty():boolean;
    get(index:number):T;
  }
  